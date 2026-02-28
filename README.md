# 🛸 ArsCreatio — Neural Intelligence Matrix

ArsCreatio is a high-performance content intelligence platform designed for deep research, viral trend analysis, and automated content generation. This repository contains the complete stack, from the high-fidelity landing page to the secure, AI-powered backend.

## 🏗️ Architecture Overview

The system is split into three core layers to ensure maximum security and scalability:

### 1. The Landing Page (Root)
*   **Location**: `./index.html`
*   **Purpose**: A high-conversion entry point that explains the value proposition and directs users to the authenticated workspace.
*   **Tech**: Vanilla HTML5, CSS3, and high-performance canvas animations.

### 2. The Neural Workspace (Frontend)
*   **Location**: `./SHIROX` (Source) & `./app` (Build)
*   **Purpose**: The main authenticated application where users interact with the AI.
*   **Tech**: React 19, Vite, Tailwind CSS, Lucide Icons.
*   **Auth**: Integrated with **Supabase Auth**. All requests to the backend are signed with a Supabase JWT for security.

### 3. The Neural Server (Backend)
*   **Location**: `./SHIROX/server`
*   **Purpose**: This is the "brain" of the application. It acts as the secure authority for all sensitive operations.
*   **Tech**: Node.js, Express, Better-SQLite3, Google Generative AI (Gemini).
*   **Security**: Validates every incoming request using the Supabase JWT. It keeps the Gemini API Key and Supabase Service Role Key hidden from the client.

---

## 📂 Codebase Structure

```text
├── app/                  # Compiled production build (Served at /app)
├── SHIROX/               # Source code for the main application
│   ├── components/       # UI Components (Chat, Analytics, Marketing, etc.)
│   ├── lib/              # Library initializations (Supabase Client)
│   ├── services/         # API Service (The bridge between Frontend and Backend)
│   ├── server/           # The Express Backend
│   │   ├── index.js      # Main entry point & API routes
│   │   ├── users.db      # Local SQLite database (Multi-user synced)
│   │   └── .env          # Server-side secrets (HIDDEN)
│   └── types.ts          # Global TypeScript definitions
├── index.html            # Public Landing Page
└── vercel.json           # Vercel deployment & routing config
```

---

## 🛠️ Developer Setup

### 1. Backend Configuration
Create a `.env` file in `SHIROX/server/`:
```env
PORT=2005
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
ALLOWED_ORIGIN=http://localhost:3000
```

### 2. Frontend Configuration
Create a `.env.local` file in `SHIROX/`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:2005
```

### 3. Running Locally
**Terminal 1 (Backend)**:
```bash
cd SHIROX/server && node index.js
```

**Terminal 2 (Frontend)**:
```bash
cd SHIROX && npm run dev
```

---

## 🚀 Deployment

### Backend (Render)
1.  Set the **Root Directory** to `SHIROX`.
2.  **Build Command**: `npm install`.
3.  **Start Command**: `node server/index.js`.
4.  Add your Environment Variables in the Render dashboard.

### Frontend (Vercel)
1.  Deploy the root of the repository.
2.  Vercel will automatically serve the `index.html` and the `/app` folder.
3.  Add the `VITE_` Environment Variables in the Vercel dashboard.

---

## 🧠 Core Systems

### Neural Sync
Every time a user saves an idea, updates settings, or sends a chat message, the `apiService.ts` automatically pushes that data to the Backend. The Backend then stores it in `users.db` linked to that specific User's ID from Supabase.

### AI Persona Blending
The system supports 10 distinct persona styles. The user can select up to two, which are blended into the system prompt before hitting the Gemini API, creating a unique, human-like interaction rhythm.

---

**Built by ArsX · Dedicated to the Creators of the Future.**
