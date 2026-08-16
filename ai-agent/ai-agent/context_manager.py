"""
context_manager.py
Manages conversation state, candidate information, history, and interview progression with file-based persistence.
"""

import os
import json
from typing import Dict, Any, List, Optional, Set

class ContextManager:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            sessions_dir = os.path.join(base_dir, "sessions")
            os.makedirs(sessions_dir, exist_ok=True)
            db_path = os.path.join(sessions_dir, "sessions_db.json")
        else:
            os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self.db_path = db_path
        self._sessions: Dict[str, Dict[str, Any]] = self._load_db()

    def _load_db(self) -> Dict[str, Dict[str, Any]]:
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_db(self):
        try:
            os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self._sessions, f, indent=2)
        except Exception as e:
            print("Error saving session db:", e)

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        self._sessions = self._load_db()
        return self._sessions.get(session_id)

    def initialize_session(self, session_id: str, candidate: Dict[str, Any]) -> Dict[str, Any]:
        self._sessions = self._load_db()
        member = candidate.get("member", {})
        missions = candidate.get("missions", [])

        completed_days = [
            m.get("day") for m in missions
            if m.get("passed") is True or m.get("day") is not None
        ]

        session_state = {
            "session_id": session_id,
            "candidate_id": member.get("id", "UNKNOWN"),
            "candidate": candidate,
            "completed_curriculum_days": completed_days,
            "topics_already_covered": [],
            "questions_already_asked": [],
            "candidate_answers": [],
            "answer_evaluations": [],
            "current_question_number": 0,
            "curriculum_days_covered": [],
            "conversation_history": [],
            "final_performance_summary": None,
            "is_completed": False,
            "current_active_question": None,
            "current_active_day": None,
            "current_active_topic": None
        }

        self._sessions[session_id] = session_state
        self._save_db()
        return session_state

    def set_active_question(self, session_id: str, question: str, day: int, topic: str):
        session = self.get_session(session_id)
        if not session:
            return
        session["current_active_question"] = question
        session["current_active_day"] = day
        session["current_active_topic"] = topic
        self._sessions[session_id] = session
        self._save_db()

    def record_answer_and_eval(
        self,
        session_id: str,
        answer: str,
        evaluation: Dict[str, Any]
    ):
        session = self.get_session(session_id)
        if not session:
            return

        q_num = session["current_question_number"] + 1
        session["current_question_number"] = q_num

        question = session.get("current_active_question", "")
        day = session.get("current_active_day", 1)
        topic = session.get("current_active_topic", "General Technical")

        # Record question details
        session["questions_already_asked"].append({
            "number": q_num,
            "question": question,
            "day": day,
            "topic": topic
        })

        session["candidate_answers"].append(answer)
        session["answer_evaluations"].append(evaluation)

        # Update covered days and topics
        if day and day not in session["curriculum_days_covered"]:
            session["curriculum_days_covered"].append(day)

        if topic and topic not in session["topics_already_covered"]:
            session["topics_already_covered"].append(topic)

        # Record history
        session["conversation_history"].append({
            "turn": q_num,
            "question": question,
            "answer": answer,
            "day": day,
            "topic": topic,
            "evaluation": evaluation
        })

        # Clear active
        session["current_active_question"] = None
        session["current_active_day"] = None
        session["current_active_topic"] = None

        self._sessions[session_id] = session
        self._save_db()

    def meets_completion_criteria(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        
        question_count = session["current_question_number"]
        days_covered_count = len(session["curriculum_days_covered"])

        # Enforce minimum 8 questions and 4 curriculum days
        return question_count >= 8 and days_covered_count >= 4

    def mark_completed(self, session_id: str, feedback: Dict[str, Any]):
        session = self.get_session(session_id)
        if not session:
            return
        session["is_completed"] = True
        session["final_performance_summary"] = feedback
        self._sessions[session_id] = session
        self._save_db()

