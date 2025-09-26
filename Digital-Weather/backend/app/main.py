from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Example user database
USERS = {"admin": "password123"}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    if request.username in USERS and USERS[request.username] == request.password:
        return {"success": True, "token": "fake-jwt-token"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/devices")
def get_devices():
    return {"devices": [{"id": 1, "lat": 40.7128, "lng": -74.0060}]}
