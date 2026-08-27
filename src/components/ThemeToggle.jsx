import { useEffect, useState } from 'react';
import { getStoredTheme, saveTheme } from '../services/preferencesStorage';

function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    saveTheme(theme);
  }, [theme]);

  const nextThemeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'is-dark' : ''}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={nextThemeLabel}
      aria-pressed={isDark}
      title={nextThemeLabel}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  );
}

export default ThemeToggle;
