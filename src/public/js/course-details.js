document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const API = `/api/content/modules/${id}`;

  async function loadCourse() {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error('Failed to fetch course');
      const m = await res.json();
      $('#courseTitle').textContent = m.title || '';
      $('#courseCategory').textContent = m.category ? `Category: ${m.category}` : '';
      $('#courseRole').textContent = m.role ? `Role: ${m.role}` : '';
      $('#courseCreated').textContent = m.createdAt ? `Created: ${new Date(m.createdAt).toLocaleString()}` : '';
      $('#courseDescription').textContent = m.description || '';

      const assetsDiv = $('#courseAssets');
      assetsDiv.innerHTML = '';
      (m.assets || []).forEach(asset => {
        let html = `<div><b>${asset.title}</b><br>`;
        if (asset.type === 'video') {
          html += `<video src="${asset.url}" controls width="100%"></video>`;
        } else if (asset.type === 'pdf') {
          html += `<a href="${asset.url}" target="_blank">PDF</a>`;
        } else if (asset.type === 'link') {
          html += `<a href="${asset.url}" target="_blank">${asset.url}</a>`;
        } else if (asset.type === 'text') {
          html += `<div>${asset.text}</div>`;
        }
        html += '</div>';
        assetsDiv.innerHTML += html;
      });
    } catch (e) {
      $('#courseTitle').textContent = 'Error loading course';
    }
  }

  loadCourse();
});
