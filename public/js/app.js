/* ═════════════════════════════════════════════════════════════════════
   RENTCAN SHARED APPLICATION SERVICES & UTILITIES
   ═════════════════════════════════════════════════════════════════════ */

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
    rentcan_vault: { label: 'RentCan Vault', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold', icon: 'lock' },
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
    window.location.href = 'login.html?logout=true';
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
    { href: 'dashboard.html', icon: 'domain', label: 'Home', key: 'dashboard' },
    { href: 'inspections.html', icon: 'fact_check', label: 'Inspect', key: 'inspections' },
    { href: 'documents.html', icon: 'description', label: 'Vault', key: 'documents' },
    { href: 'payments.html', icon: 'payments', label: 'Ledger', key: 'payments' },
    { href: 'reports.html', icon: 'analytics', label: 'Reports', key: 'reports' }
  ];
  const nav = document.createElement('nav');
  nav.id = 'rc-mobile-nav';
  nav.className = 'md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-outline-variant/40 px-2 pt-2 z-50 flex justify-around items-center shadow-lg text-on-surface';
  nav.style.paddingBottom = 'max(10px, env(safe-area-inset-bottom))';
  nav.innerHTML = items.map(item => {
    const on = item.key === active;
    return `<a href="${item.href}" class="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] text-[10px] font-bold uppercase tracking-wider ${on ? 'text-primary' : 'text-on-surface-variant/70'}">
      <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' ${on ? 1 : 0}">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');
  document.body.appendChild(nav);
  document.body.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom))';
}

window.getNextInspectionDate = getNextInspectionDate;
window.formatInspectionDateDisplay = formatInspectionDateDisplay;
window.getKeyHoldingBadgeHtml = getKeyHoldingBadgeHtml;
window.signOut = signOut;
window.triggerSpringAnimation = triggerSpringAnimation;
window.getSupabaseClient = getSupabaseClient;
window.mountMobileBottomNav = mountMobileBottomNav;

// 6. Hidden Admin Portal Shortcuts (Ctrl + Shift + A or 3 Clicks on RentCan Emblem)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
});

let clickCount = 0;
let clickTimer = null;
document.addEventListener('click', (e) => {
  if (e.target.textContent && e.target.textContent.trim() === 'RentCan') {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount >= 3) {
      window.location.href = 'admin.html';
      clickCount = 0;
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
    }
  }
});
