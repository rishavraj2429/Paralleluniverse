# AWS & Cloud Deployment Guide for Eulr Meeting Bot

This guide explains how to deploy **Eulr** to AWS ECS Fargate or Google Cloud Run for running autonomous headless browser meeting bots in the cloud.

---

## 1. Architecture Overview

```
[ Calendar Sync / User Dashboard ] 
             │
             ▼
[ Next.js API & Scheduler ]
             │
             ▼
[ AWS ECS Fargate Worker Task ]
 ├── Headless Chromium (Playwright)
 ├── WebRTC Media Injector (Virtual Mic / Cam Loop)
 ├── Audio Recording Stream
 └── AI Pipeline (Whisper & LLM Summarizer)
```

---

## 2. Docker Container Deployment to AWS ECR & ECS

### Step 1: Build & Push Docker Image to ECR

```bash
# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR Repository
aws ecr create-repository --repository-name eulr-bot-engine

# Tag & Push Image
docker build -t eulr-bot-engine .
docker tag eulr-bot-engine:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/eulr-bot-engine:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/eulr-bot-engine:latest
```

### Step 2: Configure ECS Task Definition

```json
{
  "family": "eulr-bot-task",
  "cpu": "2048",
  "memory": "4096",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "containerDefinitions": [
    {
      "name": "eulr-app",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/eulr-bot-engine:latest",
      "portMappings": [
        { "containerPort": 3000, "hostPort": 3000 }
      ],
      "environment": [
        { "name": "HEADLESS", "value": "true" },
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        { "name": "OPENAI_API_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:OPENAI_KEY" }
      ]
    }
  ]
}
```

---

## 3. Chrome WebRTC Flags for Headless Media Injection

When running on headless Linux containers without a physical monitor/webcam, Chromium uses the following flags configured in `src/bot-engine/MediaStreamInjector.ts`:

- `--use-fake-ui-for-media-stream`: Automatically grants browser camera & microphone permissions without popping up UI prompts.
- `--use-fake-device-for-media-stream`: Supplies synthetic video test pattern or feeds a pre-recorded `.y4m` video stream as the virtual camera output.
- `--use-file-for-fake-video-capture=/path/to/avatar_loop.y4m`: Loops user's avatar video live in Zoom/Meet calls.
- `--autoplay-policy=no-user-gesture-required`: Enables unmuted audio stream playback without requiring user clicks.
- `--disable-blink-features=AutomationControlled`: Hides Playwright automation flag to bypass anti-bot detection in Zoom Web Client and Google Meet.
