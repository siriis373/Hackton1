# HealBot — AI Auto-Fix Pipeline

> Push a commit → CI fails → n8n sends error log to Ollama AI → AI diagnoses the bug → Fix appears on live dashboard

---

## Project Structure

```
healbot-demo/
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions: runs tests, POSTs log to n8n
├── src/
│   ├── app.js                  ← Demo app (has an intentional bug)
│   └── app.test.js             ← Tests (will fail until bug is fixed)
├── server/
│   └── server.js               ← Express server: receives n8n result, serves dashboard
├── dashboard/
│   └── index.html              ← Live judge-facing dashboard
├── package.json
└── README.md
```

---

## Your Role (Person 3) — Setup Steps

### Step 1 — Create GitHub Repo
1. Go to github.com → New repository → name it `healbot-demo`
2. Push this entire folder to it:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/healbot-demo.git
   git push -u origin main
   ```

### Step 2 — Add GitHub Secret
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `HEALBOT_WEBHOOK_URL`
4. Value: **(get this from Person 2 — it's the n8n webhook URL)**

### Step 3 — Run the Dashboard Server
On your laptop:
```bash
npm install
npm run server
```
Opens at: http://localhost:3000

### Step 4 — Tell n8n where to POST the result
Give Person 2 this URL for the n8n "final POST" node:
```
http://YOUR_LAPTOP_IP:3000/webhook
```
(Person 2's n8n should POST the AI fix result here after Ollama processes it)

### Step 5 — Test the pipeline
1. Push any commit to trigger CI
2. Watch the dashboard light up at http://localhost:3000

---

## What n8n should POST to /webhook

Person 2's n8n final node should POST JSON to `http://YOUR_IP:3000/webhook`:

```json
{
  "status": "failure",
  "error_log": "...full test output...",
  "ai_fix": "...Ollama's suggested fix...",
  "commit": "abc1234",
  "branch": "main",
  "actor": "your-github-username",
  "repo": "username/healbot-demo",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

---

## The Demo Flow for Judges

1. **Show** the dashboard on the big screen: http://localhost:3000
2. **Make a commit** (or just `git commit --allow-empty -m "trigger" && git push`)
3. **Watch** the pipeline flow light up step by step
4. **Point** to the AI Fix panel — "Ollama read the error log and suggested this fix"
5. **Apply the fix** and push again — dashboard shows green PASS ✓

---

## The Intentional Bug

In `src/app.js`, line 21:
```js
// BUG: wrong formula
return celsius * 9 + 32;   // ← wrong

// CORRECT:
return (celsius * 9/5) + 32;  // ← what Ollama should suggest
```

Tests will fail on temperature conversion — this is intentional for the demo.
