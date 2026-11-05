/** Use the exact allowlisted root, including its trailing slash, for every email flow. */
export function authRedirectUrl(origin: string): string {
  return new URL('/', origin).href;
}

export function readAuthReturn(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const type = hash.get('type');
  const errorCode = hash.get('error_code');
  return {
    requiresPassword: type === 'recovery' || type === 'invite' || url.searchParams.has('recovery'),
    error: errorCode || hash.has('error')
      ? errorCode === 'otp_expired'
        ? 'Tautan sudah digunakan atau kedaluwarsa. Minta tautan masuk baru, lalu buka email yang paling baru.'
        : 'Tautan masuk tidak dapat digunakan. Minta tautan baru atau masuk dengan kata sandi.'
      : '',
  };
}
