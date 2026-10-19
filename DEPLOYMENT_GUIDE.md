# 🚀 Deploying Eulr Meeting Bot Platform to Render, Railway, or Vercel

Is guide me sikhaya gaya hai ki **Eulr Meeting Bot Engine** ko **Render**, **Railway**, ya **Vercel** par kaise 2 minutes me deploy kar sakte hain.

---

## 📌 Important Cloud Architecture Note

- **Meeting Bots (Zoom, Google Meet, Teams)** ko join karne ke liye **Headless Chromium + WebRTC Media Injection** background me continuous time (15-60 minutes) tak chalana padta hai.
- **Render.com** aur **Railway.app** par Docker support hota hai, isliye **Render / Railway is HIGHLY RECOMMENDED** for running full meeting bot workers.
- **Vercel** Serverless Functions par time-limit hoti hai, isliye Vercel Dashboard UI ke liye accha hai, jabki Render/Railway complete full-stack bot runner ke liye best hai.

---

## 🟢 Option 1: Deploy on Render (Recommended for Free/Cheap Docker Deployment)

### Step 1: Push project to GitHub
Apne project ko GitHub repository me push karein:
```bash
git init
git add .
git commit -m "Deploy Eulr Meeting Bot"
git remote add origin https://github.com/YOUR_USERNAME/eulr-meeting-bot.git
git push -u origin main
```

### Step 2: Render Par Blueprint Import Karein
1. Go to **[Render.com](https://render.com)** and log in.
2. Click **New +** → **Blueprint**.
3. Apne GitHub repo (`eulr-meeting-bot`) ko connect karein.
4. Render automatically `render.yaml` detect kar lega aur Docker container, Playwright Chromium, aur persistent storage volume setup kar dega!
5. Add Environment Variable:
   - `OPENAI_API_KEY`: *(Optional - for Whisper transcription)*
   - `HEADLESS`: `true`
6. Click **Apply**. Apka Eulr platform **https://eulr-meeting-bot.onrender.com** par live ho jayega!

---

## 🟣 Option 2: Deploy on Railway (Fastest Docker Cloud Setup)

1. Go to **[Railway.app](https://railway.app)**.
2. Click **New Project** → **Deploy from GitHub Repo**.
3. Select your `eulr-meeting-bot` repository.
4. Railway will automatically pick up `Dockerfile` and `railway.json`.
5. Add Environment Variables:
   - `HEADLESS=true`
   - `PORT=3000`
6. Click **Deploy**. Done!

---

## ⚪ Option 3: Deploy Frontend UI on Vercel

1. Go to **[Vercel.com](https://vercel.com)**.
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Framework Preset select karein: **Next.js**.
5. Click **Deploy**.

---

## ⚙️ Environment Variables Summary

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `HEADLESS` | `true` | Headless Chrome execution for server environment |
| `PORT` | `3000` | HTTP port |
| `OPENAI_API_KEY` | `sk-...` | (Optional) OpenAI Whisper API Key for real-time transcription |
