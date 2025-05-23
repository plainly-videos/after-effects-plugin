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
  } catch (e) {
    window.location.reload();
  }
}

export function isEmpty<T>(
  list: T[] | null | undefined,
): list is undefined | null | [] {
  return !list || (list && list.length === 0);
}
