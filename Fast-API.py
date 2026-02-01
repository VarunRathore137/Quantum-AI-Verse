from fastapi import FastAPI
from pydantic import BaseModel
from typing import List


app = FastAPI()

class Qubit(BaseModel):
   q_id: int | None = None
   q_name: str | None = None
   q_state: complex | None = None

qubits: List[Qubit] = []

@app.get("/")
def read_root():
   return{ "message": "This is Qubits data structure"}

"""Performing all CRUD operations"""

# Reading and fetching data
@app.get("/qubits")
def get_qubits():
   return qubits

# Adding new data
@app.post("/qubits")
def push_qubit(qubit: Qubit):
   qubits.append(qubit)
   return qubits

# Overriding existing data
@app.put("/qubits/{q_id}")
def update_qubit(q_id: int, new_qubit: Qubit):
   for index, q in enumerate(qubits):
      if (q.id == q_id):
         qubits[index] = new_qubit
         return new_qubit
      
   return{ "error": "q_id not found"}
   

# Patch data (Update only specific data)
@app.patch("/qubits/ {q_id}")
def patch_qubit(q_id: int, q_name: str, q_state: complex, updated_qubit: Qubit):
   for  q in enumerate(qubits):
     
      if (q.id == q_id):
         
         if q_id is not None:
            q.id = q_id
            
         if q_name is not None:
            q_name = q_name

         if q_state is not None:
            q_state = q_state

   return qubits

# Delete
@app.delete("/qubits/ {q_id}")
def delete_qubit(q_id):
   for index, q in enumerate(qubits):
      if q.id == q_id:
         deleted = qubits.pop(index)
   return deleted
