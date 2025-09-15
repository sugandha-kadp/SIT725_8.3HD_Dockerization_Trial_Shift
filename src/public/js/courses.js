(function sidebarAndAuth() {
  function parseJwt(token) { try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; } }
  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/");
    const user = parseJwt(token); if (!user) return (window.location.href = "/");
    const menuList = document.getElementById("menuList");
    let menuItems = [];
    if (user.role === "admin") {
      menuItems = [
        { name: "Dashboard", icon: "dashboard", href: "/dashboard.html" },
        { name: "Jobs", icon: "work", href: "/dashboard.html" },
        { name: "Notifications", icon: "notifications", href: "/dashboard.html" },
        { name: "Courses", icon: "school", href: "/courses.html" },
        { name: "Users", icon: "group", href: "/dashboard.html" },
        { name: "Review Request", icon: "assignment", href: "/dashboard.html" },
        { name: "Manage Jobs", icon: "settings", href: "/dashboard.html" }
      ];
    } else if (user.role === "employer") {
      menuItems = [
        { name: "Dashboard", icon: "dashboard", href: "/dashboard.html" },
        { name: "Job Management", icon: "work", href: "/dashboard.html" },
        { name: "Notifications", icon: "notifications", href: "/dashboard.html" },
        { name: "Courses", icon: "school", href: "/courses.html" }
      ];
    } else {
      menuItems = [
        { name: "Dashboard", icon: "dashboard", href: "/dashboard.html" },
        { name: "Jobs", icon: "work", href: "/dashboard.html" },
        { name: "Notifications", icon: "notifications", href: "/dashboard.html" },
        { name: "Courses", icon: "school", href: "/courses.html" }
      ];
    }
    menuList.innerHTML = menuItems
      .map(i => `<li class="sidebar-link" onclick="location.href='${i.href}'"><i class="material-icons">${i.icon}</i> ${i.name}</li>`)
      .join("");
  });
  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/';
      });
    }
  });
})();
// Combined Courses JS: includes logic from main.js, courses-tab.js, edit-course.js, and course-details.js
// This file replaces all previous course-related JS files.

(function(){
  // Utility
  const $ = s => document.querySelector(s);
  const parseJwt = token => { try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; } };

  // Views
  const vHome = $("#courses-home");
  const vManage = $("#courses-manage");
  const vAdd = $("#courses-add");
  const vEdit = $("#courses-edit"); // Will be created dynamically
  const vDetails = $("#courses-details"); // Will be created dynamically
  const pills = $("#courses-pills");
  const btnManageCourses = $("#btnManageCourses");
  const btnAddCourse = $("#btnAddCourse");
  const btnCancelAdd = $("#btnCancelAdd");
  const btnSaveAdd = $("#btnSaveAdd");
  const addTitle = $("#addTitle");
  const addCategory = $("#addCategory");
  const addRole = $("#addRole");
  const addCourseContent = $("#addCourseContent");
  const addQuizReq = $("#addQuizReq");
  const addError = $("#addError");
  const addSuccess = $("#addSuccess");
  const filterCategory = $("#filterCategory");
  const filterRole = $("#filterRole");
  const manageList = $("#manage-list");
  const managePager = $("#manage-pagination");
  const coursesError = $("#courses-error");
  const coursesEmpty = $("#courses-empty");

  const API = "/api/courses";
  let state = {
    all: [],
    page: 1,
    limit: 5,
    homePage: 1,
    category: "",
    role: ""
  };

  // Auth helpers
  function authHeader(){
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  function isAdmin() {
    try {
      const tok = localStorage.getItem("token");
      const payload = JSON.parse(atob((tok||"").split(".")[1]));
      return payload.role === "admin";
    } catch { return false; }
  }

  // View switching
  function setView(name, data) {
    vHome && (vHome.style.display = name==="home" ? "grid" : "none");
    vManage && (vManage.style.display = name==="manage" ? "grid" : "none");
    vAdd && (vAdd.style.display = name==="add" ? "grid" : "none");
    // Details and Edit views are created dynamically
    let vEdit = $("#courses-edit");
    let vDetails = $("#courses-details");
    vEdit && (vEdit.style.display = name==="edit" ? "grid" : "none");
    vDetails && (vDetails.style.display = name==="details" ? "grid" : "none");
    if(name==="edit" && data) renderEditView(data);
    if(name==="details" && data) renderDetailsView(data);
    if (pills) pills.style.display = (name==="home") ? "flex" : "none";
    btnManageCourses && (btnManageCourses.style.display = "inline-flex");
  }

  // Fetch all modules
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
      createdAt: m.createdAt || "",
      description: m.description || "",
      assets: m.assets || []
    }));
  }

  // Render Home (pill list)
  function renderHome(){
    const total = state.all.length;
    const limit = 5;
    const pages = Math.max(1, Math.ceil(total / limit));
    if (!state.homePage || state.homePage > pages) state.homePage = 1;
    const start = (state.homePage-1)*limit;
    const list = state.all.slice(start, start + limit);
    coursesEmpty && (coursesEmpty.style.display = list.length ? "none":"block");
    if (!pills) return;
    pills.innerHTML = list.map(p => `<div class="pill" data-id="${p.id}">${escapeHtml(p.title)}</div>`).join("");
    pills.querySelectorAll('.pill').forEach(el => {
      el.addEventListener('click', function(){
        const id = this.getAttribute('data-id');
        setView("details", id);
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

  // Render Manage
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

  // Render Add
  async function onSave(){
    addError.style.display = "none"; addSuccess.style.display = "none";
    const title = addTitle.value.trim();
    const category = addCategory.value.trim();
    const role = addRole.value.trim();
    const content = addCourseContent.value.trim();
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
    addCourseContent.value = "";
    addQuizReq.checked = false;
    await loadAll();
    setView("manage");
  }

  // Archive
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

  // Delete
  async function onDelete(id){
    if(!confirm("Permanently delete this course?")) return;
    const res = await fetch(`${API}/modules/${id}`, {
      method:"DELETE",
      headers:{ ...authHeader() }
    });
    if(!res.ok){ alert("Delete failed"); return; }
    await loadAll(); setView("manage");
  }

  // Edit
  async function onEdit(id){
    // Fetch course and show edit view
    const res = await fetch(`${API}/modules/${id}`, { headers: { ...authHeader() } });
    if(!res.ok){ alert("Failed to fetch course"); return; }
    const m = await res.json();
    setView("edit", m);
  }

  // Render Edit View
  function renderEditView(m){
    let vEdit = $("#courses-edit");
    if(!vEdit){
      vEdit = document.createElement("section");
      vEdit.id = "courses-edit";
      vEdit.className = "card block";
      vEdit.innerHTML = `
        <div class="card__left">
          <h4 class="h-title">Edit Course</h4>
          <div class="form-table">
            <div class="form-row">
              <div class="form-label">Title</div>
              <div class="form-field"><input id="editTitle" class="soft-input" type="text" /></div>
            </div>
            <div class="form-row">
              <div class="form-label">Job Category</div>
              <div class="form-field"><input id="editCategory" class="soft-input" type="text" /></div>
            </div>
            <div class="form-row">
              <div class="form-label">Role</div>
              <div class="form-field"><input id="editRole" class="soft-input" type="text" /></div>
            </div>
            <div class="form-row form-row-top">
              <div class="form-label">Course Content</div>
              <div class="form-field"><textarea id="editContent" class="soft-input soft-textarea"></textarea></div>
            </div>
            <div class="form-actions">
              <button id="btnCancelEdit" class="btn-soft" type="button">Cancel</button>
              <button id="btnSaveEdit" class="btn-cta" type="button">Save</button>
            </div>
            <div id="editError" class="help-error" style="display:none;"></div>
            <div id="editSuccess" class="help-success" style="display:none;">Saved!</div>
          </div>
        </div>
        <div class="card__right"><img src="/img/learning.png" alt="learn" class="hero-illus"/></div>
      `;
      vEdit.style.display = "none";
      vEdit.tabIndex = -1;
      vEdit.setAttribute("role", "region");
      vEdit.setAttribute("aria-label", "Edit Course");
      vEdit.setAttribute("aria-live", "polite");
      vEdit.setAttribute("aria-hidden", "true");
      vEdit.style.gridArea = "main";
      document.querySelector("main").appendChild(vEdit);
    }
    vEdit.style.display = "grid";
    vEdit.setAttribute("aria-hidden", "false");
    $("#editTitle").value = m.title || "";
    $("#editCategory").value = m.category || "";
    $("#editRole").value = m.role || "";
    const textAsset = (m.assets||[]).find(a=>a.type==='text');
    $("#editContent").value = textAsset ? (textAsset.text||"") : "";
    $("#btnSaveEdit").onclick = async function(){
      const title = $("#editTitle").value.trim();
      const category = $("#editCategory").value.trim();
      const role = $("#editRole").value.trim();
      const content = $("#editContent").value.trim();
      if(!title || !category){
        $("#editError").textContent = 'Title and Category are required.';
        $("#editError").style.display = 'block'; return;
      }
      // Update module
      const res = await fetch(`${API}/modules/${m._id||m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', ...authHeader() },
        body: JSON.stringify({ title, category, role })
      });
      if(!res.ok){
        $("#editError").textContent = 'Update failed.';
        $("#editError").style.display = 'block'; return;
      }
      // Update or create text asset
      $("#editSuccess").style.display = 'inline-block';
      await loadAll();
      setView("manage");
    };
    $("#btnCancelEdit").onclick = function(){ setView("manage"); };
  }

  // Render Details View
  async function renderDetailsView(id){
    let vDetails = $("#courses-details");
    if(!vDetails){
      vDetails = document.createElement("section");
      vDetails.id = "courses-details";
      vDetails.className = "card block";
      vDetails.innerHTML = `
        <div class="card__left">
          <h4 id="courseTitle" class="h-title"></h4>
          <div id="courseCategory"></div>
          <div id="courseRole"></div>
          <div id="courseCreated"></div>
          <div id="courseDescription"></div>
          <div id="courseAssets"></div>
          <button id="btnBackToCourses" class="btn-soft" type="button">Back</button>
        </div>
        <div class="card__right"><img src="/img/learning.png" alt="learn" class="hero-illus"/></div>
      `;
      vDetails.style.display = "none";
      vDetails.tabIndex = -1;
      vDetails.setAttribute("role", "region");
      vDetails.setAttribute("aria-label", "Course Details");
      vDetails.setAttribute("aria-live", "polite");
      vDetails.setAttribute("aria-hidden", "true");
      vDetails.style.gridArea = "main";
      document.querySelector("main").appendChild(vDetails);
    }
    vDetails.style.display = "grid";
    vDetails.setAttribute("aria-hidden", "false");
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/modules/${id}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch course');
      const m = await res.json();
      $("#courseTitle").textContent = m.title || '';
      $("#courseCategory").textContent = m.category ? `Category: ${m.category}` : '';
      $("#courseRole").textContent = m.role ? `Role: ${m.role}` : '';
      $("#courseCreated").textContent = m.createdAt ? `Created: ${new Date(m.createdAt).toLocaleString()}` : '';
      $("#courseDescription").textContent = m.description || '';
      const assetsDiv = $("#courseAssets");
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
      $("#courseTitle").textContent = 'Error loading course';
    }
    $("#btnBackToCourses").onclick = function(){ setView("home"); };
  }

  // Filters
  function computeFilters(){
    const dummyCats = ['kitchen','cleaning','delivery','devops'];
    const cats = [...new Set([...dummyCats, ...state.all.map(m=>m.category).filter(Boolean)])].sort();
    filterCategory.innerHTML = `<option value="">All</option>` + cats.map(c=>`<option value="${c}">${escapeHtml(cap(c))}</option>`).join("");
    addCategory.innerHTML = `<option value="">Select Category</option>` + cats.map(c=>`<option value="${c}">${escapeHtml(cap(c))}</option>`).join("");
    const dummyRoles = ['beginner','intermediate','advanced'];
    const roles = [...new Set([...dummyRoles, ...state.all.map(m=>m.role).filter(Boolean)])].sort();
    filterRole.innerHTML = `<option value="">All</option>` + roles.map(r=>`<option value="${r}">${escapeHtml(cap(r))}</option>`).join("");
  }
  function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function cap(s){ return s ? s[0].toUpperCase()+s.slice(1) : s; }

  // Load all
  async function loadAll(){
    try { await fetchModules(); computeFilters(); renderHome(); renderManage(); }
    catch(e){ console.error(e); coursesError && (coursesError.style.display = "block"); }
  }

  // Event listeners
  document.addEventListener("DOMContentLoaded", ()=>{
    setView("home");
    btnManageCourses && btnManageCourses.addEventListener("click", ()=>{ setView("manage"); renderManage(); });
    btnAddCourse && btnAddCourse.addEventListener("click", ()=> setView("add"));
    btnCancelAdd && btnCancelAdd.addEventListener("click", ()=> setView("manage"));
    btnSaveAdd && btnSaveAdd.addEventListener("click", onSave);
    filterCategory && filterCategory.addEventListener("change", ()=>{ state.category = filterCategory.value; state.page=1; renderManage(); });
    filterRole && filterRole.addEventListener("change", ()=>{ state.role = filterRole.value; state.page=1; renderManage(); });
  });
  document.addEventListener("DOMContentLoaded", loadAll);
})();
