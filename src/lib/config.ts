export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://mvxceyvbiehxeolfxslw.supabase.co',
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_tZYUU32Z6a5VcSRxhBGnPg_ch5cnEfH',
  timezone: 'Asia/Jakarta',
  uploadLimit: 20 * 1024 * 1024,
};
