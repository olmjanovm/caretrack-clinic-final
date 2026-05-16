// api.js – all REST calls
'use strict';

const API = (() => {
  async function req(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (res.status === 401) { window.location.href = '/login.html'; return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server xatosi');
    return data;
  }

  return {
    // Auth
    me:     ()       => req('GET',  '/api/auth/me'),
    logout: ()       => req('POST', '/api/auth/logout'),

    // Doctors
    getDoctors:    ()       => req('GET',    '/api/doctors'),
    addDoctor:     (body)   => req('POST',   '/api/doctors', body),
    updateDoctor:  (id, b)  => req('PUT',    `/api/doctors/${id}`, b),
    deleteDoctor:  (id)     => req('DELETE', `/api/doctors/${id}`),

    // Patients
    getPatients:   ()       => req('GET',    '/api/patients'),
    addPatient:    (body)   => req('POST',   '/api/patients', body),
    updatePatient: (id, b)  => req('PUT',    `/api/patients/${id}`, b),
    deletePatient: (id)     => req('DELETE', `/api/patients/${id}`),
    getProfile:    (id)     => req('GET',    `/api/patients/${id}/profile`),

    // Diagnoses
    getDiagnoses:    ()      => req('GET',    '/api/diagnoses'),
    addDiagnosis:    (body)  => req('POST',   '/api/diagnoses', body),
    updateDiagnosis: (id, b) => req('PUT',    `/api/diagnoses/${id}`, b),
    deleteDiagnosis: (id)    => req('DELETE', `/api/diagnoses/${id}`),

    // Reports
    getReports: () => req('GET', '/api/reports/summary'),
  };
})();
