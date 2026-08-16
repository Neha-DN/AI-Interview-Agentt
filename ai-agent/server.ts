import express from "express";
import path from "path";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Official Technical Specification HTTP Endpoint
app.post("/api/interview", (req, res) => {
  const payload = req.body || {};
  const payloadJson = JSON.stringify(payload);

  const scriptPath = path.join(process.cwd(), "ai-agent", "interview_engine.py");

  const child = execFile("python3", [scriptPath, "-"], (error, stdout, stderr) => {
    if (error) {
      console.error("Python interview engine error:", error, stderr);
      return res.status(500).json({
        error: "Failed to process interview turn",
        details: stderr || error.message
      });
    }
    try {
      const responseData = JSON.parse(stdout);
      return res.json(responseData);
    } catch (parseError) {
      console.error("Failed to parse Python response:", stdout);
      return res.status(500).json({
        error: "Invalid JSON response from AI Agent",
        raw: stdout
      });
    }
  });

  if (child.stdin) {
    child.stdin.write(payloadJson);
    child.stdin.end();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Agent Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
