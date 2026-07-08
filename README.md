# StadiumSaathi 🏟️

StadiumSaathi is a Generative AI-enabled solution designed to enhance stadium operations and the overall tournament experience for fans, organizers, volunteers, and venue staff during the **FIFA World Cup 2026**.

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

## Core Features

- **GenAI Navigation Support**: Smart routing and real-time guidance to navigate around stadium complexes.
- **Multilingual Support**: Real-time communication and venue support in multiple languages.
- **Crowd Management & Operations**: Dynamic response suggestions to ease congested zones.
- **Robust Fallback Engine**: Primary queries route via Gemini 2.5 Flash, with automatic failover to NVIDIA Gemma services.

## Architecture

```
StadiumSaathi/
├── client/          # React + TypeScript + Tailwind CSS Frontend
└── server/          # Express.js Node API with Gemini/Gemma Services
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- Firebase CLI (for deployment)

### Environment Variables
Configure the following in `client/.env` and `server/.env`:
- `REACT_APP_API_URL` (Client API pointer)
- `GEMINI_API_KEY` (Google AI Studio Key)

### Local Development

1. Run the client:
   ```bash
   cd client
   npm run dev
   ```

2. Run the server:
   ```bash
   cd server
   npm start
   ```
