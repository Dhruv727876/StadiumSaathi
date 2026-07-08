# StadiumSaathi 🏟️

StadiumSaathi is a Generative AI-enabled solution designed to enhance stadium operations and the overall tournament experience for fans, organizers, volunteers, and venue staff during the **FIFA World Cup 2026**.

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
