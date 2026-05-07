import { useState, useEffect } from 'preact/hooks';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const pref   = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored ? stored === 'dark' : pref);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      class="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Activează modul luminos' : 'Activează modul întunecat'}
      title={dark ? 'Mod luminos' : 'Mod întunecat'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
