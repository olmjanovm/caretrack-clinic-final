'use strict';

(async () => {
  const user = await initLayout('Hisobotlar', 'Klinika statistikasi');
  if (!user) return;

  const pb = document.getElementById('pageBody');

  if (user.role !== 'admin') {
    pb.innerHTML = `
      <div class="access-denied">
        <div class="access-denied-icon">${Icons.alert}</div>
        <h2>Ruxsat yo'q</h2>
        <p>Hisobotlar faqat adminlar uchun mavjud.</p>
        <a href="/dashboard.html" class="btn btn-primary" style="margin-top:16px">Boshqaruv paneliga qaytish</a>
      </div>`;
    return;
  }

  let report;
  try {
    report = await API.getReports();
  } catch(e) {
    pb.innerHTML = `<div class="error-box">${e.message}</div>`; return;
  }

  const { totals, severityCounts, patientsByDepartment, criticalAndHigh } = report;
  const total = Object.values(severityCounts).reduce((a,b) => a+b, 0) || 1;
  const maxDept = Math.max(...Object.values(patientsByDepartment), 1);

  const sevBarsHtml = Object.entries(severityCounts).map(([key, count]) => {
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

  const deptHtml = Object.entries(patientsByDepartment)
    .sort((a,b) => b[1]-a[1])
    .map(([dept, count]) => {
      const pct = Math.round(count / maxDept * 100);
      return `<div class="reports-dept-item">
        <span style="font-size:13.5px;color:var(--slate-700)">${dept}</span>
        <div class="reports-dept-bar">
          <div class="reports-dept-track"><div class="reports-dept-fill" style="width:${pct}%"></div></div>
          <span style="font-size:13px;color:var(--slate-500);min-width:20px;text-align:right">${count}</span>
        </div>
      </div>`;
    }).join('');

  const highTableHtml = criticalAndHigh.length === 0
    ? `<div class="empty-state" style="padding:32px">${Icons.clipboard}<p>Ma'lumot yo'q</p></div>`
    : `<div class="table-wrap"><table>
        <thead><tr>
          <th>ICD</th><th>Tashxis</th><th>Daraja</th><th>Sana</th>
        </tr></thead>
        <tbody>
          ${criticalAndHigh.map(d => `<tr>
            <td class="td-mono">${d.icd_code}</td>
            <td class="td-name">${d.title}</td>
            <td>${sevBadge(d.severity)}</td>
            <td>${fmtDate(d.diagnosis_date)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;

  pb.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div></div>
      <button class="btn btn-outline no-print" onclick="window.print()">${Icons.print} Hisobotni chop etish</button>
    </div>

    <!-- Summary cards -->
    <div class="stats-grid" style="margin-bottom:20px">
      ${sc('Jami shifokorlar', totals.doctors,   'stethoscope', 'stat-icon-teal')}
      ${sc('Jami bemorlar',    totals.patients,   'users',       'stat-icon-blue')}
      ${sc('Jami tashxislar',  totals.diagnoses,  'clipboard',   'stat-icon-amber')}
      ${sc('Kritik holatlar',  totals.critical,   'alert',       'stat-icon-red')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px" id="midGrid">
      <!-- Severity distribution -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Tashxislar og'irligi bo'yicha</div>
            <div class="panel-sub">Barcha tashxislar taqsimoti</div>
          </div>
        </div>
        <div class="panel-body">${sevBarsHtml}</div>
      </div>

      <!-- Patients by department -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Bo'limlar bo'yicha bemorlar</div>
            <div class="panel-sub">Har bir bo'limdagi bemorlar soni</div>
          </div>
        </div>
        <div class="panel-body">${deptHtml || '<div class="empty-state" style="padding:24px"><p>Ma\'lumot yo\'q</p></div>'}</div>
      </div>
    </div>

    <!-- High/Critical table -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Yuqori / Kritik tashxislar</div>
          <div class="panel-sub">E'tibor talab etuvchi holatlar</div>
        </div>
      </div>
      ${highTableHtml}
    </div>

    <!-- Clinician performance -->
    <div class="panel" style="margin-top:20px">
      <div class="panel-header">
        <div>
          <div class="panel-title">Klinitsistlar faoliyati</div>
          <div class="panel-sub">Kim nechta tashxis qo'ygan</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Shifokor</th><th>Login</th><th style="text-align:center">Tashxislar soni</th></tr></thead>
          <tbody>
            ${report.clinicianStats.length === 0
              ? `<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--slate-400)">Ma'lumot yo'q</td></tr>`
              : report.clinicianStats.map((c, i) => `<tr>
                  <td style="color:var(--slate-400);font-size:13px">${i + 1}</td>
                  <td class="td-name">${c.fullName}</td>
                  <td style="color:var(--teal-700);font-family:monospace;font-size:13px">${c.username}</td>
                  <td style="text-align:center">
                    <span style="display:inline-block;background:var(--teal-50);color:var(--teal-700);border-radius:999px;padding:2px 14px;font-weight:700;font-size:14px">${c.diagnosisCount}</span>
                  </td>
                </tr>`).join('')
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Receptionist performance -->
    <div class="panel" style="margin-top:20px">
      <div class="panel-header">
        <div>
          <div class="panel-title">Qabulxona xodimlari faoliyati</div>
          <div class="panel-sub">Kim nechta bemor qabul qilgan</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Xodim</th><th>Login</th><th style="text-align:center">Qabul qilingan bemorlar</th></tr></thead>
          <tbody>
            ${report.receptionistStats.length === 0
              ? `<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--slate-400)">Ma'lumot yo'q</td></tr>`
              : report.receptionistStats.map((r, i) => `<tr>
                  <td style="color:var(--slate-400);font-size:13px">${i + 1}</td>
                  <td class="td-name">${r.fullName}</td>
                  <td style="color:var(--teal-700);font-family:monospace;font-size:13px">${r.username}</td>
                  <td style="text-align:center">
                    <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:2px 14px;font-weight:700;font-size:14px">${r.patientCount}</span>
                  </td>
                </tr>`).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Responsive mid grid
  if (window.innerWidth < 768) {
    document.getElementById('midGrid').style.gridTemplateColumns = '1fr';
  }

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.sev-bar-fill, .reports-dept-fill').forEach(el => {
      const w = el.style.width; el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w; });
    });
  }, 50);
})();

function sc(label, value, iconKey, iconClass) {
  return `<div class="stat-card">
    <div class="stat-card-header">
      <span class="stat-card-label">${label}</span>
      <span class="stat-card-icon ${iconClass}">${Icons[iconKey]}</span>
    </div>
    <div class="stat-card-value">${value}</div>
  </div>`;
}
