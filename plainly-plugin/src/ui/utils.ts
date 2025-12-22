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
 * Checks if an array is empty, null, or undefined.
 *
 * This function acts as a type guard that narrows the type to indicate when
 * the array is empty, null, or undefined.
 *
 * @template T - The type of elements in the array
 * @param list - The array to check for emptiness
 * @returns {boolean} True if the list is null, undefined, or an empty array; false otherwise
 */
export function isEmpty<T>(
  list: T[] | null | undefined,
): list is undefined | null | [] {
  return !list || (list && list.length === 0);
}
