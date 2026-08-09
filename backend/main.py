from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Request Model
# -----------------------------

class InterviewRequest(BaseModel):
    sessionId: str
    candidate: dict
    message: str


# -----------------------------
# Interview Questions
# -----------------------------

questions = [
    "Hello! Let's begin your interview. Tell me about yourself.",
    "Great. Can you tell me about your experience with Python?",
    "Good. What is the difference between a list and a tuple in Python?",
    "Can you explain what SQL is and how you have used it?"
]


# -----------------------------
# Store interview progress
# -----------------------------

sessions = {}


# -----------------------------
# Interview API
# -----------------------------

@app.post("/api/interview")
def interview(request: InterviewRequest):

    session_id = request.sessionId
    message = request.message.strip()

    # New interview session
    if session_id not in sessions:

        sessions[session_id] = {
            "question_index": 0,
            "answers": []
        }

        return {
            "reply": questions[0],
            "done": False
        }

    # Store candidate's answer
    sessions[session_id]["answers"].append(message)

    # Move to next question
    sessions[session_id]["question_index"] += 1

    current_question = sessions[session_id]["question_index"]

    # Check if interview is completed
    if current_question >= len(questions):

        return {
            "reply": "Thank you. Your interview is completed.",
            "done": True,
            "feedback": {
                "summary": "Interview completed successfully.",
                "strengths": [
                    "Answered the interview questions"
                ],
                "gaps": [
                    "More technical depth can be evaluated"
                ],
                "next": [
                    "Practice Python and SQL interview questions"
                ]
            }
        }

    # Ask next question
    return {
        "reply": questions[current_question],
        "done": False
    }