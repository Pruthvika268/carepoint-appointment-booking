# CarePoint — Appointment Booking App

CarePoint is a responsive appointment booking web application built as a full-stack project. It supports booking appointments, viewing saved appointments, changing appointment status, deleting records, and optionally generating an AI-written summary of the patient's stated reason for visiting.

> **Important:** This is an educational starter project, not a production-ready medical records system. Do not use it with real patient information until authentication, role-based access, privacy/security controls, audit logs, backups, and applicable legal/compliance requirements have been reviewed and implemented.

## Features

- Responsive React interface for desktop, tablet, and mobile
- Appointment form with patient name, mobile number, doctor, date, time, and reason for visiting
- Client-side and server-side validation with success/error messages
- Appointment list loaded from the backend
- Mark appointments as completed or cancelled; delete appointments
- Persistent storage using SQLite locally or PostgreSQL when `DATABASE_URL` is configured
- Optional AI-generated appointment summary through a backend-only API key
- Health-check endpoint at `/api/health`

## Technology used

| Technology | Purpose |
| --- | --- |
| React 18 | Builds the interactive user interface |
| Vite | Frontend development server and production build tool |
| CSS | Responsive styling and layout |
| Node.js | Runs the backend JavaScript server |
| Express | Provides REST API endpoints |
| SQLite (`better-sqlite3`) | Simple local database; created automatically |
| PostgreSQL (`pg`) | Recommended database option for hosted deployment |
| OpenAI-compatible Chat Completions API | Optional AI appointment-summary generation |
| Git and GitHub | Version control and source-code repository |
| Vercel | Suggested hosting for the frontend |
| Render | Suggested hosting for the backend API |
| Neon (or another managed PostgreSQL provider) | Suggested hosted database |

## Project structure

```text
appointment_booking_app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js + Express REST API
│   ├── src/server.js
│   ├── package.json
│   └── .env.example
├── database/
│   ├── schema.sql            # PostgreSQL table and indexes
│   └── seed.sql              # Optional sample data
├── docs/
│   ├── architecture.md
│   ├── requirements.md
│   └── setup-guide.md
├── .gitignore
└── README.md
```

## Requirements for local development

1. Install **Node.js 20 or newer** from <https://nodejs.org/>. npm is included with Node.js.
2. Install Git from <https://git-scm.com/downloads> if you plan to push the project to GitHub from your computer.
3. Extract the project ZIP into a folder, for example `appointment_booking_app`.
4. Open that folder in VS Code (optional) or use a terminal.

## Run the project locally

The frontend and backend run in separate terminal windows.

### A. Start the backend

Open Terminal 1 in the project folder and run:

```bash
cd backend
```

Create your local environment file by copying the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux/Git Bash:**

```bash
cp .env.example .env
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

The API should be available at <http://localhost:4000>. Check it by opening <http://localhost:4000/api/health>. The first run creates a local SQLite database automatically at `backend/data/appointments.sqlite`.

### B. Start the frontend

Open a **second** terminal in the project folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints, usually <http://localhost:5173>.

### C. Optional: enable AI summaries locally

1. Create an API key with your chosen OpenAI-compatible provider.
2. Put it only in `backend/.env`, for example:

   ```env
   OPENAI_API_KEY=your_secret_api_key
   OPENAI_MODEL=gpt-4o-mini
   ```

3. Stop and restart the backend.
4. Enter a reason for visiting and click **Generate AI summary**.

Never put `OPENAI_API_KEY` in a `VITE_` variable or frontend code. Never commit `.env` files or secrets to GitHub. Appointment booking can be used without AI configuration.

## GitHub and live deployment

For detailed, beginner-friendly instructions to create a GitHub repository and deploy the frontend, backend, database, and optional AI feature, follow **[docs/deployment-guide.md](docs/deployment-guide.md)**. The guide includes each dashboard setting, environment variable, verification step, and common troubleshooting fix.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API/database health |
| `GET` | `/api/doctors` | Get doctor options |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create an appointment |
| `PATCH` | `/api/appointments/:id/status` | Mark Completed or Cancelled |
| `DELETE` | `/api/appointments/:id` | Delete an appointment |
| `POST` | `/api/ai/appointment-summary` | Generate an AI summary (requires backend API key) |

## Security and privacy notes

- Never commit `.env`, API keys, database URLs, passwords, or actual patient records.
- Use fake data for screenshots, demonstrations, and student submissions.
- The app currently has no login or staff permissions; anyone who can reach the API may be able to view or change appointment records. Do not expose real patient data until authentication and access control are added.
- The AI provider receives the reason for visiting sent to its API. Confirm that this is permitted before using sensitive health information.
- Use database backups and review your hosting provider's data retention, privacy, and free-tier limitations.
