import { STORAGE_KEYS } from '../constants/storageKeys';

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.theme) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // The visual theme still works for the current session.
  }
}
