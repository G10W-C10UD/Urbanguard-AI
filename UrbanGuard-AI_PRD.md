# Product Requirements Document (PRD)
# UrbanGuard-AI — Government Infrastructure Monitoring System
# City: Chennai, Tamil Nadu, India
# Version 3.0 — Final

---

## 1. PROJECT OVERVIEW

**Product Name:** UrbanGuard-AI
**Tagline:** "Protecting Chennai's Infrastructure, Powered by AI"
**Purpose:** A full-stack web platform for real-time monitoring, AI-driven fault detection, and managed repair of government-owned infrastructure assets across Chennai. The system combines IoT sensor data, predictive analytics, citizen complaints, social media intelligence, and binary search fault detection to identify broken assets and dispatch contractors automatically using a Rapido-style job system. Groq AI (model: openai/gpt-oss-120b) is embedded throughout every layer of the product.

**Primary Users:**
- Government Administrators (full access)
- Citizens / General Public (complaint submission only)
- Contractors / Repair Workers (job board and repair management)

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router v6 |
| Backend | Node.js with Express.js |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Authentication | JWT + bcrypt |
| Map | Leaflet.js + react-leaflet + react-leaflet-cluster |
| Charts | Recharts |
| State Management | React Context API |
| AI | Groq SDK (npm: groq-sdk) |
| Groq Model | openai/gpt-oss-120b |
| HTTP Client | Axios |

---

## 3. ASSET DATA — 100 CHENNAI ASSETS

### 3.1 Asset Types

| Type | Count | Sensor Metric | Unit |
|---|---|---|---|
| Street Lights | 25 | Power consumption | Watts |
| Roads | 25 | Vibration / stress index | 0–100 score |
| Water Pipelines | 25 | Flow rate + pressure | LPM + Bar |
| Sewer Lines | 25 | Flow volume | m³/hour |

### 3.2 Asset Object Schema

```json
{
  "id": "SL-001",
  "type": "streetlight",
  "name": "Anna Nagar 3rd Avenue Light",
  "location": {
    "lat": 13.0850,
    "lng": 80.2101,
    "area": "Anna Nagar"
  },
  "status": "healthy | warning | critical | under_repair | repaired",
  "health_score": 0-100,
  "installed_date": "YYYY-MM-DD",
  "expected_lifespan_years": 10,
  "last_maintained": "YYYY-MM-DD",
  "iot": {
    "sensor_reading": 95.0,
    "expected_reading": 100.0,
    "unit": "watts",
    "deviation_percent": 5.0,
    "last_updated": "ISO timestamp"
  },
  "binary_search": {
    "total_segments": 10,
    "segment_readings": [100,100,100,100,100,0,100,100,100,100],
    "faulty_segment_index": 5,
    "search_steps": []
  },
  "anomaly": {
    "age_factor": 0.4,
    "weather_factor": 0.3,
    "risk_score": 34,
    "risk_level": "medium",
    "predicted_failure_date": "YYYY-MM-DD"
  },
  "social_media_flags": 2,
  "complaint_count": 1,
  "complaint_score": 3,
  "ai_fault_report": "",
  "assigned_contractor_id": null,
  "job_status": "none | open | assigned | en_route | in_progress | completed"
}
```

### 3.3 Installed Dates & Lifespans

| Asset Type | Installed Year Range | Expected Lifespan |
|---|---|---|
| Street Lights | 2014–2022 | 10 years |
| Roads | 2010–2020 | 15 years |
| Water Pipelines | 2008–2018 | 25 years |
| Sewer Lines | 2005–2016 | 30 years |

Assign realistic installed dates within the ranges above when seeding. Vary them — do not use the same date for all assets.

### 3.4 All 100 Asset Coordinates (USE EXACTLY THESE — DO NOT MODIFY)

#### STREET LIGHTS (SL-001 to SL-025)
```
SL-001 | Anna Nagar          | 13.0850, 80.2101
SL-002 | T Nagar             | 13.0418, 80.2341
SL-003 | Adyar               | 13.0067, 80.2567
SL-004 | Velachery           | 12.9815, 80.2180
SL-005 | Tambaram            | 12.9249, 80.1000
SL-006 | Porur               | 13.0368, 80.1567
SL-007 | Nungambakkam        | 13.0569, 80.2425
SL-008 | Egmore              | 13.0784, 80.2620
SL-009 | Royapuram           | 13.1130, 80.2940
SL-010 | Mylapore            | 13.0335, 80.2676
SL-011 | Guindy              | 13.0067, 80.2206
SL-012 | Kodambakkam         | 13.0530, 80.2234
SL-013 | Perambur            | 13.1179, 80.2490
SL-014 | Ambattur            | 13.1143, 80.1548
SL-015 | Avadi               | 13.1147, 80.1015
SL-016 | Chromepet           | 12.9516, 80.1462
SL-017 | Pallavaram          | 12.9675, 80.1495
SL-018 | Sholinganallur      | 12.9010, 80.2279
SL-019 | OMR Phase 1         | 12.9279, 80.2284
SL-020 | Besant Nagar        | 13.0002, 80.2707
SL-021 | Thiruvanmiyur       | 12.9827, 80.2685
SL-022 | Chetpet             | 13.0717, 80.2395
SL-023 | Kilpauk             | 13.0839, 80.2395
SL-024 | Tondiarpet          | 13.1265, 80.2851
SL-025 | Washermanpet        | 13.1116, 80.2857
```

#### ROADS (RD-001 to RD-025)
```
RD-001 | GST Road            | 12.9716, 80.1914
RD-002 | Anna Salai          | 13.0617, 80.2596
RD-003 | Rajiv Gandhi Salai  | 12.9279, 80.2284
RD-004 | Mount Road          | 13.0487, 80.2525
RD-005 | Poonamallee HRoad   | 13.0653, 80.2001
RD-006 | Jawaharlal Nehru Rd | 13.0784, 80.2620
RD-007 | Arcot Road          | 13.0425, 80.1985
RD-008 | Velachery Main Rd   | 12.9815, 80.2180
RD-009 | 100 Feet Rd Adyar   | 13.0067, 80.2567
RD-010 | ECR Sholinganallur  | 12.9010, 80.2513
RD-011 | Ambattur Ind Road   | 13.1143, 80.1548
RD-012 | Perambur Barracks   | 13.1179, 80.2490
RD-013 | Nungambakkam HRoad  | 13.0569, 80.2425
RD-014 | Kodambakkam HRoad   | 13.0530, 80.2234
RD-015 | Old Mahabalipuram   | 12.9516, 80.2277
RD-016 | Guindy-Kathipara    | 13.0067, 80.2206
RD-017 | Saidapet Bridge Rd  | 13.0198, 80.2237
RD-018 | Pallavaram-Thorai   | 12.9675, 80.1980
RD-019 | Porur Junction Rd   | 13.0368, 80.1567
RD-020 | Tambaram Bypass     | 12.9249, 80.1140
RD-021 | Tondiarpet Main     | 13.1265, 80.2851
RD-022 | Basin Bridge Road   | 13.1002, 80.2850
RD-023 | Thiruvanmiyur Coast | 12.9827, 80.2685
RD-024 | Koyambedu Link Rd   | 13.0701, 80.1986
RD-025 | Vadapalani Road     | 13.0522, 80.2122
```

#### WATER PIPELINES (WP-001 to WP-025)
```
WP-001 | Anna Nagar West     | 13.0900, 80.2050
WP-002 | T Nagar North       | 13.0500, 80.2350
WP-003 | Adyar River Zone    | 13.0020, 80.2520
WP-004 | Velachery Lake Zone | 12.9760, 80.2210
WP-005 | Tambaram Main       | 12.9200, 80.1050
WP-006 | Porur Lake Zone     | 13.0320, 80.1520
WP-007 | Nungambakkam        | 13.0530, 80.2430
WP-008 | Egmore Supply Line  | 13.0750, 80.2600
WP-009 | Royapuram Trunk     | 13.1100, 80.2960
WP-010 | Mylapore Grid       | 13.0380, 80.2660
WP-011 | Guindy Industrial   | 13.0050, 80.2220
WP-012 | Kodambakkam Grid    | 13.0500, 80.2250
WP-013 | Perambur Zone       | 13.1200, 80.2450
WP-014 | Ambattur Zone       | 13.1100, 80.1580
WP-015 | Avadi Zone          | 13.1200, 80.1020
WP-016 | Chromepet Zone      | 12.9550, 80.1490
WP-017 | Pallavaram Zone     | 12.9700, 80.1520
WP-018 | Sholinganallur IT   | 12.9050, 80.2260
WP-019 | OMR Zone            | 12.9300, 80.2260
WP-020 | Besant Nagar Zone   | 13.0040, 80.2700
WP-021 | Thiruvanmiyur Zone  | 12.9870, 80.2700
WP-022 | Chetpet Zone        | 13.0750, 80.2400
WP-023 | Kilpauk Zone        | 13.0820, 80.2400
WP-024 | Tondiarpet Zone     | 13.1300, 80.2820
WP-025 | Washermanpet Zone   | 13.1150, 80.2850
```

#### SEWER LINES (SW-001 to SW-025)
```
SW-001 | Anna Nagar          | 13.0870, 80.2120
SW-002 | T Nagar             | 13.0450, 80.2360
SW-003 | Adyar               | 13.0040, 80.2590
SW-004 | Velachery           | 12.9830, 80.2200
SW-005 | Tambaram            | 12.9270, 80.1020
SW-006 | Porur               | 13.0350, 80.1590
SW-007 | Nungambakkam        | 13.0550, 80.2420
SW-008 | Egmore              | 13.0800, 80.2640
SW-009 | Royapuram           | 13.1150, 80.2920
SW-010 | Mylapore            | 13.0360, 80.2690
SW-011 | Guindy              | 13.0080, 80.2190
SW-012 | Kodambakkam         | 13.0540, 80.2200
SW-013 | Perambur            | 13.1160, 80.2500
SW-014 | Ambattur            | 13.1160, 80.1530
SW-015 | Avadi               | 13.1130, 80.1030
SW-016 | Chromepet           | 12.9530, 80.1480
SW-017 | Pallavaram          | 12.9690, 80.1510
SW-018 | Sholinganallur      | 12.9030, 80.2270
SW-019 | OMR                 | 12.9290, 80.2270
SW-020 | Besant Nagar        | 13.0010, 80.2720
SW-021 | Thiruvanmiyur       | 12.9850, 80.2700
SW-022 | Chetpet             | 13.0730, 80.2410
SW-023 | Kilpauk             | 13.0840, 80.2410
SW-024 | Tondiarpet          | 13.1280, 80.2840
SW-025 | Washermanpet        | 13.1130, 80.2870
```

---

## 4. USER ROLES & AUTHENTICATION

### 4.1 Role Definitions

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | admin | admin123 | Everything |
| Citizen | user | user123 | Landing page + complaint form |
| Contractor | contractor | contractor123 | Contractor portal + job board |

In production this becomes a registration system. For MVP use these hardcoded credentials.

### 4.2 Route Protection
- `/admin/*` → Admin JWT required
- `/contractor/*` → Contractor JWT required
- `/complaint` → Citizen JWT required
- `/` → Public
- Unauthorized access → redirect to `/`

### 4.3 JWT Rules
- Token expires: 24 hours
- Stored in: `localStorage` key `urbanguard_token`
- On app load: verify token → set AuthContext → route accordingly

---

## 5. PAGE STRUCTURE

### 5.1 Landing Page (`/`)

**Navbar:**
- Logo: "UrbanGuard-AI" in red on black background
- Links: Features | How It Works | About | Login
- "Get Started" pill button in red

**Live Ticker Bar (below navbar):**
- Scrolling ticker showing real-time asset stats:
  `LIVE STATUS · 100 Assets Monitored · 3 Critical · 7 Warning · 2 Jobs Active · Chennai Infrastructure Grid Online ·`
- Ticker scrolls continuously left, loops forever
- "LIVE STATUS" label in red on the left, rest in white on black

**Section 1 — Hero:**
- Large bold headline: "Protecting Chennai's Infrastructure. Powered by AI."
- Subheading: "Real-time monitoring of 100 government assets across Chennai using IoT sensors, predictive AI, citizen intelligence, and binary search fault detection."
- Two buttons: "Explore Dashboard →" (red filled) + "Learn How It Works ↓" (white outline)
- Animated stats counter below buttons:
  - 100 Assets Monitored
  - 5 Detection Methods
  - 4 Asset Types
  - AI-Powered 24/7

**Section 2 — How It Works / Features:**
- Label above: "WHAT WE DO" in small red spaced caps
- Headline: "5 Ways UrbanGuard-AI Detects Infrastructure Failure"
- 5 feature cards in a grid, each with:
  - Red icon
  - Feature name in white
  - Short description in gray
  - Cards: IoT Sensor Monitoring | Predictive Anomaly Detection | Citizen Complaints | Social Media Intelligence | Binary Search Fault Detection

**Section 3 — Login:**
- Label: "SECURE ACCESS" in red spaced caps
- Headline: "Choose Your Portal" in white
- Three login cards side by side, each with dark surface background and red border on hover:
  - 🛡️ **Admin Portal** — "Full system access, monitoring, and control"
  - 👤 **Citizen Portal** — "Report infrastructure issues in your area"
  - 🔧 **Contractor Portal** — "View and accept government repair jobs"
- Each card has: username field, password field, Login button (red)
- On successful login → redirect to correct dashboard

---

### 5.2 Admin Dashboard (`/admin`)

#### Sidebar Navigation (dark, always visible):
- UrbanGuard-AI logo at top
- Navigation items with red active state:
  - Overview
  - Asset Map
  - Street Lights
  - Roads
  - Water Pipelines
  - Sewers
  - Complaints
  - Contractor Jobs
  - AI Reports
  - Settings
- Logout at bottom

#### Overview Page (`/admin/overview`):

**Top stat cards (8 cards in a row):**
- Total Assets: 100
- Healthy (count + green)
- Warning (count + yellow)
- Critical (count + red)
- Under Repair (count + blue)
- Open Jobs (count)
- Today's Complaints (count)
- AI Alerts Generated (count)

**Below stat cards — Live Asset Ticker:**
- Same style as landing page ticker but showing: recently flagged asset IDs + their status
- e.g. `ALERT · SL-010 Mylapore CRITICAL · WP-003 Adyar WARNING · RD-001 GST Road CRITICAL`

**Charts row (4 charts):**
- Donut chart: health breakdown overall
- Donut chart: health by street lights
- Donut chart: health by roads
- Donut chart: health by water pipes + sewers combined

**Recent Activity Feed:**
- Last 15 system events in a list
- Each event has: icon, description, timestamp, colored badge
- Types: Complaint Received | Job Dispatched | Critical Alert | AI Report Generated | Sensor Alert | Binary Search Fault Found | Job Completed

**AI Assistant Panel (right side — always visible on admin pages):**
- Toggle open/close with a floating red button "Ask AI"
- Chat interface: input at bottom, messages above
- Shows: "UrbanGuard-AI Assistant" header with pulsing red dot
- Streams responses from Groq word by word (typewriter effect)
- First message on open: "Hello! I have full visibility into Chennai's infrastructure. Ask me anything about asset health, complaints, jobs, or predictions."

#### Asset Map (`/admin/map`):
- Full-screen Leaflet map centred on Chennai [13.0827, 80.2707], zoom 12
- All 100 assets plotted as markers:
  - Green circle = Healthy
  - Yellow circle = Warning
  - Red circle = Critical
  - Blue circle = Under Repair
- Different marker icon shape per asset type
- Click marker → popup:
  - Asset ID, Name, Type, Area
  - Health score gauge
  - IoT reading vs expected
  - Status badge
  - "View Full Details" button
  - "Dispatch Job" button (shows only if critical/warning)
- Filter bar: All | Street Lights | Roads | Water Pipes | Sewers
- Status filter: All | Healthy | Warning | Critical
- Natural Language Search bar (AI-powered): "Find all critical water pipes in North Chennai"

#### Individual Asset Type Pages:
Each of the 4 asset pages (Street Lights, Roads, Water Pipes, Sewers) shows:
- Header with count and health summary
- Sortable table with columns: ID | Name | Area | Status | Health Score | IoT Reading | Deviation | Last Maintained | AI Risk | Action
- Status badges colour-coded
- Click any row → Asset Detail Side Panel slides in from right
- "Dispatch Job" button on critical/warning rows

---

### 5.3 Asset Detail Side Panel

When viewing any asset, a right-side panel shows:

**Header:** Asset ID + Name + Status badge + Health score ring

**5 Detection Signal Tabs:**

**Tab 1 — IoT Sensor:**
- Live gauge showing current vs expected reading
- Deviation percentage (red if > 20%)
- Status: Normal / Warning / Critical
- Mini line chart: last 24 readings (simulated)
- Last updated timestamp with pulsing dot

**Tab 2 — Predictive Anomaly:**
- Age bar: years used vs expected lifespan
- Weather risk card: current season + rainfall/UV data (simulated)
- Risk formula displayed visually: Age Factor + Weather Factor + Base Degradation = Risk Score
- Risk level badge: Low / Medium / High in colour
- Predicted failure date

**Tab 3 — Citizen Complaints:**
- Total complaint count
- Complaint score (weighted)
- Last 3 complaints with: date, description, severity badge, status
- "View All Complaints" link

**Tab 4 — Social Media Intelligence:**
- Flag count with trend arrow
- 3 simulated social media posts (specific to asset type):
  - Street Light: "The street light near {area} has been dark for 3 nights! #Chennai #GCC #UrbanGuard"
  - Road: "Massive pothole on {road name}, nearly damaged my vehicle! #Chennai #RoadConditions"
  - Water Pipe: "No water supply in {area} since morning, pipe seems burst! #ChennaiMetroWater"
  - Sewer: "Sewer overflow on {area} main road, unbearable smell! #Chennai #Sanitation"
- Sentiment badge: Negative / Neutral

**Tab 5 — Binary Search:**
- Full visual binary search tree (see Section 7)
- Animated step-by-step
- Faulty unit highlighted in red

**Bottom of panel — AI Section:**
- "AI Fault Report" card with red "AI" badge
- If report exists: shows it with streaming text
- If not: "Generate AI Fault Report" red button → calls Groq → streams result
- "AI Prediction" button → calls Groq predictive maintenance analysis → streams result

---

### 5.4 Citizen Portal (`/complaint`)

**Header:** UrbanGuard-AI logo + "Report an Issue" heading

**Complaint Form:**
- Full Name (text input)
- Phone Number (text input)
- Area / Location (dropdown — all Chennai areas from asset list)
- Asset Type (dropdown: Street Light / Road / Water Pipeline / Sewer)
- Asset ID (optional text — "Leave blank if unknown")
- Complaint Description (textarea — min 20 characters)
- Severity (radio: Minor / Moderate / Severe)
- Upload Photo (file input, optional, accept image/*)
- Submit button (red)

**On Submit:**
1. Form data sent to backend
2. Backend calls Groq AI Complaint Classifier → gets severity + asset match + urgency
3. Complaint saved to DB with AI classification
4. Groq generates personalized acknowledgement message
5. Success screen shows:
   - Green checkmark animation
   - Complaint ID (e.g. CMP-00042)
   - AI-generated acknowledgement message (streams in)
   - "Track Your Complaint" link

**My Complaints (below form):**
- Table: Complaint ID | Asset Type | Area | Date | Severity | AI Classification | Status

---

### 5.5 Contractor Portal (`/contractor`)

**Header:** UrbanGuard-AI logo + "Contractor Dashboard"

**Stats bar:**
- Available Jobs | My Active Job | Completed This Month | Total Earnings

**Job Board Tab:**
- Live job cards — updated in real-time via Socket.io
- Each card shows:
  - Asset ID + Type icon + Area name
  - Problem summary (AI-generated fault description, truncated to 2 lines)
  - Severity badge (red for Critical, yellow for Warning)
  - Estimated government pay in ₹ (bold red)
  - Distance label (simulated)
  - Time since dispatch
  - Two buttons: "Accept Job" (red filled) | "Skip" (outline)
- Empty state: "No jobs available right now. New jobs appear here instantly."
- When job is accepted → confirmation screen → AI Briefing streams in

**My Jobs Tab:**
- Active job card (if any):
  - Full asset details
  - AI Contractor Briefing (streamed, full text visible)
  - Job lifecycle progress bar: Assigned → En Route → Work Started → Completed
  - Status update buttons
  - "Mark as Complete" button → upload notes form
- Past jobs table: Job ID | Asset | Area | Completed Date | Pay | Status

**Earnings Tab:**
- Total earned (large red number)
- Per-job breakdown table
- Payment status badges: Pending / Processing / Paid

---

## 6. THE 5 DETECTION METHODS

### Method 1: IoT Sensors

Every asset has a live sensor reading updated every 30 seconds via setInterval simulation.

**Metrics by asset type:**
- Street Light: watts consumed (expected: 100W per light × number of lights)
- Road: vibration/stress index 0–100 (expected: > 70 = healthy surface)
- Water Pipeline: flow rate in LPM (expected: defined per pipe) + pressure in bar
- Sewer: flow volume in m³/hour (expected: defined per segment)

**Status thresholds (deviation from expected):**
- < 5% deviation → Healthy (green)
- 5%–20% deviation → Warning (yellow)
- > 20% deviation → Critical (red)

**Deviation formula:**
```
deviation = ((expected - actual) / expected) * 100
```

Admin sees live-updating readings. Readings update visually in the Asset Detail Panel.

---

### Method 2: Anomaly / Predictive Detection

Three factors combine to produce a risk score for each asset.

**Age Factor:**
```
age_factor = (current_year - install_year) / expected_lifespan_years
Capped at 1.0
```

**Weather Factor (Chennai-specific seasons):**
- June–September (Monsoon): rainfall_factor = 0.9 for roads and sewers, 0.3 for lights
- March–May (Summer): uv_factor = 0.8 for street lights, 0.2 for others
- October–December (Northeast Monsoon): 0.7 for all
- January–February (Winter): 0.1 for all

**Risk Score Formula:**
```
risk_score = ((age_factor * 0.4) + (weather_factor * 0.4) + (0.1 * 0.2)) * 100
```

**Risk Levels:**
- 0–33: Low Risk (green)
- 34–66: Medium Risk (yellow)
- 67–100: High Risk (red) → auto-generate warning flag on asset

**Predicted Failure Date:**
```
months_remaining = (1 - age_factor) * expected_lifespan_years * 12
predicted_failure = today + months_remaining
```

---

### Method 3: Citizen Complaints

**Complaint Score Weighting:**
- Minor complaint: +1 to asset complaint_score
- Moderate complaint: +3
- Severe complaint: +5

**Auto-escalation rules:**
- complaint_score > 10 → asset status set to Warning
- complaint_score > 25 → asset status set to Critical + auto-dispatch job

Each new complaint is AI-classified by Groq before being saved.

---

### Method 4: Social Media Intelligence

Simulated social media monitoring.

**Simulation behaviour:**
- Every 90 seconds, a random selection of assets gets 1–3 social media flag increments
- Each asset has 3 hardcoded simulated posts relevant to its type and area (see Section 5.3 Tab 4)
- Flag thresholds:
  - > 5 flags → Warning
  - > 15 flags → Critical

**Displayed in:** Asset Detail Panel Tab 4 with post text, platform icon, and timestamp.

---

### Method 5: Binary Search Fault Detection

See full spec in Section 7.

**Auto-trigger:** When IoT deviation > 15%, binary search runs automatically.
**Manual trigger:** Admin can click "Run Binary Search" on any asset.

---

## 7. BINARY SEARCH FAULT DETECTION — FULL SPEC

### 7.1 Core Concept

When a group of assets collectively shows below-expected readings, we bisect the group repeatedly to identify the single faulty unit with precision. Works exactly like binary search in computer science — O(log n) steps.

### 7.2 Core Algorithm (`client/src/utils/binarySearch.js`)

```javascript
// Binary search fault detection algorithm for UrbanGuard-AI
// Works for all 4 asset types

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

    steps.push({
      step: steps.length + 1,
      left,
      right,
      mid,
      leftSum,
      rightSum,
      leftExpected,
      rightExpected,
      leftDeviation: leftDeviation.toFixed(1),
      rightDeviation: rightDeviation.toFixed(1),
      faultSide: rightDeviation > leftDeviation ? "right" : "left"
    });

    if (rightDeviation > leftDeviation) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return {
    faultyIndex: left,
    totalSteps: steps.length,
    steps
  };
}
```

### 7.3 Street Lights — Electricity Consumption

**Setup:**
- Group of N street lights, each consuming 100W
- Expected total = N × 100W
- One light broken → reading drops by 100W

**Example (10 lights, reading 900W instead of 1000W):**
```
Step 1: Split [1–10]
  Left [1–5]: 500W (expected 500W) ✅
  Right [6–10]: 400W (expected 500W) ❌ → fault in right
Step 2: Split [6–10]
  Left [6–8]: 300W (expected 300W) ✅
  Right [9–10]: 100W (expected 200W) ❌ → fault in right
Step 3: Split [9–10]
  Left [9]: 100W (expected 100W) ✅
  Right [10]: 0W (expected 100W) ❌ → FAULT AT UNIT 10
```

### 7.4 Roads — Vibration / Stress Index

**Setup:**
- Road divided into N sensor zones
- Each sensor zone expected score: 80 (healthy surface)
- Damaged zone reads significantly lower (30–50)

**Binary Search:** Split road into halves, the half with lower aggregate score contains the damage. Keep halving until single damaged zone identified. Output: GPS zone coordinates of the pothole / damage.

### 7.5 Water Pipelines — Flow Rate

**Setup:**
- Expected flow rate at entry: X LPM
- Checkpoints at mid-points measure flow
- Leak = flow at exit < flow at entry

**Binary Search:**
- Check midpoint sensor
  - If midpoint ≈ entry → leak is in second half
  - If midpoint < entry → leak is in first half
- Keep halving until pipe segment containing leak is isolated
- Show pressure drop at each bisection step

### 7.6 Sewer Lines — Flow Volume

**Setup:**
- Expected flow: Y m³/hour through each segment
- Blockage = flow reading drops below expected

**Binary Search:**
- Same logic as water pipeline
- Identify blocked sewer segment
- Output: exact segment and nearest GPS coordinate

### 7.7 BinarySearchVisualiser Component

**File:** `client/src/components/binary-search/BinarySearchVisualiser.jsx`

**Props:**
```
assetType: "streetlight" | "road" | "waterpipe" | "sewer"
totalUnits: number
readings: number[]
expectedPerUnit: number
assetId: string
```

**UI Requirements:**
- Display a horizontal bar of N units numbered 1–N
- Each unit is a box showing its current reading
- As search runs, animate each step with 400ms delay:
  - Current search window highlighted with red border
  - Left half: slightly dimmed
  - Right half: slightly dimmed
  - The side containing the fault: highlighted bright red
  - Fault unit at end: solid red with "FAULT" label + warning icon
- Below the visualiser: step log in a card showing each step's readings
- Final result: large red alert "⚠ FAULT DETECTED — Unit #{n} | {area}" 
- "Simulate New Fault" button: randomly picks a new faulty unit and re-runs with animation
- "Export Report" button: downloads the fault report as text

---

## 8. GROQ AI INTEGRATION — COMPLETE SPEC

All AI calls go through the central service at `server/services/groqService.js`.

### 8.1 Central Groq Service

```javascript
// server/services/groqService.js
// Central Groq AI client for UrbanGuard-AI. All AI features call this file.

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

**All AI routes** live in `server/routes/ai.js`.
**Streaming responses** use Server-Sent Events (SSE) from Express to React.
**Frontend hook** `useGroqStream.js` handles consuming SSE streams and updating state.

---

### AI Feature 1 — Admin AI Chatbot Assistant

**Trigger:** Admin clicks "Ask AI" button (floating, bottom-right, red, all admin pages)
**Location:** Right-side sliding panel

**System prompt injected on every message:**
```
You are UrbanGuard-AI, an intelligent assistant for Chennai's government infrastructure monitoring system.

Current System Snapshot:
- Total assets: 100 (25 street lights, 25 roads, 25 water pipes, 25 sewers)
- Critical assets: {critical_count}
- Warning assets: {warning_count}
- Healthy assets: {healthy_count}
- Open repair jobs: {open_jobs}
- Today's complaints: {today_complaints}
- Current date: {date}, City: Chennai, Tamil Nadu

You have full knowledge of all 100 assets, their locations, health scores, IoT readings, complaint counts, and job statuses. Answer clearly and concisely. When referencing assets, include their ID and area. Be professional but direct.
```

**Append to system prompt:** Latest snapshot of all 100 assets as compact JSON.

**Response streaming:** Word by word via SSE, typewriter effect in UI.

**Example queries the admin can ask:**
- "Which areas have the most critical infrastructure right now?"
- "Summarise today's complaints"
- "Which street lights are showing abnormal power readings?"
- "Predict which assets are most likely to fail this monsoon?"
- "Give me a priority list of repairs needed today"
- "How many jobs have been completed this week?"
- "What is the overall health score of the water pipeline network?"

---

### AI Feature 2 — Fault Report Generator

**Trigger:** Auto-generated when asset hits Critical status OR admin clicks "Generate AI Fault Report"
**Location:** Asset Detail Panel — AI Fault Report card

**Prompt:**
```
You are an infrastructure maintenance expert for Chennai Municipal Corporation.
Generate a professional fault report for this asset.

Asset: {asset_id} — {asset_name}
Type: {asset_type}
Location: {area}, Chennai
IoT Reading: {actual} (expected: {expected}, deviation: {deviation}%)
Age: {age} years (lifespan: {lifespan} years)
Risk Score: {risk_score}/100
Binary Search Result: {binary_result or "Not yet run"}
Complaint Count: {complaint_count}
Social Media Flags: {social_flags}

Write a fault report with:
1. Fault Summary (2 sentences)
2. Likely Root Cause
3. Step-by-Step Repair Instructions (numbered, specific to {asset_type})
4. Safety Precautions
5. Estimated Repair Time
6. Urgency: Immediate / Within 24hrs / Within 48hrs

Be technical and specific. This is read by engineers.
```

**Streaming:** Yes — streams into the Fault Report card in the Asset Detail Panel.

---

### AI Feature 3 — Citizen Complaint Classifier

**Trigger:** Every time a citizen submits a complaint (server-side, automatic)
**Location:** Backend only — result stored in DB, shown in Admin complaint view

**Classification prompt (returns JSON only):**
```
You are an AI classifier for UrbanGuard-AI, Chennai's infrastructure monitoring system.
Analyse this complaint and return ONLY a valid JSON object.

Complaint: "{complaint_text}"
Reported location: {area}
Reported asset type: {asset_type}

Return ONLY this JSON:
{
  "severity": "minor|moderate|severe",
  "confidence": 0-100,
  "likely_asset_type": "streetlight|road|waterpipe|sewer",
  "likely_asset_id": "asset ID if identifiable, else null",
  "urgency": "immediate|within_24hrs|within_week|low",
  "key_issues": ["issue1", "issue2"],
  "requires_dispatch": true|false,
  "reasoning": "one sentence"
}
```

**Acknowledgement prompt (shown to citizen after submission):**
```
You are UrbanGuard-AI, Chennai Municipal Corporation's AI assistant.
Write a warm, empathetic acknowledgement to a citizen who just filed a complaint.

Complaint ID: {complaint_id}
Asset Type: {asset_type}
Location: {area}
Severity: {ai_severity}
Urgency: {ai_urgency}

Write 3–4 sentences:
1. Thank them warmly
2. Confirm receipt (mention complaint ID)
3. Tell them estimated response time based on urgency
4. Encourage them to track it

Be warm, human, and reassuring. This is a government system — sound helpful, not robotic.
```

---

### AI Feature 4 — System Health Report Generator

**Location:** Admin → AI Reports page (`/admin/reports`)
**Trigger:** Admin clicks "Generate Report" + selects report type

**Report types:**
1. Daily Briefing
2. Weekly Summary
3. Critical Alert Report
4. Asset Type Deep-Dive (select which type)

**Prompt:**
```
You are UrbanGuard-AI generating an official infrastructure health report for Chennai Municipal Corporation.

Report Type: {report_type}
Generated: {datetime}

Asset Data:
{full_asset_summary_json}

Complaint Summary:
- Total today: {count} | Severe: {n} | Moderate: {n} | Minor: {n}
- Top complaint areas: {areas}

Job Summary:
- Open: {n} | In Progress: {n} | Completed today: {n}

Write a professional government report including:
1. Executive Summary (4 sentences — suitable for senior officials)
2. Critical Issues Requiring Immediate Attention (bullet list with asset IDs)
3. Asset Health Analysis by Type (one paragraph per type)
4. Top 5 Problem Areas in Chennai (by area name, with reasons)
5. Complaint Trend Analysis
6. Contractor Performance Summary
7. Actionable Recommendations for This Week (numbered list)
8. AI Prediction: Assets Most Likely to Fail in Next 7 Days (with reasoning)

Format as a formal government document. Use official language. Include specific IDs and locations.
```

**UI:**
- Report streams in with typewriter effect
- "Download as PDF" button
- "Copy to Clipboard" button
- Saved reports listed below with timestamps
- Each saved report has "View" and "Delete" buttons

---

### AI Feature 5 — Contractor Job Briefing

**Trigger:** Immediately when a contractor accepts a job
**Location:** Contractor portal — active job page

**Prompt:**
```
You are a field operations assistant for UrbanGuard-AI, Chennai.
A contractor has accepted a repair job. Write a clear, practical field briefing.

Job Details:
Asset ID: {asset_id}
Asset Type: {asset_type}
Location: {area}, Chennai (GPS: {lat}, {lng})
Problem: {fault_description}
Severity: {severity}
Binary Search Result: {result or "Full inspection needed"}
IoT Reading: {actual} vs expected {expected}
AI Fault Report Summary: {summary}

Write a contractor briefing with:
1. Job Summary (plain English, what needs to be done)
2. How to Find the Asset (specific directions in {area})
3. Tools & Equipment Required (specific list)
4. Step-by-Step Repair Procedure (numbered, practical steps)
5. Safety Warnings (highlight critical ones)
6. Completion Checklist (what to verify before closing the job)
7. Escalation: "Contact UrbanGuard-AI Control Centre if the problem exceeds scope"
8. Estimated Time to Complete

Write simply — the contractor may not have a technical background.
```

**Streaming:** Yes — streams into "Your Briefing" card immediately after job acceptance.

---

### AI Feature 6 — Predictive Maintenance Advisor

**Trigger:** Admin clicks "Get AI Prediction" on any asset detail panel
**Location:** Asset Detail Panel — Predictive Anomaly Tab

**Prompt:**
```
You are a predictive maintenance AI for UrbanGuard-AI, Chennai.
Analyse this asset's profile and provide a maintenance prediction.

Asset: {asset_id} | {asset_type} | {area}
Installed: {install_date} ({age} years ago)
Expected lifespan: {lifespan} years
Last maintained: {last_maintained}
Current health score: {health_score}/100
IoT deviation trend: {trend}
Risk score: {risk_score}/100
Complaint count (30 days): {count}
Season in Chennai now: {season}

Provide:
1. Predicted Failure Date Range
2. Confidence Level (%)
3. Primary Risk Factors (numbered)
4. Recommended Preventive Actions (do these NOW to extend lifespan)
5. Optimal Next Maintenance Date
6. Estimated Cost of Preventive Maintenance vs Emergency Repair
7. Similar Assets at Risk (mention asset type patterns)

Be specific about Chennai's climate and infrastructure conditions.
```

---

### AI Feature 7 — Natural Language Asset Search

**Trigger:** Admin types in the NL Search bar on the Asset Map or any asset list page
**Location:** Search bar at top of map + asset list pages

**Prompt:**
```
You are an asset search AI for UrbanGuard-AI.
The admin has typed a natural language search query. Convert it to search filters.

Query: "{search_query}"

Available filters:
- type: streetlight | road | waterpipe | sewer
- status: healthy | warning | critical | under_repair
- area: [any Chennai area name]
- health_score_below: number
- deviation_above: percentage

Return ONLY this JSON:
{
  "filters": {
    "type": null or string,
    "status": null or string,
    "area": null or string,
    "health_score_below": null or number,
    "deviation_above": null or number
  },
  "description": "one sentence describing what the admin is looking for"
}
```

**Frontend:** Apply returned filters to the asset list/map in real-time.

**Examples:**
- "Find all critical water pipes in North Chennai" → `{type: "waterpipe", status: "critical"}`
- "Show me street lights with more than 20% deviation" → `{type: "streetlight", deviation_above: 20}`
- "Which Mylapore assets need attention?" → `{area: "Mylapore", status: "warning"}`

---

### AI Feature 8 — Social Media Summariser

**Trigger:** Admin clicks "Summarise Social Media Activity" button on any asset detail panel
**Location:** Asset Detail Panel — Social Media Tab

**Prompt:**
```
You are a social media analyst for UrbanGuard-AI, Chennai.
Analyse these social media posts about a government infrastructure asset and provide a summary.

Asset: {asset_id} | {asset_type} | {area}
Posts:
{posts_array}
Total flags in last 24 hours: {count}

Provide:
1. Overall Public Sentiment (Negative / Neutral / Mixed)
2. Main Public Concerns (bullet list)
3. Urgency Signal: Is the public demanding immediate action? (Yes/No + reason)
4. Recommended Government Response (what should be communicated back to the public)
5. Escalation Recommendation: Should this trigger a repair job dispatch? (Yes/No)

Keep it concise. This is read by a government administrator.
```

---

### AI Feature 9 — Job Dispatch Notification Writer

**Trigger:** Automatically when a new repair job is created and dispatched to contractors
**Location:** Job card that contractors see on their job board

**Prompt:**
```
You are UrbanGuard-AI writing a job notification for contractors in Chennai.
Write a clear, compelling job notification (3–4 sentences) that:
1. Describes the problem clearly
2. States the location (area name)
3. Mentions the pay (₹{pay})
4. Encourages quick acceptance (jobs go to first to accept)

Asset: {asset_type} in {area}
Problem: {fault_summary}
Pay: ₹{pay}
Severity: {severity}

Keep it short, clear, and motivating. Contractors scan many job cards quickly.
```

**Where it appears:** As the job description text on every contractor job card.

---

### AI Feature 10 — Admin Daily Digest (Auto-Generated)

**Trigger:** Automatically generated every day at 9:00 AM (simulated — trigger on admin first login of the day)
**Location:** Admin Overview page — "Today's AI Digest" card at the top

**Prompt:**
```
You are UrbanGuard-AI. Generate a concise morning digest for the Chennai infrastructure admin.

Today's Date: {date}
System Status: {critical_count} critical, {warning_count} warning, {healthy_count} healthy assets
Overnight Events:
- New complaints: {count}
- New critical alerts: {count}
- Jobs completed overnight: {count}
- New social media flags: {count}

Write a morning briefing in 5 bullet points:
• What needs immediate attention today
• What was fixed overnight
• Key risks for today (weather or aging-based)
• Contractor activity summary
• One actionable recommendation for the day

Be direct and brief. The admin reads this first thing in the morning.
```

**UI:** Displayed in a card with a red "AI DIGEST" badge and today's date. Collapsible.

---

## 9. CONTRACTOR JOB DISPATCH SYSTEM

### 9.1 Auto-Dispatch Triggers

A repair job is automatically created and dispatched when ANY of these occur:
- IoT deviation > 20% (Critical threshold)
- Binary search identifies a specific faulty unit
- Anomaly risk score > 67 (High Risk)
- Complaint score > 25 on any asset
- Admin clicks "Dispatch Job" manually on any asset

### 9.2 Job Object Schema

```json
{
  "job_id": "JOB-001",
  "asset_id": "SL-010",
  "asset_type": "streetlight",
  "asset_name": "Mylapore Street Light Cluster",
  "location": { "lat": 13.0335, "lng": 80.2676, "area": "Mylapore" },
  "fault_description": "AI-generated fault description here",
  "ai_briefing": "AI-generated contractor briefing here",
  "severity": "critical",
  "estimated_pay": 1500,
  "dispatched_at": "ISO timestamp",
  "status": "open",
  "accepted_by": null,
  "accepted_at": null,
  "completed_at": null,
  "completion_notes": null
}
```

### 9.3 Government Pay Scale

| Asset Type | Severity | Pay |
|---|---|---|
| Street Light | Warning | ₹800 |
| Street Light | Critical | ₹1,500 |
| Road | Warning | ₹5,000 |
| Road | Critical | ₹12,000 |
| Water Pipeline | Warning | ₹3,000 |
| Water Pipeline | Critical | ₹8,000 |
| Sewer Line | Warning | ₹2,500 |
| Sewer Line | Critical | ₹6,000 |

### 9.4 Real-Time Flow (Socket.io)

```
1. System detects critical asset
   → Creates Job in DB
   → Groq generates fault description + contractor briefing (async)
   → Groq generates job notification text
   → Emits 'new_job' event to all connected contractors

2. Contractor sees job card appear instantly
   → Reads AI-generated notification text
   → Clicks "Accept Job"
   → Emits 'accept_job' { job_id, contractor_id }

3. Server receives accept_job
   → Checks job is still 'open' (race condition guard)
   → Updates job status to 'assigned'
   → Emits 'job_taken' { job_id } to ALL contractors
   → Emits 'job_confirmed' { job_id, briefing } to accepting contractor

4. All other contractors: job card disappears
   Admin dashboard: job status updates in real-time

5. Contractor updates lifecycle:
   'assigned' → 'en_route' → 'in_progress' → 'completed'
   Each update emits to admin via Socket.io
```

### 9.5 Job Lifecycle States
```
OPEN → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED → PAYMENT_PENDING → PAID
```

---

## 10. DATABASE SCHEMA

### Tables

**users**
```
id (UUID PK), username, password_hash, role (admin|citizen|contractor),
name, phone, created_at, updated_at
```

**assets**
```
id (VARCHAR PK e.g. SL-001), type, name, lat, lng, area,
status, health_score, installed_date, expected_lifespan_years, last_maintained,
iot_sensor_reading, iot_expected_reading, iot_unit, iot_deviation_percent, iot_last_updated,
binary_faulty_index, binary_segment_readings (JSONB), binary_last_run,
anomaly_age_factor, anomaly_weather_factor, anomaly_risk_score, anomaly_risk_level, anomaly_predicted_failure,
social_media_flags, complaint_count, complaint_score,
ai_fault_report (TEXT), ai_prediction (TEXT),
assigned_contractor_id, job_status,
created_at, updated_at
```

**iot_readings**
```
id (UUID PK), asset_id (FK), reading, expected, deviation_percent, timestamp
Keep last 100 readings per asset only.
```

**complaints**
```
id (VARCHAR PK e.g. CMP-00001), user_id (FK), asset_id (FK),
description, severity (citizen-reported),
ai_severity, ai_confidence, ai_urgency, ai_requires_dispatch,
ai_key_issues (JSONB), ai_reasoning,
photo_url, status (open|in_review|resolved),
created_at, updated_at
```

**jobs**
```
id (VARCHAR PK e.g. JOB-001), asset_id (FK), asset_type, area,
fault_description (AI-generated), ai_briefing (TEXT),
severity, estimated_pay, status,
accepted_by (FK to users), dispatched_at, accepted_at, completed_at,
completion_notes, created_at, updated_at
```

**social_flags**
```
id (UUID PK), asset_id (FK), platform, content, flagged_at
```

**ai_reports**
```
id (UUID PK), report_type, content (TEXT), generated_by (admin user id), generated_at
```

**binary_search_logs**
```
id (UUID PK), asset_id (FK), total_units, readings (JSONB),
steps (JSONB), faulty_index, run_at
```

---

## 11. UI / DESIGN SYSTEM

### Color Palette (based on Rocket website — strict)

```css
--color-bg:           #000000;   /* Pure pitch black — main background */
--color-surface:      #0D0D0D;   /* Cards, panels, sidebars */
--color-surface-2:    #141414;   /* Elevated cards, modals */
--color-border:       #1C1C1C;   /* All borders and dividers */
--color-accent:       #E8372A;   /* Primary red — brand, buttons, badges, icons, logo */
--color-accent-hover: #C62D21;   /* Red on hover */
--color-text-primary: #FFFFFF;   /* All primary text */
--color-text-secondary:#999999;  /* Subheadings, descriptions, labels */
--color-text-muted:   #555555;   /* Placeholder text, timestamps */
--color-success:      #FFFFFF;   /* White for success in this theme */
--color-success-bg:   #0D0D0D;   /* With green dot indicator only */
--color-warning:      #E8372A;   /* Use red-orange for warnings */
--color-critical:     #E8372A;   /* Red — same accent */
--color-healthy:      #FFFFFF;   /* White with dim dot indicator */
```

**Status indicators use dots, not colour fills:**
- Healthy: small white dot
- Warning: small red pulsing dot
- Critical: large red pulsing dot (animated)
- Under Repair: white outline dot

### Typography

```css
--font-display: 'Syne', sans-serif;      /* 800 weight — all hero headings */
--font-body:    'DM Sans', sans-serif;   /* 400/500 weight — all body text */
--font-mono:    'JetBrains Mono', monospace; /* IoT readings, IDs, numbers, code */
```

Import from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Key UI Patterns

**Buttons:**
- Primary: Red background `#E8372A`, white text, rounded-full pill shape
- Secondary: Transparent background, white `1px` border, white text, rounded-full
- Destructive: Same as primary (red)
- All buttons: transition on hover (scale 1.02 + color darken)

**Cards:**
- Background: `#0D0D0D`
- Border: `1px solid #1C1C1C`
- Border-radius: `12px`
- On hover: border becomes `#E8372A` (red)
- Padding: `24px`

**Badges/Pills:**
- Critical: Red background `#E8372A` + white text
- Warning: Dark background + red text + red border
- Healthy: Dark background + white text + white border
- AI Badge: Red background + "AI" white text (appears on all AI-generated content)

**Ticker bar:**
- Background: `#000000`
- Border-bottom: `1px solid #1C1C1C`
- "LIVE" label: red background + white text
- Ticker text: white
- Alert keywords (CRITICAL, WARNING, ALERT): red text
- Infinite scrolling left animation

**Tables:**
- Header: `#0D0D0D` background, white text, uppercase small caps
- Row: transparent background, `1px solid #1C1C1C` border-bottom
- Row hover: `#141414` background
- Sortable columns: arrow icon appears on hover

**Sidebar:**
- Background: `#000000`
- Active item: red left border + `#0D0D0D` background
- Inactive item: white text, transparent background
- Hover: `#0D0D0D` background

**AI streaming text:**
- Appears with typewriter effect (character by character)
- Red "AI" pill badge next to section heading
- Subtle pulsing red border on the card while streaming

---

## 12. BUILD PHASES (for Antigravity agents)

Execute ONE phase at a time. Do not start next phase until current is working.

### Phase 1 — Foundation
- Vite + React project setup
- Tailwind CSS with custom config using design system colors and fonts
- Express.js backend
- PostgreSQL connection + all table schemas
- JWT auth system (3 hardcoded users)
- Seed script: all 100 assets with exact coordinates from Section 3.4
- Verify: all 100 assets queryable from DB, auth endpoints working

### Phase 2 — Landing Page
- Navbar with red logo + live ticker bar (scrolling)
- Section 1: Hero with animated stat counters
- Section 2: 5 feature cards grid
- Section 3: 3 login cards with auth flow + redirects
- Verify: all 3 logins work, redirect to correct portals

### Phase 3 — Admin Dashboard Shell
- Sidebar navigation
- Overview page: stat cards + charts (Recharts)
- Recent activity feed (hardcoded events for now)
- Responsive layout
- Verify: sidebar nav works, all stat cards render

### Phase 4 — Asset Map
- Leaflet.js full-screen map
- All 100 assets plotted with correct colours
- Click popups with asset details
- Filter bar: by type + by status
- Verify: all 100 markers show, filters work correctly

### Phase 5 — Binary Search Module
- Core algorithm in `binarySearch.js`
- `BinarySearchVisualiser` component (reusable, all 4 types)
- Animated step-by-step tree
- "Simulate Fault" button
- Integrated into Asset Detail Panel Tab 5
- Verify: animation runs correctly for all 4 asset types

### Phase 6 — IoT Simulation + Anomaly Detection
- IoT simulator with setInterval (30s updates)
- Deviation calculation + status updates
- Anomaly risk score calculator (weather-aware, Chennai seasons)
- Asset statuses update dynamically
- Verify: assets change status as readings deviate

### Phase 7 — Groq AI Integration
- Install `groq-sdk`
- Central groqService.js
- All 10 AI features implemented:
  - Admin chatbot (SSE streaming)
  - Fault report generator
  - Complaint classifier
  - Acknowledgement message
  - Health report generator
  - Contractor briefing
  - Predictive advisor
  - NL asset search
  - Social media summariser
  - Job notification writer
  - Daily digest
- Verify: each AI feature returns correct output, streaming works

### Phase 8 — Complaint Portal
- Citizen complaint form
- On submit: Groq classifies → saves → streams acknowledgement
- Complaint score accumulates on assets
- Admin complaint management page
- Verify: complaint triggers AI classification, score updates asset status

### Phase 9 — Contractor Dispatch System
- Socket.io server + client
- Job auto-creation on critical trigger
- Contractor job board with real-time updates
- Accept/skip flow
- Job lifecycle management
- Contractor briefing (Groq)
- Verify: job appears on contractor board in real-time, accept removes it for others

### Phase 10 — Integration, Polish & Reports
- Connect all 5 detection signals to unified asset health score
- AI Reports page with all 4 report types
- Social media simulation
- Admin daily digest (triggers on first login of day)
- Full end-to-end test of all flows
- Mobile responsiveness check

---

## 13. NON-FUNCTIONAL REQUIREMENTS

- Map loads all 100 markers without lag (use marker clustering for < zoom 12)
- Socket.io job dispatch reflects within 2 seconds
- Binary search animation runs at 400ms per step
- Groq streaming begins within 3 seconds of request
- All protected routes reject unauthenticated access immediately
- Seed data loads automatically on server start if DB is empty
- Ticker animation is smooth (CSS-only, no JavaScript animation)
- All AI features gracefully handle Groq API errors with a user-friendly message

---

*End of PRD — UrbanGuard-AI v3.0*
*Product: Government Infrastructure Monitoring System*
*City: Chennai, Tamil Nadu, India*
