"""
question_generator.py
Generates personalized, adaptive technical interview questions and follow-ups using Gemini LLM.
"""

import os
import json
import time
import urllib.request
from typing import Dict, Any, List, Tuple

class QuestionGenerator:
    def __init__(self, curriculum_data: Dict[str, Any], model_name: str = "gemini-2.0-flash"):
        self.curriculum = curriculum_data
        self.days_map = {d["day"]: d for d in curriculum_data.get("days", [])}
        self.model_name = model_name
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def generate_next_question(
        self,
        session_state: Dict[str, Any]
    ) -> Tuple[str, int, str]:
        """
        Determines the next question, curriculum day, and topic based on candidate profile,
        previous conversation history, and evaluation of last answer.
        """
        candidate = session_state.get("candidate", {})
        member = candidate.get("member", {})
        history = session_state.get("conversation_history", [])
        questions_asked = session_state.get("questions_already_asked", [])
        days_covered = session_state.get("curriculum_days_covered", [])
        q_count = session_state.get("current_question_number", 0)

        # 1. Decide target curriculum day
        target_day, is_follow_up = self._select_target_day_and_mode(session_state)

        day_info = self.days_map.get(target_day, {
            "day": target_day,
            "title": "AI & Software Engineering",
            "tools": ["Python", "FastAPI"],
            "objectives": ["General AI development"]
        })

        # 2. Extract last evaluation if follow-up
        last_turn = history[-1] if history else None
        last_q = last_turn.get("question", "") if last_turn else ""
        last_a = last_turn.get("answer", "") if last_turn else ""
        last_eval = last_turn.get("evaluation", {}) if last_turn else {}

        # 3. Construct LLM prompt
        prompt = f"""You are an expert AI & Software Engineering Technical Interviewer.

Candidate Profile:
- Name: {member.get('name', 'Candidate')}
- Role: {member.get('jobRole', 'Software Engineer')}
- Experience: {member.get('yearsExperience', 3)} years
- Education: {member.get('education', 'BS Computer Science')}

Interview Context:
- Current Question Number: {q_count + 1}
- Questions Asked So Far: {[q['question'] for q in questions_asked]}
- Curriculum Days Covered So Far: {days_covered} (Targeting minimum 4 distinct days across 8+ questions)
- Target Day for this Question: Day {target_day} - {day_info.get('title')}
- Target Day Tools: {', '.join(day_info.get('tools', []))}
- Target Day Objectives: {', '.join(day_info.get('objectives', []))}

Mode: {"FOLLOW-UP QUESTION" if is_follow_up else "NEW TOPIC QUESTION"}

{"Previous Question: " + last_q if is_follow_up else ""}
{"Previous Candidate Answer: " + last_a if is_follow_up else ""}
{"Answer Evaluation: Rating=" + str(last_eval.get('rating')) + ", Score=" + str(last_eval.get('score')) + "/10, Direction=" + str(last_eval.get('suggested_next_direction')) if is_follow_up else ""}

Instructions:
1. If Mode is FOLLOW-UP:
   - If previous answer was WEAK: Ask a clarifying or foundational follow-up to test core understanding.
   - If previous answer was STRONG: Ask a deeper architectural, edge-case, or performance follow-up.
2. If Mode is NEW TOPIC:
   - Ask an engaging technical scenario or conceptual question aligned with Day {target_day} ({day_info.get('title')}).
3. Make the question concise, direct, professional, and personalized to the candidate's background. Do NOT include greetings or meta-text.

Return JSON in this format:
{{
  "question": "The question string",
  "day": {target_day},
  "topic": "{day_info.get('title')}"
}}
"""

        result = self._call_gemini_json(prompt)
        if result and "question" in result:
            return result["question"], result.get("day", target_day), result.get("topic", day_info.get("title"))

        # Fallback question generator if LLM fails
        return self._generate_fallback_question(target_day, day_info, is_follow_up, last_eval)

    def _select_target_day_and_mode(self, session_state: Dict[str, Any]) -> Tuple[int, bool]:
        q_count = session_state.get("current_question_number", 0)
        days_covered = session_state.get("curriculum_days_covered", [])
        history = session_state.get("conversation_history", [])
        candidate = session_state.get("candidate", {})

        # Candidate missions to prioritize
        candidate_missions = candidate.get("missions", [])
        available_days = [m["day"] for m in candidate_missions if m.get("day") in self.days_map]
        if not available_days:
            available_days = list(self.days_map.keys())

        # Check if we should ask a follow-up on the same day
        if history:
            last_turn = history[-1]
            last_eval = last_turn.get("evaluation", {})
            last_day = last_turn.get("day", 1)

            # If last answer was evaluated and we haven't asked 2 follow-ups on same topic yet
            # and we still have room for 4 days constraint
            same_day_count = sum(1 for q in session_state.get("questions_already_asked", []) if q.get("day") == last_day)

            # Follow up if answer was weak (needs clarification) or very strong (probe depth), provided we don't over-stay
            if same_day_count < 2 and last_eval.get("suggested_next_direction") in ["clarify", "deeper_probe"]:
                return last_day, True

        # Otherwise pick an unvisited curriculum day to ensure 4+ days coverage
        unvisited = [d for d in available_days if d not in days_covered]
        if unvisited:
            return unvisited[0], False

        # If all candidate days visited, pick from overall curriculum
        all_unvisited = [d for d in self.days_map.keys() if d not in days_covered]
        if all_unvisited:
            return all_unvisited[0], False

        # Fallback to round-robin
        day_index = q_count % len(available_days)
        return available_days[day_index], False

    def _generate_fallback_question(
        self,
        day: int,
        day_info: Dict[str, Any],
        is_follow_up: bool,
        last_eval: Dict[str, Any]
    ) -> Tuple[str, int, str]:
        topic = day_info.get("title", "Software Engineering")
        tools = ", ".join(day_info.get("tools", ["Python"]))

        if is_follow_up:
            if last_eval.get("rating") == "weak":
                q = f"Could you elaborate further on the core mechanics of {topic}? What primary constraints should be considered when implementing tools like {tools}?"
            else:
                q = f"Taking your explanation of {topic} further, how would you optimize or scale this architecture under high load using {tools}?"
        else:
            q = f"Let's discuss Day {day} topic: {topic}. How do you approach designing and implementing solutions using {tools} in production?"

        return q, day, topic

    def _call_gemini_json(self, prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            return {}

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.3
            }
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        for attempt in range(3):
            try:
                time.sleep(0.5 * (attempt + 1))
                with urllib.request.urlopen(req, timeout=10) as resp:
                    res = json.loads(resp.read().decode("utf-8"))
                    text = res["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text)
            except Exception:
                continue

        return {}
