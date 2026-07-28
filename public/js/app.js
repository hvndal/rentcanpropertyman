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

window.getNextInspectionDate = getNextInspectionDate;
window.formatInspectionDateDisplay = formatInspectionDateDisplay;
window.getKeyHoldingBadgeHtml = getKeyHoldingBadgeHtml;
window.signOut = signOut;
window.triggerSpringAnimation = triggerSpringAnimation;
window.getSupabaseClient = getSupabaseClient;

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
