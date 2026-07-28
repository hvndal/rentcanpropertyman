/**
 * RentCan client config — single source for Supabase + MSG91 widget defaults.
 * /api/config overrides when Vercel env vars are set.
 */
(function () {
  const DEFAULTS = {
    supabaseUrl: 'https://pomxnutomfzmignmyjbi.supabase.co',
    supabaseKey: 'sb_publishable_85_NJkwy59qf7ZChmG7ujg_BRIM0Y89',
    msg91Widget: {
      widgetId: '366674716248383037373030',
      tokenAuth: '535432TXjnw0dF6a5d0eb2P1',
      ready: true
    }
  };

  let cached = null;

  function mergeConfig(data) {
    const widget = data?.msg91Widget || {};
    return {
      supabaseUrl: data?.supabaseUrl || DEFAULTS.supabaseUrl,
      supabaseKey: data?.supabaseKey || DEFAULTS.supabaseKey,
      msg91Ready: data?.msg91Ready ?? DEFAULTS.msg91Widget.ready,
      msg91Widget: {
        widgetId: widget.widgetId || DEFAULTS.msg91Widget.widgetId,
        tokenAuth: widget.tokenAuth || DEFAULTS.msg91Widget.tokenAuth,
        ready: widget.ready ?? DEFAULTS.msg91Widget.ready
      }
    };
  }

  async function fetchConfig() {
    if (cached) return cached;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        cached = mergeConfig(await res.json());
        return cached;
      }
    } catch (e) {
      console.warn('[RentCan] /api/config unavailable — using built-in defaults', e);
    }
    cached = mergeConfig(null);
    return cached;
  }

  async function createClient() {
    const cfg = await fetchConfig();
    if (typeof supabase === 'undefined' || !cfg.supabaseUrl || !cfg.supabaseKey) return null;
    return supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: 'pkce',
        storage: window.localStorage
      }
    });
  }

  /** Canonical OAuth redirect — must match Supabase Auth → URL Configuration */
  function getAuthRedirectUrl() {
    const host = window.location.hostname;
    if (host === 'rentcan.in' || host === 'www.rentcan.in') {
      return 'https://rentcan.in/login';
    }
    const port = window.location.port;
    const origin = window.location.protocol + '//' + host + (port ? ':' + port : '');
    return origin + '/login';
  }

  function cleanAuthUrl() {
    const path = window.location.pathname || '/login';
    window.history.replaceState({}, document.title, path);
  }

  async function requireAuth() {
    if (sessionStorage.getItem('rentcan_user')) return true;

    try {
      const client = await createClient();
      if (!client) throw new Error('Supabase client unavailable');

      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return false;
      }

      const meta = session.user.user_metadata || {};
      sessionStorage.setItem('rentcan_role', meta.role || 'landlord');
      sessionStorage.setItem('rentcan_user', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        name: meta.full_name || session.user.email,
        role: meta.role || 'landlord'
      }));
      return true;
    } catch (e) {
      console.warn('[RentCan] auth guard failed:', e);
      window.location.href = '/login';
      return false;
    }
  }

  window.RentCan = {
    DEFAULTS,
    fetchConfig,
    createClient,
    requireAuth,
    getAuthRedirectUrl,
    cleanAuthUrl
  };
})();
