"""
answer_evaluator.py
Assesses candidate technical answers using Gemini LLM and structured evaluation prompts.
"""

import os
import json
import time
import urllib.request
from typing import Dict, Any

class AnswerEvaluator:
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.model_name = model_name
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        day: int,
        topic: str,
        candidate_role: str = "Software Engineer"
    ) -> Dict[str, Any]:
        """
        Evaluates technical accuracy, depth, and clarity of candidate's answer.
        Returns a structured dictionary evaluation.
        """
        prompt = f"""You are a senior technical interviewer evaluating a job candidate for a {candidate_role} position.

Question Asked: "{question}"
Topic: {topic} (Day {day} of curriculum)
Candidate Answer: "{answer}"

Evaluate the candidate's answer thoroughly and objectively. Return ONLY a valid JSON object with the following keys:
{{
  "rating": "strong" | "moderate" | "weak",
  "score": integer between 1 and 10,
  "technical_depth": "shallow" | "intermediate" | "deep",
  "key_strengths": ["list of demonstrated concepts or correct points"],
  "gaps_or_misconceptions": ["list of missing details, errors, or vague statements"],
  "suggested_next_direction": "clarify" | "deeper_probe" | "next_topic",
  "feedback_note": "Short concise summary of the candidate's response quality"
}}
"""

        evaluation = self._call_gemini_json(prompt)
        if not evaluation:
            # Fallback heuristic evaluation if Gemini fails or rate limits
            word_count = len(answer.strip().split())
            if word_count < 10:
                rating = "weak"
                score = 3
                direction = "clarify"
            elif word_count < 30:
                rating = "moderate"
                score = 6
                direction = "clarify"
            else:
                rating = "strong"
                score = 8
                direction = "deeper_probe"

            evaluation = {
                "rating": rating,
                "score": score,
                "technical_depth": "intermediate" if score >= 6 else "shallow",
                "key_strengths": ["Response provided on topic"],
                "gaps_or_misconceptions": [] if score >= 6 else ["Brief response with missing architectural details"],
                "suggested_next_direction": direction,
                "feedback_note": f"Answer evaluated with heuristic score {score}/10."
            }

        return evaluation

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
            except Exception as e:
                # Retry on rate limit or connection issue
                continue

        return {}
