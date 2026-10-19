# Eulr - Autonomous Cloud Meeting Bot Platform 🚀

**Eulr** is an open-source, full-stack cloud meeting bot platform built with **Next.js 14**, **TypeScript**, **Playwright**, **OpenAI Whisper**, and **LLM Summarization**.

It allows users to dispatch autonomous bots to join **Zoom**, **Google Meet**, and **Microsoft Teams** meetings on demand or on a schedule under their identity, stream prerecorded video/audio loops (or operate muted), record meetings, and generate AI-powered transcripts, executive summaries, and action items.

---

## 🌟 Key Features

- ☁️ **Cloud Bot Worker Engine**: Powered by Playwright Chromium with WebRTC synthetic stream injection.
- 🎥 **Multi-Platform Support**: Works out of the box with **Zoom Web Client**, **Google Meet**, and **Microsoft Teams**.
- 🕐 **Scheduled & Instant Dispatch**: Launch bots immediately via URL or schedule them for future calendar dates via built-in cron scheduler.
- 👤 **Virtual Persona & Identity Manager**: Customize display names, associate emails, and upload pre-recorded MP4/Y4M video loops to stream as virtual camera output.
- 📝 **AI Speech-to-Text & Intelligence**: Generates synchronized transcripts, executive summaries, action items with assignees, and topic timelines.
- 🛠️ **Real-Time Execution Logs**: Inspect step-by-step Playwright browser navigation logs directly from the dashboard.

---

## 🏗️ Repository Architecture

```
Paralleluniverse/
├── src/
│   ├── app/
│   │   ├── api/                   # Next.js REST API (meetings, dispatch, personas)
│   │   ├── meetings/[id]/        # Meeting Intelligence Workspace (Transcript, Summary, Action items, Logs)
│   │   ├── personas/             # Bot Identity & Virtual Webcam Video Manager
│   │   └── page.tsx              # Main Control Center & Bot Dispatcher Dashboard
│   ├── bot-engine/
│   │   ├── BaseBot.ts            # Chromium WebRTC flags & stealth initializer
│   │   ├── GoogleMeetBot.ts      # Google Meet auto-join driver
│   │   ├── ZoomWebBot.ts        # Zoom Web Client URL transformer & auto-join driver
│   │   ├── MSTeamsBot.ts        # MS Teams prejoin driver
│   │   ├── MediaStreamInjector.ts# Fake device capture & video loop stream injector
│   │   └── BotOrchestrator.ts    # Lifecycle & status state machine manager
│   ├── ai-pipeline/
│   │   ├── transcriber.ts        # Whisper Speech-to-Text pipeline
│   │   └── summarizer.ts         # LLM Executive Summary & Action Item extractor
│   ├── scheduler/
│   │   └── scheduler.ts          # Node-cron background task runner for scheduled bots
│   ├── lib/
│   │   └── store.ts              # Persistent database & meeting state engine
│   └── types/
│       └── meeting.ts            # TypeScript interfaces
├── Dockerfile                    # Production Playwright Chromium image setup
├── docker-compose.yml            # Docker container deployment spec
└── AWS_DEPLOYMENT.md             # AWS ECS Fargate & Cloud Run deployment guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies & Playwright Chromium

```bash
npm install
npx playwright install chromium
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the **Eulr Control Center**.

---

## 💻 Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
HEADLESS=true
PORT=3000
```
