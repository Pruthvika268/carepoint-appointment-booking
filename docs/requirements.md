# Requirements Tracker

## Requirement 1 — Appointment form
- [x] Patient Name
- [x] Mobile Number
- [x] Doctor Name
- [x] Appointment Date
- [x] Appointment Time
- [x] Submit button
- [x] Responsive, polished interface
- [x] Client-side and server-side validation
- [x] Booking confirmation and reference
- [x] API endpoint for creating appointments
- [x] Persistent SQLite storage by default; optional PostgreSQL storage
- [x] Appointment records remain available after page refresh and backend restart

## Requirement 2 — Appointment list
- [x] List appointments in a table below the booking form
- [x] Patient name, mobile number, doctor, date, time, and status columns
- [x] Refresh list after a successful booking
- [x] Fetch existing appointments from the backend on page load
- [x] Empty, loading, error, and refresh states
- [x] Responsive table container for smaller screens
- [x] Default appointment status: Booked

## Requirement 3 — Appointment actions
- [x] Mark an appointment as Completed
- [x] Cancel an appointment
- [x] Delete an appointment after confirmation
- [x] Persist status changes and deletions through backend API
- [x] Show action feedback and disable conflicting actions while processing
- [x] Hide completion/cancellation actions after an appointment is Completed or Cancelled

## Requirement 4 — Data storage
- [x] Durable database storage by default (SQLite file)
- [x] Optional PostgreSQL support using `DATABASE_URL`
- [x] Appointment creation, status changes, list retrieval, and deletion operate against the configured database
- [x] Database file is created automatically for local development

## Requirement 5 — Basic UI and validation
- [x] Responsive layout for desktop, tablet, and mobile screens
- [x] Consistent healthcare-inspired visual design and clear visual hierarchy
- [x] Labels programmatically connected to each form field
- [x] Required-field and date constraints enforced by the browser
- [x] Patient name is trimmed and checked for a meaningful minimum length
- [x] Mobile number is validated by digit count (10–15 digits) and allowed characters
- [x] Success and error feedback for booking, appointment status changes, and deletion
- [x] Loading/disabled states prevent duplicate submissions and conflicting actions
- [x] Keyboard focus visibility and reduced-motion preference support

## Assumptions
- Doctor options are a starter list and can be replaced with stakeholder-approved doctors.
- Appointment times are sample slots, not connected to a live doctor schedule.
- The starter does not yet prevent double-booking; slot availability and conflict checks can be added as a later requirement. SQLite is the default local database; PostgreSQL is available for deployment.


## Requirement 6 — AI appointment summary
- [x] Capture the patient's reason for visiting (5–1000 characters)
- [x] Generate a concise AI summary on demand through a backend endpoint
- [x] Keep the AI API key on the backend, never in browser code
- [x] Show loading, success, and error states for AI generation
- [x] Let the user review the generated summary before booking
- [x] Persist the reason and summary with the appointment and show them in the appointment list
- [x] Provide a clear setup path when no AI API key is configured
- [x] Prompt the AI not to diagnose or recommend treatment
