"""
feedback_generator.py
Generates comprehensive, structured final feedback for the interview session matching official API contract.
"""

import os
import json
import time
import urllib.request
from typing import Dict, Any, List

class FeedbackGenerator:
    def __init__(self, curriculum_data: Dict[str, Any], model_name: str = "gemini-2.0-flash"):
        self.curriculum = curriculum_data
        self.days_map = {d["day"]: d for d in curriculum_data.get("days", [])}
        self.model_name = model_name
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def generate_feedback(self, session_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes conversation history, evaluations, and curriculum coverage into structured feedback.
        Matches the official Technical Specification:
        {
          "summary": string,
          "strengths": list[str],
          "gaps": list[str],
          "next": list[str]
        }
        """
        candidate = session_state.get("candidate", {})
        member = candidate.get("member", {})
        history = session_state.get("conversation_history", [])
        days_covered = session_state.get("curriculum_days_covered", [])
        q_count = session_state.get("current_question_number", 0)

        # Gather evaluations
        scores = [h.get("evaluation", {}).get("score", 5) for h in history if "evaluation" in h]
        avg_score = sum(scores) / len(scores) if scores else 6.0

        history_summary = []
        for turn in history:
            history_summary.append({
                "turn": turn.get("turn"),
                "day": turn.get("day"),
                "topic": turn.get("topic"),
                "question": turn.get("question"),
                "answer": turn.get("answer"),
                "score": turn.get("evaluation", {}).get("score"),
                "rating": turn.get("evaluation", {}).get("rating"),
                "strengths": turn.get("evaluation", {}).get("key_strengths", []),
                "gaps": turn.get("evaluation", {}).get("gaps_or_misconceptions", [])
            })

        prompt = f"""You are a Principal AI & Software Engineering Hiring Director evaluating candidate {member.get('name', 'Candidate')} ({member.get('jobRole', 'Engineer')}, {member.get('yearsExperience', 0)} years exp).

Interview Summary:
- Total Questions Asked: {q_count}
- Curriculum Days Covered: {days_covered}
- Average Answer Score: {avg_score:.1f}/10
- Detailed Turn-by-Turn Evaluations: {json.dumps(history_summary)}

Synthesize a structured, actionable final evaluation. Return ONLY a valid JSON object matching this EXACT schema:
{{
  "summary": "Detailed overall narrative of candidate performance, technical depth, communication, and overall suitability.",
  "strengths": [
    "Specific technical strength 1",
    "Specific technical strength 2",
    "Specific technical strength 3"
  ],
  "gaps": [
    "Specific technical gap or area needing improvement 1",
    "Specific technical gap or area needing improvement 2"
  ],
  "next": [
    "Actionable recommended curriculum day or topic to revise 1",
    "Actionable recommended curriculum day or topic to revise 2"
  ]
}}
"""

        result = self._call_gemini_json(prompt)
        if result and "summary" in result and "strengths" in result and "gaps" in result and "next" in result:
            return result

        # Fallback feedback generator if LLM fails
        return self._generate_fallback_feedback(session_state, avg_score)

    def _generate_fallback_feedback(self, session_state: Dict[str, Any], avg_score: float) -> Dict[str, Any]:
        history = session_state.get("conversation_history", [])
        days_covered = session_state.get("curriculum_days_covered", [])
        member = session_state.get("candidate", {}).get("member", {})

        strengths = []
        gaps = []

        for turn in history:
            eval_data = turn.get("evaluation", {})
            for s in eval_data.get("key_strengths", []):
                if s not in strengths:
                    strengths.append(s)
            for g in eval_data.get("gaps_or_misconceptions", []):
                if g not in gaps:
                    gaps.append(g)

        if not strengths:
            strengths = [
                f"Demonstrated willingness to engage with Day {d} topics" for d in days_covered[:3]
            ]
        if not gaps:
            gaps = [
                "Could provide deeper architectural code examples under high scalability constraints"
            ]

        recommended_next = []
        for d in days_covered:
            day_info = self.days_map.get(d, {})
            title = day_info.get("title", f"Day {d}")
            recommended_next.append(f"Review Day {d}: {title}")

        return {
            "summary": f"{member.get('name', 'The candidate')} completed a technical interview covering {len(days_covered)} curriculum days with {len(history)} questions. Overall performance score was {avg_score:.1f}/10.",
            "strengths": strengths[:4],
            "gaps": gaps[:3],
            "next": recommended_next[:4]
        }

    def _call_gemini_json(self, prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            return {}

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
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
