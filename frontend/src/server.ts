import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { execFile } from "node:child_process";
import path from "node:path";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleApiInterview(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const payloadJson = JSON.stringify(body);

    const rootDir = process.cwd().endsWith("frontend")
      ? path.resolve(process.cwd(), "..")
      : process.cwd();

    const scriptPath = path.join(rootDir, "ai-agent", "ai-agent", "interview_engine.py");
    const aiAgentDir = path.join(rootDir, "ai-agent", "ai-agent");

    return new Promise((resolve) => {
      const child = execFile(
        "python3",
        [scriptPath, "-"],
        {
          cwd: rootDir,
          env: {
            ...process.env,
            PYTHONPATH: `${aiAgentDir}:${process.env["PYTHONPATH"] || ""}`,
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python interview engine error:", error, stderr);
            resolve(
              new Response(
                JSON.stringify({
                  error: "Failed to process interview turn",
                  details: stderr || error.message,
                }),
                {
                  status: 500,
                  headers: { "content-type": "application/json" },
                },
              ),
            );
            return;
          }
          try {
            const data = JSON.parse(stdout);
            resolve(
              new Response(JSON.stringify(data), {
                status: 200,
                headers: { "content-type": "application/json" },
              }),
            );
          } catch (parseError) {
            console.error("Failed to parse Python response:", stdout);
            resolve(
              new Response(
                JSON.stringify({
                  error: "Invalid JSON response from AI Agent",
                  raw: stdout,
                }),
                {
                  status: 500,
                  headers: { "content-type": "application/json" },
                },
              ),
            );
          }
        },
      );

      if (child.stdin) {
        child.stdin.write(payloadJson);
        child.stdin.end();
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process request";
    console.error("API interview error:", err);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/interview") {
        return await handleApiInterview(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
