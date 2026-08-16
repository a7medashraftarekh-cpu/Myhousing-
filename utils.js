// ============================================
// UTILS - XSS Protection, Rate Limiting, Helpers
// ============================================

// ===== HTTPS ENFORCEMENT =====
(function enforceHTTPS() {
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
})();

// ===== XSS SANITIZATION =====
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') return String(text);
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return escapeHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const clean = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clean[key] = sanitizeObject(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

// ===== RATE LIMITING =====
function checkRateLimit(action, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const key = 'rateLimit_' + action;
  const now = Date.now();
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { count: 0, firstAttempt: 0 };

  if (now - data.firstAttempt > windowMs) {
    data.count = 0;
    data.firstAttempt = now;
  }

  if (data.count >= maxAttempts) {
    const remaining = Math.ceil((windowMs - (now - data.firstAttempt)) / 60000);
    throw new Error('محاولات كتيرة. جرب تاني بعد ' + remaining + ' دقيقة.');
  }

  data.count++;
  localStorage.setItem(key, JSON.stringify(data));
  return true;
}

function resetRateLimit(action) {
  localStorage.removeItem('rateLimit_' + action);
}

// ===== PASSWORD STRENGTH =====
function checkPasswordStrength(password) {
  let score = 0;
  const checks = [
    { test: p => p.length >= 8, msg: '8 أحرف على الأقل' },
    { test: p => p.length >= 12, msg: '12 حرف (ممتاز)' },
    { test: p => /[A-Z]/.test(p), msg: 'حرف كبير' },
    { test: p => /[a-z]/.test(p), msg: 'حرف صغير' },
    { test: p => /[0-9]/.test(p), msg: 'رقم' },
    { test: p => /[^A-Za-z0-9]/.test(p), msg: 'رمز خاص (!@#$...)' }
  ];

  checks.forEach(c => { if (c.test(password)) score++; });

  let strength = 'ضعيفة جداً';
  let color = '#dc3545';
  if (score >= 5) { strength = 'قوية جداً'; color = '#198754'; }
  else if (score >= 4) { strength = 'قوية'; color = '#0d6efd'; }
  else if (score >= 3) { strength = 'متوسطة'; color = '#ffc107'; }
  else if (score >= 2) { strength = 'ضعيفة'; color = '#fd7e14'; }

  return { score, strength, color, checks };
}

// ===== UI HELPERS =====
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function hideErrors() {
  document.querySelectorAll('.error-msg').forEach(e => {
    e.textContent = '';
    e.style.display = 'none';
  });
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || btn.textContent;
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); padding:14px 28px; border-radius:10px; color:#fff; font-weight:600; z-index:9999; animation:fadeInDown 0.3s; direction:rtl;';
  toast.style.background = type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ===== VALIDATION =====
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^01[0-9]{9}$/.test(phone);
}

function validateRequired(value, fieldName) {
  if (!value || value.trim().length === 0) {
    throw new Error(fieldName + ' مطلوب');
  }
}

// ===== NAVBAR HELPERS =====
async function updateNavbar() {
  const user = auth.currentUser;
  const authLink = document.getElementById('authLink');
  const userMenu = document.getElementById('userMenu');
  const userAvatar = document.getElementById('userAvatar');

  if (!authLink && !userMenu) return;

  if (user) {
    const snap = await db.ref('users/' + user.uid).get();
    const data = snap.val() || {};
    if (authLink) authLink.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'block';
      if (userAvatar) userAvatar.src = data.avatar || 'https://ui-avatars.com/api/?name=User&background=random';
    }
  } else {
    if (authLink) {
      authLink.style.display = 'inline-block';
      authLink.textContent = 'تسجيل الدخول';
      authLink.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
    }
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(d => {
    if (!d.contains(e.target) && !e.target.closest('.user-menu')) {
      d.classList.remove('show');
    }
  });
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInDown {
    from { opacity:0; transform:translate(-50%, -20px); }
    to { opacity:1; transform:translate(-50%, 0); }
  }
`;
document.head.appendChild(style);
