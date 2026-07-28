/**
 * RentCan public configuration (safe for client exposure).
 * Server env vars override these defaults when set on Vercel.
 */
const RENTCAN_PUBLIC = {
  supabaseUrl: 'https://pomxnutomfzmignmyjbi.supabase.co',
  supabaseAnonKey: 'sb_publishable_85_NJkwy59qf7ZChmG7ujg_BRIM0Y89',
  msg91WidgetId: '366674716248383037373030',
  msg91TokenAuth: '535432TXjnw0dF6a5d0eb2P1'
};

function resolveSupabaseUrl() {
  return (process.env.SUPABASE_URL || RENTCAN_PUBLIC.supabaseUrl).trim();
}

function resolveSupabaseAnonKey() {
  return (process.env.SUPABASE_KEY || RENTCAN_PUBLIC.supabaseAnonKey).trim();
}

function resolveMsg91WidgetId() {
  return (process.env.MSG91_WIDGET_ID || RENTCAN_PUBLIC.msg91WidgetId).trim();
}

function resolveMsg91TokenAuth() {
  return (process.env.MSG91_TOKEN_AUTH || RENTCAN_PUBLIC.msg91TokenAuth).trim();
}

/** Server-only MSG91 API auth key — never sent to the browser */
function resolveMsg91AuthKey() {
  return (
    process.env.MSG91_AUTH_KEY
    || process.env.MSG91_AUTHKEY
    || process.env.MSG91_API_KEY
    || ''
  ).trim();
}

module.exports = {
  RENTCAN_PUBLIC,
  resolveSupabaseUrl,
  resolveSupabaseAnonKey,
  resolveMsg91WidgetId,
  resolveMsg91TokenAuth,
  resolveMsg91AuthKey
};
