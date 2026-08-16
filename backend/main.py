import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Ensure ai-agent path is in sys.path
base_dir = os.path.dirname(os.path.abspath(__file__))
ai_agent_path = os.path.join(os.path.dirname(base_dir), "ai-agent", "ai-agent")
if os.path.exists(ai_agent_path) and ai_agent_path not in sys.path:
    sys.path.insert(0, ai_agent_path)

try:
    from interview_engine import InterviewEngine
    engine = InterviewEngine()
except Exception as e:
    print("Failed to initialize InterviewEngine in backend/main.py:", e)
    engine = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InterviewRequest(BaseModel):
    sessionId: str
    candidate: Optional[Dict[str, Any]] = None
    message: Optional[str] = ""


@app.post("/api/interview")
def interview(request: InterviewRequest):
    payload = request.dict()
    if engine:
        return engine.process_turn(payload)
    return {
        "reply": "Error: AI Agent engine is not loaded properly.",
        "done": False
    }