# FocusFlow AI ⚡
> AI-Powered Executive Productivity Assistant & Focus Command Center

FocusFlow AI is a full-stack web application powered by **Google Gemini 3.6**, designed to optimize daily workflow, eliminate cognitive fatigue, and turn high-level goals into systematic weekly execution.

---

## 🌟 Key Features

1. **Productivity Command Dashboard**:
   - Central hub with real-time deep work stats, streak tracking, and daily AI productivity insights.
   - Built-in Pomodoro Focus Timer with audio chimes and session log history.
   - Priority task manager with state persistence.

2. **AI Productivity Coach (Streaming Chat)**:
   - Real-time streaming responses powered by Gemini 3.6 Flash.
   - 4 specialized coaching personas: *High-Performance Strategist*, *Mindful Guide*, *Strict Mentor*, and *Peer Partner*.
   - Quick starter prompt triggers and conversation history management.

3. **Daily Time-Block Planner**:
   - Converts priorities, working hours, and peak energy windows into an optimized time-blocked markdown schedule.
   - Strategic break scheduling and distraction-mitigation triggers.

4. **Executive Notes Summarizer**:
   - Transforms unformatted meeting notes, brain dumps, or transcripts into structured markdown briefs.
   - 4 output templates: *Executive Brief*, *Action Items Checklist*, *Decision Log*, and *Detailed Topic Synthesis*.

5. **AI Email Draft Generator**:
   - Drafts executive-grade communications with custom tone options (*Professional*, *Concise*, *Warm*, *Persuasive*, *Polite Follow-up*).
   - Generates 3 catchy subject line options and clear calls-to-action.

6. **Goal Roadmap Architect**:
   - Deconstructs long-term objectives into multi-phase weekly roadmaps, 48-hour launch micro-steps, and risk matrices.

7. **Production & UX Excellence**:
   - **Zero Client-Side API Key Exposure**: All Gemini AI SDK calls are proxied securely through the Express server backend.
   - Dark & Light mode support.
   - One-click copy response buttons and local storage persistence for all user plans, drafts, and notes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion, React Markdown
- **Backend**: Express.js (Node.js 20), Google GenAI SDK (`@google/genai`)
- **AI Model**: `gemini-3.6-flash`
- **Deployment**: Docker containerization, AWS App Runner / Google Cloud Run compatible

---

## 🚀 Environment Variables

Copy `.env.example` to `.env` and set your variables:

```env
# GEMINI_API_KEY: Required for Gemini AI API calls
GEMINI_API_KEY="your_google_gemini_api_key_here"

# PORT: Server port (defaults to 3000)
PORT=3000
```

---

## 💻 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build & Production Test**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

### 1. Build Docker Image
```bash
docker build -t focusflow-ai .
```

### 2. Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  --name focusflow-app \
  focusflow-ai
```

---

## ☁️ AWS App Runner Deployment

1. **Push Container to Amazon ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag focusflow-ai:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/focusflow-ai:latest
   docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/focusflow-ai:latest
   ```

2. **Create App Runner Service**:
   - Source: Container registry (ECR)
   - Port: `3000`
   - Environment Variable: Set `GEMINI_API_KEY` in the App Runner configuration.

---

## 📜 License

Apache-2.0
