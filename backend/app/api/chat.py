from fastapi import APIRouter
from app.models.schemas import ChatMessage, AssistantResponse, AssistantMessageRequest
from app.services.instructor_agent import generate_instructor_response
from app.services.lab_assistant_agent import generate_assistant_response

router = APIRouter()

# ── Instructor Agent ──────────────────────────────────────────────────────────

@router.post("/instructor", response_model=AssistantResponse)
def instructor_chat(msg: ChatMessage):
    result = generate_instructor_response(msg.message)
    return AssistantResponse(
        agent="instructor",
        text=result.get("explanation", "No response"),
        visualization=result.get("visualization"),
    )


# ── Researcher Agent ──────────────────────────────────────────────────────────

@router.post("/assistant", response_model=AssistantResponse)
def assistant_chat(req: AssistantMessageRequest):
    result = generate_assistant_response(req)
    return AssistantResponse(
        agent="assistant",
        text=result.get("explanation", "Simulation complete."),
        new_code=result.get("new_code"),
        action=result.get("action"),
        visualization=result.get("visualization"),
        sim_status=result.get("sim_status"),
    )
