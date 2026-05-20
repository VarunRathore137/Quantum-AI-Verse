"""
lab_assistant_agent.py  — THE RESEARCHER AGENT
Full two-prompt orchestration chain:
  1. Prompt 1  →  LLM decides {new_code, action, explanation, visualization}
  2. Execution →  Backend runs local Aer sim OR mock cloud job
  3. Prompt 2  →  LLM evaluates raw results → final {explanation, visualization}
"""

import json
from groq import Groq
from app.core.config import settings
from app.models.schemas import AssistantMessageRequest
from app.services.qasm_runner import simulate_from_qasm, count_qubits_in_qasm
from app.services.mock_cloud_simulator import submit_cloud_job

client = Groq(api_key=settings.GROQ_API_KEY)

# ── Qubit threshold for local vs cloud routing ────────────────────────────────
LOCAL_SIM_THRESHOLD = 20

# ── System Prompt (Prompt 1) ──────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are THE RESEARCHER AGENT in the QUANTUM-AI VERSE platform — an expert quantum circuit engineer.
Your mission: help users write OpenQASM 3.0 code, optimize circuits, simulate results, and understand quantum behaviour.

You always receive:
- The user's current QASM code
- The current circuit state (qubit count, gate count)
- The user's message

============================================================
STRICT RESPONSE FORMAT — return ONLY valid raw JSON, no markdown, no code fences:
============================================================
{
  "explanation": "...",
  "new_code": "full OpenQASM 3.0 code string OR null",
  "action": "simulate | cloud | none",
  "visualization": { ... } or null
}

============================================================
RULES FOR new_code:
============================================================
- If you write or modify any QASM code, put the COMPLETE updated code in "new_code".
- Always use OpenQASM 3.0 syntax:  OPENQASM 3.0; include "stdgates.inc"; qubit[N] q; bit[N] c;
- Include descriptive comments (// ...) in the QASM for clarity.
- If no code change is needed, set "new_code" to null.

============================================================
RULES FOR action:
============================================================
- "simulate": the circuit has <= 20 qubits — the backend will run an exact statevector simulation.
- "cloud":    the circuit has > 20 qubits — the backend will submit to a cloud quantum computer.
- "none":     no simulation needed (e.g. just answering a question or explaining something).
- IMPORTANT: If the user asks to "simulate", "run", "test", or "check" the circuit, set action accordingly.

============================================================
RULES FOR visualization (ONLY when you have data to show):
============================================================
--- bar_chart --- (use for probability/count comparisons)
{
  "type": "bar_chart",
  "title": "Chart title",
  "data": {
    "labels": ["00", "01", "10", "11"],
    "values": [0.5, 0.0, 0.0, 0.5],
    "colors": ["quantum", "purple", "purple", "quantum"],
    "description": "Measurement probabilities for Bell State"
  }
}

--- pie_chart --- (use for composition percentages)
{
  "type": "pie_chart",
  "title": "Chart title",
  "data": {
    "labels": ["|0⟩", "|1⟩"],
    "values": [0.5, 0.5],
    "description": "Qubit state distribution"
  }
}

If no visualization is appropriate, set "visualization" to null.

============================================================
OPTIMIZATION RULES:
============================================================
When asked to optimize, consider:
- Removing redundant consecutive gates (e.g., H H = identity)
- Reducing circuit depth by parallelizing independent gates
- Simplifying rotation angles (e.g., Rx(2π) = identity)
- Using fewer CNOT gates
Always explain each optimization you made in the "explanation" field.

============================================================
EXPLANATION RULES:
============================================================
- Use **bold** for key terms.
- Use bullet points for lists.
- Be concise, insightful, and educational.
- If you generate code, explain what each part does.
"""

# ── Prompt 2 (Evaluation System Message) ─────────────────────────────────────
EVAL_SYSTEM_MSG = """
You are THE RESEARCHER AGENT. A quantum circuit has just been simulated.
You have been given the raw simulation results. Your task:

1. Analyze the results — identify dominant states, patterns (superposition, entanglement, etc.).
2. Provide insights in simple Natural Language — what does this result mean physically?
3. Suggest optimizations or next steps for the circuit.
4. Output a visualization payload.

Return ONLY valid raw JSON (no markdown, no code fences):
{
  "explanation": "...",
  "visualization": { ... } or null
}

VISUALIZATION FORMAT (bar_chart for probabilities, pie_chart for state distribution):
{
  "type": "bar_chart",
  "title": "Measurement Probabilities",
  "data": {
    "labels": ["00", "11"],
    "values": [0.5, 0.5],
    "colors": ["quantum", "quantum"],
    "description": "The circuit creates a perfect Bell State..."
  }
}

Use only the top 8 states if there are many. Always provide insightful commentary.
"""


# ── Main orchestrator function ────────────────────────────────────────────────

def generate_assistant_response(request: AssistantMessageRequest, sim_results: dict = None):
    """Legacy signature kept for backward compatibility."""
    return _run_full_pipeline(request)


def _run_full_pipeline(request: AssistantMessageRequest) -> dict:
    """
    Runs the full two-prompt pipeline:
      P1 → (optional execution) → P2 → final response dict
    """
    # ── Detect actual qubit count from QASM text ──────────────────────────────
    qasm_qubit_count = count_qubits_in_qasm(request.code)
    stored_qubit_count = request.circuitData.get('qubits', 0)
    effective_qubits = max(qasm_qubit_count, stored_qubit_count)

    gate_count = len(request.circuitData.get('gates', []))

    context = (
        f"CURRENT CIRCUIT STATE:\n"
        f"  Qubits: {effective_qubits}\n"
        f"  Gates:  {gate_count}\n\n"
        f"CURRENT QASM CODE:\n{request.code}\n"
    )
    user_content = context + f"\nUSER MESSAGE:\n{request.message}"

    # ── Prompt 1: Decide ──────────────────────────────────────────────────────
    p1_response = _call_llm(
        system=SYSTEM_PROMPT,
        user=user_content,
        temperature=0.6,
    )

    if not p1_response:
        return _error_response()

    new_code  = p1_response.get("new_code")
    action    = p1_response.get("action", "none")
    sim_status = None

    # Determine actual qubit count from new_code if available
    code_for_sim = new_code or request.code
    sim_qubits   = count_qubits_in_qasm(code_for_sim)
    if sim_qubits == 0:
        sim_qubits = effective_qubits

    # Override action based on actual qubit count
    if action == "simulate" and sim_qubits > LOCAL_SIM_THRESHOLD:
        action = "cloud"
    elif action == "cloud" and sim_qubits <= LOCAL_SIM_THRESHOLD:
        action = "simulate"   # Let local handle small circuits

    # ── Execution Phase ───────────────────────────────────────────────────────
    sim_results = None

    if action == "simulate":
        try:
            sim_results = simulate_from_qasm(code_for_sim)
            sim_status  = "local_sim"
        except Exception as e:
            print(f"[Researcher Agent] Local sim error: {e}")
            sim_results = {"error": str(e), "note": "Simulation failed — circuit may be incomplete."}
            sim_status  = "sim_error"

    elif action == "cloud":
        try:
            sim_results = submit_cloud_job(code_for_sim, sim_qubits)
            sim_status  = "cloud_job"
        except Exception as e:
            print(f"[Researcher Agent] Cloud job error: {e}")
            sim_results = {"error": str(e)}
            sim_status  = "cloud_error"

    # If no simulation, return Prompt 1 response directly
    if sim_results is None:
        return {
            "explanation":  p1_response.get("explanation", "Done."),
            "new_code":     new_code,
            "action":       action,
            "visualization": p1_response.get("visualization"),
            "sim_status":   None,
        }

    # ── Prompt 2: Evaluate Results ────────────────────────────────────────────
    eval_context = (
        f"CIRCUIT: {sim_qubits} qubits, {gate_count} gates\n\n"
        f"ORIGINAL USER REQUEST: {request.message}\n\n"
        f"QASM CODE THAT WAS SIMULATED:\n{code_for_sim}\n\n"
        f"RAW SIMULATION RESULTS:\n{json.dumps(sim_results, indent=2)}\n"
    )

    p2_response = _call_llm(
        system=EVAL_SYSTEM_MSG,
        user=eval_context,
        temperature=0.5,
    )

    if not p2_response:
        # Fall back to P1 explanation + raw data
        p2_response = {
            "explanation": p1_response.get("explanation", "Simulation complete."),
            "visualization": _auto_visualization(sim_results),
        }

    return {
        "explanation":   p2_response.get("explanation", "Simulation complete."),
        "new_code":      new_code,
        "action":        action,
        "visualization": p2_response.get("visualization") or _auto_visualization(sim_results),
        "sim_status":    sim_status,
        "raw_results":   sim_results,
    }


# ── LLM caller ────────────────────────────────────────────────────────────────

def _call_llm(system: str, user: str, temperature: float = 0.6) -> dict | None:
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        return json.loads(raw)
    except Exception as e:
        print(f"[Researcher Agent] LLM error: {e}")
        return None


# ── Fallback auto-visualization ───────────────────────────────────────────────

def _auto_visualization(sim_results: dict) -> dict | None:
    """
    Build a bar-chart visualization automatically from raw sim results
    if Prompt 2 didn't return one.
    """
    if not sim_results:
        return None

    # Local Aer results
    probs = sim_results.get("probabilities")
    if probs:
        top = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:8]
        labels = [k for k, _ in top]
        values = [round(v, 4) for _, v in top]
        return {
            "type": "bar_chart",
            "title": "Measurement Probabilities",
            "data": {
                "labels": labels,
                "values": values,
                "colors": ["quantum"] * len(labels),
                "description": "Statevector simulation — exact probabilities",
            },
        }

    # Cloud mock results
    counts = sim_results.get("counts")
    if counts:
        shots = sim_results.get("shots", 1024)
        top   = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:8]
        labels = [k for k, _ in top]
        values = [round(v / shots, 4) for _, v in top]
        return {
            "type": "bar_chart",
            "title": f"Cloud Measurement Counts ({sim_results.get('backend', 'IBM')})",
            "data": {
                "labels": labels,
                "values": values,
                "colors": ["cloud"] * len(labels),
                "description": f"Cloud simulation — {shots} shots on {sim_results.get('backend', 'IBM')}",
            },
        }

    return None


def _error_response() -> dict:
    return {
        "explanation": (
            "**Connection error** — The Researcher Agent couldn't reach the AI backend.\n\n"
            "- Make sure the backend server is running on `:8000`.\n"
            "- Check your GROQ_API_KEY in the `.env` file."
        ),
        "visualization": None,
        "new_code":      None,
        "action":        "none",
        "sim_status":    None,
    }
