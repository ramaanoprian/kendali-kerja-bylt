// Exact destinations only; never accept arbitrary redirects from the client.
const origins = [
  'https://kendalibylt.my.id',
  'https://kendali-kerja-bylt.ramanoprian73.chatgpt.site',
  'https://kerja.dokumenbylt.my.id',
];
export function invitationRedirect(value: unknown): string | null {
  const origin = origins.find(origin => value === origin || value === origin + '/');
  return origin ? origin + '/' : null;
}
