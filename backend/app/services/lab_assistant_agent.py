import json
from groq import Groq
from app.core.config import settings
from app.models.schemas import AssistantMessageRequest

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are THE LAB ASSISTANT, an expert quantum circuit engineer in the QUANTUM-AI VERSE platform.
Your job is to help the user write OpenQASM 3.0 code, optimize circuits, analyze results, and run simulations.

You have access to the user's current QASM code and their current circuit information.

============================================================
RESPONSE FORMAT — ALWAYS return valid raw JSON (never markdown code blocks):
============================================================

{
  "explanation": "Your natural language response here. (e.g. evaluating simulation results, explaining optimizations). Use **bold** and bullet points.",
  "new_code": "The full updated OpenQASM 3.0 code as a string, if you made changes. Otherwise null.",
  "action": "simulate | cloud | none",
  "visualization": {
    "type": "bar_chart | pie_chart",
    "data": { ... }
  }
}

============================================================
ACTIONS:
============================================================
- "simulate": Triggers a local exact statevector simulation for circuits with <= 20 qubits. Wait, the actual simulation is done BEFORE you output this if the user asks. Actually, if you want to trigger a simulation, just output "action": "simulate" and the backend will handle it and return the result.
- "cloud": Triggers a real quantum cloud submission for circuits > 20 qubits.
- "none": No action needed.

============================================================
VISUALIZATION TYPES:
============================================================
--- TYPE: bar_chart ---
Use for comparing probabilities or measurement outcomes.
"visualization": {
  "type": "bar_chart",
  "data": {
    "labels": ["00", "01", "10", "11"],
    "values": [0.5, 0.0, 0.0, 0.5],
    "colors": ["blue", "purple", "purple", "blue"],
    "description": "Measurement probabilities"
  }
}

--- TYPE: pie_chart ---
Use for showing percentages of total, like phase composition or error breakdown.
"visualization": {
  "type": "pie_chart",
  "data": {
    "labels": ["|0⟩", "|1⟩"],
    "values": [0.3, 0.7],
    "description": "Probability distribution"
  }
}

If no visualization is relevant, set visualization to null.

============================================================
CRITICAL RULES:
============================================================
- Evaluate the user's request carefully.
- If they ask to add a gate, provide the modified OpenQASM 3.0 code in "new_code".
- If they ask to run or simulate, set "action" to "simulate" (if <=20 qubits) or "cloud" (if >20 qubits).
- Provide insights and suggestions in "explanation".
- If passed simulation results, format "explanation" to analyze them and ALWAYS provide a "validation" chart.
"""

def generate_assistant_response(request: AssistantMessageRequest, sim_results: dict = None):
    # If sim_results is present, it means we are in the evaluation phase of a simulation.
    
    current_qubits = request.circuitData.get('qubits', 0)
    
    context = f"CURRENT CIRCUIT STATE:\\nQubits: {current_qubits}\\n\\nCURRENT QASM CODE:\\n{request.code}\\n"
    
    if sim_results:
        context += f"\\n--- SIMULATION RESULTS JUST RECEIVED ---\\n{json.dumps(sim_results)}\\n"
        sys_msg = "Evaluate the simulation results provided, return a final explanation and a chart visualization. Set action to 'none'."
    else:
        sys_msg = SYSTEM_PROMPT
        
    messages = [
        {"role": "system", "content": sys_msg},
        {"role": "user", "content": context + f"\\nUSER MESSAGE:\\n{request.message}"}
    ]
    
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print("Groq Error [Assistant]:", e)
        return {
            "explanation": "An error occurred connecting to the Lab Assistant.",
            "visualization": None,
            "new_code": None,
            "action": "none"
        }
