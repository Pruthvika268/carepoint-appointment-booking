# Setup Guide

## Default local setup (SQLite)
1. Install Node.js 20 or newer.
2. Open a terminal in `backend`, copy `.env.example` to `.env`, then run `npm install` and `npm run dev`.
3. The backend creates `backend/data/appointments.sqlite` automatically. This file persists bookings and status changes across page refreshes and backend restarts.
4. Open another terminal in `frontend`, run `npm install` and `npm run dev`.
5. Visit the Vite URL, normally `http://localhost:5173`.

## Optional PostgreSQL setup
1. Create a PostgreSQL database.
2. Run `database/schema.sql` against it.
3. Set `DATABASE_URL` in `backend/.env` and restart the backend. Set `DATABASE_SSL=true` only if your provider requires TLS.

If frontend and backend are hosted on different origins, set `FRONTEND_ORIGIN` in the backend environment to the frontend's origin.

## Data backup
Back up `backend/data/appointments.sqlite` when the backend is stopped or use a SQLite-aware backup method. Never include real patient data in source-control commits or public ZIP archives.

## Optional AI summary setup
1. Add `OPENAI_API_KEY=your_key` to `backend/.env`.
2. Optional: set `OPENAI_MODEL=gpt-4o-mini` or configure `OPENAI_API_BASE_URL` for a compatible provider.
3. Restart the backend and enter a reason for visiting in the form.
4. Click **Generate AI summary**, review the result, and submit the booking.

The feature uses the backend's server-side `fetch` and does not need another npm dependency. Do not expose the API key in frontend code. The app can still book appointments when AI is not configured.
