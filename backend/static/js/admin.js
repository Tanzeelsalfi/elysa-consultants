/* ═══════════════════════════════════════════════
   ELYSA ADMIN DASHBOARD + LOGIN JS
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const PAGE = window.location.pathname;

  // ─────────────────────────────────────────────
  // LOGIN PAGE
  // ─────────────────────────────────────────────
  if (PAGE === '/admin/login') {
    const loginForm    = document.getElementById('loginForm');
    const usernameIn   = document.getElementById('admin-username');
    const passwordIn   = document.getElementById('admin-password');
    const togglePw     = document.getElementById('togglePw');
    const pwIcon       = document.getElementById('pwIcon');
    const loginError   = document.getElementById('loginError');
    const loginErrText = document.getElementById('loginErrorText');
    const loginBtn     = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoad = document.getElementById('loginBtnLoad');

    // Password toggle
    if (togglePw) {
      togglePw.addEventListener('click', () => {
        const type = passwordIn.type === 'password' ? 'text' : 'password';
        passwordIn.type = type;
        pwIcon.className = type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginError) loginError.style.display = 'none';

        const username = usernameIn.value.trim();
        const password = passwordIn.value.trim();

        if (!username || !password) {
          showLoginError('Please enter username and password.');
          return;
        }

        setLoginLoading(true);

        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
          });

          const data = await res.json();

          if (res.ok) {
            window.location.href = '/admin';
          } else {
            showLoginError(data.message || 'Invalid credentials.');
          }
        } catch {
          showLoginError('Network error. Please try again.');
        } finally {
          setLoginLoading(false);
        }
      });
    }

    function showLoginError(msg) {
      if (loginError)   loginError.style.display = 'flex';
      if (loginErrText) loginErrText.textContent  = msg;
    }

    function setLoginLoading(loading) {
      if (loginBtn)     loginBtn.disabled           = loading;
      if (loginBtnText) loginBtnText.style.display  = loading ? 'none' : '';
      if (loginBtnLoad) loginBtnLoad.style.display  = loading ? '' : 'none';
    }

    return; // Login page — done
  }

  // ─────────────────────────────────────────────
  // DASHBOARD PAGE
  // ─────────────────────────────────────────────
  if (PAGE !== '/admin') return;

  // ════════════════════════════════════════════
  // TEAM MANAGEMENT
  // ════════════════════════════════════════════
  const openAddEmpBtn     = document.getElementById('openAddEmployeeBtn');
  const addEmployeeForm   = document.getElementById('addEmployeeForm');
  const cancelAddEmpBtn   = document.getElementById('cancelAddEmployee');
  const employeeForm      = document.getElementById('employeeForm');
  const empFormFeedback   = document.getElementById('employeeFormFeedback');
  const submitEmpBtn      = document.getElementById('submitEmployeeBtn');
  const empPhotoInput     = document.getElementById('emp-photo');
  const empPhotoPreview   = document.getElementById('employeePhotoPreview');
  const adminTeamList     = document.getElementById('adminTeamList');
  const adminTeamLoad     = document.getElementById('adminTeamLoading');
  const adminTeamEmpty    = document.getElementById('adminTeamEmpty');

  // Edit Team Member Modal Selectors
  const editEmpModal          = document.getElementById('editEmployeeModal');
  const editEmpForm           = document.getElementById('editEmployeeForm');
  const editEmpId             = document.getElementById('edit-emp-id');
  const editEmpName           = document.getElementById('edit-emp-name');
  const editEmpPosition       = document.getElementById('edit-emp-position');
  const editEmpSpec           = document.getElementById('edit-emp-spec');
  const editEmpPhotoContainer = document.getElementById('editEmpPhotoContainer');
  const editEmpPhotoInput     = document.getElementById('edit-emp-photo');
  const editEmpPhotoPreview   = document.getElementById('editEmpPhotoPreview');
  const cancelEditEmpBtn      = document.getElementById('cancelEditEmpBtn');
  const editEmpFeedback       = document.getElementById('editEmpFeedback');

  if (openAddEmpBtn) {
    openAddEmpBtn.addEventListener('click', () => {
      const isOpen = addEmployeeForm.style.display !== 'none';
      addEmployeeForm.style.display = isOpen ? 'none' : 'block';
      openAddEmpBtn.innerHTML = isOpen
        ? '<i class="fas fa-plus"></i> Add Team Member'
        : '<i class="fas fa-times"></i> Cancel';
      if (!isOpen) {
        document.getElementById('emp-name').focus();
      }
    });
  }

  if (cancelAddEmpBtn) {
    cancelAddEmpBtn.addEventListener('click', () => {
      addEmployeeForm.style.display = 'none';
      openAddEmpBtn.innerHTML = '<i class="fas fa-plus"></i> Add Team Member';
      employeeForm.reset();
      empPhotoPreview.innerHTML = '';
    });
  }

  if (empPhotoInput && empPhotoPreview) {
    empPhotoInput.addEventListener('change', () => {
      empPhotoPreview.innerHTML = '';
      const file = empPhotoInput.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement('div');
          item.className = 'preview-item';
          item.innerHTML = `
            <img src="${e.target.result}" alt="Photo Preview" />
            <button type="button" class="preview-remove" aria-label="Remove photo">
              <i class="fas fa-times"></i>
            </button>
          `;
          item.querySelector('button').addEventListener('click', () => {
            empPhotoInput.value = '';
            empPhotoPreview.innerHTML = '';
          });
          empPhotoPreview.appendChild(item);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (employeeForm) {
    employeeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setEmpFeedback('', '');
      setEmpSubmitLoading(true);

      const formData = new FormData(employeeForm);

      try {
        const res = await fetch('/api/admin/employees', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setEmpFeedback('✅ Team member added successfully!', 'success');
          employeeForm.reset();
          empPhotoPreview.innerHTML = '';
          addEmployeeForm.style.display = 'none';
          openAddEmpBtn.innerHTML = '<i class="fas fa-plus"></i> Add Team Member';
          loadAdminTeam();
          showToast('Team member added successfully', 'success');
        } else {
          setEmpFeedback(data.message || 'Failed to add team member.', 'error');
        }
      } catch {
        setEmpFeedback('Network error. Please try again.', 'error');
      } finally {
        setEmpSubmitLoading(false);
      }
    });
  }

  async function loadAdminTeam() {
    if (!adminTeamLoad) return;
    adminTeamLoad.style.display  = 'flex';
    adminTeamList.style.display  = 'none';
    adminTeamEmpty.style.display = 'none';

    try {
      const res = await fetch('/api/admin/employees', { credentials: 'include' });
      const team = await res.json();

      adminTeamLoad.style.display = 'none';

      if (!team.length) {
        adminTeamEmpty.style.display = 'block';
        return;
      }

      adminTeamList.style.display = 'grid';
      renderTeamList(team);
    } catch {
      adminTeamLoad.style.display = 'none';
      adminTeamEmpty.style.display = 'block';
    }
  }

  function renderTeamList(team) {
    adminTeamList.innerHTML = '';
    team.forEach(member => {
      const photo = member.photo || '';
      const item = document.createElement('div');
      item.className = 'project-item'; // reuse styles
      item.innerHTML = `
        <div class="project-item-img">
          ${photo ? `<img src="${escHtml(photo)}" alt="${escHtml(member.name)}" loading="lazy" />` : '<div style="display:flex; align-items:center; justify-content:center; height:100%; background:#14141f; color:#444;"><i class="fas fa-user fa-3x"></i></div>'}
        </div>
        <div class="project-item-body">
          <div class="project-item-category">${escHtml(member.spec || 'Staff')}</div>
          <div class="project-item-title">${escHtml(member.name)}</div>
          <div class="project-item-desc">${escHtml(member.position || '')}</div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn-edit btn-edit-emp" style="padding: 6px 12px; font-size: 0.8rem; background: var(--gold); color: #0a0a0f; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete btn-delete-emp" data-id="${member._id}" style="margin-top: 0; padding: 6px 12px; font-size: 0.8rem;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      item.querySelector('.btn-edit-emp').addEventListener('click', () => {
        openEditEmployeeModal(member);
      });
      item.querySelector('.btn-delete-emp').addEventListener('click', async () => {
        if (!confirm(`Are you sure you want to delete ${member.name}?`)) return;
        try {
          const res = await fetch(`/api/admin/employees/${member._id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            loadAdminTeam();
            showToast('Team member deleted successfully', 'danger');
          } else {
            showToast('Failed to delete team member', 'danger');
          }
        } catch {
          showToast('Network error', 'danger');
        }
      });
      adminTeamList.appendChild(item);
    });
  }

  function setEmpFeedback(msg, type) {
    if (!empFormFeedback) return;
    empFormFeedback.textContent = msg;
    empFormFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function setEditEmpFeedback(msg, type) {
    if (!editEmpFeedback) return;
    editEmpFeedback.textContent = msg;
    editEmpFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function openEditEmployeeModal(member) {
    editEmpId.value = member._id;
    editEmpName.value = member.name || '';
    editEmpPosition.value = member.position || '';
    editEmpSpec.value = member.spec || '';
    
    // Display current photo
    editEmpPhotoContainer.innerHTML = '';
    const photo = member.photo || '';
    if (photo) {
      const img = document.createElement('img');
      img.src = photo;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      editEmpPhotoContainer.appendChild(img);
    } else {
      editEmpPhotoContainer.innerHTML = '<i class="fas fa-user fa-3x" style="color: #444;"></i>';
    }

    editEmpPhotoPreview.innerHTML = '';
    if (editEmpPhotoInput) editEmpPhotoInput.value = '';
    setEditEmpFeedback('', '');

    if (editEmpModal) editEmpModal.style.display = 'flex';
  }

  if (cancelEditEmpBtn) {
    cancelEditEmpBtn.addEventListener('click', () => {
      if (editEmpModal) editEmpModal.style.display = 'none';
    });
  }

  if (editEmpPhotoInput && editEmpPhotoPreview) {
    editEmpPhotoInput.addEventListener('change', () => {
      editEmpPhotoPreview.innerHTML = '';
      const file = editEmpPhotoInput.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editEmpPhotoPreview.innerHTML = `<div class="preview-item"><img src="${e.target.result}" alt="New Preview" /></div>`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (editEmpForm) {
    editEmpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setEditEmpFeedback('', '');

      const name = editEmpName.value.trim();
      const pos  = editEmpPosition.value.trim();
      if (!name || !pos) {
        setEditEmpFeedback('Name and Position are required.', 'error');
        return;
      }

      const formData = new FormData(editEmpForm);

      try {
        const res = await fetch(`/api/admin/employees/${editEmpId.value}`, {
          method: 'PUT',
          credentials: 'include',
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Team member updated successfully', 'success');
          if (editEmpModal) editEmpModal.style.display = 'none';
          loadAdminTeam();
        } else {
          setEditEmpFeedback(data.message || 'Failed to update team member.', 'error');
        }
      } catch {
        setEditEmpFeedback('Network error. Please try again.', 'error');
      }
    });
  }

  function setEmpSubmitLoading(loading) {
    if (!submitEmpBtn) return;
    submitEmpBtn.disabled = loading;
    submitEmpBtn.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Saving...'
      : '<i class="fas fa-save"></i> Save Member';
  }

  // ── ELEMENTS ────────────────────────────────
  const authLoading      = document.getElementById('authLoading');
  const dashboardContent = document.getElementById('dashboardContent');
  const logoutBtn        = document.getElementById('logoutBtn');
  const sidebarEl        = document.getElementById('adminSidebar');
  const mainEl           = document.getElementById('adminMain');
  const menuToggle       = document.getElementById('menuToggle');
  const sidebarClose     = document.getElementById('sidebarClose');
  const topbarTitle      = document.getElementById('topbarTitle');

  // Tab panels
  const tabPanels = {
    projects: document.getElementById('tab-projects'),
    team:     document.getElementById('tab-team'),
    careers:  document.getElementById('tab-careers'),
    contacts: document.getElementById('tab-contacts'),
    reviews:  document.getElementById('tab-reviews'),
  };
  const navBtns = {
    projects: document.getElementById('nav-projects'),
    team:     document.getElementById('nav-team'),
    careers:  document.getElementById('nav-careers'),
    contacts: document.getElementById('nav-contacts'),
    reviews:  document.getElementById('nav-reviews'),
  };
  const tabTitles = { projects: 'Projects', team: 'Manage Team', careers: 'Careers', contacts: 'Leads', reviews: 'Reviews' };

  // ── SIDEBAR TOGGLE ───────────────────────────
  if (menuToggle) {
    menuToggle.addEventListener('click', () => sidebarEl.classList.toggle('open'));
  }
  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => sidebarEl.classList.remove('open'));
  }
  document.addEventListener('click', (e) => {
    if (sidebarEl && !sidebarEl.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebarEl.classList.remove('open');
    }
  });

  // ── TAB SWITCHING ────────────────────────────
  function switchTab(tab) {
    Object.keys(tabPanels).forEach(key => {
      tabPanels[key].style.display = key === tab ? 'block' : 'none';
      navBtns[key].classList.toggle('active', key === tab);
    });
    if (topbarTitle) topbarTitle.textContent = tabTitles[tab] || tab;
    sidebarEl.classList.remove('open');

    if (tab === 'team')     loadAdminTeam();
    if (tab === 'careers')  loadAdminCareers();
    if (tab === 'contacts') loadContacts();
    if (tab === 'reviews')  loadReviews();
  }

  Object.keys(navBtns).forEach(key => {
    navBtns[key].addEventListener('click', (e) => { e.preventDefault(); switchTab(key); });
  });

  // ── AUTH VERIFY ──────────────────────────────
  async function verifyAuth() {
    try {
      const res = await fetch('/api/admin/verify', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Show logged-in username in topbar
        const userEl = document.querySelector('.topbar-user');
        if (userEl && data.username) {
          userEl.innerHTML = `<i class="fas fa-user-shield"></i> <span>${escHtml(data.username)}</span>`;
        }
        authLoading.style.display    = 'none';
        dashboardContent.style.display = 'block';
        loadAdminProjects();
        loadAdminTeam();
        loadAdminCareers();
        loadContacts();
        loadReviews();
      } else {
        window.location.href = '/admin/login';
      }
    } catch {
      window.location.href = '/admin/login';
    }
  }

  // ── LOGOUT ───────────────────────────────────
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/admin/login';
    });
  }

  // ════════════════════════════════════════════
  // PROJECTS MANAGEMENT
  // ════════════════════════════════════════════
  const openAddBtn     = document.getElementById('openAddProjectBtn');
  const addProjectForm = document.getElementById('addProjectForm');
  const cancelAddBtn   = document.getElementById('cancelAddProject');
  const projectForm    = document.getElementById('projectForm');
  const projectsFeedback = document.getElementById('projectFormFeedback');
  const submitProjBtn  = document.getElementById('submitProjectBtn');
  const fileInput      = document.getElementById('proj-images');
  const imagePreviews  = document.getElementById('imagePreviews');
  const fileUploadArea = document.getElementById('fileUploadArea');
  const adminProjList  = document.getElementById('adminProjectsList');
  const adminProjLoad  = document.getElementById('adminProjectsLoading');
  const adminProjEmpty = document.getElementById('adminProjectsEmpty');
  const deleteModal    = document.getElementById('deleteModal');
  const confirmDel     = document.getElementById('confirmDeleteBtn');
  const cancelDel      = document.getElementById('cancelDeleteBtn');

  let deleteTargetId = null;

  // Edit Project Elements and State
  const editModal      = document.getElementById('editModal');
  const editProjectForm = document.getElementById('editProjectForm');
  const cancelEditBtn  = document.getElementById('cancelEditProject');
  const editProjId     = document.getElementById('edit-proj-id');
  const editProjTitle  = document.getElementById('edit-proj-title');
  const editProjDesc   = document.getElementById('edit-proj-desc');
  const editProjCat    = document.getElementById('edit-proj-category');
  const editImageContainer = document.getElementById('editImageContainer');
  const editFileInput  = document.getElementById('edit-proj-images');
  const editPreviews   = document.getElementById('editImagePreviews');
  const editFileUploadArea = document.getElementById('editFileUploadArea');
  const editFeedback   = document.getElementById('editProjectFeedback');
  const saveEditProjBtn = document.getElementById('saveEditProjectBtn');

  let keptImages = [];

  // Toggle add form
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      const isOpen = addProjectForm.style.display !== 'none';
      addProjectForm.style.display = isOpen ? 'none' : 'block';
      openAddBtn.innerHTML = isOpen
        ? '<i class="fas fa-plus"></i> Add Project'
        : '<i class="fas fa-times"></i> Cancel';
      if (!isOpen) {
        document.getElementById('proj-title').focus();
      }
    });
  }

  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', () => {
      addProjectForm.style.display = 'none';
      openAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add Project';
      projectForm.reset();
      imagePreviews.innerHTML = '';
    });
  }

  // ── EDIT MODAL OPEN ───────────────────────────
  function openEditModal(proj) {
    editProjId.value = proj._id;
    editProjTitle.value = proj.title || '';
    editProjDesc.value = proj.description || '';
    editProjCat.value = proj.category || 'General';
    
    keptImages = [...(proj.images || [])];
    renderEditThumbnails();
    
    editPreviews.innerHTML = '';
    if (editFileInput) editFileInput.value = '';
    setEditFeedback('', '');
    
    if (editModal) editModal.style.display = 'flex';
  }

  function renderEditThumbnails() {
    if (!editImageContainer) return;
    editImageContainer.innerHTML = '';
    keptImages.forEach((imgUrl, i) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.style.cssText = 'position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid #333;';
      item.innerHTML = `
        <img src="${escHtml(imgUrl)}" style="width: 100%; height: 100%; object-fit: cover;" />
        <button type="button" class="preview-remove" style="position: absolute; top: 4px; right: 4px; background: rgba(231,76,60,0.9); color: white; border: none; border-radius: 4px; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" aria-label="Remove image">
          <i class="fas fa-trash"></i>
        </button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        keptImages.splice(i, 1);
        renderEditThumbnails();
      });
      editImageContainer.appendChild(item);
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      if (editModal) editModal.style.display = 'none';
      keptImages = [];
    });
  }

  // Previews for new files added to edit form
  if (editFileInput && editPreviews) {
    editFileInput.addEventListener('change', () => {
      editPreviews.innerHTML = '';
      Array.from(editFileInput.files).forEach((file, i) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement('div');
          item.className = 'preview-item';
          item.innerHTML = `
            <img src="${e.target.result}" alt="New Preview ${i+1}" />
            <button type="button" class="preview-remove" aria-label="Remove image ${i+1}">
              <i class="fas fa-times"></i>
            </button>
          `;
          editPreviews.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // Drag over effects for edit upload area
  if (editFileUploadArea) {
    editFileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      editFileUploadArea.classList.add('drag-over');
    });
    editFileUploadArea.addEventListener('dragleave', () => editFileUploadArea.classList.remove('drag-over'));
    editFileUploadArea.addEventListener('drop', () => editFileUploadArea.classList.remove('drag-over'));
  }

  // Submit edit form
  if (editProjectForm) {
    editProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setEditFeedback('', '');
      setEditSubmitLoading(true);

      const formData = new FormData(editProjectForm);
      formData.delete('id');
      
      // Append kept images list
      formData.append('keep_images', JSON.stringify(keptImages));

      try {
        const id = editProjId.value;
        const res = await fetch(`/api/admin/projects/${id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          showToast('Project updated successfully', 'success');
          if (editModal) editModal.style.display = 'none';
          loadAdminProjects();
        } else {
          setEditFeedback(data.message || 'Failed to update project.', 'error');
        }
      } catch {
        setEditFeedback('Network error. Please try again.', 'error');
      } finally {
        setEditSubmitLoading(false);
      }
    });
  }

  function setEditFeedback(msg, type) {
    if (!editFeedback) return;
    editFeedback.textContent = msg;
    editFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function setEditSubmitLoading(loading) {
    if (!saveEditProjBtn) return;
    saveEditProjBtn.disabled = loading;
    saveEditProjBtn.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Saving...'
      : '<i class="fas fa-save"></i> Save Changes';
  }

  // Image preview
  if (fileInput && imagePreviews) {
    fileInput.addEventListener('change', () => {
      imagePreviews.innerHTML = '';
      Array.from(fileInput.files).forEach((file, i) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement('div');
          item.className = 'preview-item';
          item.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${i+1}" />
            <button type="button" class="preview-remove" aria-label="Remove image ${i+1}">
              <i class="fas fa-times"></i>
            </button>
          `;
          imagePreviews.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // Drag-over effect
  if (fileUploadArea) {
    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('drag-over');
    });
    fileUploadArea.addEventListener('dragleave', () => fileUploadArea.classList.remove('drag-over'));
    fileUploadArea.addEventListener('drop', () => fileUploadArea.classList.remove('drag-over'));
  }

  // Submit add project form
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setFeedback('', '');
      setSubmitLoading(true);

      const formData = new FormData(projectForm);

      try {
        const res = await fetch('/api/admin/projects', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setFeedback('✅ Project added! The projects page will update automatically.', 'success');
          projectForm.reset();
          imagePreviews.innerHTML = '';
          addProjectForm.style.display = 'none';
          openAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add Project';
          loadAdminProjects();
          showToast('Project added — frontend will refresh automatically', 'success');
        } else {
          setFeedback(data.message || 'Failed to add project.', 'error');
        }
      } catch {
        setFeedback('Network error. Please try again.', 'error');
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  // Load admin projects list
  async function loadAdminProjects() {
    adminProjLoad.style.display  = 'flex';
    adminProjList.style.display  = 'none';
    adminProjEmpty.style.display = 'none';

    try {
      const res = await fetch('/api/admin/projects', { credentials: 'include' });
      const data = await res.json();

      adminProjLoad.style.display = 'none';

      if (!res.ok) {
        showToast(data.message || 'Failed to load projects', 'danger');
        adminProjEmpty.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Error: ${escHtml(data.message || 'Failed to load projects')}</p>`;
        adminProjEmpty.style.display = 'block';
        return;
      }

      if (!data.length) {
        adminProjEmpty.innerHTML = `<i class="fas fa-folder-open"></i> <p>No projects yet. Add your first one above.</p>`;
        adminProjEmpty.style.display = 'block';
        return;
      }

      adminProjList.style.display = 'grid';
      renderProjectList(data);
    } catch {
      adminProjLoad.style.display = 'none';
      adminProjEmpty.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Network Error or Server Connection Failure.</p>`;
      adminProjEmpty.style.display = 'block';
    }
  }

  function renderProjectList(projects) {
    adminProjList.innerHTML = '';
    projects.forEach(proj => {
      const thumb = (proj.images || [])[0] || '';
      const item = document.createElement('div');
      item.className = 'project-item';
      item.innerHTML = `
        <div class="project-item-img">
          ${thumb ? `<img src="${escHtml(thumb)}" alt="${escHtml(proj.title)}" loading="lazy" />` : ''}
        </div>
        <div class="project-item-body">
          <div class="project-item-category">${escHtml(proj.category || 'Project')}</div>
          <div class="project-item-title">${escHtml(proj.title)}</div>
          <div class="project-item-desc">${escHtml(proj.description || '')}</div>
          <div class="project-item-count"><i class="fas fa-images"></i> ${(proj.images||[]).length} image(s)</div>
          <div class="project-item-actions" style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn-edit-proj btn-primary-admin" data-id="${proj._id}" style="padding: 6px 12px; font-size: 0.82rem; background: #c9a84c; color: #0a0a0f; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight:600; margin-top:0;">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" data-id="${proj._id}" style="padding: 6px 12px; font-size: 0.82rem; margin-top:0;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      item.querySelector('.btn-delete').addEventListener('click', () => {
        deleteTargetId = proj._id;
        deleteModal.style.display = 'flex';
      });
      item.querySelector('.btn-edit-proj').addEventListener('click', () => {
        openEditModal(proj);
      });
      adminProjList.appendChild(item);
    });
  }

  // Delete modal
  if (confirmDel) {
    confirmDel.addEventListener('click', async () => {
      if (!deleteTargetId) return;
      try {
        const res = await fetch(`/api/admin/projects/${deleteTargetId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        deleteModal.style.display = 'none';
        deleteTargetId = null;
        if (res.ok) {
          loadAdminProjects();
          showToast('Project deleted — frontend will refresh automatically', 'danger');
        }
      } catch {
        deleteModal.style.display = 'none';
      }
    });
  }
  if (cancelDel) {
    cancelDel.addEventListener('click', () => {
      deleteModal.style.display = 'none';
      deleteTargetId = null;
    });
  }

  // ════════════════════════════════════════════
  // LEADS
  // ════════════════════════════════════════════
  const contactsBadge  = document.getElementById('contactsBadge');

  document.getElementById('refreshContactsBtn')?.addEventListener('click', loadContacts);

  async function loadContacts() {
    const loadEl  = document.getElementById('contactsLoading');
    const listEl  = document.getElementById('contactsList');
    const emptyEl = document.getElementById('contactsEmpty');

    loadEl.style.display  = 'flex';
    listEl.style.display  = 'none';
    emptyEl.style.display = 'none';

    try {
      const res  = await fetch('/api/admin/contacts', { credentials: 'include' });
      const data = await res.json();
      loadEl.style.display = 'none';

      if (!res.ok) {
        showToast(data.message || 'Failed to load leads', 'danger');
        emptyEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Error: ${escHtml(data.message || 'Failed to load leads')}</p>`;
        emptyEl.style.display = 'block';
        if (contactsBadge) contactsBadge.classList.remove('visible');
        return;
      }

      if (contactsBadge) {
        contactsBadge.textContent = data.length;
        if (data.length > 0) {
          contactsBadge.classList.add('visible');
        } else {
          contactsBadge.classList.remove('visible');
        }
      }

      if (!data.length) { 
        emptyEl.innerHTML = `<i class="fas fa-inbox"></i> <p>No leads yet.</p>`;
        emptyEl.style.display = 'block'; 
        return; 
      }
      listEl.style.display = 'flex';
      renderMessages(listEl, data, 'contact');
    } catch {
      loadEl.style.display = 'none';
      emptyEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Network Error or Server Connection Failure.</p>`;
      emptyEl.style.display = 'block';
    }
  }

  function renderMessages(container, items, type) {
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'message-card';
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';

      card.innerHTML = `
        <div class="message-card-header">
          <div>
            <div class="message-sender">${escHtml(item.name || '')}</div>
            <div class="message-email"><a href="mailto:${escHtml(item.email||'')}">${escHtml(item.email||'')}</a></div>
          </div>
          <div class="message-date">${date}</div>
        </div>
        <div class="message-body">${escHtml(item.message || '')}</div>
        ${item.phone ? `<div class="message-phone"><i class="fas fa-phone"></i> ${escHtml(item.phone)}</div>` : ''}
        <div class="message-card-actions" style="margin-top: 12px; display: flex; justify-content: flex-end;">
          <button class="btn-delete btn-delete-msg" data-id="${item._id}" style="padding: 6px 12px; font-size: 0.8rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-trash"></i> Delete Lead
          </button>
        </div>
      `;

      // Add event listener to delete button
      const deleteBtn = card.querySelector('.btn-delete-msg');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to delete this lead?')) return;

          try {
            const res = await fetch(`/api/admin/contacts/${item._id}`, {
              method: 'DELETE',
              credentials: 'include'
            });

            if (res.ok) {
              showToast('Lead deleted successfully', 'danger');
              loadContacts();
            } else {
              showToast('Failed to delete lead', 'danger');
            }
          } catch {
            showToast('Network error. Failed to delete.', 'danger');
          }
        });
      }

      container.appendChild(card);
    });
  }

  // ── HELPERS ─────────────────────────────────
  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Toast notification
  function showToast(msg, type) {
    const toast = document.createElement('div');
    const color = type === 'success' ? '#2ecc71' : type === 'danger' ? '#e74c3c' : '#c9a84c';
    toast.style.cssText = `
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: ${color};
      color: #fff;
      padding: 12px 22px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3500);
  }

  function setFeedback(msg, type) {
    if (!projectsFeedback) return;
    projectsFeedback.textContent = msg;
    projectsFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function setSubmitLoading(loading) {
    if (!submitProjBtn) return;
    submitProjBtn.disabled = loading;
    submitProjBtn.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Saving...'
      : '<i class="fas fa-save"></i> Save Project';
  }

  // ════════════════════════════════════════════
  // CAREER MANAGEMENT
  // ════════════════════════════════════════════
  const openAddCareerBtn  = document.getElementById('openAddCareerBtn');
  const addCareerForm     = document.getElementById('addCareerForm');
  const cancelAddCareer   = document.getElementById('cancelAddCareer');
  const careerForm        = document.getElementById('careerForm');
  const careerFeedback    = document.getElementById('careerFormFeedback');
  const submitCareerBtn   = document.getElementById('submitCareerBtn');
  const adminCareersList  = document.getElementById('adminCareersList');
  const adminCareersLoad  = document.getElementById('adminCareersLoading');
  const adminCareersEmpty = document.getElementById('adminCareersEmpty');

  if (openAddCareerBtn) {
    openAddCareerBtn.addEventListener('click', () => {
      const isOpen = addCareerForm.style.display !== 'none';
      addCareerForm.style.display = isOpen ? 'none' : 'block';
      openAddCareerBtn.innerHTML = isOpen
        ? '<i class="fas fa-plus"></i> Add Career'
        : '<i class="fas fa-times"></i> Cancel';
      if (!isOpen) document.getElementById('career-title').focus();
    });
  }

  if (cancelAddCareer) {
    cancelAddCareer.addEventListener('click', () => {
      addCareerForm.style.display = 'none';
      openAddCareerBtn.innerHTML = '<i class="fas fa-plus"></i> Add Career';
      if (careerForm) careerForm.reset();
    });
  }

  if (careerForm) {
    careerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setCareerFeedback('', '');
      setCareerSubmitLoading(true);

      const title    = document.getElementById('career-title').value.trim();
      const desc     = document.getElementById('career-desc').value.trim();
      const skills   = document.getElementById('career-skills').value.trim();
      const location = document.getElementById('career-location').value.trim();
      const type     = document.getElementById('career-type').value;

      if (!title || !desc) {
        setCareerFeedback('Title and description are required.', 'error');
        setCareerSubmitLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/careers', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description: desc, skills, location, type })
        });
        const data = await res.json();

        if (res.ok) {
          setCareerFeedback('✅ Career added successfully!', 'success');
          careerForm.reset();
          addCareerForm.style.display = 'none';
          openAddCareerBtn.innerHTML = '<i class="fas fa-plus"></i> Add Career';
          loadAdminCareers();
          showToast('Career listing added successfully', 'success');
        } else {
          setCareerFeedback(data.message || 'Failed to add career.', 'error');
        }
      } catch {
        setCareerFeedback('Network error. Please try again.', 'error');
      } finally {
        setCareerSubmitLoading(false);
      }
    });
  }

  async function loadAdminCareers() {
    if (!adminCareersLoad) return;
    adminCareersLoad.style.display  = 'flex';
    adminCareersList.style.display  = 'none';
    adminCareersEmpty.style.display = 'none';

    try {
      const res  = await fetch('/api/admin/careers', { credentials: 'include' });
      const data = await res.json();
      adminCareersLoad.style.display = 'none';

      if (!data.length) {
        adminCareersEmpty.style.display = 'block';
        return;
      }
      adminCareersList.style.display = 'grid';
      renderCareerList(data);
    } catch {
      adminCareersLoad.style.display  = 'none';
      adminCareersEmpty.style.display = 'block';
    }
  }

  function renderCareerList(careers) {
    adminCareersList.innerHTML = '';
    careers.forEach(job => {
      const skills = (job.skills || []).join(', ');
      const typeLabel = { 'full-time':'Full-Time', 'part-time':'Part-Time', 'contract':'Contract', 'internship':'Internship' }[job.type] || job.type || 'Full-Time';
      const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '';

      const item = document.createElement('div');
      item.className = 'project-item';
      item.innerHTML = `
        <div class="project-item-body" style="padding: 20px;">
          <div class="project-item-category">${escHtml(typeLabel)} ${job.location ? '· ' + escHtml(job.location) : ''}</div>
          <div class="project-item-title">${escHtml(job.title)}</div>
          <div class="project-item-desc" style="margin-top:8px;">${escHtml(job.description || '')}</div>
          ${skills ? `<div style="margin-top:10px; font-size:0.82rem; color:#888;"><i class="fas fa-tools" style="color:#c9a84c;"></i> ${escHtml(skills)}</div>` : ''}
          ${postedDate ? `<div style="margin-top:6px; font-size:0.78rem; color:#666;"><i class="fas fa-calendar-alt"></i> Posted ${escHtml(postedDate)}</div>` : ''}
          <div style="margin-top:14px; display:flex; gap:8px;">
            <button class="btn-edit btn-edit-career" style="padding:6px 14px; font-size:0.82rem; background:var(--gold); color:#0a0a0f; border:none; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:6px;">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete btn-delete-career" data-id="${job._id}" style="padding:6px 14px; font-size:0.82rem; margin-top:0;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      item.querySelector('.btn-edit-career').addEventListener('click', () => {
        openEditCareerModal(job);
      });
      item.querySelector('.btn-delete-career').addEventListener('click', async () => {
        if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
        try {
          const res = await fetch(`/api/admin/careers/${job._id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            loadAdminCareers();
            showToast('Career listing deleted', 'danger');
          } else {
            showToast('Failed to delete career', 'danger');
          }
        } catch {
          showToast('Network error', 'danger');
        }
      });
      adminCareersList.appendChild(item);
    });
  }

  function setCareerFeedback(msg, type) {
    if (!careerFeedback) return;
    careerFeedback.textContent = msg;
    careerFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function setCareerSubmitLoading(loading) {
    if (!submitCareerBtn) return;
    submitCareerBtn.disabled = loading;
    submitCareerBtn.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Saving...'
      : '<i class="fas fa-save"></i> Save Career';
  }

  // ── EDIT CAREER MODAL ──────────────────────────
  const editCareerModal    = document.getElementById('editCareerModal');
  const editCareerForm     = document.getElementById('editCareerForm');
  const editCareerId       = document.getElementById('edit-career-id');
  const editCareerTitle    = document.getElementById('edit-career-title');
  const editCareerType     = document.getElementById('edit-career-type');
  const editCareerLocation = document.getElementById('edit-career-location');
  const editCareerDesc     = document.getElementById('edit-career-desc');
  const editCareerSkills   = document.getElementById('edit-career-skills');
  const editCareerFeedback = document.getElementById('editCareerFeedback');
  const saveEditCareerBtn  = document.getElementById('saveEditCareerBtn');
  const cancelEditCareer   = document.getElementById('cancelEditCareerBtn');

  function openEditCareerModal(job) {
    editCareerId.value       = job._id;
    editCareerTitle.value    = job.title || '';
    editCareerType.value     = job.type  || 'full-time';
    editCareerLocation.value = job.location || '';
    editCareerDesc.value     = job.description || '';
    // skills may be array from backend
    const skillsArr = Array.isArray(job.skills) ? job.skills : (job.skills ? [job.skills] : []);
    editCareerSkills.value   = skillsArr.join(', ');
    setEditCareerFeedback('', '');
    if (editCareerModal) editCareerModal.style.display = 'flex';
  }

  function setEditCareerFeedback(msg, type) {
    if (!editCareerFeedback) return;
    editCareerFeedback.textContent = msg;
    editCareerFeedback.className   = `form-feedback${type ? ' ' + type : ''}`;
  }

  function setEditCareerSubmitLoading(loading) {
    if (!saveEditCareerBtn) return;
    saveEditCareerBtn.disabled = loading;
    saveEditCareerBtn.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Saving...'
      : '<i class="fas fa-save"></i> Save Changes';
  }

  if (cancelEditCareer) {
    cancelEditCareer.addEventListener('click', () => {
      if (editCareerModal) editCareerModal.style.display = 'none';
    });
  }

  if (editCareerForm) {
    editCareerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setEditCareerFeedback('', '');

      const title = editCareerTitle.value.trim();
      const desc  = editCareerDesc.value.trim();
      if (!title || !desc) {
        setEditCareerFeedback('Title and description are required.', 'error');
        return;
      }

      setEditCareerSubmitLoading(true);
      try {
        const id = editCareerId.value;
        const res = await fetch(`/api/admin/careers/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: desc,
            skills: editCareerSkills.value.trim(),
            location: editCareerLocation.value.trim(),
            type: editCareerType.value
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Career updated successfully', 'success');
          if (editCareerModal) editCareerModal.style.display = 'none';
          loadAdminCareers();
        } else {
          setEditCareerFeedback(data.message || 'Failed to update career.', 'error');
        }
      } catch {
        setEditCareerFeedback('Network error. Please try again.', 'error');
      } finally {
        setEditCareerSubmitLoading(false);
      }
    });
  }

  // ════════════════════════════════════════════
  // REVIEWS
  // ════════════════════════════════════════════
  document.getElementById('refreshReviewsBtn')?.addEventListener('click', loadReviews);

  async function loadReviews() {
    const loadEl  = document.getElementById('reviewsLoading');
    const listEl  = document.getElementById('reviewsList');
    const emptyEl = document.getElementById('reviewsEmpty');

    if (!loadEl || !listEl || !emptyEl) return;

    loadEl.style.display  = 'flex';
    listEl.style.display  = 'none';
    emptyEl.style.display = 'none';

    try {
      const res  = await fetch('/api/admin/reviews', { credentials: 'include' });
      const data = await res.json();
      loadEl.style.display = 'none';

      if (!res.ok) {
        showToast(data.message || 'Failed to load reviews', 'danger');
        emptyEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Error: ${escHtml(data.message || 'Failed to load reviews')}</p>`;
        emptyEl.style.display = 'block';
        return;
      }

      if (!data.length) { 
        emptyEl.innerHTML = `<i class="far fa-comments"></i> <p>No reviews yet.</p>`;
        emptyEl.style.display = 'block'; 
        return; 
      }
      
      listEl.style.display = 'flex';
      renderReviews(listEl, data);
    } catch {
      loadEl.style.display = 'none';
      emptyEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> <p>Network Error or Server Connection Failure.</p>`;
      emptyEl.style.display = 'block';
    }
  }

  function renderReviews(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'message-card';
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';

      const starHtml = Array.from({ length: 5 }, (_, i) => 
        `<i class="${i < item.rating ? 'fas' : 'far'} fa-star" style="color:#f39c12; font-size: 0.9rem;"></i>`
      ).join('');

      card.innerHTML = `
        <div class="message-card-header">
          <div>
            <div class="message-sender" style="display:flex; align-items:center; gap:10px;">
              <span>${escHtml(item.name || '')}</span>
              <div style="display:flex; gap:2px;">${starHtml}</div>
            </div>
          </div>
          <div class="message-date">${date}</div>
        </div>
        <div class="message-body">"${escHtml(item.comment || '')}"</div>
        <div class="message-card-actions" style="margin-top: 12px; display: flex; justify-content: flex-end;">
          <button class="btn-delete btn-delete-rev" data-id="${item._id}" style="padding: 6px 12px; font-size: 0.8rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-trash"></i> Delete Review
          </button>
        </div>
      `;

      const deleteBtn = card.querySelector('.btn-delete-rev');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to delete this review?')) return;

          try {
            const res = await fetch(`/api/admin/reviews/${item._id}`, {
              method: 'DELETE',
              credentials: 'include'
            });

            if (res.ok) {
              showToast('Review deleted successfully', 'danger');
              loadReviews();
            } else {
              showToast('Failed to delete review', 'danger');
            }
          } catch {
            showToast('Network error. Failed to delete.', 'danger');
          }
        });
      }

      container.appendChild(card);
    });
  }

  // ── INIT ────────────────────────────────────
  verifyAuth();

})();
