"""
interview_engine.py
Main interview orchestrator for the AI Agent.
Exposes clean Python functions/classes to be called by the FastAPI or Node backend.
"""

import os
import json
from typing import Dict, Any, Optional

from context_manager import ContextManager
from answer_evaluator import AnswerEvaluator
from question_generator import QuestionGenerator
from feedback_generator import FeedbackGenerator

class InterviewEngine:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.dirname(os.path.abspath(__file__))

        curriculum_path = os.path.join(data_dir, "curriculum.json")
        candidates_path = os.path.join(data_dir, "candidates.json")

        self.curriculum_data = self._load_json(curriculum_path)
        self.candidates_data = self._load_json(candidates_path)

        self.context_manager = ContextManager()
        self.answer_evaluator = AnswerEvaluator()
        self.question_generator = QuestionGenerator(self.curriculum_data)
        self.feedback_generator = FeedbackGenerator(self.curriculum_data)

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def get_candidate_by_id(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        candidates = self.candidates_data.get("candidates", [])
        for c in candidates:
            if c.get("member", {}).get("id") == candidate_id:
                return c
        return candidates[0] if candidates else None

    def process_turn(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point matching the official Technical Specification HTTP contract.
        
        Input Payload:
        Start: {"sessionId": "abc-123", "candidate": {...}}
        Turn:  {"sessionId": "abc-123", "message": "..."}

        Output Response:
        In-Progress: {"reply": "...", "done": false}
        Completed:   {"reply": "...", "done": true, "feedback": {...}}
        """
        session_id = payload.get("sessionId") or payload.get("session_id")
        if not session_id:
            return {"reply": "Error: sessionId is required.", "done": False}

        candidate_arg = payload.get("candidate")
        message_arg = payload.get("message")

        session_state = self.context_manager.get_session(session_id)

        # Step 1: Start session if candidate provided or session new
        if not session_state:
            candidate = candidate_arg
            if not candidate:
                candidate = self.candidates_data.get("candidates", [{}])[0]

            session_state = self.context_manager.initialize_session(session_id, candidate)

            # Generate first question
            question, day, topic = self.question_generator.generate_next_question(session_state)
            self.context_manager.set_active_question(session_id, question, day, topic)

            member_name = candidate.get("member", {}).get("name", "Candidate")
            welcome_msg = (
                f"Welcome {member_name}! Let's begin your technical interview.\n\n"
                f"Question 1 (Day {day} - {topic}): {question}"
            )

            return {
                "reply": welcome_msg,
                "done": False
            }

        # Step 2: Handle incoming answer message
        if session_state.get("is_completed"):
            return {
                "reply": "Interview has already been completed.",
                "done": True,
                "feedback": session_state.get("final_performance_summary", {})
            }

        candidate_answer = message_arg or "No response provided."
        active_q = session_state.get("current_active_question", "Describe your technical experience.")
        active_day = session_state.get("current_active_day", 1)
        active_topic = session_state.get("current_active_topic", "General Technical")

        # Evaluate answer
        member_role = session_state.get("candidate", {}).get("member", {}).get("jobRole", "Developer")
        evaluation = self.answer_evaluator.evaluate_answer(
            question=active_q,
            answer=candidate_answer,
            day=active_day,
            topic=active_topic,
            candidate_role=member_role
        )

        # Record turn in context manager
        self.context_manager.record_answer_and_eval(
            session_id=session_id,
            answer=candidate_answer,
            evaluation=evaluation
        )

        # Check if interview meets criteria to complete (>= 8 questions AND >= 4 curriculum days)
        if self.context_manager.meets_completion_criteria(session_id):
            feedback = self.feedback_generator.generate_feedback(session_state)
            self.context_manager.mark_completed(session_id, feedback)

            return {
                "reply": "Thank you for completing the technical interview! Your responses have been evaluated.",
                "done": True,
                "feedback": feedback
            }

        # Generate next question
        next_question, next_day, next_topic = self.question_generator.generate_next_question(session_state)
        self.context_manager.set_active_question(session_id, next_question, next_day, next_topic)

        q_num = session_state.get("current_question_number", 0) + 1

        return {
            "reply": f"Question {q_num} (Day {next_day} - {next_topic}): {next_question}",
            "done": False
        }

# Global engine singleton instance
_engine_instance = None

def get_engine() -> InterviewEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = InterviewEngine()
    return _engine_instance

def process_interview_turn(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function for FastAPI / Node backends to invoke directly.
    """
    engine = get_engine()
    return engine.process_turn(payload)


if __name__ == "__main__":
    # Standard CLI test execution & stdin runner
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "-":
        input_data = sys.stdin.read()
        if input_data.strip():
            payload = json.loads(input_data)
            result = process_interview_turn(payload)
            print(json.dumps(result))
    elif len(sys.argv) > 1:
        payload_file = sys.argv[1]
        with open(payload_file, "r") as f:
            data = json.load(f)
        result = process_interview_turn(data)
        print(json.dumps(result, indent=2))
