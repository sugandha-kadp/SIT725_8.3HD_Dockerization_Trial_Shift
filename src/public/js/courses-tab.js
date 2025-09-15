(function(){
  const API = "/api/content";
  const $ = (s)=>document.querySelector(s);

  // Views
  const vHome = $("#courses-home");
  const vManage = $("#courses-manage");
  const vAdd = $("#courses-add");
  const pills = $("#courses-pills");
  const btnManageCourses = $("#btnManageCourses");

  // Manage
  const filterCategory = $("#filterCategory");
  const filterRole = $("#filterRole");
  const manageList = $("#manage-list");
  const managePager = $("#manage-pagination");
  const btnAddCourse = $("#btnAddCourse");

  // Add
  const addTitle = $("#addTitle");
  const addCategory = $("#addCategory");
  const addRole = $("#addRole");
  const addContent = $("#addContent");
  const addQuizReq = $("#addQuizReq");
  const btnSaveAdd = $("#btnSaveAdd");
  const btnCancelAdd = $("#btnCancelAdd");
  const addError = $("#addError");
  const addSuccess = $("#addSuccess");

  const state = {
    all: [],
    page: 1,
    limit: 5, 
    homePage: 1, 
    category: "",
    role: ""
  };

  const isAdmin = () => {
    try {
      const tok = localStorage.getItem("token");
      const payload = JSON.parse(atob((tok||"").split(".")[1]));
      return payload.role === "admin";
    } catch { return false; }
  };

  function authHeader(){
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  function setView(name){
  vHome.style.display   = (name==="home")   ? "grid" : "none";
  vManage.style.display = (name==="manage") ? "grid" : "none";
  vAdd.style.display    = (name==="add")    ? "grid" : "none";

  if (pills) pills.style.display = (name==="home") ? "flex" : "none";
  $("#btnManageCourses").style.display = "inline-flex";
  }

  async function fetchModules(){
    const url = new URL(`${API}/modules`, window.location.origin);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "100");
    const res = await fetch(url, { headers:{...authHeader()} });
    if(!res.ok) throw new Error(`modules fetch failed (${res.status})`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.items || data.modules || []);
    state.all = items.map(m => ({
      id: m.id || m._id,
      title: m.title || "(Untitled)",
      category: m.category || "",
      role: m.role || "",
      visibility: m.visibility || "public",
      createdAt: m.createdAt || ""
    }));
  }

  function renderHome(){
    // Pagination for home view
    const total = state.all.length;
    const limit = 5;
    const pages = Math.max(1, Math.ceil(total / limit));
    if (!state.homePage || state.homePage > pages) state.homePage = 1;
    const start = (state.homePage-1)*limit;
    const list = state.all.slice(start, start + limit);
    $("#courses-empty").style.display = list.length ? "none":"block";
    if (!pills) return;
    pills.innerHTML = list.map(p => `<div class="pill" data-id="${p.id}">${escapeHtml(p.title)}</div>`).join("");
    // Add click event to each pill
    pills.querySelectorAll('.pill').forEach(el => {
      el.addEventListener('click', function(){
        const id = this.getAttribute('data-id');
        window.location.href = `/course-details.html?id=${encodeURIComponent(id)}`;
      });
    });
    // Render pagination bar for home view
    let homePager = document.getElementById("courses-home-pagination");
    if (!homePager) {
      homePager = document.createElement("div");
      homePager.id = "courses-home-pagination";
      homePager.className = "pagination";
      pills && pills.parentNode && pills.parentNode.insertBefore(homePager, pills.nextSibling);
    }
    let html = "";
    for(let i=1;i<=pages;i++){
      html += `<button class="page-btn ${i===state.homePage?'active':''}" data-page="${i}" style="display:inline-block;">${i}</button>`;
    }
    homePager.innerHTML = html;
    homePager.style.display = "flex";
    homePager.querySelectorAll(".page-btn").forEach(b=>{
      b.addEventListener("click", ()=>{
        state.homePage = Number(b.dataset.page);
        renderHome();
      });
    });
  }

  function computeFilters(){
    // Merge real categories with the dummy ones shown in Add section
    const dummyCats = ['kitchen','cleaning','delivery','devops'];
    const cats = [...new Set([...dummyCats, ...state.all.map(m=>m.category).filter(Boolean)])].sort();
    filterCategory.innerHTML = `<option value="">All</option>` + cats.map(c=>`<option value="${c}">${escapeHtml(cap(c))}</option>`).join("");
    addCategory.innerHTML = `<option value="">Select Category</option>` + cats.map(c=>`<option value="${c}">${escapeHtml(cap(c))}</option>`).join("");

    const dummyRoles = ['beginner','intermediate','advanced'];
    const roles = [...new Set([...dummyRoles, ...state.all.map(m=>m.role).filter(Boolean)])].sort();
    filterRole.innerHTML = `<option value="">All</option>` + roles.map(r=>`<option value="${r}">${escapeHtml(cap(r))}</option>`).join("");
  }

  function renderManage(){
    const filtered = state.all.filter(m =>
      (!state.category || m.category===state.category) &&
      (!state.role || m.role===state.role)
    );
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.limit));
    if(state.page > pages) state.page = pages;

    const start = (state.page-1)*state.limit;
    const pageItems = filtered.slice(start, start + state.limit);

    manageList.innerHTML = pageItems.map(m=>`
      <div class="manage-item" data-id="${m.id}">
        <div class="manage-title">${escapeHtml(m.title)}</div>
        <div class="manage-actions">
          <button class="icon-btn js-edit" title="Edit"><i class="material-icons">edit</i></button>
          <button class="icon-btn js-archive" title="Archive"><i class="material-icons">archive</i></button>
          <button class="icon-btn js-delete" title="Delete"><i class="material-icons">delete_forever</i></button>
        </div>
      </div>
    `).join("");

    // pagination
    let html = "";
    for(let i=1;i<=pages;i++){
      html += `<button class="page-btn ${i===state.page?'active':''}" data-page="${i}" style="display:inline-block;">${i}</button>`;
    }
    managePager.innerHTML = html;
    managePager.style.display = "flex";
    // Debug info
    console.log("Pagination: total", total, "pages", pages, "current", state.page);

    managePager.querySelectorAll(".page-btn").forEach(b=>{
      b.addEventListener("click", ()=>{
        state.page = Number(b.dataset.page);
        renderManage();
      });
    });
    manageList.querySelectorAll(".js-archive").forEach(btn=>{
      btn.addEventListener("click", ()=> onArchive(btn.closest(".manage-item").dataset.id));
    });
    manageList.querySelectorAll(".js-delete").forEach(btn=>{
      btn.addEventListener("click", ()=> onDelete(btn.closest(".manage-item").dataset.id));
    });
    manageList.querySelectorAll(".js-edit").forEach(btn=>{
      btn.addEventListener("click", ()=> onEdit(btn.closest(".manage-item").dataset.id));
    });
  }

  function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function cap(s){ return s ? s[0].toUpperCase()+s.slice(1) : s; }

  async function onArchive(id){
    if(!confirm("Archive this course?")) return;
    const res = await fetch(`${API}/modules/${id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", ...authHeader() },
      body: JSON.stringify({ isArchived: true })
    });
    if(!res.ok){ alert("Archive failed"); return; }
    await loadAll(); setView("manage");
  }

  async function onDelete(id){
    if(!confirm("Permanently delete this course?")) return;
    const res = await fetch(`${API}/modules/${id}`, {
      method:"DELETE",
      headers:{ ...authHeader() }
    });
    if(!res.ok){ alert("Delete failed"); return; }
    await loadAll(); setView("manage");
  }

  // Simple prompt editor (swap for modal later if you like)
  async function onEdit(id){
    // Open edit page with course id
    window.location.href = `/edit-course.html?id=${encodeURIComponent(id)}`;
  }

  async function onSave(){
    addError.style.display = "none"; addSuccess.style.display = "none";

    const title = addTitle.value.trim();
    const category = addCategory.value.trim();
    const role = addRole.value.trim();
    const content = addContent.value.trim();

    if(!title || !category){
      addError.textContent = "Title and Category are required.";
      addError.style.display = "block"; return;
    }

    // Create module
    const res = await fetch(`${API}/modules`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", ...authHeader() },
      body: JSON.stringify({ title, category, visibility:"public", role })
    });
    if(!res.ok){
      const t = await res.text().catch(()=> "");
      addError.textContent = `Create failed. ${t}`;
      addError.style.display = "block"; return;
    }
    const mod = await res.json();
    const id = mod.id || mod._id;

    // Optional text asset
    if(content){
      const res2 = await fetch(`${API}/modules/${id}/assets`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...authHeader() },
        body: JSON.stringify({ type:"text", title:"Overview", text: content })
      });
      if(!res2.ok){
        console.warn("Text asset creation failed");
      }
    }

  addSuccess.style.display = "inline-block";
  addTitle.value = "";
  addContent.value = "";
  addQuizReq.checked = false;
  await loadAll();
  setView("manage");
  }

  // Buttons / filters
  document.addEventListener("DOMContentLoaded", ()=>{
    setView("home");
    btnManageCourses.addEventListener("click", ()=>{
      setView("manage"); renderManage();
    });
    btnAddCourse.addEventListener("click", ()=> setView("add"));
    btnCancelAdd.addEventListener("click", ()=> setView("manage"));
    btnSaveAdd.addEventListener("click", onSave);
    filterCategory.addEventListener("change", ()=>{ state.category = filterCategory.value; state.page=1; renderManage(); });
    filterRole.addEventListener("change", ()=>{ state.role = filterRole.value; state.page=1; renderManage(); });
  });

  async function loadAll(){
    try { await fetchModules(); computeFilters(); renderHome(); renderManage(); }
    catch(e){ console.error(e); $("#courses-error").style.display = "block"; }
  }
  document.addEventListener("DOMContentLoaded", loadAll);
})();
