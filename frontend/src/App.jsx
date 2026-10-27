import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, Clock3, HeartPulse, ShieldCheck, Stethoscope, UserRound, Phone, ChevronDown, ArrowRight, CalendarCheck, RefreshCw, ClipboardList, Check, Ban, Trash2, LoaderCircle, Sparkles, FileText } from 'lucide-react';

const doctors = [
  { name: 'Dr. Ananya Rao', specialty: 'General Physician' },
  { name: 'Dr. Rahul Mehta', specialty: 'Cardiology' },
  { name: 'Dr. Priya Sharma', specialty: 'Dermatology' },
  { name: 'Dr. Arjun Nair', specialty: 'Orthopedics' },
  { name: 'Dr. Meera Iyer', specialty: 'Pediatrics' }
];

const today = new Date();
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const initialForm = { patientName: '', mobileNumber: '', doctorName: '', appointmentDate: '', appointmentTime: '', reasonForVisit: '', aiSummary: '' };

function Field({ label, htmlFor, icon: Icon, children, hint }) {
  return <div className="field">
    <label htmlFor={htmlFor}>{label}</label>
    <div className="input-wrap">{Icon && <Icon size={18} aria-hidden="true" />}{children}</div>
    {hint && <small id={htmlFor === 'mobileNumber' ? 'mobile-hint' : undefined}>{hint}</small>}
  </div>;
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiNotice, setAiNotice] = useState({ type: '', message: '' });
  const [appointments, setAppointments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [actionError, setActionError] = useState('');
  const [listNotice, setListNotice] = useState({ type: '', message: '' });
  const [pendingAction, setPendingAction] = useState('');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const selectedDoctor = useMemo(() => doctors.find(d => d.name === form.doctorName), [form.doctorName]);

  const loadAppointments = useCallback(async () => {
    setListError('');
    try {
      const response = await fetch(`${apiBase}/api/appointments`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load appointments.');
      setAppointments(Array.isArray(result.appointments) ? result.appointments : []);
    } catch (error) {
      setListError(error.message || 'Unable to connect to the appointment service.');
    } finally {
      setListLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function updateAppointmentStatus(appointment, nextStatus) {
    const actionKey = `${appointment.id}-${nextStatus}`;
    setPendingAction(actionKey);
    setActionError('');
    try {
      const response = await fetch(`${apiBase}/api/appointments/${encodeURIComponent(appointment.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to update appointment.');
      await loadAppointments();
      setListNotice({ type: 'success', message: `Appointment marked as ${nextStatus.toLowerCase()}.` });
    } catch (error) {
      setActionError(error.message || 'Unable to update appointment. Please try again.');
    } finally {
      setPendingAction('');
    }
  }

  async function deleteAppointment(appointment) {
    const confirmed = window.confirm(`Delete the appointment for ${appointment.patientName}? This action cannot be undone.`);
    if (!confirmed) return;
    const actionKey = `${appointment.id}-delete`;
    setPendingAction(actionKey);
    setActionError('');
    try {
      const response = await fetch(`${apiBase}/api/appointments/${encodeURIComponent(appointment.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to delete appointment.');
      await loadAppointments();
      setListNotice({ type: 'success', message: 'Appointment deleted successfully.' });
    } catch (error) {
      setActionError(error.message || 'Unable to delete appointment. Please try again.');
    } finally {
      setPendingAction('');
    }
  }

  function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTime(value) {
    if (!value) return '—';
    const [hour, minute] = String(value).slice(0, 5).split(':').map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }

  function update(e) {
    const { name, value } = e.target;
    setForm(current => ({ ...current, [name]: value, ...(name === 'reasonForVisit' ? { aiSummary: '' } : {}) }));
    if (name === 'reasonForVisit') setAiNotice({ type: '', message: '' });
    setStatus({ type: '', message: '' });
    setBooking(null);
  }

  async function generateSummary() {
    const reason = form.reasonForVisit.trim();
    if (reason.length < 5 || reason.length > 1000) {
      setAiNotice({ type: 'error', message: 'Enter a reason for visiting between 5 and 1000 characters first.' });
      return;
    }
    setGeneratingSummary(true);
    setAiNotice({ type: '', message: '' });
    try {
      const response = await fetch(`${apiBase}/api/ai/appointment-summary`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonForVisit: reason })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not generate the summary.');
      setForm(current => ({ ...current, aiSummary: result.summary || '' }));
      setAiNotice({ type: 'success', message: 'AI summary generated. Review it before booking.' });
    } catch (error) {
      setAiNotice({ type: 'error', message: error.message || 'Unable to generate the AI summary. Please try again.' });
    } finally {
      setGeneratingSummary(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    const patientName = form.patientName.trim();
    const mobileDigits = form.mobileNumber.replace(/\D/g, '');
    if (patientName.length < 2) {
      setStatus({ type: 'error', message: 'Enter the patient’s full name (at least 2 characters).' });
      return;
    }
    if (mobileDigits.length < 10 || mobileDigits.length > 15 || !/^\+?[0-9\s()-]+$/.test(form.mobileNumber.trim())) {
      setStatus({ type: 'error', message: 'Enter a valid mobile number containing 10–15 digits.' });
      return;
    }
    if (!form.appointmentDate || form.appointmentDate < localToday) {
      setStatus({ type: 'error', message: 'Choose today or a future date for your appointment.' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientName })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not book your appointment.');
      setBooking(result.appointment);
      setAiNotice({ type: '', message: '' });
      setStatus({ type: 'success', message: 'Your appointment has been booked successfully.' });
      setListNotice({ type: '', message: '' });
      setForm(initialForm);
      await loadAppointments();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to connect to the server. Please start the backend and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="CarePoint home">
        <span className="brand-mark"><HeartPulse size={22} /></span>
        <span>care<span className="brand-accent">point</span><small>HEALTHCARE, MADE SIMPLE</small></span>
      </a>
      <div className="topbar-note"><ShieldCheck size={17} /> Your health, our priority</div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR WELLNESS JOURNEY STARTS HERE</div>
          <h1>Care that fits<br /><span>your schedule.</span></h1>
          <p>Book an appointment with trusted healthcare professionals in just a few simple steps.</p>
          <div className="trust-row">
            <div className="trust-icon"><Stethoscope size={19} /></div>
            <div><strong>Care from trusted doctors</strong><span>Professional support, centered on you.</span></div>
          </div>
          <div className="hero-decoration decor-one"></div><div className="hero-decoration decor-two"></div>
        </div>

        <section className="booking-card" aria-labelledby="booking-title">
          <div className="card-heading">
            <div className="heading-icon"><CalendarCheck size={22} /></div>
            <div><h2 id="booking-title">Book an appointment</h2><p>Fill in your details to reserve your visit.</p></div>
          </div>
          <div className="step-indicator"><span>01</span><div></div><span className="step-muted">YOUR DETAILS</span></div>

          <form onSubmit={submit}>
            <Field label="Patient name" htmlFor="patientName" icon={UserRound}>
              <input id="patientName" name="patientName" value={form.patientName} onChange={update} placeholder="Enter full name" autoComplete="name" required minLength={2} maxLength={100} pattern=".*\S.*" title="Enter at least 2 characters." />
            </Field>
            <Field label="Mobile number" htmlFor="mobileNumber" icon={Phone} hint="We'll use this number for appointment updates.">
              <input id="mobileNumber" name="mobileNumber" value={form.mobileNumber} onChange={update} placeholder="e.g. 98765 43210" type="tel" inputMode="tel" autoComplete="tel" required maxLength={18} aria-describedby="mobile-hint" />
            </Field>
            <Field label="Choose a doctor" htmlFor="doctorName" icon={Stethoscope}>
              <select id="doctorName" name="doctorName" value={form.doctorName} onChange={update} required>
                <option value="" disabled>Select a doctor</option>
                {doctors.map(d => <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>)}
              </select><ChevronDown className="select-chevron" size={16} />
            </Field>
            {selectedDoctor && <div className="doctor-chip"><span className="doctor-avatar"><UserRound size={17} /></span><span><strong>{selectedDoctor.name}</strong><small>{selectedDoctor.specialty}</small></span><CheckCircle2 size={17} className="verified" /></div>}
            <div className="field-grid">
              <Field label="Appointment date" htmlFor="appointmentDate" icon={CalendarDays}>
                <input id="appointmentDate" name="appointmentDate" type="date" value={form.appointmentDate} onChange={update} min={localToday} required />
              </Field>
              <Field label="Appointment time" htmlFor="appointmentTime" icon={Clock3}>
                <select id="appointmentTime" name="appointmentTime" value={form.appointmentTime} onChange={update} required>
                  <option value="" disabled>Select time</option>
                  {['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t => <option key={t} value={t}>{new Date(`2000-01-01T${t}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</option>)}
                </select><ChevronDown className="select-chevron" size={16} />
              </Field>
            </div>

            <div className="field reason-field">
              <label htmlFor="reasonForVisit">Reason for visiting</label>
              <div className="reason-helper">Briefly describe what you would like to discuss with the doctor.</div>
              <textarea id="reasonForVisit" name="reasonForVisit" value={form.reasonForVisit} onChange={update} placeholder="e.g. I have had a persistent cough for three days." required minLength={5} maxLength={1000} rows={3} />
              <div className="reason-footer"><small>5–1000 characters. Share only information relevant to your visit.</small><span>{form.reasonForVisit.length}/1000</span></div>
              <button className="ai-summary-btn" type="button" onClick={generateSummary} disabled={generatingSummary || form.reasonForVisit.trim().length < 5}>
                {generatingSummary ? <LoaderCircle size={16} className="spinning" /> : <Sparkles size={16} />} {generatingSummary ? 'Generating summary…' : 'Generate AI summary'}
              </button>
              {aiNotice.message && <div className={`ai-notice ${aiNotice.type}`} role={aiNotice.type === 'error' ? 'alert' : 'status'}>{aiNotice.message}</div>}
              {form.aiSummary && <div className="ai-summary-preview"><div className="ai-summary-title"><FileText size={16} /><strong>Appointment summary</strong><span>AI generated</span></div><p>{form.aiSummary}</p><small>Please review for accuracy. This is a summary, not a diagnosis or medical advice.</small></div>}
            </div>

            {status.message && <div className={`status-message ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.type === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}{status.message}</div>}
            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Booking appointment…' : 'Confirm appointment'} <ArrowRight size={18} />
            </button>
            <p className="privacy-note"><ShieldCheck size={15} /> Your information is kept private and secure.</p>
          </form>
          {booking && status.type === 'success' && <div className="confirmation">
            <div className="confirmation-icon"><CheckCircle2 size={22} /></div>
            <div><strong>Booking reference: {booking.id}</strong><span>{booking.patientName} · {booking.doctorName}</span><span>{booking.appointmentDate} at {booking.appointmentTime}</span></div>
          </div>}
        </section>
      </section>
      <section className="appointments-panel" aria-labelledby="appointments-title">
        <div className="appointments-heading">
          <div className="appointments-title-group">
            <div className="heading-icon list-heading-icon"><ClipboardList size={22} /></div>
            <div><h2 id="appointments-title">Appointment list</h2><p>Review recently booked appointments and their current status.</p></div>
          </div>
          <button className="refresh-btn" type="button" onClick={() => { setListNotice({ type: '', message: '' }); loadAppointments(); }} disabled={listLoading} aria-label="Refresh appointment list">
            <RefreshCw size={15} className={listLoading ? 'spinning' : ''} /> Refresh
          </button>
        </div>
        <div className="appointments-summary"><span className="summary-dot"></span>{appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} recorded</div>
        {listNotice.message && <div className={`list-notice ${listNotice.type}`} role={listNotice.type === 'error' ? 'alert' : 'status'}>{listNotice.message}</div>}
        {listError && <div className="list-error" role="alert">{listError} Make sure the backend is running, then refresh.</div>}
        {actionError && <div className="list-error" role="alert">{actionError}</div>}
        <div className="table-wrap">
          <table className="appointments-table">
            <thead><tr><th>Patient name</th><th>Mobile number</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason / AI summary</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {listLoading && appointments.length === 0 ? <tr><td colSpan="8" className="table-message">Loading appointments…</td></tr> :
                appointments.length === 0 ? <tr><td colSpan="8" className="table-message"><span className="empty-list-icon"><CalendarCheck size={22} /></span><strong>No appointments yet</strong><span>New bookings will appear here after you submit the form.</span></td></tr> :
                [...appointments].sort((a, b) => `${b.appointmentDate} ${b.appointmentTime}`.localeCompare(`${a.appointmentDate} ${a.appointmentTime}`)).map((appointment, index) => <tr key={appointment.id ?? `${appointment.patientName}-${appointment.appointmentDate}-${appointment.appointmentTime}-${index}`}>
                  <td><span className="patient-cell"><span className="patient-avatar"><UserRound size={15} /></span><strong>{appointment.patientName}</strong></span></td>
                  <td className="mobile-cell">{appointment.mobileNumber}</td>
                  <td><span className="doctor-cell">{appointment.doctorName}</span></td>
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>{formatTime(appointment.appointmentTime)}</td>
                  <td className="reason-summary-cell"><span>{appointment.reasonForVisit || '—'}</span>{appointment.aiSummary && <small><Sparkles size={12} /> {appointment.aiSummary}</small>}</td>
                  <td><span className={`appointment-status ${(appointment.status || 'Booked').toLowerCase().replace(/[^a-z]+/g, '-')}`}><span></span>{appointment.status || 'Booked'}</span></td>
                  <td><div className="appointment-actions">
                    {!['Completed', 'Cancelled'].includes(appointment.status || 'Booked') && <>
                      <button type="button" className="action-btn complete-action" onClick={() => updateAppointmentStatus(appointment, 'Completed')} disabled={Boolean(pendingAction)} title="Mark as completed" aria-label={`Mark ${appointment.patientName}'s appointment as completed`}>
                        {pendingAction === `${appointment.id}-Completed` ? <LoaderCircle size={14} className="spinning" /> : <Check size={14} />} <span>Complete</span>
                      </button>
                      <button type="button" className="action-btn cancel-action" onClick={() => updateAppointmentStatus(appointment, 'Cancelled')} disabled={Boolean(pendingAction)} title="Cancel appointment" aria-label={`Cancel ${appointment.patientName}'s appointment`}>
                        {pendingAction === `${appointment.id}-Cancelled` ? <LoaderCircle size={14} className="spinning" /> : <Ban size={14} />} <span>Cancel</span>
                      </button>
                    </>}
                    <button type="button" className="action-btn delete-action" onClick={() => deleteAppointment(appointment)} disabled={Boolean(pendingAction)} title="Delete appointment" aria-label={`Delete ${appointment.patientName}'s appointment`}>
                      {pendingAction === `${appointment.id}-delete` ? <LoaderCircle size={14} className="spinning" /> : <Trash2 size={14} />} <span>Delete</span>
                    </button>
                  </div></td>
                </tr>)}
            </tbody>
          </table>
        </div>
        <p className="list-footnote"><ShieldCheck size={14} /> Appointment details are shown according to the records available from the booking service.</p>
      </section>

      <section className="benefits">
        <div className="benefit"><span><CalendarCheck size={20} /></span><div><strong>Easy scheduling</strong><p>Book your visit in minutes.</p></div></div>
        <div className="benefit"><span><Stethoscope size={20} /></span><div><strong>Trusted professionals</strong><p>Care from experienced doctors.</p></div></div>
        <div className="benefit"><span><ShieldCheck size={20} /></span><div><strong>Privacy first</strong><p>Your details matter to us.</p></div></div>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} CarePoint Healthcare</span><span>Here for your health, every step of the way.</span></footer>
  </div>;
}
