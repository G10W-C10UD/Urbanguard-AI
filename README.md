<p align="center">
  <img src="docs/banner.png" alt="UrbanGuard-AI Banner" width="100%" />
</p>

<h1 align="center">🏙️ UrbanGuard-AI</h1>

<p align="center">
  <strong>Protecting Chennai's Infrastructure. Powered by AI.</strong>
</p>

<p align="center">
  A full-stack government infrastructure monitoring platform for real-time fault detection, predictive maintenance, and automated contractor dispatch across 100 assets in Chennai, India.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Groq_AI-GPT--OSS--120B-E8372A?style=for-the-badge&logo=openai&logoColor=white" alt="Groq AI" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-E8372A?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/city-Chennai-white?style=flat-square" alt="Chennai" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [The 5 Detection Methods](#-the-5-detection-methods)
- [Binary Search Fault Detection — Explained](#-binary-search-fault-detection--explained)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Default Credentials](#-default-credentials)
- [Project Structure](#-project-structure)
- [AI Features](#-ai-features)
- [Credits](#-credits)

---

## 🏛️ About

**UrbanGuard-AI** is a government-grade smart city platform built for **Chennai Municipal Corporation**. It monitors **100 real infrastructure assets** — street lights, roads, water pipelines, and sewer lines — using a combination of simulated IoT sensors, predictive analytics, citizen complaints, social media intelligence, and a novel **binary search fault isolation algorithm**.

The system features three distinct portals:

| Portal | Role | Purpose |
|--------|------|---------|
| 🛡️ **Admin Dashboard** | Government Officials | Full monitoring, AI reports, contractor dispatch |
| 👤 **Citizen Portal** | General Public | Submit and track infrastructure complaints |
| 🔧 **Contractor Portal** | Repair Workers | Accept jobs, receive AI briefings, track earnings |

Every layer of the application is enhanced by **Groq AI (GPT-OSS-120B)** — from real-time chatbot assistance and predictive maintenance advisories to automated fault reports and natural language asset search.

---

## ✨ Key Features

### Admin Dashboard
- 📊 **Real-time overview** with 8 stat cards, health charts, and activity feed
- 🗺️ **Interactive Chennai map** with 100 plotted assets (Leaflet + clustering)
- 📋 **Asset management** tables with sorting, filtering, and detail panels
- 🤖 **AI chatbot** with full system context — ask anything about infrastructure
- 📝 **AI-generated reports** — daily briefings, critical alerts, deep-dive analysis
- 🔍 **Natural language search** — *"Find all critical water pipes in North Chennai"*
- 🚀 **Rapido-style job dispatch** — auto-create and broadcast repair jobs via Socket.io

### Citizen Portal
- 📝 Complaint submission with AI-powered classification
- 🤖 AI-generated personalized acknowledgement (streamed)
- 📋 Complaint tracking table with status updates

### Contractor Portal
- 📡 **Live job board** — new jobs appear instantly via WebSocket
- 📄 **AI contractor briefings** — auto-generated repair instructions
- 📊 **Earnings tracker** with per-job breakdown
- 🔄 **Job lifecycle management** — Assigned → En Route → In Progress → Completed

---

## 🔬 The 5 Detection Methods

UrbanGuard-AI uses **5 independent detection signals** that work together to identify infrastructure failures. Each asset is continuously evaluated across all five methods:

### 1. 📡 IoT Sensor Monitoring
Real-time simulated sensor readings updated every **30 seconds**. Each asset type has specific metrics:

| Asset Type | Metric | Unit | Healthy Threshold |
|-----------|--------|------|-------------------|
| Street Lights | Power consumption | Watts | < 5% deviation |
| Roads | Vibration / stress index | 0–100 score | < 5% deviation |
| Water Pipelines | Flow rate + pressure | LPM + Bar | < 5% deviation |
| Sewer Lines | Flow volume | m³/hour | < 5% deviation |

**Status classification:** `< 5%` → Healthy · `5–20%` → Warning · `> 20%` → Critical

### 2. 🧠 Predictive Anomaly Detection
Multi-factor risk scoring combining:

```
risk_score = ((age_factor × 0.4) + (weather_factor × 0.4) + (base × 0.2)) × 100
```

- **Age Factor** — Years in service vs expected lifespan
- **Weather Factor** — Chennai-specific seasonal risks (monsoon, summer UV, northeast monsoon)
- **Predicted Failure Date** — Calculated from remaining useful life

Risk levels: `0–33` Low · `34–66` Medium · `67–100` High (auto-flag)

### 3. 📢 Citizen Complaints
Weighted complaint scoring system with automatic escalation:
- Minor: +1 · Moderate: +3 · Severe: +5
- Score > 10 → Auto-escalate to **Warning**
- Score > 25 → Auto-escalate to **Critical** + dispatch job

### 4. 📱 Social Media Intelligence
Simulated social media monitoring with platform-specific posts per asset type:
- Flag thresholds: `> 5` flags → Warning · `> 15` flags → Critical
- Updates every 90 seconds with random flag increments

### 5. 🔍 Binary Search Fault Detection
Algorithmic fault isolation using O(log n) binary search. See detailed explanation below.

---

## 🔍 Binary Search Fault Detection — Explained

### The Problem
When a group of assets collectively shows below-expected readings (e.g., a street with 10 lights consuming 900W instead of 1000W), we need to find the **single faulty unit** efficiently.

### The Algorithm
UrbanGuard-AI uses **binary search** — the same divide-and-conquer algorithm from computer science — to isolate faults in **O(log n)** steps instead of checking each unit individually.

```
┌──────────────────────────────────────────────┐
│  10 Street Lights — Total: 900W (Expected: 1000W)          │
│                                                              │
│  Step 1: Split [1–10]                                        │
│  ├── Left  [1–5]:  500W (expected 500W) ✅                  │
│  └── Right [6–10]: 400W (expected 500W) ❌ → fault right    │
│                                                              │
│  Step 2: Split [6–10]                                        │
│  ├── Left  [6–8]:  300W (expected 300W) ✅                  │
│  └── Right [9–10]: 100W (expected 200W) ❌ → fault right    │
│                                                              │
│  Step 3: Split [9–10]                                        │
│  ├── Left  [9]:  100W (expected 100W) ✅                    │
│  └── Right [10]:   0W (expected 100W) ❌ → FAULT AT UNIT 10 │
│                                                              │
│  ⚠ Result: 3 steps to find fault (vs 10 for linear scan)   │
└──────────────────────────────────────────────┘
```

### How It Works Per Asset Type

| Asset Type | What's Measured | What a Fault Looks Like |
|-----------|----------------|------------------------|
| **Street Lights** | Power consumption per light (100W each) | One light at 0W drops the group total |
| **Roads** | Vibration score per zone (expected: 80) | Damaged zone reads 30–50 (pothole) |
| **Water Pipelines** | Flow rate at checkpoints (LPM) | Leak causes flow drop between checkpoints |
| **Sewer Lines** | Flow volume per segment (m³/hr) | Blockage reduces flow at the segment |

### Core Algorithm

```javascript
export function runBinarySearch(readings, expectedPerUnit) {
  const steps = [];
  let left = 0;
  let right = readings.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    const leftSum = readings.slice(left, mid + 1).reduce((a, b) => a + b, 0);
    const rightSum = readings.slice(mid + 1, right + 1).reduce((a, b) => a + b, 0);

    const leftExpected = (mid - left + 1) * expectedPerUnit;
    const rightExpected = (right - mid) * expectedPerUnit;

    const leftDeviation = ((leftExpected - leftSum) / leftExpected) * 100;
    const rightDeviation = ((rightExpected - rightSum) / rightExpected) * 100;

    steps.push({ step: steps.length + 1, left, right, mid,
      leftDeviation, rightDeviation,
      faultSide: rightDeviation > leftDeviation ? "right" : "left"
    });

    if (rightDeviation > leftDeviation) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return { faultyIndex: left, totalSteps: steps.length, steps };
}
```

**Auto-trigger:** Binary search runs automatically when IoT deviation exceeds **15%**.  
**Manual trigger:** Admins can click **"Run Binary Search"** on any asset's detail panel.

The **BinarySearchVisualiser** component renders an animated step-by-step visualization with a 400ms delay per step, highlighting the search window and marking the faulty unit in red with a `FAULT` label.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React (Vite) | 18.3 |
| **Styling** | Tailwind CSS | 4.0 |
| **Routing** | React Router | v6 |
| **Charts** | Recharts | 3.8 |
| **Maps** | Leaflet + react-leaflet + clustering | 1.9 / 4.2 |
| **Icons** | Lucide React | 1.7 |
| **Markdown** | react-markdown + remark-gfm | 10.1 |
| **HTTP** | Axios | 1.7 |
| **Backend** | Node.js + Express.js | 4.21 |
| **Database** | PostgreSQL | 16+ |
| **Real-time** | Socket.io | 4.8 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | 9.0 / 2.4 |
| **AI** | Groq SDK → GPT-OSS-120B | 0.9 |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)              │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────────┐ │
│  │  Admin    │  │  Citizen  │  │  Contractor           │ │
│  │Dashboard  │  │  Portal   │  │  Portal               │ │
│  └────┬─────┘  └─────┬─────┘  └──────────┬────────────┘ │
│       │               │                    │              │
│  ┌────┴───────────────┴────────────────────┴───────────┐ │
│  │         React Context (Auth + Assets)               │ │
│  │         Axios · Socket.io-client · useGroqStream    │ │
│  └─────────────────────┬───────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────┘
                         │  HTTP + WebSocket + SSE
┌────────────────────────┼─────────────────────────────────┐
│                 BACKEND (Express.js)                     │
│  ┌─────────┐  ┌────────┴────────┐  ┌─────────────────┐  │
│  │  Auth   │  │  REST API       │  │  Socket.io      │  │
│  │  JWT    │  │  Routes         │  │  Job Dispatch   │  │
│  └────┬────┘  └────────┬────────┘  └────────┬────────┘  │
│       │                │                     │           │
│  ┌────┴────────────────┴─────────────────────┴────────┐  │
│  │              Groq AI Service (SSE Streaming)       │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              PostgreSQL Database                   │  │
│  │   Assets · Users · Complaints · Jobs               │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** ≥ 16.x (running locally or remote)
- **Groq API Key** — Get one free at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/UrbanGuard-AI.git
cd UrbanGuard-AI
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urbanguard
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

> ⚠️ **Important:** Replace the placeholder values with your actual credentials. Never commit your `.env` file.

### 3. Set Up the Database

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE urbanguard;"
```

> The server will automatically create tables and seed 100 Chennai assets on first startup.

### 4. Install & Run the Server

```bash
cd server
npm install
npm run dev
```

The server starts on `http://localhost:5000`. You should see:
```
🚀 UrbanGuard-AI server running on port 5000
📊 Database connected
🌱 Assets seeded (100 assets)
```

### 5. Install & Run the Client

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

The client starts on `http://localhost:5173`. Open it in your browser.

### 6. Log In

Use any of the [default credentials](#-default-credentials) to access the system.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ |
| `GROQ_API_KEY` | Groq API key for AI features | ✅ |
| `PORT` | Backend server port (default: 5000) | ❌ |
| `VITE_API_URL` | Client-side API base URL (default: `http://localhost:5000/api`) | ❌ |

---

## 🔑 Default Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| 🛡️ Admin | `admin` | `admin123` | Full system — dashboard, map, assets, reports, AI |
| 👤 Citizen | `user` | `user123` | Complaint submission and tracking |
| 🔧 Contractor | `contractor` | `contractor123` | Job board, active jobs, earnings |

> These are MVP hardcoded credentials. JWT tokens expire after **24 hours**.

---

## 📁 Project Structure

```
UrbanGuard-AI/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Shared UI components
│   │   │   ├── map/                 # Leaflet map components
│   │   │   ├── charts/             # Recharts visualizations
│   │   │   ├── binary-search/      # Binary search visualiser
│   │   │   ├── iot/                # IoT sensor displays
│   │   │   ├── anomaly/            # Predictive anomaly panels
│   │   │   ├── jobs/               # Job dispatch components
│   │   │   └── ai/                 # AI-powered components
│   │   │       ├── ChatPanel.jsx       # Admin AI chatbot
│   │   │       ├── FaultReport.jsx     # AI fault reports
│   │   │       ├── PredictionPanel.jsx # Predictive maintenance
│   │   │       ├── NLSearchBar.jsx     # Natural language search
│   │   │       ├── AIBadge.jsx         # Red "AI" pill badge
│   │   │       └── StreamingText.jsx   # Typewriter streaming
│   │   ├── pages/
│   │   │   ├── Landing.jsx             # Public landing page
│   │   │   ├── admin/                  # Admin dashboard pages
│   │   │   ├── citizen/                # Citizen complaint form
│   │   │   └── contractor/             # Contractor portal
│   │   ├── context/                # React Context (Auth + Assets)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── utils/                  # Algorithms & helpers
│   │   │   ├── binarySearch.js         # Binary search algorithm
│   │   │   ├── anomalyDetection.js     # Risk score calculation
│   │   │   └── iotSimulator.js         # IoT data simulator
│   │   └── data/
│   │       └── assets.js               # 100 Chennai asset definitions
│   └── package.json
│
├── server/                          # Express.js backend
│   ├── routes/
│   │   ├── auth.js                     # Login + JWT
│   │   ├── assets.js                   # Asset CRUD
│   │   ├── complaints.js              # Complaint management
│   │   ├── jobs.js                    # Job dispatch
│   │   ├── iot.js                     # IoT data endpoints
│   │   └── ai.js                      # All AI endpoints
│   ├── services/
│   │   └── groqService.js             # Central Groq AI client
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification
│   │   └── roleMiddleware.js           # Role-based access
│   ├── models/                     # Database models
│   ├── socket/
│   │   └── jobDispatch.js             # Socket.io job events
│   ├── seed/
│   │   └── seedAssets.js              # 100 asset seeder
│   ├── db.js                          # PostgreSQL connection
│   └── index.js                       # Server entry point
│
├── .env                            # Environment variables
├── UrbanGuard-AI_PRD.md            # Product Requirements Document
└── README.md                       # ← You are here
```

---

## 🤖 AI Features

UrbanGuard-AI integrates **11 AI-powered features** using Groq's GPT-OSS-120B model, all streaming via Server-Sent Events (SSE):

| # | Feature | Trigger | Response |
|---|---------|---------|----------|
| 1 | **Admin AI Chatbot** | "Ask AI" button on any admin page | Streaming |
| 2 | **Fault Report Generator** | Auto on critical / manual button | Streaming |
| 3 | **Complaint Classifier** | Auto on every complaint submission | JSON |
| 4 | **Complaint Acknowledgement** | Auto after complaint saved | Streaming |
| 5 | **System Health Report** | Admin selects report type + generate | Streaming |
| 6 | **Contractor Job Briefing** | Auto when contractor accepts job | Streaming |
| 7 | **Predictive Maintenance** | "Get AI Prediction" on asset panel | Streaming |
| 8 | **Natural Language Search** | Search bar on asset map page | JSON |
| 9 | **Social Media Summariser** | Auto per asset social tab | Streaming |
| 10 | **Job Notification Writer** | Auto inside job creation | Non-streaming |
| 11 | **Daily Digest** | Once per day or manual trigger | Streaming |

**UI conventions for AI content:**
- 🔴 Red **"AI"** pill badge on every AI-generated section
- ✍️ Typewriter streaming effect via `StreamingText.jsx`
- 💫 Pulsing red border animation while streaming
- ⚠️ Graceful fallback: *"AI is temporarily unavailable."*

---

## 🗺️ Map Features

- **Leaflet.js** map centered on Chennai `[13.0827, 80.2707]`
- **100 real-coordinate markers** across 25 Chennai neighborhoods
- **Marker clustering** at zoom < 12 via `react-leaflet-cluster`
- **Color-coded markers**: White (healthy) · Red small (warning) · Red large pulsing (critical) · Gray (under repair)
- **Click-to-inspect** popups with health scores, IoT readings, and dispatch buttons
- **Filter by** asset type and status
- **AI-powered search**: Natural language queries to find assets

---

## 🎨 Design System

UrbanGuard-AI follows a strict **black/white/red** color palette inspired by premium SaaS interfaces:

| Color | Hex | Usage |
|-------|-----|-------|
| ⬛ Pure Black | `#000000` | Main background |
| 🔲 Surface | `#0D0D0D` | Cards and panels |
| 🔳 Elevated | `#141414` | Modals and overlays |
| ➖ Border | `#1C1C1C` | Dividers and borders |
| 🔴 Brand Red | `#E8372A` | Buttons, badges, icons, active states |
| ⬜ White | `#FFFFFF` | Primary text |
| 🩶 Gray | `#999999` | Secondary text |

**Typography:** Syne (headings) · DM Sans (body) · JetBrains Mono (data)

---

## 📄 License

This project is built for educational and demonstration purposes.

---

## 🙏 Credits

| | |
|---|---|
| **Built by** | Joel P — Full Stack Developer |
| **AI Model** | [Groq](https://groq.com) — GPT-OSS-120B |
| **Maps** | [OpenStreetMap](https://www.openstreetmap.org) contributors |
| **Icons** | [Lucide](https://lucide.dev) — Beautiful open-source icons |
| **Charts** | [Recharts](https://recharts.org) — Composable chart library |
| **Fonts** | [Google Fonts](https://fonts.google.com) — Syne, DM Sans, JetBrains Mono |
| **City Data** | Chennai Municipal Corporation — Infrastructure reference data |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) |

---

<p align="center">
  <strong>Made with ❤️ for Chennai</strong>
  <br />
  <sub>UrbanGuard-AI — Government Infrastructure Monitoring System</sub>
</p>
