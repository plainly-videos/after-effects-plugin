import { AeItemType, type CompositionAeItem } from './types/metadata';

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

export const compositionSorter = (
  a: CompositionAeItem,
  b: CompositionAeItem,
) => {
  const aLayersCount = countCompChildren(a);
  const bLayersCount = countCompChildren(b);
  // Secondary, if children layers count is equal, sort by duration
  if (bLayersCount === aLayersCount) {
    return b.duration - a.duration;
  }

  // Primary sort by number of child layers
  return bLayersCount - aLayersCount;
};

export const collectCompositions = (
  composition: CompositionAeItem,
  maxLevel: number = Number.POSITIVE_INFINITY,
  currentLevel = 0,
) => {
  const res: CompositionAeItem[] = [composition];
  if (currentLevel >= maxLevel) {
    return res;
  }

  for (const element of composition.children) {
    if (element.type === AeItemType.COMPOSITION) {
      const children = collectCompositions(
        element as CompositionAeItem,
        maxLevel,
        currentLevel + 1,
      );

      for (const e of children.sort(compositionSorter)) {
        res.push(e);
      }
    }
  }

  return res;
};

export const countCompChildren = (comp: CompositionAeItem): number => {
  if (!comp.children || comp.children.length === 0) {
    return 0;
  }

  let count = comp.children.length;
  for (const child of comp.children) {
    if (child.type === AeItemType.COMPOSITION) {
      count += countCompChildren(child as CompositionAeItem);
    }
  }

  return count;
};
