# AI Usage Log — ABTalks AI Interview Agent

This file documents the major AI prompts used by our team during the development of the project.

---

# Member 1 — Frontend Development

## Prompt 1 — Frontend Planning

We are participating in the ABTalks hackathon and building an AI Interview Agent for the 31-day AI Cohort.

I am responsible for the frontend.

Design a clean, modern and professional frontend for an AI technical interview platform. The interface should feel like a real technical interview rather than a simple chatbot.

The frontend should allow a candidate to:
- Select or load their candidate profile
- Start an interview
- See the current interview question
- Type and submit an answer
- Receive the next question
- Continue a multi-turn interview
- See interview progress
- View structured feedback after completing the interview

The design should be responsive, user-friendly and suitable for a hackathon demonstration.

Keep the frontend separate from the internal AI-agent implementation and communicate with the backend through HTTP APIs.

---

## Prompt 2 — Frontend API Integration

Connect the frontend to the backend API for the AI Interview Agent.

The frontend should:
1. Start a new interview session.
2. Send the candidate information and session ID.
3. Display the first AI-generated question.
4. Allow the candidate to submit an answer.
5. Send subsequent answers using the same session ID.
6. Display adaptive follow-up questions.
7. Continue until the backend returns done: true.
8. Display the final structured feedback.

Use the API request and response formats defined by the backend and do not invent a different API contract.

Handle loading states, errors and empty responses gracefully.

---

## Prompt 3 — Frontend Testing and Improvements

Test the interview interface from the candidate's perspective.

Check that:
- The interview can be started.
- Questions appear correctly.
- Candidate answers can be submitted.
- The next question appears after submission.
- The conversation remains understandable.
- Loading and error states are handled.
- Final feedback is displayed properly.
- The interface works on both desktop and mobile screens.

Fix only issues that affect usability or the main interview flow.

---

# Member 2 — Backend Development

## Prompt 1 — Backend Architecture

We are building an AI Interview Agent for the ABTalks hackathon.

I am responsible for the backend.

Build a clean backend that acts as the bridge between the frontend and the AI Interview Agent.

The backend should:
- Receive interview requests from the frontend.
- Create and maintain interview sessions.
- Pass candidate information to the AI agent.
- Pass candidate answers to the AI agent.
- Receive generated questions and evaluations.
- Return appropriate responses to the frontend.
- Return final structured feedback when the interview is complete.

Keep the backend modular and easy to integrate with the AI-agent code created by another team member.

---

## Prompt 2 — API Contract

Implement the API according to the official Technical Specification provided for the hackathon.

Do not invent, rename or unnecessarily modify the required API endpoints, request fields or response fields.

The backend must preserve the required request and response structures so that the frontend and AI agent can communicate without integration problems.

Clearly document:
- HTTP method
- Endpoint
- Request body
- Response body
- Session handling
- Error responses

The official Technical Specification must be treated as the source of truth.

---

## Prompt 3 — Frontend and Backend Integration

Connect the frontend to the backend using the agreed API contract.

Test the complete flow:

Frontend → Backend → Response → Frontend

Verify that:
- Interview initialization works.
- Candidate information is passed correctly.
- Session IDs remain consistent.
- Candidate answers reach the backend.
- AI-generated questions are returned correctly.
- Final feedback is returned correctly.

Check for CORS, request format, response format and connection issues.

---

## Prompt 4 — AI Agent Integration

Integrate the AI Interview Agent into the backend without changing its internal logic unnecessarily.

The backend should act as the communication layer between the frontend and AI agent.

The intended architecture is:

Frontend
↓
Backend
↓
AI Interview Agent
↓
Gemini
↓
AI Interview Agent
↓
Backend
↓
Frontend

Ensure that session IDs, candidate data, candidate answers, generated questions and final feedback are passed correctly.

---

# Member 3 — AI Agent Development

## Prompt 1 — AI Agent Architecture

We are building an AI Interview Agent for the ABTalks hackathon.

The agent must conduct a realistic multi-turn technical interview based on a candidate's learning journey through a 31-day AI engineering cohort.

The agent must:
- Use the provided curriculum JSON.
- Use the provided candidate profiles.
- Personalize questions according to the candidate's completed missions and learning signals.
- Generate technical interview questions.
- Generate intelligent follow-up questions based on candidate responses.
- Maintain conversation context.
- Evaluate candidate answers.
- Cover at least 8 questions across at least 4 different curriculum days.
- Generate structured final feedback.

Use Gemini for the AI functionality.

Design the agent as modular components so it can be integrated with a separate backend.

---

## Prompt 2 — Adaptive Question Generation

Implement a question generator for the AI Interview Agent.

Questions should be generated using:
- Candidate profile
- Completed missions
- Curriculum topics
- Learning objectives
- Previous questions
- Candidate's previous answers
- Previous answer evaluations

The interview should not behave like a fixed list of questions.

Generate intelligent follow-up questions based on the candidate's previous response.

The agent should be able to decide whether to:
- Ask for clarification
- Probe deeper
- Move to another topic

---

## Prompt 3 — Answer Evaluation

Implement an answer evaluator for the AI Interview Agent.

Evaluate each candidate answer based on:
- Technical accuracy
- Technical depth
- Understanding
- Strengths
- Knowledge gaps
- Misconceptions

Generate a score and determine the next direction of the interview.

The evaluation should be used to make the next question adaptive rather than predetermined.

---

## Prompt 4 — Context and Session Management

Implement session and conversation context management.

The system should remember:
- Candidate details
- Session ID
- Questions already asked
- Candidate answers
- Answer evaluations
- Curriculum days already covered
- Current interview progress

The same session should continue correctly across multiple HTTP requests.

Do not lose the conversation context between turns.

---

## Prompt 5 — Final Feedback

Implement structured final feedback for the candidate.

The feedback should include:
- Summary
- Strengths
- Gaps
- Recommended next steps

The final response must follow the response format defined in the official Technical Specification.

The interview should only finish after satisfying the minimum requirement of:
- At least 8 questions
- At least 4 different curriculum days

---

## Prompt 6 — AI Agent API Integration

Expose the AI Interview Agent through the API required by the hackathon.

Make the agent easy for the backend developer to integrate.

Clearly document:
- Endpoint
- Request format
- Response format
- Session handling
- Interview initialization
- Subsequent turns
- Completion response
- Final feedback format
- Required environment variables

Do not change the official API contract.

---

## Prompt 7 — AI Agent Testing

Test the AI Interview Agent independently.

Verify that:
- Candidate profiles load correctly.
- Curriculum data loads correctly.
- Interviews initialize correctly.
- Questions are generated.
- Answers are evaluated.
- Follow-up questions adapt to answers.
- Context is maintained.
- At least 8 questions are asked.
- At least 4 curriculum days are covered.
- Final structured feedback is generated.
- The HTTP endpoint works correctly.

Fix errors without adding unnecessary features.

---

# Team-Level Integration and Testing

## Prompt 1 — Full System Integration

We have three components developed by three team members:

1. Frontend
2. Backend
3. AI Interview Agent

Integrate them without changing the official Technical Specification.

The final architecture should be:

Frontend
↓
Backend API
↓
AI Interview Agent
↓
Gemini
↓
AI Interview Agent
↓
Backend API
↓
Frontend

Verify that:
- The frontend sends the correct request.
- The backend receives it correctly.
- The backend communicates with the AI agent.
- The AI agent maintains session context.
- Gemini generates the required AI response.
- The backend returns the response to the frontend.
- The frontend displays the next question.
- The final structured feedback is displayed correctly.

---

## Prompt 2 — Final End-to-End Testing

Test the complete application as a real candidate would use it.

Perform the following flow:

1. Open the application.
2. Select or load a candidate.
3. Start the interview.
4. Receive the first question.
5. Submit an answer.
6. Receive an adaptive follow-up.
7. Continue the conversation.
8. Ensure at least 8 questions are completed.
9. Ensure at least 4 curriculum days are covered.
10. Complete the interview.
11. Display the final structured feedback.

Check for:
- API errors
- Incorrect request or response formats
- Session/context problems
- CORS problems
- Gemini API errors
- Frontend display errors
- Backend integration errors

Fix only critical issues required for the final working prototype.

---

# AI Tools Used

Our team used AI-assisted development for:
- Project planning
- Architecture design
- Frontend development
- Backend development
- AI-agent development
- API integration
- Debugging
- Testing
- Documentation

All generated code and suggestions were reviewed, integrated and tested by the team.
