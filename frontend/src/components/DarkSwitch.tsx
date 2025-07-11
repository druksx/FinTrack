'use client';

import { useTheme } from 'next-themes';

export default function DarkSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="p-2 rounded bg-secondary text-background"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
} 