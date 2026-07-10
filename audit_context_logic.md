# Cognitive Logic Audit - Code vs. LLM Decisions

This audit analyzes the division of labor in StadiumSaathi between inspectable Javascript/Typescript code-level branching and Generative AI prompt-level reasoning.

---

### 1. Server-Side Routing & Prompt Construction

#### `server/services/geminiService.js`
- **`buildSystemPrompt(persona, language)`**:
  - Contains **zero** logic branching for the rules themselves. It uses template string interpolation to embed `${selectedPersona}` and `${selectedLang}` into a static markdown prompt structure.
  - Generates the `Known Venue Locations` block by mapping over a static array `STADIUM_LOCATIONS` to construct a bulleted string.
  - **Verdict**: The prompt generation is static template assembly. The LLM is expected to parse the text and decide how to act.

#### `server/services/aiService.js`
- **`processMessage(prompt, persona, language)`**:
  - Uses an operational `try/catch` block to orchestrate AI models.
  - **Branching**: If the primary Gemini API call fails (or times out), it catches the exception and falls back to NVIDIA Gemma 2.
  - **Verdict**: Operational failover logic is code-governed, while response reasoning is model-governed.

---

### 2. Client-Side Components & Features

#### `Wayfinding.tsx` (📍 Smart Wayfinding)
- **Code Branching**:
  - `if (data.success)`: Decides whether to render the response string or show an error state.
  - `catch (err)`: Branches to show an offline fallback string on connection failure.
- **LLM Delegation**: The route planning itself (which corridors to take, ramp navigation based on wheelchair/step-free selections) is pushed entirely to the LLM. The code simply builds the query string.

#### `CrowdDashboard.tsx` (📊 Crowd Density Tracking)
- **Code Branching**:
  - `if (snap.exists())` and `if (data[sec.name])`: Verifies and map Firestore document records to local component states.
  - Arrow-key handling: Multi-branch `if/else` checks keys (`ArrowRight`, `ArrowLeft`, `ArrowDown`, `ArrowUp`) to perform focus adjustments.
  - Badge coloring: Nested ternaries mapping the status (`low` / `medium` / `high`) to Tailwind style classes.
- **Verdict**: Purely state synchronization and UI presentation branching. No operational crowd routing decisions are made by the code.

#### `AccessibilitySetup.tsx` (♿ Accessibility Profile)
- **Code Branching**: Toggles individual boolean states and writes them to the Firestore `users/{uid}` collection.
- **LLM Delegation**: No path filtering is done in the UI. The selections are compiled into a CSV string (`wheelchair access, step-free routing`) and passed directly as contextual parameters to the `/api/chat` route.

#### `Transportation.tsx` (🚍 Transportation & Parking)
- **Code Branching**:
  - `if (data.success)` and `catch (err)`: Standard async resolution logic.
- **LLM Delegation**: The recommendation (e.g., advising Metro over rideshare because kickoff is in 20 minutes) is resolved entirely by the LLM. The code does not inspect the `kickoffMinutes` number value beyond validation.

---

### 3. Branches Count & Logic Breakdown

| File / Component | Code Branches (if/switch/ternary) | Purpose | LLM Delegated Features |
|---|---|---|---|
| `App.tsx` | 6 | Auth listener check, save profile verify, user settings CSV compiler, congestion simulation hook. | Accessibility preference resolution. |
| `MapView.tsx` | 7 | Google Maps SDK script loader, API key fallback switcher, active zone marker highlighting. | Coordinate mapping presentation. |
| `CrowdDashboard.tsx` | 8 | Firestore data checks, keyboard focus, conditional color styles. | None (presentation only). |
| `Wayfinding.tsx` | 2 | API response check, catch error fallback. | Step-by-step path planning & obstacle avoidance. |
| `Transportation.tsx` | 2 | API response check, catch error fallback. | Kickoff-timed transit delay assessments. |
| `aiService.js` | 1 | Gemini failure catching. | Failover response generation. |

---

### 4. Honest Assessment

StadiumSaathi's intelligence is structured as a **Decoupled AI Orchestration Pattern**:

1. **What the Code Decides (Inspectable Logic)**:
   - Secure server-side proxying and input validation.
   - Graceful API/network failure fallbacks (mock map presentation, offline directions).
   - Operations-level failover routing (Gemini 2.5 Flash ➔ NVIDIA Gemma).
   - Real-time telemetry sync & polling orchestration (Firestore listeners).

2. **What the LLM Decides (Prompt Logic)**:
   - Strategic path routing matching accessibility options.
   - Travel advice aligned with minutes left before kickoff.
   - Translation and localized output generation.

**Summary**: An evaluator scanning the codebase will find robust **system architecture logic** (rate limiters, security CSP headers, keyboard accessibility grids, and database/API synchronization hooks), but the **domain intelligence** (schedule routing, route calculations, and multilingual dialogues) is deliberately delegated to the GenAI prompt context.
