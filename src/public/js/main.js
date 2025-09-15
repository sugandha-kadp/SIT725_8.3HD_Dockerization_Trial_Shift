
document.addEventListener('DOMContentLoaded', function () {

	if (!document.getElementById('tab-courses')) return;

	const modulesList = document.getElementById('modulesList');
	const modulesEmptyState = document.getElementById('modulesEmptyState');
	const modulesErrorState = document.getElementById('modulesErrorState');
	const categoryFilter = document.getElementById('moduleCategoryFilter');
	const searchInput = document.getElementById('moduleSearch');
	const adminControls = document.getElementById('adminModuleControls');
	let allModules = [];
	let userRole = null;

	// Get user role from JWT
	const token = localStorage.getItem('token');
	if (token) {
		try {
			userRole = JSON.parse(atob(token.split('.')[1])).role;
		} catch (e) { userRole = null; }
	}

	// Show admin controls if admin
	if (userRole === 'admin') {
		adminControls.style.display = 'block';
	}

	// Fetch modules from API
	async function loadModules() {
		modulesList.innerHTML = '';
		modulesEmptyState.style.display = 'none';
		modulesErrorState.style.display = 'none';
		try {
			// TODO: Replace with real API endpoint
			const res = await fetch('/api/content/modules');
			if (!res.ok) throw new Error('API error');
			const data = await res.json();
			allModules = data.modules || [];
			renderCategories();
			renderModules();
		} catch (err) {
			modulesErrorState.style.display = 'block';
		}
	}

	// Render category filter options
	function renderCategories() {
		const categories = [...new Set(allModules.map(m => m.category).filter(Boolean))];
		categoryFilter.innerHTML = '<option value="">All Categories</option>' +
			categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
		if (window.M && window.M.FormSelect) M.FormSelect.init(categoryFilter);
	}

	// Render modules list
	function renderModules() {
		const search = (searchInput.value || '').toLowerCase();
		const category = categoryFilter.value;
		let filtered = allModules.filter(m =>
			(!search || m.title.toLowerCase().includes(search)) &&
			(!category || m.category === category)
		);
		if (!filtered.length) {
			modulesList.innerHTML = '';
			modulesEmptyState.style.display = 'block';
			return;
		}
		modulesEmptyState.style.display = 'none';
		modulesList.innerHTML = filtered.map(m => moduleCard(m)).join('');
	}

	// Module card HTML
	function moduleCard(m) {
		return `
		<div class="col s12 m6 l4">
			<div class="card module-card">
				<div class="card-content">
					<span class="card-title">${m.title}</span>
					<p>${m.description || ''}</p>
					<div class="module-assets">
						${(m.assets || []).map(assetHtml).join('')}
					</div>
				</div>
				<div class="card-action">
					<button class="btn-flat like-btn" data-id="${m._id}"><i class="material-icons">thumb_up</i></button>
					<button class="btn-flat dislike-btn" data-id="${m._id}"><i class="material-icons">thumb_down</i></button>
					${userRole === 'admin' ? `
						<button class="btn-flat edit-btn" data-id="${m._id}"><i class="material-icons">edit</i></button>
						<button class="btn-flat archive-btn" data-id="${m._id}"><i class="material-icons">archive</i></button>
					` : ''}
				</div>
			</div>
		</div>
		`;
	}

	// Asset HTML
	function assetHtml(asset) {
		if (!asset || !asset.type) return '';
		if (asset.type === 'video') return `<video src="${asset.url}" controls width="100%"></video>`;
		if (asset.type === 'pdf') return `<a href="${asset.url}" target="_blank">PDF</a>`;
		if (asset.type === 'link') return `<a href="${asset.url}" target="_blank">${asset.label || 'Link'}</a>`;
		if (asset.type === 'text') return `<div class="module-text">${asset.content}</div>`;
		return '';
	}

	// Event listeners
	searchInput.addEventListener('input', renderModules);
	categoryFilter.addEventListener('change', renderModules);

	// TODO: Add event delegation for like/dislike, edit, archive, create

	// Initial load
	loadModules();
});
