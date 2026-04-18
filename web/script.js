/**
 * University Management System — Frontend JS
 * All data operations go to the Express API → MySQL
 * API base: https://ums-app1.onrender.com
 */

const API = 'https://ums-app1.onrender.com/api';

// ── Auth helpers ──────────────────────────────────────────────────────────────

function ensureAuthenticated() {
  if (!sessionStorage.getItem('umsLoggedIn')) {
    window.location.href = 'index.html';
  }
}

function logout() {
  sessionStorage.removeItem('umsLoggedIn');
  window.location.href = 'index.html';
}

// ── Generic API helpers ───────────────────────────────────────────────────────

async function apiGet(endpoint) {
  const res = await fetch(API + endpoint);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(API + endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}

async function apiPut(endpoint, data) {
  const res = await fetch(API + endpoint, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}

async function apiDelete(endpoint) {
  const res = await fetch(API + endpoint, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Safe val helper ───────────────────────────────────────────────────────────
function safeVal(selector) {
  const el = $(selector);
  return el.length ? (el.val() || '').trim() : '';
}

// ── Null display helper ───────────────────────────────────────────────────────
function display(val) {
  return (val && val !== 'null') ? val : '<span class="text-muted">—</span>';
}

// ── Attendance utilities ──────────────────────────────────────────────────────
function daysInYear(year) {
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}
function countSundaysInYear(year) {
  let count = 0;
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    if (d.getDay() === 0) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ── Load leave types from DB into any <select> ────────────────────────────────
// currentValue: pre-select this option after loading
async function loadLeaveTypesIntoSelect(selectId, currentValue) {
  const $sel = $(selectId);
  $sel.html('<option value="">-- Loading... --</option>');
  try {
    const types = await apiGet('/leave-types');
    $sel.html('<option value="">-- Select --</option>');
    types.forEach(t => {
      const selected = (t.leaveTypeName === currentValue) ? 'selected' : '';
      $sel.append(`<option value="${t.leaveTypeName}" ${selected}>${t.leaveTypeName}</option>`);
    });
    // Ensure pre-selection works even if option was added after val()
    if (currentValue) $sel.val(currentValue);
  } catch (e) {
    // Fallback hardcoded if API fails
    const fallback = ['Medical', 'Casual', 'Duty', 'Compoff'];
    $sel.html('<option value="">-- Select --</option>');
    fallback.forEach(f => {
      $sel.append(`<option value="${f}" ${f === currentValue ? 'selected' : ''}>${f}</option>`);
    });
  }
}

// ── Render helpers ────────────────────────────────────────────────────────────

async function renderStudents(filterText = '') {
  const container = $('#studentList');
  if (!container.length) return;
  container.empty();
  try {
    const students = await apiGet('/students');
    const filtered = filterText
      ? students.filter(s =>
          (s.rollno  || '').toLowerCase().includes(filterText) ||
          (s.name    || '').toLowerCase().includes(filterText) ||
          (s.course  || '').toLowerCase().includes(filterText) ||
          (s.branch  || '').toLowerCase().includes(filterText) ||
          (s.email   || '').toLowerCase().includes(filterText)
        )
      : students;

    if (!filtered.length) {
      container.append('<tr><td colspan="13" class="text-center">No student records found.</td></tr>');
      return;
    }
    filtered.forEach(s => {
      const encoded = encodeURIComponent(JSON.stringify(s));
      container.append(`
        <tr>
          <td>${display(s.rollno)}</td>
          <td>${display(s.name)}</td>
          <td>${display(s.fname)}</td>
          <td>${display(s.dob)}</td>
          <td>${display(s.course)}</td>
          <td>${display(s.branch)}</td>
          <td>${display(s.email)}</td>
          <td>${display(s.phone)}</td>
          <td>${display(s.address)}</td>
          <td>${display(s.class_x)}</td>
          <td>${display(s.class_xii)}</td>
          <td>${display(s.aadhar)}</td>
          <td class="text-center action-btn">
            <button class="btn btn-sm btn-primary edit-student me-1"
                    data-student="${encoded}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger remove-student"
                    data-rollno="${s.rollno}">🗑 Delete</button>
          </td>
        </tr>`);
    });
  } catch (err) {
    container.append(`<tr><td colspan="13" class="text-center text-danger">Error: ${err.message}</td></tr>`);
  }
}

async function renderTeachers(filterText = '') {
  const container = $('#teacherList');
  if (!container.length) return;
  container.empty();
  try {
    const teachers = await apiGet('/teachers');
    const filtered = filterText
      ? teachers.filter(t =>
          (t.empId     || '').toLowerCase().includes(filterText) ||
          (t.name      || '').toLowerCase().includes(filterText) ||
          (t.department|| '').toLowerCase().includes(filterText) ||
          (t.email     || '').toLowerCase().includes(filterText) ||
          (t.phone     || '').toLowerCase().includes(filterText)
        )
      : teachers;

    if (!filtered.length) {
      container.append('<tr><td colspan="11" class="text-center">No teacher records found.</td></tr>');
      return;
    }
    filtered.forEach(t => {
      const encoded = encodeURIComponent(JSON.stringify(t));
      container.append(`
        <tr>
          <td>${display(t.empId)}</td>
          <td>${display(t.name)}</td>
          <td>${display(t.fname)}</td>
          <td>${display(t.dob)}</td>
          <td>${display(t.department)}</td>
          <td>${display(t.education)}</td>
          <td>${display(t.email)}</td>
          <td>${display(t.phone)}</td>
          <td>${display(t.address)}</td>
          <td>${display(t.aadhar)}</td>
          <td class="action-btn text-center">
            <button class="btn btn-sm btn-warning edit-teacher me-1"
                    data-teacher="${encoded}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger remove-teacher"
                    data-empid="${t.empId}">🗑️ Delete</button>
          </td>
        </tr>`);
    });
  } catch (err) {
    container.append(`<tr><td colspan="11" class="text-center text-danger">Error: ${err.message}</td></tr>`);
  }
}

// ── Render Leave List ─────────────────────────────────────────────────────────
async function renderLeaveList(filterEmpId = '') {
  const tbody = $('#leaveList tbody');
  if (!tbody.length) return;
  tbody.empty();
  try {
    const endpoint = filterEmpId
      ? `/teacher-leaves?empId=${encodeURIComponent(filterEmpId)}`
      : '/teacher-leaves';

    const [leaves, teachers] = await Promise.all([
      apiGet(endpoint),
      apiGet('/teachers')
    ]);

    const teacherMap = {};
    teachers.forEach(t => { teacherMap[t.empId] = t.name || '—'; });

    if (!leaves.length) {
      tbody.append('<tr><td colspan="7" class="text-center">No leave records found.</td></tr>');
      return;
    }

    leaves.forEach(l => {
      const leaveType   = (l.leaveType && l.leaveType !== 'null') ? l.leaveType : '—';
      const statusBadge = l.status === 'Approved'
        ? `<span class="badge bg-success">${l.status}</span>`
        : l.status === 'Rejected'
          ? `<span class="badge bg-danger">${l.status}</span>`
          : `<span class="badge bg-warning text-dark">${l.status || 'Pending'}</span>`;
      const encoded = encodeURIComponent(JSON.stringify(l));
      const tName   = teacherMap[l.empId] || '—';

      tbody.append(`
        <tr>
          <td>${display(l.empId)}</td>
          <td>${display(tName)}</td>
          <td>${l.date || '—'}</td>
          <td>${leaveType}</td>
          <td>${l.duration || '—'}</td>
          <td>${statusBadge}</td>
          <td class="text-center action-btn">
            <button class="btn btn-sm btn-primary edit-leave me-1"
                    data-leave="${encoded}"
                    data-teacher-name="${tName}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger delete-leave"
                    data-id="${l.id}">🗑 Delete</button>
          </td>
        </tr>`);
    });
  } catch (err) {
    tbody.append(`<tr><td colspan="7" class="text-danger">${err.message}</td></tr>`);
  }
}

async function renderFeeStructure() {
  const container = $('#feeTableBody');
  if (!container.length) return;
  if (window.location.pathname.endsWith('fee-structure.html')) return;
  container.empty();
  try {
    const fees = await apiGet('/fees');
    fees.forEach(row => {
      const sems = [
        row.semester1||row.Semester1||0, row.semester2||row.Semester2||0,
        row.semester3||row.Semester3||0, row.semester4||row.Semester4||0,
        row.semester5||row.Semester5||0, row.semester6||row.Semester6||0,
        row.semester7||row.Semester7||0, row.semester8||row.Semester8||0
      ];
      const total = sems.reduce((s, v) => s + (Number(v) || 0), 0);
      container.append(`
        <tr>
          <td>${row.courseCode || '—'}</td>
          <td>${row.course || '—'}</td>
          <td>${row.branch || '—'}</td>
          ${sems.map(s => `<td class="text-end">₹${Number(s).toLocaleString('en-IN')}</td>`).join('')}
          <td class="text-end fw-bold">₹${total.toLocaleString('en-IN')}</td>
        </tr>`);
    });
    if (!fees.length) {
      container.append('<tr><td colspan="12" class="text-center text-muted">No fee records found.</td></tr>');
    }
  } catch (err) {
    container.append(`<tr><td colspan="12" class="text-danger">${err.message}</td></tr>`);
  }
}

async function renderDashboardCards() {
  if (!window.location.pathname.endsWith('dashboard.html')) return;
  try {
    const data = await apiGet('/dashboard');
    $('#totalStudents').text(data.totalStudents);
    $('#totalTeachers').text(data.totalTeachers);
    $('#pendingStudentLeaves').text(data.pendingStudentLeaves);
    $('#pendingTeacherLeaves').text(data.pendingTeacherLeaves);
    $('#dashboardDate').text(new Date().toLocaleString());
    if ($('#activityTable').length) {
      $('#activityTable').html(`
        <tr>
          <td>${new Date().toLocaleTimeString()}</td>
          <td>Student details sync</td>
          <td><span class="badge bg-success">Done</span></td>
        </tr>
        <tr>
          <td>${new Date(Date.now() + 3600000).toLocaleTimeString()}</td>
          <td>Exam results update</td>
          <td><span class="badge bg-warning">Pending</span></td>
        </tr>
        <tr>
          <td>${new Date(Date.now() + 7200000).toLocaleTimeString()}</td>
          <td>Teacher leave review</td>
          <td><span class="badge bg-danger">Review</span></td>
        </tr>`);
    }
  } catch (err) {
    console.error('Dashboard load error:', err.message);
  }
}

// ── Show leave balance ────────────────────────────────────────────────────────
async function showLeaveBalance(empId) {
  const summary = $('#leaveSummary');
  if (!summary.length) return;
  if (!empId) {
    summary.html('<div class="alert alert-info">Enter Teacher ID and click Show Balance.</div>');
    return;
  }
  try {
    const res  = await fetch(API + `/teacher-leave-balance?empId=${encodeURIComponent(empId)}`);
    const data = await res.json();
    if (!res.ok) {
      summary.html(`<div class="alert alert-danger">${data.error || 'Could not fetch balance.'}</div>`);
      return;
    }
    let html = `<h5 class="mt-3">Leave Balance for <strong>${data.empId}</strong> (${data.year})</h5>
                <table class="table table-bordered table-sm mt-2" style="max-width:520px;">
                  <thead class="table-dark">
                    <tr>
                      <th>Leave Type</th>
                      <th class="text-center">Total</th>
                      <th class="text-center">Used</th>
                      <th class="text-center">Remaining</th>
                    </tr>
                  </thead><tbody>`;
    for (const [type, info] of Object.entries(data.balance)) {
      const rem      = info.remaining;
      const rowClass = rem === 0 ? 'table-danger' : rem <= 3 ? 'table-warning' : 'table-success';
      html += `<tr class="${rowClass}">
                 <td>${type}</td>
                 <td class="text-center">${info.total}</td>
                 <td class="text-center">${info.used}</td>
                 <td class="text-center"><strong>${rem}</strong></td>
               </tr>`;
    }
    html += `</tbody></table>`;
    summary.html(html);
  } catch (err) {
    summary.html(`<div class="alert alert-danger">${err.message}</div>`);
  }
}

// ── Render Attendance ─────────────────────────────────────────────────────────
async function renderAttendance(year, filterText = '') {
  const tbody = $('#attendanceList');
  const msg   = $('#attendanceTableMessage');
  if (!tbody.length) return;
  tbody.empty();
  msg.html('');
  try {
    const records  = await apiGet(`/teacher-attendance?year=${year}`);
    const filtered = filterText
      ? records.filter(r =>
          (r.empId       || '').toLowerCase().includes(filterText) ||
          (r.teacherName || '').toLowerCase().includes(filterText)
        )
      : records;

    if (!filtered.length) {
      msg.html('<div class="alert alert-warning py-2">No attendance records. Click "Recalculate &amp; Save All" to generate.</div>');
      $('#attendanceSummaryCards').hide();
      return;
    }

    const avgPct  = (filtered.reduce((s, r) => s + parseFloat(r.attendancePct || 0), 0) / filtered.length).toFixed(1);
    const below75 = filtered.filter(r => parseFloat(r.attendancePct) < 75).length;
    $('#attendanceSummaryCards').css('display', 'flex').html(`
      <div class="col-md-3">
        <div class="card attendance-card border-primary">
          <div class="card-body text-center">
            <div class="text-muted small mb-1">Total Teachers</div>
            <div class="stat-badge text-primary">${filtered.length}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card attendance-card border-success">
          <div class="card-body text-center">
            <div class="text-muted small mb-1">Avg Attendance</div>
            <div class="stat-badge text-success">${avgPct}%</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card attendance-card border-danger">
          <div class="card-body text-center">
            <div class="text-muted small mb-1">Below 75%</div>
            <div class="stat-badge text-danger">${below75}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card attendance-card border-warning">
          <div class="card-body text-center">
            <div class="text-muted small mb-1">Working Days (${year})</div>
            <div class="stat-badge text-warning">${filtered[0] ? filtered[0].workingDays : '—'}</div>
          </div>
        </div>
      </div>`);

    filtered.forEach(r => {
      const pct         = parseFloat(r.attendancePct || 0).toFixed(1);
      const pctClass    = pct >= 75 ? 'pct-high' : pct >= 60 ? 'pct-medium' : 'pct-low';
      const progressBar = pct >= 75 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-danger';
      const encoded     = encodeURIComponent(JSON.stringify(r));
      tbody.append(`
        <tr>
          <td>${display(r.empId)}</td>
          <td>${display(r.teacherName)}</td>
          <td>${r.year}</td>
          <td>${r.totalDays}</td>
          <td>${r.sundays}</td>
          <td>${r.workingDays}</td>
          <td>${r.leavesTaken}</td>
          <td>${r.daysPresent}</td>
          <td>
            <span class="${pctClass}">${pct}%</span>
            <div class="progress mt-1">
              <div class="progress-bar ${progressBar}" style="width:${Math.min(pct,100)}%"></div>
            </div>
          </td>
          <td class="text-center action-btn">
            <button class="btn btn-sm btn-primary edit-attendance me-1"
                    data-record="${encoded}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger delete-attendance"
                    data-id="${r.id}">🗑 Delete</button>
          </td>
        </tr>`);
    });
  } catch (err) {
    msg.html(`<div class="alert alert-danger">Error loading attendance: ${err.message}</div>`);
  }
}

// ── Main document ready ───────────────────────────────────────────────────────

$(document).ready(function () {

  // ── Splash screen ───────────────────────────────────────────────────────────
  if ($('#splash-screen').length && $('#login-screen').length) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      $('#splash-progress').css('width', progress + '%');
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          $('#splash-screen').addClass('d-none');
          $('#login-screen').removeClass('d-none');
        }, 500);
      }
    }, 50);
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  $('#login-form').on('submit', async function (e) {
    e.preventDefault();
    const username = safeVal('#username');
    const password = safeVal('#password');
    try {
      const result = await apiPost('/login', { username, password });
      if (result.success) {
        $('#login-alert').addClass('d-none');
        sessionStorage.setItem('umsLoggedIn', 'true');
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      $('#login-alert').removeClass('d-none').text(err.message || 'Invalid username or password.');
    }
  });

  // ── Logout ──────────────────────────────────────────────────────────────────
  $('#logoutButton').on('click', function (e) {
    e.preventDefault();
    logout();
  });

  // ── Auth guard + initial renders ────────────────────────────────────────────
  const protectedPages = [
    'dashboard.html', 'add-student.html', 'add-teacher.html',
    'student-details.html', 'teacher-details.html',
    'apply-leave.html', 'leave-types.html', 'leave-details.html',
    'fee-structure.html', 'exam-details.html', 'teacher-attendance.html'
  ];
  const currentPage = window.location.pathname.split('/').pop();
  if (protectedPages.includes(currentPage)) {
    ensureAuthenticated();
    renderDashboardCards();
    renderFeeStructure();
    renderStudents();
    renderTeachers();
    renderLeaveList();
  }

  // ── Search — page-aware ─────────────────────────────────────────────────────
  const isStudentPage = currentPage === 'student-details.html';

  $('#searchBtn').on('click', function () {
    const q = safeVal('#searchInput').toLowerCase();
    isStudentPage ? renderStudents(q) : renderTeachers(q);
  });
  $('#clearBtn').on('click', function () {
    $('#searchInput').val('');
    isStudentPage ? renderStudents() : renderTeachers();
  });
  $('#searchInput').on('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const q = $(this).val().trim().toLowerCase();
    isStudentPage ? renderStudents(q) : renderTeachers(q);
  });

  // ── Add Student ─────────────────────────────────────────────────────────────
  $('#studentForm').on('submit', async function (e) {
    e.preventDefault();
    const student = {
      name:     safeVal('#studentName'),
      fname:    null,
      rollno:   safeVal('#studentId'),
      dob:      null, address: null, phone: null,
      email:    safeVal('#studentEmail'),
      class_x:  null, class_xii: null, aadhar: null, course: null,
      branch:   safeVal('#department'),
    };
    try {
      await apiPost('/students', student);
      $('#studentStatus').html('<div class="alert alert-success">Student added successfully.</div>');
      this.reset();
      renderStudents();
    } catch (err) {
      $('#studentStatus').html(`<div class="alert alert-danger">${err.message}</div>`);
    }
  });

  // ── Add Teacher ─────────────────────────────────────────────────────────────
  $('#teacherForm').on('submit', async function (e) {
    e.preventDefault();
    const teacher = {
      name:       safeVal('#teacherName'),
      fname:      safeVal('#fatherName')       || null,
      empId:      safeVal('#teacherId'),
      dob:        $('#teacherDob').val()        || null,
      address:    safeVal('#teacherAddress')   || null,
      phone:      safeVal('#teacherPhone')     || null,
      email:      safeVal('#teacherEmail'),
      class_x:    safeVal('#teacherClassX')    || null,
      class_xii:  safeVal('#teacherClassXII')  || null,
      aadhar:     safeVal('#teacherAadhar')    || null,
      education:  $('#teacherEducation').val() || null,
      department: $('#department').val(),
    };
    if (!teacher.name || !teacher.empId || !teacher.email || !teacher.department) {
      $('#teacherStatus').html('<div class="alert alert-danger">Please fill all required fields.</div>');
      return;
    }
    try {
      await apiPost('/teachers', teacher);
      $('#teacherStatus').html('<div class="alert alert-success">Teacher added successfully.</div>');
      this.reset();
      renderTeachers();
    } catch (err) {
      $('#teacherStatus').html(`<div class="alert alert-danger">Error: ${err.message}</div>`);
    }
  });

  // ── Edit Teacher — open modal ───────────────────────────────────────────────
  $(document).on('click', '.edit-teacher', function () {
    let t;
    try { t = JSON.parse(decodeURIComponent($(this).data('teacher'))); }
    catch (e) { alert('Could not load teacher data.'); return; }
    $('#editOriginalEmpId').val(t.empId   || '');
    $('#editEmpId').val(t.empId           || '');
    $('#editName').val(t.name             || '');
    $('#editFname').val(t.fname           || '');
    $('#editDob').val(t.dob              || '');
    $('#editEmail').val(t.email           || '');
    $('#editPhone').val(t.phone           || '');
    $('#editAddress').val(t.address       || '');
    $('#editAadhar').val(t.aadhar         || '');
    $('#editDepartment').val(t.department || '');
    $('#editEducation').val(t.education   || '');
    $('#editMessage').html('');
    new bootstrap.Modal(document.getElementById('editTeacherModal')).show();
  });

  // ── Edit Teacher — save ─────────────────────────────────────────────────────
  $('#saveEditBtn').on('click', async function () {
    const originalEmpId = $('#editOriginalEmpId').val();
    const teacher = {
      name:       safeVal('#editName'),
      fname:      safeVal('#editFname')      || null,
      empId:      safeVal('#editEmpId'),
      dob:        $('#editDob').val()         || null,
      email:      safeVal('#editEmail'),
      phone:      safeVal('#editPhone')      || null,
      address:    safeVal('#editAddress')    || null,
      aadhar:     safeVal('#editAadhar')     || null,
      education:  $('#editEducation').val()  || null,
      department: $('#editDepartment').val() || null,
    };
    if (!teacher.name || !teacher.empId || !teacher.email || !teacher.department) {
      $('#editMessage').html('<div class="alert alert-danger">Name, Employee ID, Email and Department are required.</div>');
      return;
    }
    try {
      await apiPut(`/teachers/${encodeURIComponent(originalEmpId)}`, teacher);
      bootstrap.Modal.getInstance(document.getElementById('editTeacherModal')).hide();
      $('#tableMessage').html('<div class="alert alert-success alert-dismissible">✅ Teacher updated. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
      renderTeachers();
    } catch (err) {
      $('#editMessage').html(`<div class="alert alert-danger">❌ ${err.message}</div>`);
    }
  });

  // ── Edit Student — open modal ───────────────────────────────────────────────
  $(document).on('click', '.edit-student', function () {
    let s;
    try { s = JSON.parse(decodeURIComponent($(this).data('student'))); }
    catch (e) { alert('Could not load student data.'); return; }
    $('#editOriginalRollno').val(s.rollno      || '');
    $('#editRollno').val(s.rollno              || '');
    $('#editStudentName').val(s.name           || '');
    $('#editFatherName').val(s.fname           || '');
    $('#editStudentDob').val(s.dob             || '');
    $('#editStudentEmail').val(s.email         || '');
    $('#editStudentPhone').val(s.phone         || '');
    $('#editStudentCourse').val(s.course       || '');
    $('#editStudentBranch').val(s.branch       || '');
    $('#editStudentAddress').val(s.address     || '');
    $('#editStudentClassX').val(s.class_x      || '');
    $('#editStudentClassXII').val(s.class_xii  || '');
    $('#editStudentAadhar').val(s.aadhar       || '');
    $('#editStudentMessage').html('');
    new bootstrap.Modal(document.getElementById('editStudentModal')).show();
  });

  // ── Edit Student — save ─────────────────────────────────────────────────────
  $('#saveStudentEditBtn').on('click', async function () {
    const originalRollno = $('#editOriginalRollno').val();
    const student = {
      name:      safeVal('#editStudentName'),
      fname:     safeVal('#editFatherName')      || null,
      rollno:    safeVal('#editRollno'),
      dob:       $('#editStudentDob').val()        || null,
      email:     safeVal('#editStudentEmail'),
      phone:     safeVal('#editStudentPhone')    || null,
      course:    $('#editStudentCourse').val()   || null,
      branch:    $('#editStudentBranch').val()   || null,
      address:   safeVal('#editStudentAddress')  || null,
      class_x:   safeVal('#editStudentClassX')   || null,
      class_xii: safeVal('#editStudentClassXII') || null,
      aadhar:    safeVal('#editStudentAadhar')   || null,
    };
    if (!student.name || !student.rollno || !student.email || !student.course || !student.branch) {
      $('#editStudentMessage').html('<div class="alert alert-danger">Name, Roll No, Email, Course and Branch are required.</div>');
      return;
    }
    try {
      await apiPut(`/students/${encodeURIComponent(originalRollno)}`, student);
      bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
      $('#tableMessage').html('<div class="alert alert-success alert-dismissible">✅ Student updated. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
      renderStudents();
    } catch (err) {
      $('#editStudentMessage').html(`<div class="alert alert-danger">❌ ${err.message}</div>`);
    }
  });

  // ── Leave page: filter & clear ──────────────────────────────────────────────
  $('#filterLeaveBtn').on('click', function () {
    renderLeaveList(safeVal('#filterTeacherId'));
  });
  $('#clearLeaveFilterBtn').on('click', function () {
    $('#filterTeacherId').val('');
    renderLeaveList();
  });

  // ── Edit Leave — open modal ─────────────────────────────────────────────────
  // ✅ FIX: Loads leave types from DB dynamically, pre-selects current leave type
  $(document).on('click', '.edit-leave', async function () {
    let l;
    try { l = JSON.parse(decodeURIComponent($(this).data('leave'))); }
    catch (e) { alert('Could not load leave data.'); return; }

    const teacherName = $(this).data('teacher-name') || '';

    // Fill the non-dropdown fields first
    $('#editLeaveId').val(l.id             || '');
    $('#editLeaveEmpId').val(l.empId       || '');
    $('#editLeaveTeacherName').val(teacherName);
    $('#editLeaveStartDate').val(l.startDate || l.date || '');
    $('#editLeaveEndDate').val(l.endDate    || l.date || '');
    $('#editLeaveStatus').val(l.status      || 'Pending');
    $('#editLeaveMessage').html('');

    // ✅ Load leave types from DB then pre-select the current leave type
    await loadLeaveTypesIntoSelect('#editLeaveType', l.leaveType || '');

    new bootstrap.Modal(document.getElementById('editLeaveModal')).show();
  });

  // ── Edit Leave — save ───────────────────────────────────────────────────────
  // ✅ FIX: After save, re-render table so status badge updates immediately
  $('#saveLeaveEditBtn').on('click', async function () {
    const id        = $('#editLeaveId').val();
    const startDate = $('#editLeaveStartDate').val();
    const endDate   = $('#editLeaveEndDate').val();
    const leaveType = $('#editLeaveType').val();
    const status    = $('#editLeaveStatus').val();

    if (!startDate || !endDate || !leaveType) {
      $('#editLeaveMessage').html('<div class="alert alert-danger">Start Date, End Date and Leave Type are required.</div>');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      $('#editLeaveMessage').html('<div class="alert alert-danger">End date cannot be before start date.</div>');
      return;
    }
    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    try {
      await apiPut(`/teacher-leaves/${encodeURIComponent(id)}`, {
        startDate, endDate, leaveType, status, duration: String(duration)
      });
      bootstrap.Modal.getInstance(document.getElementById('editLeaveModal')).hide();

      // ✅ Show success with current status so user sees balance will update
      const statusNote = status === 'Rejected'
        ? ' Leave balance has been <strong>restored</strong> for this teacher.'
        : status === 'Approved'
          ? ' Leave has been <strong>approved</strong> and deducted from balance.'
          : ' Leave is <strong>pending</strong> and temporarily deducted from balance.';

      $('#leaveTableMessage').html(`<div class="alert alert-success alert-dismissible">
        ✅ Leave updated successfully. ${statusNote}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`);

      // ✅ Re-render table so status badge updates immediately without page refresh
      renderLeaveList(safeVal('#filterTeacherId'));

    } catch (err) {
      $('#editLeaveMessage').html(`<div class="alert alert-danger">❌ ${err.message}</div>`);
    }
  });

  // ── Delete Leave ────────────────────────────────────────────────────────────
  $(document).on('click', '.delete-leave', async function () {
    const id = $(this).data('id');
    const ok = await umsConfirmDelete('this leave record');
    if (!ok) return;
    try {
      await apiDelete(`/teacher-leaves/${encodeURIComponent(id)}`);
      $('#leaveTableMessage').html('<div class="alert alert-success alert-dismissible">✅ Leave deleted. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
      renderLeaveList(safeVal('#filterTeacherId'));
    } catch (err) { alert('Delete failed: ' + err.message); }
  });

  // ── Show Balance ────────────────────────────────────────────────────────────
  $('#showBalanceButton').on('click', function () {
    const empId = safeVal('#teacherId');
    if (!empId) {
      $('#leaveMessage').html('<div class="alert alert-danger">Please select a teacher first.</div>');
      return;
    }
    showLeaveBalance(empId);
  });

  // ── Delete student ──────────────────────────────────────────────────────────
  $(document).on('click', '.remove-student', async function () {
    const rollno = $(this).data('rollno');
    const ok = await umsConfirmDelete('Student ' + rollno);
    if (!ok) return;
    try {
      await apiDelete(`/students/${encodeURIComponent(rollno)}`);
      renderStudents();
    } catch (err) { alert('Delete failed: ' + err.message); }
  });

  // ── Delete teacher ──────────────────────────────────────────────────────────
  $(document).on('click', '.remove-teacher', async function () {
    const empId = $(this).data('empid');
    const ok = await umsConfirmDelete('Teacher ' + empId);
    if (!ok) return;
    try {
      await apiDelete(`/teachers/${encodeURIComponent(empId)}`);
      $('#tableMessage').html('<div class="alert alert-success alert-dismissible">✅ Teacher deleted. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
      renderTeachers();
    } catch (err) { alert('Delete failed: ' + err.message); }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ── ATTENDANCE PAGE ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  if (currentPage === 'teacher-attendance.html') {

    const thisYear = new Date().getFullYear();
    const $yearSel = $('#attendanceYear');
    for (let y = thisYear + 1; y >= thisYear - 3; y--) {
      $yearSel.append(`<option value="${y}" ${y === thisYear ? 'selected' : ''}>${y}</option>`);
    }

    renderAttendance(thisYear);

    $('#loadAttendanceBtn').on('click', function () {
      renderAttendance(parseInt($yearSel.val()), safeVal('#attendanceSearchInput').toLowerCase());
    });
    $('#attendanceSearchBtn').on('click', function () {
      renderAttendance(parseInt($yearSel.val()), safeVal('#attendanceSearchInput').toLowerCase());
    });
    $('#attendanceClearBtn').on('click', function () {
      $('#attendanceSearchInput').val('');
      renderAttendance(parseInt($yearSel.val()));
    });
    $('#attendanceSearchInput').on('keydown', function (e) {
      if (e.key === 'Enter')
        renderAttendance(parseInt($yearSel.val()), $(this).val().trim().toLowerCase());
    });

    $('#calcAllAttendanceBtn').on('click', async function () {
      const year = parseInt($yearSel.val());
      const btn  = $(this);
      btn.prop('disabled', true).text('⏳ Processing…');
      try {
        const result = await apiPost('/teacher-attendance/calculate', { year });
        $('#attendanceTableMessage').html(`<div class="alert alert-success alert-dismissible">✅ ${result.message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`);
        renderAttendance(year);
      } catch (err) {
        $('#attendanceTableMessage').html(`<div class="alert alert-danger">❌ ${err.message}</div>`);
      } finally {
        btn.prop('disabled', false).text('🔄 Recalculate & Save All');
      }
    });

    $(document).on('click', '.edit-attendance', function () {
      let r;
      try { r = JSON.parse(decodeURIComponent($(this).data('record'))); }
      catch (e) { alert('Could not load record.'); return; }
      $('#editAttId').val(r.id               || '');
      $('#editAttEmpId').val(r.empId         || '');
      $('#editAttName').val(r.teacherName    || '');
      $('#editAttYear').val(r.year           || '');
      $('#editAttWorkingDays').val(r.workingDays || '');
      $('#editAttLeaves').val(r.leavesTaken      || '');
      $('#editAttMessage').html('');
      new bootstrap.Modal(document.getElementById('editAttendanceModal')).show();
    });

    $('#saveAttendanceEditBtn').on('click', async function () {
      const id          = $('#editAttId').val();
      const workingDays = parseInt($('#editAttWorkingDays').val());
      const leavesTaken = parseInt($('#editAttLeaves').val());

      if (isNaN(workingDays) || isNaN(leavesTaken) || workingDays < 0 || leavesTaken < 0) {
        $('#editAttMessage').html('<div class="alert alert-danger">Working Days and Leaves must be valid non-negative numbers.</div>');
        return;
      }
      if (leavesTaken > workingDays) {
        $('#editAttMessage').html('<div class="alert alert-danger">Leaves taken cannot exceed working days.</div>');
        return;
      }
      const daysPresent   = workingDays - leavesTaken;
      const attendancePct = ((daysPresent / workingDays) * 100).toFixed(2);
      try {
        await apiPut(`/teacher-attendance/${encodeURIComponent(id)}`, {
          workingDays, leavesTaken, daysPresent, attendancePct
        });
        bootstrap.Modal.getInstance(document.getElementById('editAttendanceModal')).hide();
        $('#attendanceTableMessage').html('<div class="alert alert-success alert-dismissible">✅ Attendance updated. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
        renderAttendance(parseInt($yearSel.val()));
      } catch (err) {
        $('#editAttMessage').html(`<div class="alert alert-danger">❌ ${err.message}</div>`);
      }
    });

    $(document).on('click', '.delete-attendance', async function () {
      const id = $(this).data('id');
      const ok = await umsConfirmDelete('this attendance record');
      if (!ok) return;
      try {
        await apiDelete(`/teacher-attendance/${encodeURIComponent(id)}`);
        $('#attendanceTableMessage').html('<div class="alert alert-success alert-dismissible">✅ Record deleted. <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
        renderAttendance(parseInt($yearSel.val()));
      } catch (err) { alert('Delete failed: ' + err.message); }
    });
  }

});