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

export function handleLinkClick(link: string | undefined) {
  if (!link) return;
  // @ts-expect-error
  cep.util.openURLInDefaultBrowser(link);
}

export function isEmpty<T>(
  list: T[] | null | undefined,
): list is undefined | null | [] {
  return !list || (list && list.length === 0);
}

export function getIdPage(currentPage: string, match: string): boolean {
  const pageMatch = currentPage.startsWith(match);

  return pageMatch;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function extractIdFromPage(page: string) {
  const id = page.split('/').pop() || '';
  return id;
}
