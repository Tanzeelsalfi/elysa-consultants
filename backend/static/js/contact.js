/* ═══════════════════════════════════════════════
   ELYSA CONSULTANTS — CONTACT PAGE JS
   Form validation + API submission
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const form          = document.getElementById('contactForm');
  const submitBtn     = document.getElementById('contactSubmitBtn');
  const btnText       = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoading    = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
  const formSuccess   = document.getElementById('formSuccess');
  const errorBanner   = document.getElementById('formErrorBanner');
  const errorText     = document.getElementById('formErrorText');
  const sendAnother   = document.getElementById('sendAnotherBtn');
  const charCountEl   = document.getElementById('charCount');
  const messageInput  = document.getElementById('contact-message');
  const phoneInput    = document.getElementById('contact-phone');

  // ── CHARACTER COUNTER ─────────────────────────
  if (messageInput && charCountEl) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCountEl.textContent = `${len} / 2000`;
      charCountEl.style.color = len > 1800 ? '#e74c3c' : '';
    });
  }

  // ── PHONE NUMBER INPUT RESTRICTION ────────────
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 10) {
        val = val.substring(0, 10);
      }
      e.target.value = val;
    });
  }

  // ── FIELD VALIDATION ─────────────────────────
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function showFieldError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (err)   err.textContent = msg;
  }

  function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (err)   err.textContent = '';
  }

  function clearAllErrors() {
    ['contact-name', 'contact-email', 'contact-phone', 'contact-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
    ['name-error', 'email-error', 'phone-error', 'message-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    if (errorBanner) errorBanner.style.display = 'none';
  }

  // Live validation
  ['contact-name', 'contact-email', 'contact-phone', 'contact-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const errId = id.replace('contact-', '') + '-error';
        clearFieldError(id, errId);
      });
    }
  });

  // ── FORM SUBMIT ───────────────────────────────
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      const name        = document.getElementById('contact-name').value.trim();
      const email       = document.getElementById('contact-email').value.trim();
      const phoneDigits = document.getElementById('contact-phone').value.trim();
      const countryCode = document.getElementById('contact-country-code').value;
      const message     = document.getElementById('contact-message').value.trim();

      // Client-side validation
      let hasErrors = false;

      if (!name) {
        showFieldError('contact-name', 'name-error', 'Please enter your name.');
        hasErrors = true;
      }

      if (!email) {
        showFieldError('contact-email', 'email-error', 'Please enter your email address.');
        hasErrors = true;
      } else if (!isValidEmail(email)) {
        showFieldError('contact-email', 'email-error', 'Please enter a valid email address.');
        hasErrors = true;
      }

      if (!message) {
        showFieldError('contact-message', 'message-error', 'Please enter your message.');
        hasErrors = true;
      } else if (message.length < 10) {
        showFieldError('contact-message', 'message-error', 'Message is too short (minimum 10 characters).');
        hasErrors = true;
      }

      if (phoneDigits) {
        if (phoneDigits.length !== 10) {
          showFieldError('contact-phone', 'phone-error', 'Phone number must be exactly 10 digits.');
          hasErrors = true;
        }
      }

      if (hasErrors) return;

      const phone = phoneDigits ? `${countryCode} ${phoneDigits}` : '';

      // Show loading
      setLoading(true);

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message })
        });

        const data = await res.json();

        if (res.ok) {
          // Show success
          form.style.display = 'none';
          if (formSuccess) formSuccess.style.display = 'block';
        } else {
          showErrorBanner(data.message || 'Something went wrong. Please try again.');
        }

      } catch (err) {
        showErrorBanner('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    });
  }

  // ── SEND ANOTHER ──────────────────────────────
  if (sendAnother) {
    sendAnother.addEventListener('click', () => {
      if (form) {
        form.reset();
        form.style.display = 'block';
        if (charCountEl) charCountEl.textContent = '0 / 2000';
      }
      if (formSuccess) formSuccess.style.display = 'none';
    });
  }

  // ── HELPERS ───────────────────────────────────
  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText)    btnText.style.display    = loading ? 'none' : '';
    if (btnLoading) btnLoading.style.display = loading ? '' : 'none';
  }

  function showErrorBanner(msg) {
    if (errorBanner) {
      errorBanner.style.display = 'flex';
      if (errorText) errorText.textContent = msg;
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

})();
