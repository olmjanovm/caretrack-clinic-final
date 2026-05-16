'use strict';

const DEPARTMENTS = ['General Practice','Cardiology','Neurology','Dermatology','Orthopedics','Diagnostics'];

let allDoctors = [];
let currentUser = null;

(async () => {
  currentUser = await initLayout('Shifokorlar', 'Shifokorlar ro\'yxati');
  if (!currentUser) return;
  await loadDoctors();
})();

async function loadDoctors() {
  const pb = document.getElementById('pageBody');
  try {
    allDoctors = await API.getDoctors();
    renderPage();
  } catch(e) {
    pb.innerHTML = `<div class="error-box">${e.message}</div>`;
  }
}

function renderPage() {
  const isAdmin = currentUser.role === 'admin';
  document.getElementById('pageBody').innerHTML = `
    <div class="controls-bar">
      <div class="search-wrap">
        ${Icons.search}
        <input type="text" class="search-input" id="searchInput" placeholder="Qidirish..." />
      </div>
      <select class="filter-select" id="deptFilter">
        <option value="">Barcha bo'limlar</option>
        ${DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>
      <select class="filter-select" id="statusFilter">
        <option value="">Barcha holatlar</option>
        <option value="Available">Mavjud</option>
        <option value="Off-duty">Ishda emas</option>
      </select>
      ${isAdmin ? `<div class="controls-bar-end"><button class="btn btn-primary" id="addBtn">${Icons.plus} Yangi shifokor</button></div>` : ''}
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>To'liq ismi</th>
              <th>Mutaxassislik</th>
              <th>Bo'lim</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Holat</th>
              ${isAdmin ? '<th>Amallar</th>' : ''}
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const debouncedRender = debounce(renderTable, 300);
  document.getElementById('searchInput').addEventListener('keyup', debouncedRender);
  document.getElementById('deptFilter').addEventListener('change', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);
  if (isAdmin) document.getElementById('addBtn').addEventListener('click', () => openForm());
  renderTable();
}

function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const dept = document.getElementById('deptFilter').value;
  const status = document.getElementById('statusFilter').value;
  return allDoctors.filter(d =>
    (!q || d.full_name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) &&
    (!dept || d.department === dept) &&
    (!status || d.available_status === status)
  );
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const isAdmin = currentUser.role === 'admin';
  const rows = getFiltered();

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 6}" style="padding:48px;text-align:center;color:var(--slate-400)">
      Shifokorlar topilmadi
    </td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(d => {
    const statusClass = d.available_status === 'Available' ? 'badge-available' : 'badge-offduty';
    const statusLabel = d.available_status === 'Available' ? 'Mavjud' : 'Ishda emas';
    return `<tr>
      <td class="td-name">${d.full_name}</td>
      <td>${d.specialty}</td>
      <td>${d.department}</td>
      <td>${d.phone}</td>
      <td style="color:var(--teal-700)">${d.email}</td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      ${isAdmin ? `<td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="viewDoctor('${d.id}')">${Icons.eye || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'} Ko'rish</button>
          <button class="btn btn-outline btn-sm" onclick="openForm('${d.id}')">${Icons.pencil} Tahrirlash</button>
          <button class="btn btn-danger btn-sm" onclick="doDelete('${d.id}')">${Icons.trash}</button>
        </div>
      </td>` : ''}
    </tr>`;
  }).join('');
}

function viewDoctor(id) {
  const doc = allDoctors.find(d => d.id === id);
  if (!doc) return;
  const statusLabel = doc.available_status === 'Available' ? 'Mavjud' : 'Ishda emas';
  const statusClass = doc.available_status === 'Available' ? 'badge-available' : 'badge-offduty';
  
  buildModal('viewDoctorModal', 'Shifokor ma\'lumotlari', `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--teal-100); color:var(--teal-700); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold;">
          ${initials(doc.full_name)}
        </div>
        <div>
          <div style="font-size:20px; font-weight:bold; color:var(--slate-900);">${doc.full_name}</div>
          <div style="color:var(--slate-500);">${doc.specialty}</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px;">
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Bo'lim</div>
          <div style="color:var(--slate-900);">${doc.department}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Holat</div>
          <div><span class="badge ${statusClass}">${statusLabel}</span></div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Telefon</div>
          <div style="color:var(--slate-900);">${doc.phone}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--slate-500); font-weight:600;">Email</div>
          <div style="color:var(--slate-900);">${doc.email}</div>
        </div>
      </div>
    </div>
  `, `
    <button class="btn btn-outline" data-close="viewDoctorModal">Yopish</button>
  `);
  
  openModal('viewDoctorModal');
}

function openForm(id) {
  const doc = id ? allDoctors.find(d => d.id === id) : null;
  const title = doc ? 'Shifokorni tahrirlash' : 'Yangi shifokor';

  buildModal('doctorModal', title, `
    <div class="form-group">
      <label class="form-label">To'liq ismi *</label>
      <input type="text" class="form-input no-icon" id="f_full_name" value="${doc?.full_name||''}" placeholder="Dr. Ism Familiya" />
    </div>
    <div class="form-group">
      <label class="form-label">Mutaxassislik *</label>
      <input type="text" class="form-input no-icon" id="f_specialty" value="${doc?.specialty||''}" placeholder="Kardiolog" />
    </div>
    <div class="form-group">
      <label class="form-label">Bo'lim *</label>
      <select class="form-select" id="f_department">
        ${DEPARTMENTS.map(d => `<option value="${d}" ${doc?.department===d?'selected':''}>${d}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Telefon *</label>
      <input type="text" class="form-input no-icon" id="f_phone" value="${doc?.phone||''}" placeholder="+998 90 000 00 00" />
    </div>
    <div class="form-group">
      <label class="form-label">Email *</label>
      <input type="email" class="form-input no-icon" id="f_email" value="${doc?.email||''}" placeholder="shifokor@caretrack.uz" />
    </div>
    <div class="form-group">
      <label class="form-label">Holat</label>
      <select class="form-select" id="f_status">
        <option value="Available" ${doc?.available_status==='Available'?'selected':''}>Mavjud</option>
        <option value="Off-duty"  ${doc?.available_status==='Off-duty' ?'selected':''}>Ishda emas</option>
      </select>
    </div>
    ${!doc ? `
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 14px; margin-top:4px;">
      <div style="font-size:12px; font-weight:600; color:#166534; margin-bottom:8px;">🔐 Login ma'lumotlari (avtomatik)</div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label" style="font-size:12px;">Username *</label>
        <input type="text" class="form-input no-icon" id="f_username" placeholder="masalan: d.rahimov" style="font-family:monospace;" />
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:12px;">Parol *</label>
        <input type="text" class="form-input no-icon" id="f_password" placeholder="masalan: klinik123" style="font-family:monospace;" />
      </div>
    </div>` : ''}
    <div id="formError" class="error-box" style="display:none"></div>
  `, `
    <button class="btn btn-outline" data-close="doctorModal">Bekor qilish</button>
    <button class="btn btn-primary" id="saveDocBtn">Saqlash</button>
  `);

  openModal('doctorModal');

  document.getElementById('saveDocBtn').addEventListener('click', async () => {
    const body = {
      full_name: document.getElementById('f_full_name').value.trim(),
      specialty: document.getElementById('f_specialty').value.trim(),
      department: document.getElementById('f_department').value,
      phone: document.getElementById('f_phone').value.trim(),
      email: document.getElementById('f_email').value.trim(),
      available_status: document.getElementById('f_status').value,
    };
    const errEl = document.getElementById('formError');
    errEl.style.display = 'none';

    if (!body.full_name || !body.specialty || !body.phone || !body.email) {
      errEl.textContent = "Barcha majburiy maydonlarni to'ldiring (*)"; errEl.style.display='block'; return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errEl.textContent = "Email formati noto'g'ri"; errEl.style.display='block'; return;
    }

    // Yangi shifokor uchun username/parol tekshiruvi
    if (!doc) {
      const uname = document.getElementById('f_username').value.trim();
      const upass = document.getElementById('f_password').value.trim();
      if (!uname || !upass) {
        errEl.textContent = "Username va parolni to'ldiring"; errEl.style.display='block'; return;
      }
      body.username = uname;
      body.password = upass;
    }

    try {
      if (doc) {
        await API.updateDoctor(id, body);
        toast('Shifokor yangilandi');
        closeModal('doctorModal');
      } else {
        const newDoc = await API.addDoctor(body);
        closeModal('doctorModal');
        // Login ma'lumotlarini ko'rsatish
        const uname = body.username;
        const upass = body.password;
        buildModal('credModal', '✅ Shifokor qo\'shildi', `
          <div style="text-align:center; padding:8px 0 16px;">
            <div style="font-size:14px; color:var(--slate-600); margin-bottom:20px;">Shifokor tizimga qo'shildi. Quyidagi login ma'lumotlarini saqlang:</div>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px; display:inline-block; text-align:left; min-width:240px;">
              <div style="margin-bottom:10px;">
                <div style="font-size:11px; color:#166534; font-weight:600; margin-bottom:4px;">SHIFOKOR</div>
                <div style="font-size:15px; font-weight:700; color:var(--slate-900);">${body.full_name}</div>
              </div>
              <div style="margin-bottom:8px;">
                <div style="font-size:11px; color:#166534; font-weight:600; margin-bottom:2px;">USERNAME</div>
                <div style="font-family:monospace; font-size:15px; font-weight:700; color:#0f766e; background:#fff; padding:4px 10px; border-radius:6px; border:1px solid #bbf7d0;">${uname}</div>
              </div>
              <div>
                <div style="font-size:11px; color:#166534; font-weight:600; margin-bottom:2px;">PAROL</div>
                <div style="font-family:monospace; font-size:15px; font-weight:700; color:#0f766e; background:#fff; padding:4px 10px; border-radius:6px; border:1px solid #bbf7d0;">${upass}</div>
              </div>
            </div>
          </div>
        `, `<button class="btn btn-primary" data-close="credModal">Tushunarli</button>`);
        openModal('credModal');
      }
      allDoctors = await API.getDoctors();
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
      await API.deleteDoctor(id);
      toast('Shifokor o\'chirildi');
      allDoctors = await API.getDoctors();
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
