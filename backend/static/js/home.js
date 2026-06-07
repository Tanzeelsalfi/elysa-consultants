/* ═══════════════════════════════════════════════
   ELYSA CONSULTANTS — HOME PAGE JS
   Dynamically fetches team members from API and
   initializes the slider.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const teamSlider = document.getElementById('teamSlider');
  const teamDots   = document.getElementById('teamDots');
  const prevBtn    = document.getElementById('teamPrev');
  const nextBtn    = document.getElementById('teamNext');

  if (!teamSlider) return;

  async function loadTeam() {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error();
      const team = await res.json();
      
      if (team && team.length > 0) {
        renderTeam(team);
        initializeSlider();
      } else {
        // Fall back to slider on hardcoded markup if API is empty
        initializeSlider();
      }
    } catch {
      // Fall back to slider on hardcoded markup on network errors
      initializeSlider();
    }
  }

  function renderTeam(team) {
    teamSlider.innerHTML = '';
    teamDots.innerHTML = '';

    team.forEach((member, i) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.dataset.index = i;
      
      const photo = member.photo || '';
      
      card.innerHTML = `
        <div class="team-avatar">
          ${photo ? `<img src="${escHtml(photo)}" alt="${escHtml(member.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
          <div class="avatar-fallback" style="${photo ? 'display:none;' : ''}"><i class="fas fa-user"></i></div>
        </div>
        <div class="team-info">
          <h3>${escHtml(member.name)}</h3>
          <p class="team-position">${escHtml(member.position || '')}</p>
          <span class="team-spec">${escHtml(member.spec || '')}</span>
        </div>
      `;
      teamSlider.appendChild(card);

      // Create slider dot
      const dot = document.createElement('span');
      dot.className = `dot${i === 0 ? ' active' : ''}`;
      dot.dataset.index = i;
      teamDots.appendChild(dot);
    });
  }

  function initializeSlider() {
    const cards = teamSlider.querySelectorAll('.team-card');
    const dots  = teamDots ? teamDots.querySelectorAll('.dot') : [];
    
    if (cards.length === 0) return;
    
    let current = 0;
    let autoTimer;

    function goTo(idx) {
      current = (idx + cards.length) % cards.length;
      teamSlider.scrollTo({ left: teamSlider.offsetWidth * current, behavior: 'smooth' });
      if (dots.length > 0) {
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        clearTimeout(autoTimer);
        goTo(current - 1);
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearTimeout(autoTimer);
        goTo(current + 1);
        startAuto();
      });
    }

    if (dots.length > 0) {
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          clearTimeout(autoTimer);
          goTo(Number(dot.dataset.index));
          startAuto();
        });
      });
    }

    function startAuto() {
      autoTimer = setTimeout(() => { goTo(current + 1); startAuto(); }, 5000);
    }

    startAuto();
  }

  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Init
  loadTeam();

})();
