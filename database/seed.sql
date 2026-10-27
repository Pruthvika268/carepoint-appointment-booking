-- Optional sample records for local development only.
-- Remove or change these values before using a real environment.
INSERT INTO appointments (patient_name, mobile_number, doctor_name, appointment_date, appointment_time)
VALUES
  ('Demo Patient', '9000000000', 'Dr. Ananya Rao', CURRENT_DATE + 1, TIME '10:00')
ON CONFLICT DO NOTHING;
