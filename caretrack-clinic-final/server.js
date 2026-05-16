'use strict';
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ── helpers ──────────────────────────────────────────────────────────────────
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}
function genId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'caretrack-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));
app.use(express.static(path.join(__dirname, 'public')));

function getSessionUser(req) {
  if (req.session && req.session.user) return req.session.user;
  if (req.headers['x-user']) {
    try { return JSON.parse(req.headers['x-user']); } catch {}
  }
  return null;
}

function requireAuth(req, res, next) {
  const u = getSessionUser(req);
  if (u) {
    if (!req.session) req.session = {};
    req.session.user = u;
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

function requireRole(...roles) {
  return (req, res, next) => {
    const u = getSessionUser(req);
    if (!u) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(u.role)) return res.status(403).json({ error: 'Forbidden' });
    if (!req.session) req.session = {};
    req.session.user = u;
    next();
  };
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Foydalanuvchi nomi yoki parol noto'g'ri" });
  req.session.user = { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
  res.json({ ok: true, user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

// ── DOCTORS ──────────────────────────────────────────────────────────────────
app.get('/api/doctors', requireAuth, (req, res) => {
  res.json(readJSON('doctors.json'));
});

app.post('/api/doctors', requireRole('admin'), (req, res) => {
  const { username, password, ...docBody } = req.body;
  const doctors = readJSON('doctors.json');
  const users   = readJSON('users.json');

  // Username allaqachon borligini tekshir
  if (username && users.find(u => u.username === username)) {
    return res.status(409).json({ error: "Bu username allaqachon mavjud" });
  }

  const doc = { id: genId('d'), ...docBody };
  doctors.push(doc);
  writeJSON('doctors.json', doctors);

  // Shifokorga user akkaunt yaratish
  if (username && password) {
    const newUser = {
      id: 'u_' + doc.id,
      username,
      password,
      fullName: doc.full_name,
      role: 'clinician',
      doctor_id: doc.id
    };
    users.push(newUser);
    writeJSON('users.json', users);
  }

  res.status(201).json(doc);
});

app.put('/api/doctors/:id', requireRole('admin'), (req, res) => {
  const doctors = readJSON('doctors.json');
  const idx = doctors.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  doctors[idx] = { ...doctors[idx], ...req.body, id: req.params.id };
  writeJSON('doctors.json', doctors);
  res.json(doctors[idx]);
});

app.delete('/api/doctors/:id', requireRole('admin'), (req, res) => {
  const doctors = readJSON('doctors.json');
  const filtered = doctors.filter(d => d.id !== req.params.id);
  if (filtered.length === doctors.length) return res.status(404).json({ error: 'Not found' });
  writeJSON('doctors.json', filtered);
  res.json({ ok: true });
});

// ── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', requireAuth, (req, res) => {
  res.json(readJSON('patients.json'));
});

app.post('/api/patients', requireRole('admin', 'receptionist'), (req, res) => {
  const patients = readJSON('patients.json');
  const pat = { id: genId('p'), ...req.body, registered_by: req.session.user.id };
  patients.push(pat);
  writeJSON('patients.json', patients);
  res.status(201).json(pat);
});

app.put('/api/patients/:id', requireRole('admin', 'clinician'), (req, res) => {
  const patients = readJSON('patients.json');
  const idx = patients.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  patients[idx] = { ...patients[idx], ...req.body, id: req.params.id };
  writeJSON('patients.json', patients);
  res.json(patients[idx]);
});

app.delete('/api/patients/:id', requireRole('admin'), (req, res) => {
  const patients = readJSON('patients.json');
  const filtered = patients.filter(p => p.id !== req.params.id);
  if (filtered.length === patients.length) return res.status(404).json({ error: 'Not found' });
  writeJSON('patients.json', filtered);
  res.json({ ok: true });
});

app.get('/api/patients/:id/profile', requireAuth, (req, res) => {
  const patients = readJSON('patients.json');
  const doctors = readJSON('doctors.json');
  const diagnoses = readJSON('diagnoses.json');
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  const doctor = doctors.find(d => d.id === patient.doctor_id) || null;
  const patientDiagnoses = diagnoses.filter(d => d.patient_id === req.params.id)
    .sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date));
  res.json({ patient, doctor, diagnoses: patientDiagnoses });
});

// ── DIAGNOSES ────────────────────────────────────────────────────────────────
app.get('/api/diagnoses', requireRole('admin', 'clinician'), (req, res) => {
  res.json(readJSON('diagnoses.json'));
});

app.post('/api/diagnoses', requireRole('admin', 'clinician'), (req, res) => {
  const diagnoses = readJSON('diagnoses.json');
  const diag = { id: genId('dx'), ...req.body, created_by: req.session.user.id };
  diagnoses.push(diag);
  writeJSON('diagnoses.json', diagnoses);
  res.status(201).json(diag);
});

app.put('/api/diagnoses/:id', requireRole('admin', 'clinician'), (req, res) => {
  const diagnoses = readJSON('diagnoses.json');
  const idx = diagnoses.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  diagnoses[idx] = { ...diagnoses[idx], ...req.body, id: req.params.id };
  writeJSON('diagnoses.json', diagnoses);
  res.json(diagnoses[idx]);
});

app.delete('/api/diagnoses/:id', requireRole('admin'), (req, res) => {
  const diagnoses = readJSON('diagnoses.json');
  const filtered = diagnoses.filter(d => d.id !== req.params.id);
  if (filtered.length === diagnoses.length) return res.status(404).json({ error: 'Not found' });
  writeJSON('diagnoses.json', filtered);
  res.json({ ok: true });
});

// ── REPORTS ──────────────────────────────────────────────────────────────────
app.get('/api/reports/summary', requireRole('admin'), (req, res) => {
  const doctors  = readJSON('doctors.json');
  const patients = readJSON('patients.json');
  const diagnoses= readJSON('diagnoses.json');
  const users    = readJSON('users.json');

  const severityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  diagnoses.forEach(d => { if (severityCounts[d.severity] !== undefined) severityCounts[d.severity]++; });

  const deptMap = {};
  doctors.forEach(doc => {
    const dept  = doc.department;
    const count = patients.filter(p => p.doctor_id === doc.id).length;
    deptMap[dept] = (deptMap[dept] || 0) + count;
  });

  const criticalAndHigh = diagnoses
    .filter(d => d.severity === 'Critical' || d.severity === 'High')
    .sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date));

  // Clinician stats: nechta tashxis qo'ygan
  const clinicians = users.filter(u => u.role === 'clinician');
  const clinicianStats = clinicians.map(u => ({
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    diagnosisCount: diagnoses.filter(d => d.created_by === u.id).length
  })).sort((a, b) => b.diagnosisCount - a.diagnosisCount);

  // Receptionist stats: nechta bemor ro'yxatdan o'tkazgan
  const receptionists = users.filter(u => u.role === 'receptionist');
  const receptionistStats = receptionists.map(u => ({
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    patientCount: patients.filter(p => p.registered_by === u.id).length
  })).sort((a, b) => b.patientCount - a.patientCount);

  res.json({
    totals: { doctors: doctors.length, patients: patients.length, diagnoses: diagnoses.length, critical: severityCounts.Critical },
    severityCounts,
    patientsByDepartment: deptMap,
    criticalAndHigh,
    clinicianStats,
    receptionistStats
  });
});

// ── SPA fallback ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/login.html'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ CareTrack Clinic running at http://localhost:${PORT}`);
    console.log('   Login: admin/admin123 | clinician/clinician123 | receptionist/reception123');
  });
}

module.exports = app;

