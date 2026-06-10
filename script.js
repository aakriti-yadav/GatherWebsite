
/* Show a temporary notification toast */
function showNotification(message, type) {
  const note = document.createElement('div');
  note.className = 'notification' + (type === 'error' ? ' error' : '');
  note.textContent = message;
  document.body.appendChild(note);
  requestAnimationFrame(() => note.classList.add('show'));
  setTimeout(() => {
    note.classList.remove('show');
    setTimeout(() => note.remove(), 400);
  }, 3000);
}

/* Dark mode toggle */
function initDarkMode() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  if (localStorage.getItem('gather_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    btn.textContent = '☀';
  }
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('gather_theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀' : '🌙';
  });
}

/* Highlight the active nav link based on current page */
function highlightActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page) {
      link.classList.add('active');
    }
  });
}

/* Set minimum date on booking form to today */
function setMinBookingDate() {
  const dateInput = document.getElementById('bookingDate');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* Booking form with localStorage */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const list = document.getElementById('bookingList');

  function renderBookings() {
    const bookings = JSON.parse(localStorage.getItem('gather_bookings') || '[]');
    if (!list) return;
    if (bookings.length === 0) {
      list.innerHTML = '<p class="text-muted-soft">No bookings yet. Be the first to book a space!</p>';
      return;
    }
    list.innerHTML = bookings.slice(-5).reverse().map(b => `
      <div class="glass-card mb-3">
        <h5>${b.zone}</h5>
        <p class="mb-1"><strong>${b.name}</strong> · ${b.email}</p>
        <p class="mb-0 text-muted-soft">${b.date} at ${b.time}</p>
      </div>
    `).join('');
  }
  renderBookings();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = form.studentName.value.trim();
    const email = form.studentEmail.value.trim();
    const zone  = form.zone.value;
    const date  = form.date.value;
    const time  = form.time.value;

    if (!name || !email || !zone || !date || !time) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    const bookings = JSON.parse(localStorage.getItem('gather_bookings') || '[]');
    bookings.push({ name, email, zone, date, time });
    localStorage.setItem('gather_bookings', JSON.stringify(bookings));

    showNotification('Booking confirmed! See you soon.');
    form.reset();
    renderBookings();
  });
}

/* Contact form validation */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      showNotification('All fields are required.', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showNotification('Please enter a valid email.', 'error');
      return;
    }
    if (message.length < 10) {
      showNotification('Message should be at least 10 characters.', 'error');
      return;
    }
    showNotification('Thanks ' + name + '! We\'ll reply soon.');
    form.reset();
  });
}

/* Event countdown to next Friday 6pm */
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date();
  target.setDate(target.getDate() + ((5 - target.getDay() + 7) % 7 || 7));
  target.setHours(18, 0, 0, 0);

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) { el.textContent = 'Event is live!'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
  }
  tick();
  setInterval(tick, 1000);
}

/* Event search and category filter with no-results message */
function initEventFilter() {
  const search    = document.getElementById('eventSearch');
  const filter    = document.getElementById('eventFilter');
  const items     = document.querySelectorAll('.event-item');
  const noResults = document.getElementById('noResults');
  if (!items.length) return;

  function applyFilter() {
    const q   = search ? search.value.toLowerCase().trim() : '';
    const cat = filter ? filter.value : 'all';
    let visible = 0;

    items.forEach(item => {
      const name     = (item.dataset.name || '').toLowerCase();
      const desc     = (item.dataset.desc || '').toLowerCase();
      const itemCat  = item.dataset.category || '';
      const matchText = name.includes(q) || desc.includes(q);
      const matchCat  = cat === 'all' || itemCat === cat;
      const show      = matchText && matchCat;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  if (search) search.addEventListener('input', applyFilter);
  if (filter) filter.addEventListener('change', applyFilter);
}

/* Events modal — populate from button data attributes */
function initEventModal() {
  const modalEl = document.getElementById('eventModal');
  if (!modalEl) return;

  const bsModal = new bootstrap.Modal(modalEl);

  document.querySelectorAll('.event-info-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('evtTitle').textContent = btn.dataset.title || '';
      document.getElementById('evtDesc').textContent  = btn.dataset.desc  || '';
      document.getElementById('evtTime').textContent  = btn.dataset.time  || '';
      document.getElementById('evtLocation').textContent  = btn.dataset.location  || '';
      document.getElementById('evtExtra').textContent  = btn.dataset.extra  || '';
      bsModal.show();
    });
  });
}

/*  Scroll reveal for .reveal and .stagger-children  */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .stagger-children');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

/* ── Animated stat counters ── */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* Ripple on buttons  */
function initRipple() {
  document.querySelectorAll('.btn-pastel, .btn-outline-pastel').forEach(btn => {
    btn.addEventListener('click', function(e) {
      this.classList.remove('ripple');
      void this.offsetWidth; // force reflow
      this.classList.add('ripple');
      setTimeout(() => this.classList.remove('ripple'), 600);
    });
  });
}

/* Boot everything when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  highlightActiveNav();
  setMinBookingDate();
  initBookingForm();
  initContactForm();
  initCountdown();
  initEventFilter();
  initEventModal();
  initScrollReveal();
  initStatCounters();
  initRipple();
});
