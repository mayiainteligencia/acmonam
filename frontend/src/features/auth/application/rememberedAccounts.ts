const REMEMBERED_KEY = 'mayia.remembered_accounts';

export interface RememberedAccount {
  email: string;
  name?: string;
}

export function getRememberedAccounts(): RememberedAccount[] {
  try {
    const raw = localStorage.getItem(REMEMBERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRememberedAccount(email: string, name?: string) {
  try {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    const list = getRememberedAccounts().filter((a) => a.email.toLowerCase() !== trimmed);
    list.unshift({
      email: trimmed,
      name: name?.trim() || trimmed.split('@')[0],
    });
    localStorage.setItem(REMEMBERED_KEY, JSON.stringify(list.slice(0, 4)));
  } catch {
    // Ignore storage errors
  }
}

export function removeRememberedAccount(email: string) {
  try {
    const trimmed = email.trim().toLowerCase();
    const list = getRememberedAccounts().filter((a) => a.email.toLowerCase() !== trimmed);
    localStorage.setItem(REMEMBERED_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

