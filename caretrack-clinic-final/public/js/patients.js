'use strict';

let allPatients = [];
let allDoctors  = [];
let currentUser = null;

(async () => {
  currentUser = await initLayout('Bemorlar', 'Bemorlar ro\'yxati');
  if (!currentUser) return;
  try {
    [allPatients, allDoctors] = await Promise.all([API.getPatients(), API.getDoctors()]);
    renderPage();
  } catch(e) {
    document.getElementById('pageBody').innerHTML = `<div class="error-box">${e.message}</div>`;
  }
})();

function canAdd()    { return ['admin','receptionist'].includes(currentUser.role); }
function canEdit()   { return ['admin','clinician'].includes(currentUser.role); }
function canDelete() { return currentUser.role === 'admin'; }

function renderPage() {
  const docOptions = allDoctors.map(d => `<option value="${d.id}">${d.full_name}</option>`).join('');
  document.getElementById('pageBody').innerHTML = `
    <div class="controls-bar">
      <div class="search-wrap">
        ${Icons.search}
        <input type="text" class="search-input" id="searchInput" placeholder="Qidirish..." />
      </div>
      <select class="filter-select" id="docFilter">
        <option value="">Barcha shifokorlar</option>
        ${docOptions}
      </select>
      <select class="filter-select" id="genderFilter">
        <option value="">Barcha jinslar</option>
        <option value="Male">Erkak</option>
        <option value="Female">Ayol</option>
      </select>
      ${canAdd() ? `<div class="controls-bar-end"><button class="btn btn-primary" id="addBtn">${Icons.plus} Yangi bemor</button></div>` : ''}
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>To'liq ismi</th>
              <th>Tug'ilgan sana</th>
              <th>Jins</th>
              <th>Telefon</th>
              <th>Shifokor</th>
              <th>Manzil</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const debouncedRender = debounce(renderTable, 300);
  document.getElementById('searchInput').addEventListener('keyup', debouncedRender);
  document.getElementById('docFilter').addEventListener('change', renderTable);
  document.getElementById('genderFilter').addEventListener('change', renderTable);
  if (canAdd()) document.getElementById('addBtn').addEventListener('click', () => openForm());
  renderTable();
}

function getFiltered() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const docId  = document.getElementById('docFilter').value;
  const gender = document.getElementById('genderFilter').value;
  return allPatients.filter(p =>
    (!q      || p.full_name.toLowerCase().includes(q) || p.phone.includes(q)) &&
    (!docId  || p.doctor_id === docId) &&
    (!gender || p.gender === gender)
  );
}

function docName(id) {
  const d = allDoctors.find(d => d.id === id);
  return d ? d.full_name : '—';
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const rows  = getFiltered();

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="padding:48px;text-align:center;color:var(--slate-400)">Bemorlar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => {
    const gc = p.gender === 'Female' ? 'badge-female' : 'badge-male';
    const gl = p.gender === 'Female' ? 'Ayol' : 'Erkak';
    return `<tr>
      <td class="td-name">${p.full_name}</td>
      <td>${fmtDate(p.date_of_birth)}</td>
      <td><span class="badge ${gc}">${gl}</span></td>
      <td>${p.phone}</td>
      <td>${docName(p.doctor_id)}</td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.address}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="viewPatientGlobal('${p.id}')">${Icons.eye} Ko'rish</button>
          ${canEdit()   ? `<button class="btn btn-outline btn-sm" onclick="openForm('${p.id}')">${Icons.pencil}</button>` : ''}
          ${canDelete() ? `<button class="btn btn-danger  btn-sm" onclick="doDelete('${p.id}')">${Icons.trash}</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openForm(id) {
  const pat   = id ? allPatients.find(p => p.id === id) : null;
  const title = pat ? 'Bemorni tahrirlash' : 'Yangi bemor';
  const docOpts = allDoctors.map(d =>
    `<option value="${d.id}" ${pat?.doctor_id===d.id?'selected':''}>${d.full_name}</option>`
  ).join('');

  buildModal('patModal', title, `
    <div class="form-group">
      <label class="form-label">To'liq ismi *</label>
      <input type="text" class="form-input no-icon" id="f_full_name" value="${pat?.full_name||''}" placeholder="Ism Familiya" />
    </div>
    <div class="form-group">
      <label class="form-label">Tug'ilgan sana *</label>
      <input type="date" class="form-input no-icon" id="f_dob" value="${pat?.date_of_birth||''}" />
    </div>
    <div class="form-group">
      <label class="form-label">Jins *</label>
      <select class="form-select" id="f_gender">
        <option value="" disabled ${!pat?'selected':''}>Tanlang</option>
        <option value="Male"   ${pat?.gender==='Male'  ?'selected':''}>Erkak</option>
        <option value="Female" ${pat?.gender==='Female'?'selected':''}>Ayol</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Telefon *</label>
      <input type="text" class="form-input no-icon" id="f_phone" value="${pat?.phone||''}" placeholder="+998 91 000 00 00" />
    </div>
    <div class="form-group">
      <label class="form-label">Manzil</label>
      <input type="text" class="form-input no-icon" id="f_address" value="${pat?.address||''}" placeholder="Shahar, ko'cha" />
    </div>
    <div class="form-group">
      <label class="form-label">Shifokor *</label>
      <select class="form-select" id="f_doctor">
        <option value="" disabled ${!pat?'selected':''}>Shifokorni tanlang</option>
        ${docOpts}
      </select>
    </div>
    <div id="formError" class="error-box" style="display:none"></div>
  `, `
    <button class="btn btn-outline" data-close="patModal">Bekor qilish</button>
    <button class="btn btn-primary" id="savePatBtn">Saqlash</button>
  `);

  openModal('patModal');

  document.getElementById('savePatBtn').addEventListener('click', async () => {
    const body = {
      full_name:    document.getElementById('f_full_name').value.trim(),
      date_of_birth:document.getElementById('f_dob').value,
      gender:       document.getElementById('f_gender').value,
      phone:        document.getElementById('f_phone').value.trim(),
      address:      document.getElementById('f_address').value.trim(),
      doctor_id:    document.getElementById('f_doctor').value,
    };
    const errEl = document.getElementById('formError');
    errEl.style.display = 'none';

    if (!body.full_name || !body.date_of_birth || !body.gender || !body.phone || !body.doctor_id) {
      errEl.textContent = "Barcha majburiy maydonlarni to'ldiring (*)"; errEl.style.display='block'; return;
    }

    try {
      if (pat) { await API.updatePatient(id, body); toast('Bemor yangilandi'); }
      else      { await API.addPatient(body);        toast('Bemor qo\'shildi'); }
      closeModal('patModal');
      [allPatients, allDoctors] = await Promise.all([API.getPatients(), API.getDoctors()]);
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
      await API.deletePatient(id);
      toast('Bemor o\'chirildi');
      allPatients = await API.getPatients();
      renderTable();
    } catch(e) { toast(e.message, 'error'); }
  });
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
