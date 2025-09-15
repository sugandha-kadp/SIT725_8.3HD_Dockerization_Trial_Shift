const API = '/api/job-preferences';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function splitCSV(value) {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

const form = document.getElementById('prefForm');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('prefsBody');
const selectAll = document.getElementById('selectAll');
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

function fillForm(pref) {
  document.getElementById('prefId').value = pref?._id || '';
  document.getElementById('preferredLocation').value = pref?.preferredLocation || '';
  document.getElementById('preferredCategories').value = (pref?.preferredCategories || []).join(', ');
  M.updateTextFields && M.updateTextFields();
}

function clearForm() { fillForm(null); }

async function fetchPrefs() {
  const res = await fetch(API, { headers: { ...authHeaders() } });
  if (res.status === 401) return alert('Please login first.');
  const data = await res.json();
  renderRows(data);
}

function renderRows(prefs) {
  tableBody.innerHTML = '';
  prefs.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <label>
          <input type="checkbox" class="row-check" data-id="${p._id}"/>
          <span></span>
        </label>
      </td>
      <td>${p.preferredLocation}</td>
      <td>${(p.preferredCategories || []).join(', ')}</td>
      <td>
        <a class="btn-small blue lighten-1 edit-btn" data-id="${p._id}">Edit</a>
        <a class="btn-small red lighten-1 delete-btn" data-id="${p._id}">Delete</a>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEdit));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDelete));
}

async function onEdit(e) {
  const id = e.target.dataset.id;
  const res = await fetch(API, { headers: { ...authHeaders() } });
  const prefs = await res.json();
  const pref = prefs.find(p => p._id === id);
  fillForm(pref);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function onDelete(e) {
  const id = e.target.dataset.id;
  if (!confirm('Delete this preference?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  await fetchPrefs();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    preferredLocation: document.getElementById('preferredLocation').value.trim(),
    preferredCategories: splitCSV(document.getElementById('preferredCategories').value),
  };

  const prefId = document.getElementById('prefId').value;
  const isEdit = Boolean(prefId);

  const res = await fetch(isEdit ? `${API}/${prefId}` : API, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || 'Request failed');
    return;
  }

  clearForm();
  await fetchPrefs();
});

resetBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearForm();
});

selectAll.addEventListener('change', () => {
  document.querySelectorAll('.row-check').forEach(cb => cb.checked = selectAll.checked);
});

bulkDeleteBtn.addEventListener('click', async () => {
  const ids = Array.from(document.querySelectorAll('.row-check'))
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.id);

  if (!ids.length) return alert('No rows selected.');
  if (!confirm(`Delete ${ids.length} selected preference(s)?`)) return;

  await fetch(API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ids })
  });

  selectAll.checked = false;
  await fetchPrefs();
});

// init
fetchPrefs().catch(err => alert(err.message || 'Failed to load'));