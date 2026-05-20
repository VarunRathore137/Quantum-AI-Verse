from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatMessage(BaseModel):
    message: str

class AssistantResponse(BaseModel):
    agent: str = "instructor"
    text: str
    visualization: Optional[Dict[str, Any]] = None
    new_code: Optional[str] = None
    action: Optional[str] = None
    sim_status: Optional[str] = None   # "local_sim" | "cloud_job" | "optimized" | "sim_error" | "cloud_error"

class AssistantMessageRequest(BaseModel):
    message: str
    code: str
    circuitData: Dict[str, Any]

class GateSpec(BaseModel):
    type: str
    target: int
    control: Optional[int] = None
    params: Optional[List[float]] = None

class CircuitSpec(BaseModel):
    num_qubits: int
    gates: List[GateSpec]

class SimulationResult(BaseModel):
    statevector: List[str]
    probabilities: Dict[str, float]
