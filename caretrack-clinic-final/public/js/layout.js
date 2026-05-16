// layout.js – sidebar, topbar, toast, modal helpers
'use strict';

// ── SVG icons ─────────────────────────────────────────────────────────────────
const Icons = {
  heartPulse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-1.5 2 4.5 2-7 1.5 3H22"/></svg>`,
  dashboard:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  stethoscope:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  users:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  clipboard:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></svg>`,
  barChart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
  logout:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  x:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  arrowLeft:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  search:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>`,
  pencil:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
  trash:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  eye:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  print:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  alert:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>`,
  user:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lock:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  shield:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  check:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  xCircle:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`,
};

// ── Nav config ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard.html',      label: 'Boshqaruv paneli', icon: 'dashboard',   roles: ['admin','clinician','receptionist'] },
  { href: '/doctors.html',        label: 'Shifokorlar',      icon: 'stethoscope', roles: ['admin','clinician','receptionist'] },
  { href: '/patients.html',       label: 'Bemorlar',         icon: 'users',       roles: ['admin','clinician','receptionist'] },
  { href: '/diagnoses.html',      label: 'Tashxislar',       icon: 'clipboard',   roles: ['admin','clinician'] },
  { href: '/reports.html',        label: 'Hisobotlar',       icon: 'barChart',    roles: ['admin'] },
];

const ROLE_LABELS = { admin: 'Administrator', clinician: 'Klinitsist', receptionist: 'Qabulxona xodimi' };

function initSidebar(user) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const navHtml = NAV_ITEMS
    .filter(n => n.roles.includes(user.role))
    .map(n => {
      const isActive = window.location.pathname.endsWith(n.href.replace('/', ''));
      return `<a href="${n.href}" class="nav-item ${isActive ? 'active' : ''}">
        ${Icons[n.icon]}
        <span>${n.label}</span>
      </a>`;
    }).join('');

  const initials = (user.fullName || user.username).split(' ').map(s => s[0]).slice(0,2).join('');

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">${Icons.heartPulse}</div>
      <div>
        <div class="sidebar-logo-name">CareTrack</div>
        <div class="sidebar-logo-sub">Clinic TYBT</div>
      </div>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-user">
      <div class="sidebar-user-inner">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${user.fullName || user.username}</div>
          <span class="role-badge ${user.role}">${ROLE_LABELS[user.role]}</span>
        </div>
        <button class="logout-btn" id="logoutBtn" title="Chiqish">${Icons.logout}</button>
      </div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
  });
}

function initTopbar(title, sub) {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <div class="topbar-left">
      <h1>${title}</h1>
      ${sub ? `<div class="topbar-breadcrumb">${sub}</div>` : ''}
    </div>
  `;
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? Icons.check : Icons.xCircle}<span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Modal helpers ──────────────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
function buildModal(id, title, bodyHtml, footerHtml) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = id;
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" data-close="${id}">${Icons.x}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">${footerHtml}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(id); });
  return overlay;
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────
function confirmDialog(msg, onConfirm) {
  const id = 'confirm-modal';
  buildModal(id, '', `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
      <div class="confirm-icon">${Icons.alert}</div>
      <div class="confirm-title">Ishonchingiz komilmi?</div>
      <div class="confirm-desc">${msg}</div>
    </div>
  `, `
    <button class="btn btn-outline" data-close="${id}">Bekor qilish</button>
    <button class="btn btn-danger" id="confirmOkBtn">O'chirish</button>
  `);
  openModal(id);
  document.getElementById('confirmOkBtn').addEventListener('click', () => {
    closeModal(id);
    onConfirm();
  });
}

// ── Severity label ─────────────────────────────────────────────────────────────
function sevLabel(s) {
  return { Low: 'Past', Medium: "O'rta", High: 'Yuqori', Critical: 'Kritik' }[s] || s;
}
function sevBadge(s) {
  const cls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[s] || '';
  return `<span class="badge ${cls}"><span class="sev-dot sev-dot-${s}"></span>${sevLabel(s)}</span>`;
}

// ── Format date ────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('uz-UZ', { year:'numeric', month:'short', day:'numeric' }); }
  catch { return d; }
}

// ── Initials ───────────────────────────────────────────────────────────────────
function initials(name) {
  return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
}

// ── Layout init ────────────────────────────────────────────────────────────────
async function initLayout(title, sub) {
  const user = await Auth.requireAuth();
  if (!user) return null;
  initSidebar(user);
  initTopbar(title, sub);
  return user;
}

// ── Global Modals ──────────────────────────────────────────────────────────────
window.viewPatientGlobal = async function(id) {
  try {
    const [patients, doctors, diagnoses] = await Promise.all([API.getPatients(), API.getDoctors(), API.getDiagnoses()]);
    const p = patients.find(x => x.id === id);
    if (!p) return;
    const d = doctors.find(x => x.id === p.doctor_id);
    
    const docName = d ? d.full_name : 'Biriktirilmagan';
    const gender = p.gender === 'Female' ? 'Ayol' : 'Erkak';
    const gc = p.gender === 'Female' ? 'badge-female' : 'badge-male';
    
    const patDiagnoses = diagnoses.filter(diag => diag.patient_id === id).sort((a,b) => b.diagnosis_date.localeCompare(a.diagnosis_date));
    
    let diagHtml = '<div style="color:var(--slate-500); font-size:13px; margin-top:8px;">Tashxislar topilmadi</div>';
    if (patDiagnoses.length > 0) {
      diagHtml = patDiagnoses.map(diag => `
        <div style="background:var(--slate-50); border:1px solid var(--slate-200); border-radius:8px; padding:12px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:600; color:var(--slate-900); font-size:14px;">${diag.title} <span class="icd-chip" style="margin-left:8px; font-size:11px; padding:2px 6px;">${diag.icd_code}</span></div>
              <div style="font-size:13px; color:var(--slate-500); margin-top:4px;">Sana: ${fmtDate(diag.diagnosis_date)}</div>
            </div>
            ${sevBadge(diag.severity)}
          </div>
          ${diag.description ? `<div style="font-size:13px; color:var(--slate-700); margin-top:8px;">${diag.description}</div>` : ''}
        </div>
      `).join('');
    }
    
    buildModal('viewPatientModal', 'Bemor ma\'lumotlari', `
      <div style="display:flex; flex-direction:column; gap:16px; max-height: 70vh; overflow-y: auto; padding-right: 8px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:64px; height:64px; border-radius:50%; background:var(--blue-100); color:var(--blue-700); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; flex-shrink:0;">
            ${initials(p.full_name)}
          </div>
          <div>
            <div style="font-size:20px; font-weight:bold; color:var(--slate-900);">${p.full_name}</div>
            <div style="color:var(--slate-500);">${fmtDate(p.date_of_birth)} · <span class="badge ${gc}">${gender}</span></div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px; background:white; padding:16px; border:1px solid var(--slate-200); border-radius:8px;">
          <div>
            <div style="font-size:12px; color:var(--slate-500); font-weight:600; margin-bottom:4px;">Telefon</div>
            <div style="color:var(--slate-900); font-weight:500;">${p.phone}</div>
          </div>
          <div>
            <div style="font-size:12px; color:var(--slate-500); font-weight:600; margin-bottom:4px;">Manzil</div>
            <div style="color:var(--slate-900); font-weight:500;">${p.address || '—'}</div>
          </div>
          <div style="grid-column: span 2;">
            <div style="font-size:12px; color:var(--slate-500); font-weight:600; margin-bottom:4px;">Biriktirilgan shifokor</div>
            <div style="color:var(--slate-900); font-weight:500; display:flex; align-items:center; gap:8px;">${Icons.stethoscope.replace('<svg', '<svg width="16" height="16"')} ${docName}</div>
          </div>
        </div>
        <div style="margin-top:8px;">
          <h4 style="font-size:15px; font-weight:600; color:var(--slate-900); border-bottom:1px solid var(--slate-200); padding-bottom:8px;">Tashxislar tarixi</h4>
          ${diagHtml}
        </div>
      </div>
    `, `
      <button class="btn btn-outline" data-close="viewPatientModal">Yopish</button>
    `);
    openModal('viewPatientModal');
  } catch(e) { toast(e.message, 'error'); }
};

window.viewDiagnosisGlobal = async function(id) {
  try {
    const [diagnoses, patients] = await Promise.all([API.getDiagnoses(), API.getPatients()]);
    const d = diagnoses.find(x => x.id === id);
    if (!d) return;
    const p = patients.find(x => x.id === d.patient_id);
    const pName = p ? p.full_name : 'Bemor topilmadi';
    
    buildModal('viewDiagModal', 'Tashxis ma\'lumotlari', `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; align-items:flex-start; gap:16px;">
          <div class="icd-chip" style="font-size:16px; padding:6px 12px;">${d.icd_code}</div>
          <div>
            <div style="font-size:18px; font-weight:bold; color:var(--slate-900);">${d.title}</div>
            <div style="color:var(--slate-500); margin-top:4px;">${sevBadge(d.severity)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px;">
          <div>
            <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Bemor</div>
            <div style="color:var(--slate-900); font-weight:500;">${pName}</div>
          </div>
          <div>
            <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Sana</div>
            <div style="color:var(--slate-900);">${fmtDate(d.diagnosis_date)}</div>
          </div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Tavsif</div>
          <div style="color:var(--slate-900); background:#f8fafc; padding:12px; border-radius:8px; margin-top:4px;">${d.description || 'Kiritilmagan'}</div>
        </div>
        ${d.notes ? `
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Izohlar</div>
          <div style="color:var(--slate-900); background:#fefce8; padding:12px; border-radius:8px; margin-top:4px;">${d.notes}</div>
        </div>
        ` : ''}
      </div>
    `, `
      <button class="btn btn-outline" data-close="viewDiagModal">Yopish</button>
    `);
    openModal('viewDiagModal');
  } catch(e) { toast(e.message, 'error'); }
};
