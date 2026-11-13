import PocketBase from 'pocketbase';

export const PB_BASE_URL = 'https://db.lokro.dev';

let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(PB_BASE_URL);
    try {
      const stored = localStorage.getItem('pb_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && 'token' in parsed) {
          pbInstance.authStore.save(parsed.token, parsed.model);
        }
      }
    } catch {}
  }
  return pbInstance;
}
