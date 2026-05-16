'use strict';

(async () => {
  const user = await initLayout('Bemor profili', 'Bemorlar › Profil');
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const pb = document.getElementById('pageBody');

  if (!id) { pb.innerHTML = `<div class="error-box">Bemor ID topilmadi</div>`; return; }

  let data;
  try {
    data = await API.getProfile(id);
  } catch(e) {
    pb.innerHTML = `<div class="error-box">${e.message}</div>`; return;
  }

  const { patient: p, doctor: doc, diagnoses } = data;

  // Update topbar title
  initTopbar(p.full_name, `Bemorlar › ${p.full_name}`);

  const gender     = p.gender === 'Female' ? 'Ayol' : 'Erkak';
  const genderBadge = `<span class="badge ${p.gender==='Female'?'badge-female':'badge-male'}">${gender}</span>`;

  // Age
  const age = p.date_of_birth
    ? Math.floor((Date.now() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : '—';

  // Timeline
  const timelineHtml = diagnoses.length === 0
    ? `<div class="empty-state">
        ${Icons.clipboard}
        <h3>Tashxislar yo'q</h3>
        <p>Bu bemor uchun hali tashxis yozilmagan</p>
      </div>`
    : `<div class="timeline">
        ${diagnoses.map(d => `
          <div class="timeline-item">
            <div class="timeline-dot-col">
              <div class="timeline-dot timeline-dot-${d.severity}"></div>
              <div class="timeline-line"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <div>
                  <div class="timeline-title">${d.title}</div>
                  <div class="timeline-icd">ICD: ${d.icd_code}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  ${sevBadge(d.severity)}
                  <span class="timeline-date">${fmtDate(d.diagnosis_date)}</span>
                </div>
              </div>
              ${d.description ? `<div class="timeline-desc">${d.description}</div>` : ''}
              ${d.notes ? `<div class="timeline-notes"><strong>Izoh:</strong> ${d.notes}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>`;

  pb.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px" class="no-print">
      <a href="/patients.html" class="btn btn-outline btn-sm">${Icons.arrowLeft} Orqaga</a>
      <button class="btn btn-outline btn-sm" onclick="window.print()">${Icons.print} Chop etish</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px" class="profile-cols">
      <!-- Patient info -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Bemor ma'lumotlari</div>
            <div class="panel-sub">Shaxsiy ma'lumotlar</div>
          </div>
          ${genderBadge}
        </div>
        <div class="panel-body">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div style="width:56px;height:56px;border-radius:50%;background:var(--teal-50);color:var(--teal-700);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700">
              ${initials(p.full_name)}
            </div>
            <div>
              <div style="font-size:18px;font-weight:700;color:var(--slate-900)">${p.full_name}</div>
              <div style="font-size:13px;color:var(--slate-500)">${age} yosh · ${gender}</div>
            </div>
          </div>
          <div class="profile-grid">
            <div class="info-row">
              <span class="info-label">Tug'ilgan sana</span>
              <span class="info-value">${fmtDate(p.date_of_birth)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Telefon</span>
              <span class="info-value">${p.phone}</span>
            </div>
            <div class="info-row" style="grid-column:1/-1">
              <span class="info-label">Manzil</span>
              <span class="info-value">${p.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Doctor info -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Biriktirilgan shifokor</div>
            <div class="panel-sub">Davolovchi mutaxassis</div>
          </div>
        </div>
        <div class="panel-body">
          ${doc ? `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
              <div style="width:56px;height:56px;border-radius:50%;background:var(--blue-50);color:var(--blue-700);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700">
                ${initials(doc.full_name)}
              </div>
              <div>
                <div style="font-size:16px;font-weight:600;color:var(--slate-900)">${doc.full_name}</div>
                <div style="font-size:13px;color:var(--slate-500)">${doc.specialty}</div>
              </div>
            </div>
            <div class="profile-grid">
              <div class="info-row">
                <span class="info-label">Bo'lim</span>
                <span class="info-value">${doc.department}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Holat</span>
                <span class="info-value">
                  <span class="badge ${doc.available_status==='Available'?'badge-available':'badge-offduty'}">
                    ${doc.available_status==='Available'?'Mavjud':'Ishda emas'}
                  </span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Telefon</span>
                <span class="info-value">${doc.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value" style="color:var(--teal-700)">${doc.email}</span>
              </div>
            </div>
          ` : `<div class="empty-state" style="padding:32px">${Icons.stethoscope}<p>Shifokor biriktirilmagan</p></div>`}
        </div>
      </div>
    </div>

    <!-- Diagnosis history -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Tashxis tarixi</div>
          <div class="panel-sub">${diagnoses.length} ta tashxis</div>
        </div>
      </div>
      <div class="panel-body">${timelineHtml}</div>
    </div>
  `;

  // Responsive profile cols
  if (window.innerWidth < 768) {
    document.querySelector('.profile-cols').style.gridTemplateColumns = '1fr';
  }
})();
