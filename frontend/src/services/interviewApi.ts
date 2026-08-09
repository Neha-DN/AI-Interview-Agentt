/**
 * The ONLY module in the frontend that talks to the backend.
 * Public endpoint: POST /api/interview  (no authentication).
 *
 * Configure the backend with environment variables in `.env`:
 *   VITE_API_BASE_URL=http://localhost:8000
 *   VITE_USE_MOCK_API=true|false
 */
import type { InterviewRequest, InterviewResponse } from "./types";
import { mockInterview } from "./mockInterviewApi";

const BASE_URL = (import.meta.env['VITE_API_BASE_URL'] ?? "http://localhost:8000").replace(/\/$/, "");

const USE_MOCK = String(import.meta.env['VITE_USE_MOCK_API'] ?? "true") === "true";

export const apiMode = USE_MOCK ? "mock" : "live";
export const apiEndpoint = `${BASE_URL}/api/interview`;

export class InterviewApiError extends Error {}

function assertContract(data: unknown): InterviewResponse {
  const d = data as Partial<InterviewResponse> | null;
  if (!d || typeof d.reply !== "string" || typeof d.done !== "boolean") {
    throw new InterviewApiError(
      "Response does not match the official contract: expected { reply: string, done: boolean }.",
    );
  }
  return d as InterviewResponse;
}

export async function postInterview(body: InterviewRequest): Promise<InterviewResponse> {
  if (USE_MOCK) return assertContract(await mockInterview(body));

  let res: Response;
  try {
    res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new InterviewApiError(`Could not reach the interview API at ${apiEndpoint}.`);
  }

  if (!res.ok) {
    throw new InterviewApiError(`Interview API responded with ${res.status} ${res.statusText}.`);
  }

  return assertContract(await res.json());
}
