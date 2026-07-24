import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to instantiate Gemini Client safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ----------------------------------------------------
// Health Check API
// ----------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ----------------------------------------------------
// 1. AI Coach Chat Endpoint (Streaming SSE)
// ----------------------------------------------------
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { messages, persona = "High-Performance Strategist" } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    const systemInstructions: Record<string, string> = {
      "Focus":
        "You are an elite high-performance productivity coach. You focus on deep work, time blocking, energy management, priority alignment (Eisenhower matrix), and actionable, concise advice. Keep responses sharp, encouraging, and structured with bullet points or clear steps.",
      "High-Performance Strategist":
        "You are an elite high-performance productivity coach. You focus on deep work, time blocking, energy management, priority alignment (Eisenhower matrix), and actionable, concise advice. Keep responses sharp, encouraging, and structured with bullet points or clear steps.",
      "Calm":
        "You are an empathetic mindful productivity coach. You help users prevent burnout, manage anxiety, embrace breaks, maintain work-life balance, and focus on sustainable, steady momentum. Use a soothing, supportive tone.",
      "Mindful Guide":
        "You are an empathetic mindful productivity coach. You help users prevent burnout, manage anxiety, embrace breaks, maintain work-life balance, and focus on sustainable, steady momentum. Use a soothing, supportive tone.",
      "Challenge Me":
        "You are a no-nonsense, direct accountability mentor. You push back against procrastination, excuses, and task-switching. Direct, highly tactical, and focus on immediate execution.",
      "Strict Mentor":
        "You are a no-nonsense, direct accountability mentor. You push back against procrastination, excuses, and task-switching. Direct, highly tactical, and focus on immediate execution.",
      "Brainstorm":
        "You are an encouraging, upbeat peer accountability partner. You brainstorm ideas, celebrate small wins, and break overwhelming tasks into 5-minute micro-steps.",
      "Friendly Partner":
        "You are an encouraging, upbeat peer accountability partner. You brainstorm ideas, celebrate small wins, and break overwhelming tasks into 5-minute micro-steps.",
    };

    const sysInstruction =
      systemInstructions[persona] || systemInstructions["High-Performance Strategist"];

    // Format chat history into contents array for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("AI Coach error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to process AI chat." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// ----------------------------------------------------
// 2. Daily Planner Generator Endpoint
// ----------------------------------------------------
app.post("/api/ai/plan-day", async (req: Request, res: Response) => {
  try {
    const { priorities, startTime, endTime, peakEnergyTime, fixedEvents, breakPreference } = req.body;

    const ai = getGeminiClient();

    const prompt = `Create an optimized, realistic daily time-blocked schedule for me based on the following input:
- Top Priorities / Tasks: ${priorities || "Not specified"}
- Working Hours: ${startTime || "9:00 AM"} to ${endTime || "5:00 PM"}
- Peak Energy Hours: ${peakEnergyTime || "Morning"}
- Fixed Meetings / Hard Commitments: ${fixedEvents || "None"}
- Break Preference: ${breakPreference || "50-min deep focus / 10-min break (Pomodoro style)"}

Return a valid JSON object matching this schema:
{
  "summary": "Short 2-sentence overarching focus theme for the day.",
  "blocks": [
    {
      "id": "1",
      "time": "09:00 AM - 10:30 AM",
      "title": "Task or activity name",
      "durationMinutes": 90,
      "type": "Deep Work",
      "priority": "High",
      "breakSuggestion": "Short recommendation for rest after this block"
    }
  ],
  "markdown": "Detailed markdown formatted schedule for fallback/reading"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert time-blocking productivity strategist. Always respond with a valid JSON object containing summary, blocks, and markdown keys.",
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    let parsed = { summary: "", blocks: [], markdown: "" };
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch (e) {
      console.warn("Failed to parse JSON from AI plan-day response, falling back");
    }

    res.json({
      schedule: parsed.markdown || response.text,
      summary: parsed.summary || "Optimized time-blocked focus schedule",
      blocks: parsed.blocks || [],
    });
  } catch (error: any) {
    console.error("Plan Day error:", error);
    res.status(500).json({ error: error.message || "Failed to generate daily schedule." });
  }
});

// ----------------------------------------------------
// 3. Notes Summarizer Endpoint
// ----------------------------------------------------
app.post("/api/ai/summarize", async (req: Request, res: Response) => {
  try {
    const { rawNotes, format = "Executive Brief" } = req.body;

    if (!rawNotes || typeof rawNotes !== "string" || !rawNotes.trim()) {
      return res.status(400).json({ error: "Raw notes content is required." });
    }

    const ai = getGeminiClient();

    const prompt = `Summarize and structure the following raw notes into a comprehensive executive analysis.
Return a valid JSON object containing these EXACT fields:
{
  "summary": "High-level 2-3 sentence synthesis overview",
  "keyPoints": ["Core takeaway 1", "Core takeaway 2", "Core takeaway 3"],
  "actionItems": [
    {"task": "Specific task description", "assignee": "Name or Unassigned", "priority": "High"}
  ],
  "deadlines": ["Due Date 1 - Description", "Due Date 2 - Description"],
  "importantDates": ["Date / Event 1", "Date / Event 2"],
  "questionsToReview": ["Open question 1 to resolve", "Open question 2"],
  "markdown": "Clean markdown report combining all above sections nicely formatted with headers"
}

RAW NOTES:
"""
${rawNotes}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class executive assistant. Always output structured JSON containing summary, keyPoints, actionItems, deadlines, importantDates, questionsToReview, and markdown fields.",
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch (e) {
      console.warn("Failed to parse JSON from AI summarize response");
    }

    res.json({
      summary: parsed.markdown || response.text,
      structured: parsed,
    });
  } catch (error: any) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize notes." });
  }
});

// ----------------------------------------------------
// 4. Email Generator Endpoint
// ----------------------------------------------------
app.post("/api/ai/email", async (req: Request, res: Response) => {
  try {
    const { goal, recipient, context, tone = "Professional", bulletPoints } = req.body;

    if (!goal) {
      return res.status(400).json({ error: "Email goal/purpose is required." });
    }

    const ai = getGeminiClient();

    const prompt = `Draft a compelling email based on the following brief:
- Goal / Purpose: ${goal}
- Recipient: ${recipient || "General Recipient"}
- Category / Tone: ${tone}
- Additional Context: ${context || "None"}
- Must Include Points: ${bulletPoints || "None"}

Return a valid JSON object matching this schema:
{
  "subjectOptions": [
    "Option 1: Clear & Direct",
    "Option 2: Engaging & Personal",
    "Option 3: High Impact"
  ],
  "subject": "The recommended default subject line",
  "body": "The complete formatted email body ready to edit or send (with greeting, paragraphs, bullet points if relevant, call to action, and professional sign-off)",
  "markdown": "Complete formatted email report with subject options and body in markdown"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class executive communication strategist. Always return structured JSON with subjectOptions, subject, body, and markdown fields.",
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch (e) {
      console.warn("Failed to parse JSON from AI email response");
    }

    res.json({
      email: parsed.markdown || response.text,
      subjectOptions: parsed.subjectOptions || [parsed.subject || "Follow up"],
      subject: parsed.subject || "Subject line",
      body: parsed.body || response.text,
    });
  } catch (error: any) {
    console.error("Email generator error:", error);
    res.status(500).json({ error: error.message || "Failed to generate email draft." });
  }
});

// ----------------------------------------------------
// 5. Goal Planner / Roadmap Endpoint
// ----------------------------------------------------
app.post("/api/ai/goal-roadmap", async (req: Request, res: Response) => {
  try {
    const { goalTitle, timeframe = "30 Days", currentStatus, obstacles } = req.body;

    if (!goalTitle) {
      return res.status(400).json({ error: "Goal title is required." });
    }

    const ai = getGeminiClient();

    const prompt = `Build an actionable, step-by-step Goal Roadmap for the following goal:
- Main Goal: ${goalTitle}
- Target Timeframe: ${timeframe}
- Current Starting Point: ${currentStatus || "Starting from scratch"}
- Expected Challenges / Obstacles: ${obstacles || "General time & focus constraints"}

Please structure the roadmap in Markdown with:
1. 🎯 **North Star Outcome**: Clear definition of success.
2. 🗓️ **Phase-by-Phase Roadmap**:
   - Split timeframe logically (e.g. Week 1, Week 2... or Phase 1, Phase 2...).
   - List key milestones and specific weekly deliverables.
3. ✅ **Immediate Action Steps (Next 48 Hours)**: 3 high-impact micro-tasks to launch momentum.
4. ⚠️ **Risk Matrix & Mitigation Strategies**: Anticipated friction points and how to overcome them.
5. 📊 **Key Metrics (KPIs)**: How to measure weekly progress.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite OKR (Objectives and Key Results) & goal implementation strategist. Produce realistic, motivating, structured goal roadmaps.",
        temperature: 0.5,
      },
    });

    res.json({ roadmap: response.text });
  } catch (error: any) {
    console.error("Goal Roadmap error:", error);
    res.status(500).json({ error: error.message || "Failed to generate goal roadmap." });
  }
});

// ----------------------------------------------------
// 6. Quick Daily Productivity Boost Endpoint
// ----------------------------------------------------
app.post("/api/ai/quick-tip", async (_req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Give me 1 powerful, research-backed, actionable productivity tip for today in under 50 words. Focus on deep work, focus retention, or cognitive energy management.",
      config: {
        temperature: 0.8,
      },
    });
    res.json({ tip: response.text });
  } catch (error: any) {
    res.json({ tip: "Focus on one high-value task for 25 uninterrupted minutes before opening email or social media. Momentum builds clarity." });
  }
});

// ----------------------------------------------------
// Server Startup & Vite Middleware Integration
// ----------------------------------------------------
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
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FocusFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
