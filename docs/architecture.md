# Architecture

- **Frontend:** React 18 + Vite; responsive booking form, appointment list, and accessible feedback states.
- **Backend:** Node.js + Express REST API; validates incoming appointment data and handles status changes/deletions.
- **Default storage:** SQLite file at `backend/data/appointments.sqlite`, created automatically on first run. Data is persistent across browser refreshes and backend restarts.
- **Optional storage:** PostgreSQL when `DATABASE_URL` is configured; this replaces SQLite for that backend run.
- **API:** `POST /api/appointments`, `GET /api/appointments`, `PATCH /api/appointments/:id/status`, `DELETE /api/appointments/:id`, `GET /api/doctors`, `GET /api/health`.

## Request flow
1. User completes the appointment form.
2. React validates the required fields and sends JSON to the Express API.
3. Backend validates the fields again.
4. The appointment is saved to SQLite or PostgreSQL.
5. The API returns the saved record and the UI refreshes the appointment list from the API.
6. Status changes and deletions are persisted through the same backend/database layer.

## Persistence behavior
The frontend does not treat browser state as the source of truth. On page load, it requests the appointment list from the backend. SQLite stores records on disk by default, so a normal page refresh or backend restart does not erase them.


## AI summary flow
The React client posts the patient-entered reason to `POST /api/ai/appointment-summary`. Express calls an OpenAI-compatible Chat Completions endpoint using a backend environment variable, returns a short summary, and does not expose the secret to the browser. The user reviews the summary and submits it with the appointment; both the reason and summary are persisted in SQLite or PostgreSQL. If the AI API is not configured or unavailable, the app displays a helpful error and the rest of the booking service remains usable.
