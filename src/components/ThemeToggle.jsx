import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pokedoom-theme';

function getInitialTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const nextThemeLabel = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

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
