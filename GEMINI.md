# UrbanGuard-AI — Antigravity Agent Rules
# Save as: your-workspace/.agents/rules/urbanguard-rules.md
# Read UrbanGuard-AI_PRD.md before starting ANY task.

---

## PROJECT IDENTITY

Product name: **UrbanGuard-AI**
Purpose: Government infrastructure monitoring system for Chennai, India.
All requirements, coordinates, schemas, and AI prompts are in `UrbanGuard-AI_PRD.md`.
Read the PRD in full before writing any code.

---

## TECH STACK — NEVER DEVIATE

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router v6 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Map | Leaflet.js + react-leaflet + react-leaflet-cluster |
| Charts | Recharts |
| State | React Context API only |
| AI | groq-sdk (npm package) |
| Groq Model | openai/gpt-oss-120b |
| HTTP Client | Axios |

Do NOT use: Next.js, Firebase, MongoDB, Redux, Zustand, Material UI, Ant Design, Chakra UI, or any CSS framework other than Tailwind.

---

## FOLDER STRUCTURE — ALWAYS FOLLOW

```
urbanguard-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── map/
│   │   │   ├── charts/
│   │   │   ├── binary-search/
│   │   │   │   └── BinarySearchVisualiser.jsx
│   │   │   ├── iot/
│   │   │   ├── anomaly/
│   │   │   ├── jobs/
│   │   │   └── ai/
│   │   │       ├── ChatPanel.jsx
│   │   │       ├── FaultReport.jsx
│   │   │       ├── PredictionPanel.jsx
│   │   │       ├── NLSearchBar.jsx
│   │   │       ├── AIBadge.jsx
│   │   │       └── StreamingText.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AssetMap.jsx
│   │   │   │   ├── StreetLights.jsx
│   │   │   │   ├── Roads.jsx
│   │   │   │   ├── WaterPipes.jsx
│   │   │   │   ├── Sewers.jsx
│   │   │   │   ├── Complaints.jsx
│   │   │   │   ├── ContractorJobs.jsx
│   │   │   │   └── Reports.jsx
│   │   │   ├── citizen/
│   │   │   │   └── ComplaintForm.jsx
│   │   │   └── contractor/
│   │   │       ├── ContractorDashboard.jsx
│   │   │       ├── JobBoard.jsx
│   │   │       └── MyJobs.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── AssetContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAssets.js
│   │   │   ├── useSocket.js
│   │   │   ├── useBinarySearch.js
│   │   │   └── useGroqStream.js
│   │   ├── utils/
│   │   │   ├── binarySearch.js
│   │   │   ├── anomalyDetection.js
│   │   │   ├── iotSimulator.js
│   │   │   └── helpers.js
│   │   ├── data/
│   │   │   └── assets.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assets.js
│   │   ├── complaints.js
│   │   ├── jobs.js
│   │   ├── iot.js
│   │   └── ai.js
│   ├── services/
│   │   └── groqService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── Asset.js
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Job.js
│   ├── socket/
│   │   └── jobDispatch.js
│   ├── seed/
│   │   └── seedAssets.js
│   ├── db.js
│   └── index.js
│
├── UrbanGuard-AI_PRD.md
├── .env
└── README.md
```

---

## CODING STANDARDS

### All Files
- Top comment in every file: one line describing what it does
- async/await only — never .then() chains
- Always use try/catch around async code
- All secrets in .env only — never hardcode API keys or passwords
- No console.log in production — use a simple logger

### React
- Functional components only — no class components
- One default export per component file
- PascalCase filenames for components
- Tailwind classes only — never inline styles
- Keep components under 200 lines — split if longer
- All API calls via Axios — never raw fetch in components
- Axios base URL from VITE_API_URL env variable
- Every data fetch shows a skeleton loader — never a blank screen

### Backend
- All routes except /api/auth/login require authMiddleware
- Role checks in roleMiddleware only
- All API success responses: { "success": true, "data": {}, "message": "" }
- All errors: { "success": false, "error": "message" }
- Parameterized queries only — never string-concatenate SQL
- All tables have created_at and updated_at columns

---

## GROQ AI RULES

### Central Service
All Groq calls MUST go through server/services/groqService.js only.

```javascript
// server/services/groqService.js
import Groq from "groq-sdk";
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function groqChat(messages, stream = false) {
  return await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages,
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    reasoning_effort: "medium",
    stream,
    stop: null,
  });
}
```

### Streaming Pattern (SSE)
Backend streams via Server-Sent Events. Frontend consumes via useGroqStream hook.
See PRD Section 8 for full streaming code pattern.

### 10 AI Features to Implement (all prompts in PRD Section 8)
1. Admin AI Chatbot — POST /api/ai/chat (streaming)
2. Fault Report Generator — GET /api/ai/fault-report/:assetId (streaming)
3. Complaint Classifier — called inside POST /api/complaints (JSON response)
4. Complaint Acknowledgement — after complaint saved (streaming to frontend)
5. System Health Report — POST /api/ai/report (streaming)
6. Contractor Job Briefing — GET /api/ai/briefing/:jobId (streaming)
7. Predictive Maintenance Advisor — GET /api/ai/prediction/:assetId (streaming)
8. Natural Language Search — POST /api/ai/search (JSON response)
9. Social Media Summariser — GET /api/ai/social-summary/:assetId (streaming)
10. Job Notification Writer — called inside job creation (non-streaming)
11. Daily Digest — GET /api/ai/digest (streaming, once per day)

### AI UI Rules
- Every AI-generated section has a red "AI" pill badge
- Streaming text uses StreamingText.jsx component (typewriter effect)
- While streaming: card has pulsing red border animation
- Error state: "AI is temporarily unavailable." in red text — never show raw errors

---

## AUTHENTICATION RULES

Hardcoded MVP users (seed on startup):
- admin / admin123 / role: admin
- user / user123 / role: citizen
- contractor / contractor123 / role: contractor

JWT stored in localStorage as urbanguard_token
JWT payload: { id, username, role }
Expiry: 24 hours
Wrong role accessing a route: redirect to /

---

## ASSET DATA RULES

- All 100 coordinates are in UrbanGuard-AI_PRD.md Section 3.4 — use them exactly
- Stored in client/src/data/assets.js
- Seed script runs on server start if assets table is empty
- IDs are immutable: SL-001 to SL-025, RD-001 to RD-025, WP-001 to WP-025, SW-001 to SW-025

---

## BINARY SEARCH RULES

- Algorithm in client/src/utils/binarySearch.js
- Visualiser component: client/src/components/binary-search/BinarySearchVisualiser.jsx
- Props: assetType, totalUnits, readings[], expectedPerUnit, assetId
- Animation: 400ms delay per step
- Faulty unit: solid red box with FAULT label
- Simulate Fault button: random faulty unit, reruns animation
- No asset-specific logic inside the component — props only

---

## IOT SIMULATION RULES

- Updates every 30 seconds via setInterval
- Normal variance: ±3% random
- Faulty reading: 20–40% below expected
- Status thresholds: <5% = healthy, 5-20% = warning, >20% = critical
- Binary search auto-triggers at deviation > 15%

---

## SOCKET.IO RULES

- Server events: new_job, job_taken, job_confirmed, job_status_update
- Client events: accept_job { job_id, contractor_id }
- Rooms: contractors room, admin room
- Race condition guard: verify job is still 'open' before confirming accept

---

## MAP RULES

- Use react-leaflet only
- Centre: [13.0827, 80.2707], zoom 12
- Tile: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
- Use react-leaflet-cluster for zoom < 12
- Marker colours: healthy = white, warning = red small, critical = red large pulsing, repair = gray

---

## DESIGN RULES — STRICT

### Color Palette (Rocket-inspired — black/white/red only)
```
#000000  — Main background (pure black)
#0D0D0D  — Cards and panels
#141414  — Modals and elevated surfaces
#1C1C1C  — All borders and dividers
#E8372A  — Brand red (buttons, badges, icons, logo, active states)
#C62D21  — Red on hover
#FFFFFF  — All primary text
#999999  — Secondary text (descriptions, captions)
#555555  — Muted text (placeholders, timestamps)
```

ONLY these colours. No other colours anywhere in the app.

### Typography
- Display: Syne 800 — hero headings, page titles
- Body: DM Sans 400/500/600 — all body text and UI labels
- Mono: JetBrains Mono 400/500 — IDs, sensor readings, numbers

### Tailwind Config
```javascript
colors: {
  bg: '#000000', surface: '#0D0D0D', 'surface-2': '#141414',
  border: '#1C1C1C', accent: '#E8372A', 'accent-hover': '#C62D21',
},
fontFamily: {
  display: ['Syne', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
```

### Component Patterns
- Primary button: bg-accent text-white rounded-full px-6 py-3 hover:bg-accent-hover
- Secondary button: border border-white text-white rounded-full px-6 py-3
- Card: bg-surface border border-border rounded-xl p-6 hover:border-accent transition
- Badge critical: bg-accent text-white text-xs px-3 py-1 rounded-full font-mono
- Badge warning: border border-accent text-accent text-xs px-3 py-1 rounded-full font-mono
- AI badge: bg-accent text-white text-xs px-2 py-0.5 rounded font-mono font-bold

### What NEVER to do
- Never use a white or light background anywhere
- Never use purple, blue, green, or any colour not in the palette
- Never use Inter, Roboto, Arial, or Space Grotesk
- Never use box shadows with colour — border highlights only
- Never make a button that is not red-filled or white-outline

---

## PHASE AWARENESS

- State phase number at the start of every task
- Do not proceed to next phase until current is verified working
- After each phase output 3 bullets: what was built / how to test / what comes next

---

*UrbanGuard-AI GEMINI.md v3.0*
