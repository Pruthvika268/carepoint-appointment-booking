CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(18) NOT NULL,
    doctor_name VARCHAR(120) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit TEXT NOT NULL DEFAULT '',
    ai_summary TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT appointment_date_not_in_past CHECK (appointment_date >= CURRENT_DATE)
);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Booked';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason_for_visit TEXT NOT NULL DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ai_summary TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_appointments_date_doctor
    ON appointments (appointment_date, doctor_name);

CREATE INDEX IF NOT EXISTS idx_appointments_created_at
    ON appointments (created_at DESC);
