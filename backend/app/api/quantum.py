from fastapi import APIRouter, HTTPException
from app.models.schemas import CircuitSpec, SimulationResult
from app.services.quantum_simulator import simulate_circuit

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
def run_simulation(spec: CircuitSpec):
    try:
        result = simulate_circuit(spec)
        return SimulationResult(
            statevector=result["statevector"],
            probabilities=result["probabilities"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
