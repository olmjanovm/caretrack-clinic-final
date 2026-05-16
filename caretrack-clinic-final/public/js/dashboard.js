'use strict';

(async () => {
  const user = await initLayout('Boshqaruv paneli', 'CareTrack Clinic TYBT – Bemorlarga yuqori sifatli va zamonaviy tibbiy xizmat ko\'rsatish markazi');
  if (!user) return;

  const pb = document.getElementById('pageBody');

  // Load data in parallel
  let doctors = [], patients = [], diagnoses = [];
  try {
    [doctors, patients, diagnoses] = await Promise.all([
      API.getDoctors(),
      API.getPatients(),
      (user.role === 'receptionist') ? Promise.resolve([]) : API.getDiagnoses()
    ]);
  } catch (e) {
    pb.innerHTML = `<div class="error-box">${e.message}</div>`;
    return;
  }

  // Build stats
  const critical = diagnoses.filter(d => d.severity === 'Critical').length;
  const available = doctors.filter(d => d.available_status === 'Available').length;
  const today = new Date().toISOString().slice(0,10);

  // Severity counts
  const sevCounts = { Low:0, Medium:0, High:0, Critical:0 };
  diagnoses.forEach(d => { if (sevCounts[d.severity] !== undefined) sevCounts[d.severity]++; });
  const total = diagnoses.length || 1;

  // Doctor map
  const docMap = {};
  doctors.forEach(d => { docMap[d.id] = d; });

  // Recent patients (last 5)
  const recentPatients = patients.slice(-5).reverse();

  // Recent diagnoses (last 5 by date)
  const recentDiagnoses = [...diagnoses]
    .sort((a,b) => b.diagnosis_date.localeCompare(a.diagnosis_date))
    .slice(0,5);

  // Patient map
  const patMap = {};
  patients.forEach(p => { patMap[p.id] = p; });

  // ── Render by role ────────────────────────────────────────────────────────
  let statsHtml = '';
  if (user.role === 'admin') {
    statsHtml = `
      <div class="stats-grid">
        ${statCard('Jami shifokorlar', doctors.length, 'stethoscope', 'stat-icon-teal', 'Faol mutaxassislar')}
        ${statCard('Jami bemorlar', patients.length, 'users', 'stat-icon-blue', "Ro'yxatga olinganlar")}
        ${statCard('Jami tashxislar', diagnoses.length, 'clipboard', 'stat-icon-amber', 'Yozilgan diagnozlar')}
      </div>`;
  } else if (user.role === 'clinician') {
    statsHtml = `
      <div class="stats-grid">
        ${statCard('Jami bemorlar', patients.length, 'users', 'stat-icon-blue', "Ro'yxatga olinganlar")}
        ${statCard('Jami tashxislar', diagnoses.length, 'clipboard', 'stat-icon-amber', 'Yozilgan diagnozlar')}
      </div>`;
  } else {
    // receptionist
    statsHtml = `
      <div class="stats-grid">
        ${statCard('Jami shifokorlar', doctors.length, 'stethoscope', 'stat-icon-teal', 'Barcha shifokorlar')}
        ${statCard('Mavjud shifokorlar', available, 'stethoscope', 'stat-icon-green', 'Hozir qabul qilyapti')}
        ${statCard('Jami bemorlar', patients.length, 'users', 'stat-icon-blue', "Ro'yxatga olinganlar")}
        ${statCard('Bugun ro\'yxatga olingan', 0, 'users', 'stat-icon-violet', 'Bugungi bemorlar')}
      </div>
      <div style="margin-top:16px">
        <a href="/patients.html" class="btn btn-primary">
          ${Icons.plus} Yangi bemor qo'shish
        </a>
      </div>`;
  }

  // ── Recent patients list ───────────────────────────────────────────────────
  const recentPatientsHtml = recentPatients.length === 0
    ? `<div class="empty-state" style="padding:32px">${Icons.users}<p>Bemorlar yo'q</p></div>`
    : recentPatients.map(p => {
        const doc = docMap[p.doctor_id];
        const gender = p.gender === 'Female' ? 'Ayol' : 'Erkak';
        const gClass = p.gender === 'Female' ? 'badge-female' : 'badge-male';
        return `<div class="list-item">
          <div class="item-avatar">${initials(p.full_name)}</div>
          <div class="item-info">
            <div class="item-name"><a href="javascript:void(0)" onclick="viewPatientGlobal('${p.id}')">${p.full_name}</a></div>
            <div class="item-sub">${doc ? doc.full_name : 'Biriktirilmagan'} · ${p.phone}</div>
          </div>
          <span class="badge ${gClass}">${gender}</span>
        </div>`;
      }).join('');

  // ── Recent diagnoses list ─────────────────────────────────────────────────
  const recentDiagHtml = recentDiagnoses.length === 0
    ? `<div class="empty-state" style="padding:32px">${Icons.clipboard}<p>Tashxislar yo'q</p></div>`
    : recentDiagnoses.map(d => {
        const p = patMap[d.patient_id];
        return `<div class="list-item">
          <div class="icd-chip">${d.icd_code}</div>
          <div class="item-info">
            <div class="item-name">${d.title}</div>
            <div class="item-sub">${p ? `<a href="javascript:void(0)" onclick="viewPatientGlobal('${p.id}')" style="color:inherit">${p.full_name}</a>` : 'Bemor topilmadi'} · ${fmtDate(d.diagnosis_date)}</div>
          </div>
          ${sevBadge(d.severity)}
        </div>`;
      }).join('');

  // ── Severity distribution ─────────────────────────────────────────────────
  const sevDistHtml = Object.entries(sevCounts).map(([key, count]) => {
    const pct = Math.round(count / total * 100);
    return `<div class="sev-bar-row">
      <div class="sev-bar-label">
        <span>${sevLabel(key)}</span>
        <span>${count} (${pct}%)</span>
      </div>
      <div class="sev-bar-track">
        <div class="sev-bar-fill sev-bar-${key}" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join('');

  // ── Department distribution ───────────────────────────────────────────────
  const deptCounts = {};
  patients.forEach(p => {
    const doc = docMap[p.doctor_id];
    const dept = doc ? doc.department : 'Boshqa';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const sortedDepts = Object.entries(deptCounts).sort((a,b) => b[1] - a[1]);
  const maxDept = sortedDepts.length > 0 ? sortedDepts[0][1] : 1;
  
  const deptDistHtml = sortedDepts.map(([dept, count]) => {
    const pct = Math.round((count / maxDept) * 100); // relative to max for bar width
    return `<div style="display:flex; align-items:center; margin-bottom:12px;">
      <div style="width:120px; font-size:13px; color:var(--slate-700); font-weight:500;">${dept}</div>
      <div style="flex:1; margin:0 12px;">
        <div style="height:6px; background:var(--slate-100); border-radius:3px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:#0f766e; border-radius:3px; transition:width 1s ease-out;"></div>
        </div>
      </div>
      <div style="width:24px; text-align:right; font-size:13px; color:var(--slate-500);">${count}</div>
    </div>`;
  }).join('');

  // ── Critical Diagnoses ────────────────────────────────────────────────────
  const criticalDiagnoses = [...diagnoses]
    .filter(d => d.severity === 'Critical' || d.severity === 'High')
    .sort((a,b) => b.diagnosis_date.localeCompare(a.diagnosis_date))
    .slice(0, 5);

  const critDiagHtml = criticalDiagnoses.length === 0
    ? `<div class="empty-state" style="padding:32px">${Icons.clipboard}<p>Yuqori/Kritik tashxislar yo'q</p></div>`
    : criticalDiagnoses.map(d => {
        const p = patMap[d.patient_id];
        return `<div class="list-item">
          <div class="icd-chip">${d.icd_code}</div>
          <div class="item-info">
            <div class="item-name">${d.title}</div>
            <div class="item-sub">${p ? `<a href="javascript:void(0)" onclick="viewPatientGlobal('${p.id}')" style="color:inherit">${p.full_name}</a>` : 'Bemor topilmadi'} · ${fmtDate(d.diagnosis_date)}</div>
          </div>
          ${sevBadge(d.severity)}
        </div>`;
      }).join('');

  // ── Layout: admin/clinician vs receptionist ───────────────────────────────
  let bottomSection = '';
  if (user.role !== 'receptionist') {
    bottomSection = `
      <div class="dash-grid-2">
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">Tashxislar og'irligi bo'yicha</div>
              <div class="panel-sub">Barcha tashxislar taqsimoti</div>
            </div>
          </div>
          <div class="panel-body">${sevDistHtml}</div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">Bo'limlar bo'yicha bemorlar</div>
              <div class="panel-sub">Har bir bo'limdagi bemorlar soni</div>
            </div>
          </div>
          <div class="panel-body" style="padding-top:16px;">${deptDistHtml}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-header">
          <div>
            <div class="panel-title">Yuqori / Kritik tashxislar</div>
            <div class="panel-sub">Zudlik bilan e'tibor qaratilishi kerak bo'lgan holatlar</div>
          </div>
          <a href="/diagnoses.html" class="panel-link">Hammasi ${Icons.arrowRight}</a>
        </div>
        ${critDiagHtml}
      </div>`;
  } else {
    bottomSection = `
      <div class="panel" style="margin-top:16px">
        <div class="panel-header">
          <div>
            <div class="panel-title">So'nggi bemorlar</div>
            <div class="panel-sub">Yaqinda qo'shilganlar</div>
          </div>
          <a href="/patients.html" class="panel-link">Hammasi ${Icons.arrowRight}</a>
        </div>
        ${recentPatientsHtml}
      </div>`;
  }

  pb.innerHTML = `
    <div style="margin-bottom:4px;font-size:20px;font-weight:700;color:var(--slate-900)">
      Xush kelibsiz, ${user.fullName || user.username} 👋
    </div>
    <div style="font-size:13px;color:var(--slate-500);margin-bottom:20px">Bugun klinikadagi umumiy holat</div>
    ${statsHtml}
    ${bottomSection}
  `;

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.sev-bar-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w; });
    });
  }, 50);

})();

// ── Helpers ───────────────────────────────────────────────────────────────────
function statCard(label, value, iconKey, iconClass, hint) {
  return `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-label">${label}</span>
        <span class="stat-card-icon ${iconClass}">${Icons[iconKey]}</span>
      </div>
      <div>
        <div class="stat-card-value">${value}</div>
        <div class="stat-card-hint">${hint}</div>
      </div>
    </div>`;
}
