/* ═════════════════════════════════════════════════════════════════════
   RENTCAN SHARED APPLICATION SERVICES & UTILITIES
   ═════════════════════════════════════════════════════════════════════ */

/** Escape user/DB text before inserting into HTML (XSS-safe). */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Map free-text repair categories to schema enum values. */
function mapMaintenanceCategory(label) {
  const s = String(label || '').toLowerCase();
  if (s.includes('plumb') || s.includes('water') || s.includes('leak')) return 'plumbing';
  if (s.includes('electric') || s.includes('power')) return 'electrical';
  if (s.includes('ac') || s.includes('appliance') || s.includes('cool')) return 'appliance';
  if (s.includes('struct') || s.includes('paint') || s.includes('wall')) return 'structural';
  if (s.includes('inspect')) return 'inspection';
  if (s.includes('sos') || s.includes('emerg')) return 'sos';
  return 'appliance';
}

const RC_INSPECTION_CHECKLIST = [
  'Entrance & main door / locks',
  'Living area walls & flooring',
  'Kitchen sink, taps & appliances',
  'Bathrooms — taps, drainage, tiles',
  'Bedrooms — windows & AC vents',
  'Electrical switches & lighting',
  'Water supply & pressure',
  'Balcony / terrace condition',
  'Common areas / parking access',
  'Fire safety / extinguisher (if any)',
  'Pest signs',
  'Overall cleanliness',
  'Key set count verified',
  'Meter readings noted',
  'Photo evidence captured'
];

// 1. Calculate Next Monthly Inspection Date (Always 5th of every month)
function getNextInspectionDate(fromDate = new Date()) {
  const d = new Date(fromDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const currentDay = d.getDate();

  let targetMonth = month;
  let targetYear = year;

  if (currentDay > 5) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const nextDate = new Date(targetYear, targetMonth, 5);
  return nextDate.toISOString().split('T')[0];
}

function formatInspectionDateDisplay(isoDateStr) {
  if (!isoDateStr) isoDateStr = getNextInspectionDate();
  const d = new Date(isoDateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// 2. Format Key Holding Status
function getKeyHoldingBadgeHtml(status = 'landlord') {
  const map = {
    landlord: { label: 'Landlord Held', color: 'bg-primary/10 text-primary border-primary/20', icon: 'key' },
    tenant: { label: 'Tenant Held', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: 'key' },
    rentcan_vault: { label: 'RentCan Vault', color: 'bg-brand-mint/30 text-brand-brown border-brand-mint font-bold', icon: 'lock' },
    agency: { label: 'Agency Custody', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: 'vpn_key' }
  };
  const item = map[status] || map.landlord;
  return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.color}">
    <span class="material-symbols-outlined text-[14px]">${item.icon}</span>
    ${item.label}
  </span>`;
}

// 3. Reliable Global Sign Out Function
async function signOut() {
  try {
    sessionStorage.clear();
    localStorage.clear();
    if (typeof supabase !== 'undefined') {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        if (config.supabaseUrl && config.supabaseKey) {
          const client = supabase.createClient(config.supabaseUrl, config.supabaseKey);
          await client.auth.signOut();
        }
      }
    }
  } catch(e) {
    console.warn('SignOut error:', e);
  } finally {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/login?logout=true';
  }
}

// 4. Fluid Spring Animation Trigger for UI elements
function triggerSpringAnimation(element) {
  if (!element) return;
  element.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease';
  element.style.transform = 'scale(0.97)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 150);
}

// 5. Shared Supabase client helper
async function getSupabaseClient() {
  if (window.RentCan) return window.RentCan.createClient();

  let cfg = { supabaseUrl: '', supabaseKey: '' };
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseKey) cfg = data;
    }
  } catch(e) {
    console.warn('Config fetch failed:', e);
  }
  if (!cfg.supabaseUrl || !cfg.supabaseKey || typeof supabase === 'undefined') return null;
  return supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
}

// 7. Shared mobile bottom navigation (phone-first)
function mountMobileBottomNav(active) {
  if (document.getElementById('rc-mobile-nav')) return;
  const items = [
    { href: '/dashboard', icon: 'domain', label: 'Home', key: 'dashboard' },
    { href: '/inspections', icon: 'fact_check', label: 'Inspect', key: 'inspections' },
    { href: '/documents', icon: 'description', label: 'Vault', key: 'documents' },
    { href: '/payments', icon: 'payments', label: 'Ledger', key: 'payments' },
    { href: '/reports', icon: 'analytics', label: 'Reports', key: 'reports' }
  ];
  const nav = document.createElement('nav');
  nav.id = 'rc-mobile-nav';
  nav.className = 'md:hidden fixed bottom-0 left-0 right-0 rc-app-mobile-nav px-2 pt-2 z-50 flex justify-around items-center text-on-surface';
  nav.style.paddingBottom = 'max(10px, env(safe-area-inset-bottom))';
  nav.innerHTML = items.map(item => {
    const on = item.key === active;
    return `<a href="${item.href}" data-rc-nav class="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] text-[10px] font-bold uppercase tracking-wider ${on ? 'text-primary' : 'text-on-surface-variant/70'}">
      <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' ${on ? 1 : 0}">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');
  document.body.appendChild(nav);
  document.body.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom))';
}

// 8. Clean paths + soft page transitions (feels like one app, not raw .html hops)
const RC_PATHS = {
  '/': 'index.html',
  '/login': 'login.html',
  '/dashboard': 'dashboard.html',
  '/documents': 'documents.html',
  '/payments': 'payments.html',
  '/inspections': 'inspections.html',
  '/reports': 'reports.html',
  '/info': 'info.html',
  '/investors': 'investors.html',
  '/admin': 'admin.html',
  '/checkout': 'checkout.html'
};

function rcCleanPath(href) {
  if (!href) return href;
  try {
    const u = new URL(href, window.location.origin);
    if (u.origin !== window.location.origin) return href;
    const map = {
      'index.html': '/',
      'login.html': '/login',
      'dashboard.html': '/dashboard',
      'documents.html': '/documents',
      'payments.html': '/payments',
      'inspections.html': '/inspections',
      'reports.html': '/reports',
      'info.html': '/info',
      'investors.html': '/investors',
      'admin.html': '/admin',
      'checkout.html': '/checkout'
    };
    const file = u.pathname.split('/').pop();
    if (map[file]) {
      return map[file] + u.search + u.hash;
    }
    if (u.pathname.endsWith('.html')) {
      return u.pathname.replace(/\.html$/, '') + u.search + u.hash;
    }
    return u.pathname + u.search + u.hash;
  } catch (_) {
    return href;
  }
}

function softNavigate(href, opts) {
  const target = rcCleanPath(href);
  if (!target || target === '#' || target.startsWith('mailto:') || target.startsWith('tel:')) {
    return true;
  }
  if (target.startsWith('#')) return true;
  // Navigate immediately — no opacity blanking (that was blocking pages)
  window.location.href = target;
  return false;
}

function showAuthWait(options) {
  const opts = options || {};
  let el = document.getElementById('rc-auth-wait');
  if (!el) {
    el = document.createElement('div');
    el.id = 'rc-auth-wait';
    el.className = 'rc-auth-wait';
    el.innerHTML = `
      <a href="/" class="rc-brand-logo rc-brand-logo--light rc-brand-logo--app rc-auth-mark" aria-label="RentCan">
        <img src="/assets/logos/rentcan-wordmark.png" alt="RentCan">
      </a>
      <div class="rc-spinner" aria-hidden="true"></div>
      <div class="rc-auth-title" id="rc-auth-title">Signing you in</div>
      <div class="rc-auth-sub" id="rc-auth-sub">Just a moment while we prepare your account.</div>
      <ul class="rc-auth-steps" id="rc-auth-steps">
        <li data-step="0"><span class="rc-auth-dot"></span><span>Confirming secure sign-in</span></li>
        <li data-step="1"><span class="rc-auth-dot"></span><span>Loading your profile</span></li>
        <li data-step="2"><span class="rc-auth-dot"></span><span>Opening your dashboard</span></li>
      </ul>
      <button type="button" class="rc-auth-cancel" id="rc-auth-cancel" onclick="cancelAuthWait()">Cancel and go back</button>`;
    document.body.appendChild(el);
  }
  if (opts.title) document.getElementById('rc-auth-title').textContent = opts.title;
  if (opts.sub) document.getElementById('rc-auth-sub').textContent = opts.sub;
  el.classList.add('show');
  setAuthWaitStep(opts.step || 0);
  return el;
}

function setAuthWaitStep(step) {
  const items = document.querySelectorAll('#rc-auth-steps li');
  items.forEach((li) => {
    const n = Number(li.getAttribute('data-step'));
    const dot = li.querySelector('.rc-auth-dot');
    li.classList.remove('active', 'done');
    if (dot) dot.classList.remove('pulse');
    if (n < step) li.classList.add('done');
    if (n === step) {
      li.classList.add('active');
      if (dot) dot.classList.add('pulse');
    }
  });
}

function hideAuthWait() {
  const el = document.getElementById('rc-auth-wait');
  if (el) el.classList.remove('show');
}

function cancelAuthWait() {
  sessionStorage.removeItem('rc_auth_pending');
  hideAuthWait();
  const btn = document.getElementById('btn-google');
  if (btn) {
    btn.disabled = false;
    const label = btn.querySelector('.btn-label');
    if (label) {
      label.innerHTML = 'Continue with Google<span class="btn-sub">Instant sign-in with your Google account</span>';
    }
  }
}

async function finishAuthRedirect(dest) {
  window.location.href = rcCleanPath(dest || '/dashboard');
}

// Do not intercept clicks — normal browser navigation only
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('rc-exit');
  document.documentElement.classList.add('rc-ready');
});

window.escapeHtml = escapeHtml;
window.mapMaintenanceCategory = mapMaintenanceCategory;
window.RC_INSPECTION_CHECKLIST = RC_INSPECTION_CHECKLIST;
window.getNextInspectionDate = getNextInspectionDate;
window.formatInspectionDateDisplay = formatInspectionDateDisplay;
window.getKeyHoldingBadgeHtml = getKeyHoldingBadgeHtml;
window.signOut = signOut;
window.triggerSpringAnimation = triggerSpringAnimation;
window.getSupabaseClient = getSupabaseClient;
window.mountMobileBottomNav = mountMobileBottomNav;
window.softNavigate = softNavigate;
window.rcCleanPath = rcCleanPath;
window.showAuthWait = showAuthWait;
window.setAuthWaitStep = setAuthWaitStep;
window.hideAuthWait = hideAuthWait;
window.cancelAuthWait = cancelAuthWait;
window.finishAuthRedirect = finishAuthRedirect;

// 6. Hidden Admin Portal Shortcuts (Ctrl + Shift + A or 3 Clicks on RentCan Emblem)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.location.href = '/admin';
  }
});

let clickCount = 0;
let clickTimer = null;
document.addEventListener('click', (e) => {
  if (e.target.textContent && e.target.textContent.trim() === 'RentCan') {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount >= 3) {
      window.location.href = '/admin';
      clickCount = 0;
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
    }
  }
});
