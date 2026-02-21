/* =========================================================
   TIJWAAL – SHARED JAVASCRIPT UTILITIES
   ========================================================= */

// ── Sidebar Toggle ───────────────────────────────────────
function initSidebar() {
  const sidebar  = document.querySelector('.sidebar');
  const toggle   = document.getElementById('sidebarToggle');
  const overlay  = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  function open()  { sidebar.classList.add('open'); overlay && overlay.classList.add('open'); }
  function close() { sidebar.classList.remove('open'); overlay && overlay.classList.remove('open'); }

  toggle  && toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);

  // Active nav link highlight
  const links = sidebar.querySelectorAll('.nav-link');
  const current = window.location.pathname.split('/').pop();
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && href.split('/').pop() === current) link.classList.add('active');
  });
}

// ── Modal Helpers ────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
function initModals() {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  // Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
  // Open triggers
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
}

// ── Toast Notification ───────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
      display:flex; flex-direction:column; gap:0.5rem; pointer-events:none;
    `;
    document.body.appendChild(container);
  }
  const colors = { success: '#22C55E', danger: '#EF4444', warning: '#F59E0B', info: '#D4A843' };
  const icons  = { success: '✓', danger: '✕', warning: '⚠', info: 'ℹ' };
  const toast  = document.createElement('div');
  toast.style.cssText = `
    background:#0F1628; border:1px solid ${colors[type]}44; color:#F0F4FF;
    padding:0.75rem 1.25rem; border-radius:10px; font-size:0.88rem;
    display:flex; align-items:center; gap:0.5rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
    animation:slideIn 0.3s ease; pointer-events:all;
  `;
  toast.innerHTML = `<span style="color:${colors[type]};font-weight:700;">${icons[type]}</span> ${message}`;
  container.appendChild(toast);
  const style = document.createElement('style');
  style.textContent = `@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(style);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ── Search / Filter Table ───────────────────────────────
function initTableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── OTP Input Behaviour ──────────────────────────────────
function initOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && i > 0) inputs[i - 1].focus();
    });
  });
}

// ── Step Wizard ──────────────────────────────────────────
function initWizard() {
  let current = 0;
  const steps  = document.querySelectorAll('.wizard-step');
  const dots   = document.querySelectorAll('.step-dot');
  const lines  = document.querySelectorAll('.step-line');

  function show(n) {
    steps.forEach((s, i) => s.style.display = i === n ? 'block' : 'none');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === n);
      d.classList.toggle('done',   i < n);
      d.textContent = i < n ? '✓' : i + 1;
    });
    lines.forEach((l, i) => l.classList.toggle('done', i < n));
    current = n;
  }

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => { if (current < steps.length - 1) show(current + 1); });
  });
  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => { if (current > 0) show(current - 1); });
  });

  if (steps.length) show(0);
}

// ── Charts (Chart.js wrappers) ───────────────────────────
function createLineChart(canvasId, labels, data, label = 'Value') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: '#D4A843',
        backgroundColor: 'rgba(212,168,67,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#D4A843',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8A9CC4' } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8A9CC4' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8A9CC4' } }
      }
    }
  });
}

function createBarChart(canvasId, labels, data, label = 'Count') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: [
          'rgba(212,168,67,0.7)', 'rgba(45,212,191,0.7)',
          'rgba(212,168,67,0.5)', 'rgba(45,212,191,0.5)',
          'rgba(212,168,67,0.4)', 'rgba(45,212,191,0.4)',
        ],
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8A9CC4' } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8A9CC4' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8A9CC4' } }
      }
    }
  });
}

function createDoughnutChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: ['#D4A843','#2DD4BF','#8B5CF6','#EF4444'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      cutout: '72%',
      plugins: { legend: { labels: { color: '#8A9CC4', padding: 16 } } }
    }
  });
}

// ── On DOM Ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initModals();
  initOTP();
  initWizard();
});
