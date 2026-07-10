# StadiumSaathi 🏟️

> Your GenAI-enabled stadium operations and fan experience assistant designed to enhance navigation, crowd management, accessibility, and real-time decision support during the FIFA World Cup 2026.

[![Built for Hack2Skill Hackathon](https://img.shields.io/badge/Hack2Skill-Hackathon-orange)](https://hack2skill.com)
[![Powered by Gemini 2.5 Flash](https://img.shields.io/badge/Powered%20by-Gemini--2.5--flash-blue)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-yellow)](https://firebase.google.com)

---

## 📖 Overview
StadiumSaathi is a high-efficiency stadium operations and spectator assistant designed to address tournament logistics challenges during the FIFA World Cup 2026. By utilizing decoupled AI orchestration, live crowd congestion telemetry, and localized client state caching, it provides immediate route suggestions, accessibility setups, and real-time operational support for fans, venue staff, and volunteers.

The platform integrates directly with Google Maps to render spatial marker maps, and utilizes Cloud Firestore to sync and auto-refresh regional stadium congestion indices. It features a robust multi-model fallback chain to ensure high availability during peak spectator traffic.

## Problem Statement
> Build a GenAI-enabled solution that enhances stadium operations and the 
> overall tournament experience for fans, organizers, volunteers, or venue 
> staff. The solution must leverage Generative AI to improve navigation, 
> crowd management, accessibility, transportation, sustainability, 
> multilingual assistance, operational intelligence, or real-time decision 
> support during the FIFA World Cup 2026.

## How StadiumSaathi Addresses This
Each capability called for in the problem statement is implemented by a dedicated file or component in this repository:
- **Navigation**: Managed visually via the interactive map component [MapView.tsx](client/src/components/MapView.tsx) and AI routing paths inside [Wayfinding.tsx](client/src/components/Wayfinding.tsx).
- **Crowd Management**: Handled via interval-based Firestore congestion feeds in [CrowdDashboard.tsx](client/src/components/CrowdDashboard.tsx).
- **Accessibility**: Customized path recommendations mapped from spectator selections inside [AccessibilitySetup.tsx](client/src/components/AccessibilitySetup.tsx).
- **Transportation**: Calculated travel and parking options mapped relative to kickoff timings inside [Transportation.tsx](client/src/components/Transportation.tsx).
- **Sustainability**: Handled via Eco-friendly wayfinding guidelines and waste-reduction hints inside the system prompt builder in [geminiService.js](server/services/geminiService.js).
- **Multilingual Assistance**: Driven by user language selections mapped in [App.tsx](client/src/App.tsx) and compiled inside the system prompt in [geminiService.js](server/services/geminiService.js).
- **Operational Intelligence**: Driven by server-side AI model routing rules in [aiService.js](server/services/aiService.js), ensuring models coordinate to offer operational insights.
- **Real-Time Decision Support**: Programmed inside the custom AI system prompt builder in [geminiService.js](server/services/geminiService.js), giving immediate actionable instructions to fans and staff.

---

## ✨ Features
| # | Feature | Description |
|---|---|---|
| 1 | **Interactive Map (MapView)** | Renders an interactive map of gates, zones, and transport hubs. Integrates with the Google Maps JS API and falls back to a clean mock visual layout if the API fails to load or no API key is provided. |
| 2 | **Smart Wayfinding (Wayfinding)** | Computes step-by-step navigation instructions using AI queries customized to the user's starting point, destination gate, language, and accessibility preferences. |
| 3 | **Crowd Density Tracking (CrowdDashboard)** | Syncs color-coded regional congestion statuses (`low`, `medium`, `high`) from Firestore with an automatic 10-second interval refresh to prevent overcrowding. |
| 4 | **Accessibility Configuration (AccessibilitySetup)** | Toggles and saves accessibility requirements (Wheelchair Routing, Sensory-Friendly Zones, Step-Free Access) to user profiles to tailor AI route instructions. |
| 5 | **kickoff-Aligned Transportation** | Suggests optimal transportation and parking hubs relative to minutes remaining before the kickoff time to minimize exit delay bottlenecks. |
| 6 | **Persona-Driven Assistant** | Builds dynamic prompts grounding the assistant in tournament guides, safety protocols, and venue-specific data while avoiding pricing hallucinations. |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + TypeScript | UI component framework with strict compile-time types and lifecycle isolation. |
| **Vite** | Bundle construction supporting lazy-loaded component code-splitting. |
| **Tailwind CSS** | Styling utility classes and responsive layouts. |
| **Firebase JS SDK** | Handles client-side Anonymous Auth and Firestore listeners. |
| **Vitest + JSDOM** | High-performance unit testing library for React hooks and components. |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | High-throughput asynchronous backend server hosting API routes. |
| **Axios** | Client used to execute requests to Google Gemini and NVIDIA API gateways. |
| **Helmet.js** | Enforces secure HTTP headers to mitigate cross-site scripting (XSS) and injection vectors. |
| **express-rate-limit** | Custom rate limiters configured to restrict client chat (20 req/min) and general (15 req/min) operations. |
| **express-validator** | Deep validation and sanitization (HTML escaping) on incoming payloads. |

### Google / Firebase Services
| Service | Purpose |
|---|---|
| **Firebase Anonymous Auth** | Secure session initiation generating transient JWT keys to isolate user preferences. |
| **Cloud Firestore** | NoSQL database storing user profile states (`users/{uid}`) and live congestion (`congestion/current_status`). |
| **Google Maps JS API** | Renders stadium map layouts and places custom markers for gates and hubs. |
| **Google Gemini 2.5 Flash API** | Primary GenAI inference model executing fast natural language instruction resolutions. |
| **NVIDIA NIM API** | Fallback inference platform hosting `google/gemma-2-9b-it` to handle Gemini timeouts. |

---

## 📐 Architecture & Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                         │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Wayfinding  │  │CrowdDashboard│  │    Transportation    │   │
│  │ (lazy)      │  │ (lazy)       │  │    (lazy)            │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                │                     │               │
│  ┌──────▼────────────────▼─────────────────────▼───────────┐   │
│  │               useMainHook (useCallback)                  │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │       Firebase SDK (Auth · Firestore · Analytics)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express Secure Proxy Server                        │
│                                                                 │
│   POST /api/chat                                                │
│                                                                 │
│   ┌────────────────────────┐   ┌──────────────────────────┐     │
│   │ Rate Limiter (20/min)  │   │ Express Validator (XSS)  │     │
│   └───────────┬────────────┘   └──────────────────────────┘     │
│               │                                                 │
│└──────────────┼─────────────────────────────────────────────────┘
                │  HTTPS
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI Orchestration (aiService.js)                    │
│                                                                 │
│        Attempt Primary ─────────────► Gemini (gemini-2.5-flash) │
│               │                                                 │
│        Fail / Timeout (25s) ────────► NVIDIA (gemma-2-9b-it)    │
└─────────────────────────────────────────────────────────────────┘
```

### Firestore Document Layouts

#### `users/{uid}`
Keeps track of spectator preferences to customize dynamic prompts:
```json
{
  "language": "en",
  "wheelchair": true,
  "sensoryFriendly": false,
  "stepFree": true,
  "lastActive": "2026-07-10T21:30:00.000Z"
}
```

#### `congestion/current_status`
Keeps track of current density configurations in the stadium zones:
```json
{
  "North Gate": { "status": "low", "updatedAt": "2026-07-10T21:30:00.000Z" },
  "South Gate": { "status": "medium", "updatedAt": "2026-07-10T21:30:00.000Z" },
  "East Stand": { "status": "high", "updatedAt": "2026-07-10T21:30:00.000Z" }
}
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js ≥ 20
- Firebase CLI (`npm install -g firebase-tools`)
- Google Gemini API Key + NVIDIA NIM API Key

### 1 — Configure Environment Variables

Create `client/.env` based on `client/.env.example`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=stadiumsaathi-prod-98.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=stadiumsaathi-prod-98.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2 — Server setup
```bash
cd server
npm install
npm start
```

### 3 — Client setup
```bash
cd ../client
npm install
npm run dev
```

---

## 🧪 Testing

### Server tests (Jest + Supertest)
```bash
cd server
npm test
```

| Test file | What it covers |
|---|---|
| `health.test.js` | Verifies health check status (`UP`), server timestamp format, and response latency (<200ms). |
| `chat.test.js` | Asserts standard route operations, character caps, missing parameter rejections, and mock generation processing. |
| `security.test.js` | Asserts Helmet headers are present, request payloads exceeding limits are blocked, and malicious XSS strings are escaped. |
| `gemini.test.js` | Validates custom persona compilation, fallback default persona injection, next-action format compliance, and output parsing. |

#### Example Request & Validation Behavior

* **Bad Payload Structure (Missing Message)**:
  `POST /api/chat` with body `{ "persona": "StadiumAssistant" }`
  Response: `400 Bad Request`
  ```json
  {
    "error": "Bad Request",
    "errors": [
      {
        "type": "field",
        "value": "",
        "msg": "Message parameter is required",
        "path": "message",
        "location": "body"
      }
    ]
  }
  ```

* **XSS Injections Sanitization**:
  `POST /api/chat` with body `{ "message": "<script>alert(1)</script>" }`
  Sanitized message sent to AI: `&lt;script&gt;alert(1)&lt;&#x2F;script&gt;`

---

### Client tests (Vitest + React Testing Library)
```bash
cd client
npm run test
```

| Test file | What it covers |
|---|---|
| `useMainHook.test.ts` | Tests main state machine handling, empty query handling, loading toggle behavior, capture of API error responses, and error reset functions. |
| `components.test.tsx` | Asserts successful render states, mock map click callbacks, accessibility toggle changes, wayfinding drop-downs, and transportation kickoff triggers. |

---

## 🧠 Approach & Prompt Engineering

### Secure Proxy Topology
To safeguard API keys, the React frontend application never queries Google Gemini or NVIDIA Developer endpoints directly. Instead, requests flow through an Express proxy. The server verifies payloads, sanitizes parameters using `express-validator` to neutralize malicious markup, enforces rate-limiting configurations, and appends authorization headers before initiating AI API requests.

### Structured Persona Prompt Architecture
The custom `buildSystemPrompt` systematically constructs instructions:
1. **Identity Context**: Dictates that the AI acts as a dedicated operations assistant helping spectators, staff, and organizers during the FIFA World Cup 2026.
2. **8 Knowledge Pillars**: Directs responses within strict boundaries: Wayfinding (marking routes with a `STADIUM_GUIDANCE:` prefix), Congestion mitigation, Transport advice, Accessibility Routing, Sustainability recommendations, Tournament Schedule details, Emergency procedures, and Language preference handling.
3. **Hard Limits**: Enforces dependencies on real data. Explicitly prohibits the generation of mock seat numbers or match ticket pricing.
4. **Format Directives**: Mandates the prefixing of wayfinding responses and requires every response to end with exactly one concrete next action for the user.

---

## 📋 Assumptions Made
1. **Map Failover**: Assumes that if the Google Maps API script fails to load or no key is configured, the system falls back gracefully to a static, interactive mock layout focusing on Miami Hard Rock Stadium coordinates `{ lat: 25.8038, lng: -80.1384 }`.
2. **Anonymous Session Scope**: Assumes that user profiles (language, step-free access, wheelchair flags) are stored based on temporary anonymous user IDs, allowing persistent profile lookups within active sessions.
3. **Model Fallback Constraints**: Assumes that Google Gemini `gemini-2.5-flash` is the primary AI provider, with automatic failover to NVIDIA NIM's `google/gemma-2-9b-it` only if requests fail or exceed a 25-second timeout.
4. **Static Venue Gates**: Assumes that the locations of gates (North, South, East, West) and transport links remain static during active matches.
5. **Rate-limiting Boundaries**: Assumes that rate-limiting metrics (20 calls per minute) are sufficient to handle natural user conversations while preventing malicious endpoint floods.

---

## 📜 License
Built exclusively for the **Hack2Skill FIFA World Cup 2026 Challenge** · Data grounded in stadium operations and accessibility parameters · *Empowering collective progress towards a seamless tournament experience.*
