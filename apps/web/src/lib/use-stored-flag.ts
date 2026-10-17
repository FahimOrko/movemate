import { useState } from 'react';

export function useStoredFlag(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? defaultValue : stored === 'true';
    } catch {
      return defaultValue;
    }
  });
  const set = (next: boolean) => {
    setValue(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
  };
  return [value, set] as const;
}
