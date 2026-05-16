'use strict';

let allDiagnoses = [];
let allPatients  = [];
let currentUser  = null;

(async () => {
  currentUser = await initLayout('Tashxislar', 'Tashxislar ro\'yxati');
  if (!currentUser) return;

  // Access control
  if (!['admin','clinician'].includes(currentUser.role)) {
    document.getElementById('pageBody').innerHTML = `
      <div class="access-denied">
        <div class="access-denied-icon">${Icons.alert}</div>
        <h2>Ruxsat yo'q</h2>
        <p>Bu sahifaga kirish uchun sizda ruxsat yo'q.</p>
        <a href="/dashboard.html" class="btn btn-primary" style="margin-top:16px">Boshqaruv paneliga qaytish</a>
      </div>`;
    return;
  }

  try {
    [allDiagnoses, allPatients] = await Promise.all([API.getDiagnoses(), API.getPatients()]);
    renderPage();
  } catch(e) {
    document.getElementById('pageBody').innerHTML = `<div class="error-box">${e.message}</div>`;
  }
})();

function canWrite()  { return ['admin','clinician'].includes(currentUser.role); }
function canDelete() { return currentUser.role === 'admin'; }

function renderPage() {
  const patOptions = allPatients.map(p => `<option value="${p.id}">${p.full_name}</option>`).join('');
  document.getElementById('pageBody').innerHTML = `
    <div class="controls-bar">
      <div class="search-wrap">
        ${Icons.search}
        <input type="text" class="search-input" id="searchInput" placeholder="ICD kodi yoki sarlavha..." />
      </div>
      <select class="filter-select" id="sevFilter">
        <option value="">Barcha darajalar</option>
        <option value="Low">Past</option>
        <option value="Medium">O'rta</option>
        <option value="High">Yuqori</option>
        <option value="Critical">Kritik</option>
      </select>
      <select class="filter-select" id="patFilter">
        <option value="">Barcha bemorlar</option>
        ${patOptions}
      </select>
      ${canWrite() ? `<div class="controls-bar-end"><button class="btn btn-primary" id="addBtn">${Icons.plus} Yangi tashxis</button></div>` : ''}
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ICD kodi</th>
              <th>Sarlavha</th>
              <th>Bemor</th>
              <th>Daraja</th>
              <th>Sana</th>
              <th>Tavsif</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('sevFilter').addEventListener('change', renderTable);
  document.getElementById('patFilter').addEventListener('change', renderTable);
  if (canWrite()) document.getElementById('addBtn').addEventListener('click', () => openForm());
  renderTable();
}

function getFiltered() {
  const q   = document.getElementById('searchInput').value.toLowerCase();
  const sev = document.getElementById('sevFilter').value;
  const pat = document.getElementById('patFilter').value;
  return allDiagnoses.filter(d =>
    (!q   || d.icd_code.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)) &&
    (!sev || d.severity === sev) &&
    (!pat || d.patient_id === pat)
  );
}

function patName(id) {
  const p = allPatients.find(p => p.id === id);
  return p ? p.full_name : '—';
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const rows  = getFiltered();

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="padding:48px;text-align:center;color:var(--slate-400)">Tashxislar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(d => `<tr>
    <td><span class="td-mono">${d.icd_code}</span></td>
    <td class="td-name" style="max-width:200px">${d.title}</td>
    <td>
      <a href="javascript:void(0)" onclick="viewPatientGlobal('${d.patient_id}')" style="color:var(--teal-700);font-weight:500">${patName(d.patient_id)}</a>
    </td>
    <td>${sevBadge(d.severity)}</td>
    <td>${fmtDate(d.diagnosis_date)}</td>
    <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--slate-500)">${d.description||'—'}</td>
    <td>
      <div class="td-actions">
        <button class="btn btn-outline btn-sm" onclick="viewDiagnosisGlobal('${d.id}')">${Icons.eye || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'} Ko'rish</button>
        ${canWrite()  ? `<button class="btn btn-outline btn-sm" onclick="openForm('${d.id}')">${Icons.pencil}</button>` : ''}
        ${canDelete() ? `<button class="btn btn-danger  btn-sm" onclick="doDelete('${d.id}')">${Icons.trash}</button>` : ''}
      </div>
    </td>
  </tr>`).join('');
}

function openForm(id) {
  const diag  = id ? allDiagnoses.find(d => d.id === id) : null;
  const title = diag ? 'Tashxisni tahrirlash' : 'Yangi tashxis';
  const patOpts = allPatients.map(p =>
    `<option value="${p.id}" ${diag?.patient_id===p.id?'selected':''}>${p.full_name}</option>`
  ).join('');

  buildModal('diagModal', title, `
    <div class="form-group">
      <label class="form-label">Bemor *</label>
      <select class="form-select" id="f_patient">
        <option value="" disabled ${!diag?'selected':''}>Bemorni tanlang</option>
        ${patOpts}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">ICD kodi *</label>
      <input type="text" class="form-input no-icon" id="f_icd" value="${diag?.icd_code||''}" placeholder="I10" />
    </div>
    <div class="form-group">
      <label class="form-label">Sarlavha *</label>
      <input type="text" class="form-input no-icon" id="f_title" value="${diag?.title||''}" placeholder="Tashxis nomi" />
    </div>
    <div class="form-group">
      <label class="form-label">Tavsif</label>
      <textarea class="form-textarea" id="f_desc">${diag?.description||''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Daraja *</label>
      <select class="form-select" id="f_severity">
        <option value="" disabled ${!diag?'selected':''}>Tanlang</option>
        <option value="Low"      ${diag?.severity==='Low'     ?'selected':''}>Past</option>
        <option value="Medium"   ${diag?.severity==='Medium'  ?'selected':''}>O'rta</option>
        <option value="High"     ${diag?.severity==='High'    ?'selected':''}>Yuqori</option>
        <option value="Critical" ${diag?.severity==='Critical'?'selected':''}>Kritik</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Tashxis sanasi *</label>
      <input type="date" class="form-input no-icon" id="f_date" value="${diag?.diagnosis_date||''}" />
    </div>
    <div class="form-group">
      <label class="form-label">Izohlar</label>
      <textarea class="form-textarea" id="f_notes">${diag?.notes||''}</textarea>
    </div>
    <div id="formError" class="error-box" style="display:none"></div>
  `, `
    <button class="btn btn-outline" data-close="diagModal">Bekor qilish</button>
    <button class="btn btn-primary" id="saveDiagBtn">Saqlash</button>
  `);

  openModal('diagModal');

  document.getElementById('saveDiagBtn').addEventListener('click', async () => {
    const body = {
      patient_id:     document.getElementById('f_patient').value,
      icd_code:       document.getElementById('f_icd').value.trim(),
      title:          document.getElementById('f_title').value.trim(),
      description:    document.getElementById('f_desc').value.trim(),
      severity:       document.getElementById('f_severity').value,
      diagnosis_date: document.getElementById('f_date').value,
      notes:          document.getElementById('f_notes').value.trim(),
    };
    const errEl = document.getElementById('formError');
    errEl.style.display = 'none';

    if (!body.patient_id || !body.icd_code || !body.title || !body.severity || !body.diagnosis_date) {
      errEl.textContent = "Barcha majburiy maydonlarni to'ldiring (*)"; errEl.style.display='block'; return;
    }

    try {
      if (diag) { await API.updateDiagnosis(id, body); toast('Tashxis yangilandi'); }
      else       { await API.addDiagnosis(body);        toast('Tashxis qo\'shildi'); }
      closeModal('diagModal');
      allDiagnoses = await API.getDiagnoses();
      renderTable();
    } catch(e) {
      errEl.textContent = e.message; errEl.style.display='block';
    }
  });
}

async function doDelete(id) {
  const modalId = 'confirm-delete-modal';
  buildModal(modalId, 'O\'chirishni tasdiqlash', `
    <div style="text-align:center; padding: 20px 0;">
      <div style="color:var(--slate-900); font-size:16px; font-weight:500; margin-bottom:12px;">Haqiqatan ham o'chirmoqchimisiz?</div>
      <div style="color:var(--slate-500); font-size:14px;">Bu amalni qaytarib bo'lmaydi.</div>
    </div>
  `, `
    <button class="btn btn-outline" data-close="${modalId}" style="background: #64748b; color: white; border: none;">Bekor qilish</button>
    <button class="btn btn-danger" id="confirmDeleteBtn" style="background: #ef4444;">Ha, o'chir</button>
  `);
  
  openModal(modalId);
  
  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    closeModal(modalId);
    try {
      await API.deleteDiagnosis(id);
      toast('Tashxis o\'chirildi');
      allDiagnoses = await API.getDiagnoses();
      renderTable();
    } catch(e) { toast(e.message, 'error'); }
  });
}
