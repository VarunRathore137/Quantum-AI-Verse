from fastapi import APIRouter
from app.models.schemas import ChatMessage, AssistantResponse
from app.services.instructor_agent import generate_instructor_response

router = APIRouter()

@router.post("/instructor", response_model=AssistantResponse)
def instructor_chat(msg: ChatMessage):
    result = generate_instructor_response(msg.message)
    return AssistantResponse(
        agent="instructor",
        text=result.get("explanation", "No response"),
        visualization=result.get("visualization")
    )
