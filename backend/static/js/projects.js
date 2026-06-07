/* ═══════════════════════════════════════════════
   ELYSA CONSULTANTS — PROJECTS JS
   Fetch projects from API, render grid, lightbox.
   Subscribes to SSE stream — auto-refreshes when
   admin adds or deletes projects in real time.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const API_BASE    = '/api/projects';
  const STREAM_URL  = '/api/admin/projects/stream';

  // ── STATIC FALLBACK PROJECTS ──────────────────
  // Shown only if no projects exist in the database yet.
  const FALLBACK_PROJECTS = [
    {
      _id: 'static-1',
      title: 'Residential House In Kashmir',
      description: 'Modern residential architecture with elegant elevation and luxury living spaces.',
      category: 'Residential',
      images: [
        '/static/images/house1.jpg',
        '/static/images/house2.jpg',
        '/static/images/house3.jpg',
        '/static/images/house4.jpg',
        '/static/images/house5.jpg',
        '/static/images/house6.jpg',
        '/static/images/house7.jpg',
        '/static/images/house8.jpg'
      ]
    },
    {
      _id: 'static-2',
      title: 'Showroom Building',
      description: 'Elegant showroom architecture designed for premium retail and customer experience.',
      category: 'Commercial',
      images: [
        '/static/images/showroom1.jpg',
        '/static/images/showroom2.jpg'
      ]
    },
    {
      _id: 'static-3',
      title: 'Commercial Building At Kashmir',
      description: 'Modern commercial infrastructure with advanced planning and professional construction design.',
      category: 'Commercial',
      images: [
        '/static/images/commercial1.jpg',
        '/static/images/commercial2.jpg',
        '/static/images/commercial3.jpg',
        '/static/images/commercial4.jpg',
        '/static/images/commercial5.jpg',
        '/static/images/commercial6.jpg',
        '/static/images/commercial7.jpg',
        '/static/images/mall1.jpg'
      ]
    },
    {
      _id: 'static-4',
      title: 'Residential Flats and Malls At Bangalore',
      description: 'Premium residential apartment project designed with modern architecture, luxury interiors, and high-end urban living.',
      category: 'Residential',
      images: [
        '/static/images/resbang.jpg',
        '/static/images/resbang2.jpg',
        '/static/images/resbang3.jpg',
        '/static/images/resbang4.jpg',
        '/static/images/resbang5.jpg',
        '/static/images/resbang6.jpg'
      ]
    }
  ];

  // ── STATE ─────────────────────────────────────
  let allProjects      = [];
  let usingFallback    = false;   // true when showing static projects (no DB data)
  let lightboxProject  = null;
  let currentImageIndex = 0;
  let sseSource        = null;    // EventSource reference
  let currentFilter    = 'all';
  let currentSort      = 'newest';

  // ── ELEMENTS ──────────────────────────────────
  const loadingEl  = document.getElementById('projectsLoading');
  const emptyEl    = document.getElementById('projectsEmpty');
  const gridEl     = document.getElementById('projectsGrid');
  const lightbox   = document.getElementById('lightbox');
  const lbOverlay  = document.getElementById('lightboxOverlay');
  const lbClose    = document.getElementById('lightboxClose');
  const lbImg      = document.getElementById('lightboxImg');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  const lbTitle    = document.getElementById('lightboxTitle');
  const lbDesc     = document.getElementById('lightboxDesc');
  const lbCategory = document.getElementById('lightboxCategory');
  const lbThumbs   = document.getElementById('lightboxThumbs');
  const lbCounter  = document.getElementById('lightboxCounter');

  // ── LIVE UPDATE BANNER ────────────────────────
  let updateBanner = null;

  function createUpdateBanner() {
    if (updateBanner) return;
    updateBanner = document.createElement('div');
    updateBanner.id = 'liveUpdateBanner';
    updateBanner.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #c9a84c, #a07a30);
      color: #0a0a0f;
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 0.88rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 8px 24px rgba(201,168,76,0.4);
      z-index: 9999;
      display: none;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      white-space: nowrap;
    `;
    updateBanner.innerHTML = `
      <i class="fas fa-sync-alt" style="animation: spin 1s linear infinite;"></i>
      <span>Projects updated — click to refresh</span>
    `;
    // Add spin animation
    if (!document.getElementById('spin-style')) {
      const style = document.createElement('style');
      style.id = 'spin-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }
    updateBanner.addEventListener('click', () => {
      updateBanner.style.display = 'none';
      reloadProjects();
    });
    document.body.appendChild(updateBanner);
  }

  function showUpdateBanner() {
    createUpdateBanner();
    updateBanner.style.display = 'flex';
    // Auto-reload after 3 seconds
    setTimeout(() => {
      if (updateBanner.style.display !== 'none') {
        updateBanner.style.display = 'none';
        reloadProjects();
      }
    }, 3000);
  }

  // ── FETCH PROJECTS ────────────────────────────
  async function loadProjects(silent = false) {
    if (!silent) {
      loadingEl.style.display  = 'flex';
      gridEl.style.display     = 'none';
      emptyEl.style.display    = 'none';
    }

    try {
      const res  = await fetch(API_BASE);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      if (data.length > 0) {
        allProjects   = data;
        usingFallback = false;
      } else {
        allProjects   = FALLBACK_PROJECTS;
        usingFallback = true;
      }
    } catch {
      if (!usingFallback) {
        allProjects   = FALLBACK_PROJECTS;
        usingFallback = true;
      }
    }

    if (!silent) {
      loadingEl.style.display = 'none';
    }

    applyFilterAndSort();
  }

  async function reloadProjects() {
    // Silent reload — keeps grid visible, just swaps content
    try {
      const res  = await fetch(API_BASE);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.length > 0) {
        allProjects   = data;
        usingFallback = false;
        applyFilterAndSort();
      } else {
        allProjects   = FALLBACK_PROJECTS;
        usingFallback = true;
        applyFilterAndSort();
      }
    } catch { /* keep showing what we have */ }
  }

  // ── RENDER GRID ───────────────────────────────
  function renderGrid(projects) {
    // Animate out old cards
    const existingCards = gridEl.querySelectorAll('.project-card');
    existingCards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(8px)'; });

    setTimeout(() => {
      gridEl.innerHTML = '';
      projects.forEach((project, idx) => {
        const card = createProjectCard(project, idx);
        gridEl.appendChild(card);
        // Stagger fade-in
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          }, idx * 60);
        });
      });
    }, existingCards.length ? 200 : 0);
  }

  function createProjectCard(project, idx) {
    const images = project.images || [];
    const thumb  = images[0] || '';
    const count  = images.length;

    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View project: ${project.title}`);
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(12px)';
    card.dataset.id = project._id;

    card.innerHTML = `
      <div class="project-card-img">
        ${thumb ? `<img src="${escHtml(thumb)}" alt="${escHtml(project.title)}" loading="lazy" />` : ''}
        <div class="project-card-overlay">
          <div class="view-btn"><i class="fas fa-expand"></i></div>
        </div>
      </div>
      <div class="project-card-body">
        <span class="project-card-category">${escHtml(project.category || 'Project')}</span>
        <h3 class="project-card-title">${escHtml(project.title)}</h3>
        <p class="project-card-desc">${escHtml(project.description || '')}</p>
        <div class="project-card-count">
          <i class="fas fa-images"></i> ${count} image${count !== 1 ? 's' : ''}
        </div>
      </div>
    `;

    card.addEventListener('click',   () => openLightbox(project));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(project); }
    });

    return card;
  }

  // ── LIGHTBOX ──────────────────────────────────
  function openLightbox(project) {
    lightboxProject   = project;
    currentImageIndex = 0;
    updateLightboxUI();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    lightboxProject = null;
  }

  function updateLightboxUI() {
    if (!lightboxProject) return;
    const images = lightboxProject.images || [];
    const total  = images.length;
    const img    = images[currentImageIndex] || '';

    lbImg.src               = img;
    lbImg.alt               = lightboxProject.title;
    lbTitle.textContent     = lightboxProject.title;
    lbDesc.textContent      = lightboxProject.description || '';
    lbCategory.textContent  = lightboxProject.category || '';
    lbCounter.textContent   = `${currentImageIndex + 1} / ${total}`;

    lbThumbs.innerHTML = '';
    images.forEach((src, i) => {
      const thumb = document.createElement('img');
      thumb.src       = src;
      thumb.alt       = `Image ${i + 1}`;
      thumb.className = `lightbox-thumb${i === currentImageIndex ? ' active' : ''}`;
      thumb.loading   = 'lazy';
      thumb.addEventListener('click', () => { currentImageIndex = i; updateLightboxUI(); });
      lbThumbs.appendChild(thumb);
    });
  }

  function prevImage() {
    if (!lightboxProject) return;
    const total = (lightboxProject.images || []).length;
    currentImageIndex = (currentImageIndex - 1 + total) % total;
    updateLightboxUI();
  }

  function nextImage() {
    if (!lightboxProject) return;
    const total = (lightboxProject.images || []).length;
    currentImageIndex = (currentImageIndex + 1) % total;
    updateLightboxUI();
  }

  // ── LIGHTBOX EVENTS ───────────────────────────
  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
  if (lbPrev)    lbPrev.addEventListener('click', prevImage);
  if (lbNext)    lbNext.addEventListener('click', nextImage);

  document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.style.display === 'none') return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // ── SERVER-SENT EVENTS (Real-time updates) ────
  function connectSSE() {
    if (sseSource) {
      sseSource.close();
    }

    try {
      sseSource = new EventSource(STREAM_URL);

      sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // If projects changed, show banner and auto-reload
          if (data.changed === true) {
            // If lightbox is open, close it first
            if (lightbox && lightbox.style.display !== 'none') {
              closeLightbox();
            }
            showUpdateBanner();
          }
        } catch { /* ignore parse errors */ }
      };

      sseSource.onerror = () => {
        // Connection dropped — fall back to polling
        sseSource.close();
        sseSource = null;
        startPollingFallback();
      };

    } catch {
      // Browser doesn't support SSE — use polling
      startPollingFallback();
    }
  }

  // ── POLLING FALLBACK (if SSE not supported) ───
  let pollTimer = null;

  function startPollingFallback() {
    if (pollTimer) return;
    let lastCount = allProjects.filter(p => !p._id.startsWith('static-')).length;

    pollTimer = setInterval(async () => {
      try {
        const res  = await fetch(API_BASE);
        if (!res.ok) return;
        const data = await res.json();
        if (data.length !== lastCount) {
          lastCount = data.length;
          showUpdateBanner();
        }
      } catch { /* ignore */ }
    }, 15000); // poll every 15 seconds as fallback
  }

  // ── CLEANUP on page unload ────────────────────
  window.addEventListener('beforeunload', () => {
    if (sseSource) sseSource.close();
    if (pollTimer) clearInterval(pollTimer);
  });

  // ── HELPERS ───────────────────────────────────
  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function applyFilterAndSort() {
    let filtered = [...allProjects];
    
    // 1. Filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    // 2. Sort
    if (currentSort === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // newest first
      });
    } else if (currentSort === 'oldest') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB; // oldest first
      });
    } else if (currentSort === 'name-asc') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (currentSort === 'name-desc') {
      filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    
    if (filtered.length === 0) {
      gridEl.style.display  = 'none';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      gridEl.style.display  = 'grid';
      renderGrid(filtered);
    }
  }

  // ── CONTROLS SETUP ────────────────────────────
  function setupControls() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('projectsSort');

    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.classList.remove('active');
            b.style.border = '1px solid #333';
            b.style.background = 'transparent';
            b.style.color = '#aaa';
          });
          btn.classList.add('active');
          btn.style.border = '1px solid #c9a84c';
          btn.style.background = 'rgba(201,168,76,0.1)';
          btn.style.color = '#c9a84c';

          currentFilter = btn.dataset.filter;
          applyFilterAndSort();
        });

        btn.addEventListener('mouseenter', () => {
          if (!btn.classList.contains('active')) {
            btn.style.borderColor = '#c9a84c';
            btn.style.color = '#c9a84c';
          }
        });
        btn.addEventListener('mouseleave', () => {
          if (!btn.classList.contains('active')) {
            btn.style.borderColor = '#333';
            btn.style.color = '#aaa';
          }
        });
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilterAndSort();
      });
      sortSelect.addEventListener('focus', () => sortSelect.style.borderColor = '#c9a84c');
      sortSelect.addEventListener('blur', () => sortSelect.style.borderColor = '#333');
    }
  }

  // ── INIT ──────────────────────────────────────
  setupControls();
  loadProjects();
  connectSSE();   // Subscribe to real-time project changes

})();
