import type React from 'react';

/**
 * Restart the extension by reloading the page. This is necessary to ensure that any global listeners
 * are removed before reloading the page.
 *
 * If the process object is not available (e.g. in a web context), then the page is simply reloaded.
 *
 * @returns {void}
 */
export function reloadExtension(): void {
  try {
    process.removeAllListeners();
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

/**
 * Starts a simulated asymptotic progress interval that advances toward a cap,
 * naturally slowing as it approaches it. Call the returned cleanup function to stop it.
 *
 * @param setProgress - State setter for progress (0–100)
 * @returns Cleanup function to clear the interval
 */
export function startAsymptoticProgress(
  setProgress: React.Dispatch<React.SetStateAction<number>>,
): () => void {
  const CAP = 90;
  const RATE = 0.005;
  const TICK_MS = 200;
  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= CAP) return prev;
      return Math.min(prev + (CAP - prev) * RATE, CAP);
    });
  }, TICK_MS);
  return () => clearInterval(interval);
}

export function isEmpty<T>(
  list: T[] | null | undefined,
): list is undefined | null | [] {
  return !list || (list && list.length === 0);
}
