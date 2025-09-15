// Edit Course Page Logic
(function(){
  const $ = (s)=>document.querySelector(s);
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) {
    $('#editError').textContent = 'No course ID provided.';
    $('#editError').style.display = 'block';
    return;
  }
  const API = `/api/content/modules/${id}`;
  const editTitle = $('#editTitle');
  const editCategory = $('#editCategory');
  const editRole = $('#editRole');
  const editContent = $('#editContent');
  const btnSaveEdit = $('#btnSaveEdit');
  const btnCancelEdit = $('#btnCancelEdit');
  const editError = $('#editError');
  const editSuccess = $('#editSuccess');

  function authHeader(){
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function loadCourse(){
    try {
      const res = await fetch(API, { headers: { ...authHeader() } });
      if(!res.ok) throw new Error('Failed to fetch course');
      const m = await res.json();
      editTitle.value = m.title || '';
      editCategory.value = m.category || '';
      editRole.value = m.role || '';
      // Find text asset if any
      const textAsset = (m.assets||[]).find(a=>a.type==='text');
      editContent.value = textAsset ? (textAsset.text||'') : '';
    } catch(e) {
      editError.textContent = e.message;
      editError.style.display = 'block';
    }
  }

  btnSaveEdit.addEventListener('click', async function(){
    editError.style.display = 'none'; editSuccess.style.display = 'none';
    const title = editTitle.value.trim();
    const category = editCategory.value.trim();
    const role = editRole.value.trim();
    const content = editContent.value.trim();
    if(!title || !category){
      editError.textContent = 'Title and Category are required.';
      editError.style.display = 'block'; return;
    }
    // Update module
    const res = await fetch(API, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', ...authHeader() },
      body: JSON.stringify({ title, category, role })
    });
    if(!res.ok){
      editError.textContent = 'Update failed.';
      editError.style.display = 'block'; return;
    }
    // Update or create text asset
    editSuccess.style.display = 'inline-block';
  });

  btnCancelEdit.addEventListener('click', function(){
    window.location.href = '/courses.html';
  });

  loadCourse();
})();
