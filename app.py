from fastapi import FastAPI, requests
from fastapi.middleware.cors import CORSMiddleware
import matplotlib as plt
import pylatexenc
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit import transpile

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
   message = "This is the start of the Q-AI"
   return message

@app.get("/health")
def health_check():
   return {"status": "ok", "message": "Backend is running successfully!"}

def build_circuit() -> QuantumCircuit:
   qc = QuantumCircuit(3, 2)
   qc.x(0)
   qc.h(0)
   qc.h(1)
   qc.barrier()
   qc.cx(0, 1)
   qc.cx(1, 2)
   qc.h(2)
   qc.z(0)
   qc.y(1)
   qc.cz(1,2)
   qc.measure(2, 1)
   return qc

def calculate_probability(counts: dict):
   total_counts = sum(counts.values())
   probabilities = {}
   for i, count in counts.items(): 
      percentage = (count/total_counts) * 100
      round_percentage = round(percentage, 2)
      probabilities[i] = round_percentage
   return probabilities
   
def simulate_circuit(circuit: QuantumCircuit):
   simulator = AerSimulator()
   transpiled_circ = transpile(circuit, simulator)
   job = simulator.run(transpiled_circ, shots=1024)
   result = job.result()
   count = result.get_counts(circuit)
   circuit_depth = circuit.depth()
   num_gates = circuit.size()
   return { 
           "count": count ,
           "circuit_depth" : circuit_depth, 
           "num_gates": num_gates
           }

@app.get("/backend/api")

def circuit_details():
   qc = build_circuit()
   sim_info = simulate_circuit(qc)
   count_percentage = calculate_probability(sim_info["count"]) 

   return {
            "counts": sim_info["count"],
            "Probabilities": count_percentage,
            "circuit_depth": sim_info["circuit_depth"],
            "num_gates": sim_info["num_gates"],
   }


if __name__ == "__main__":
   circuit = build_circuit()
   circuit_details()
