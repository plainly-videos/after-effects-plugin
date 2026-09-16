interface RelinkItem {
  path: string;
  isSequence: boolean;
}

interface RelinkData {
  [itemId: string]: RelinkItem;
}

export type { RelinkData, RelinkItem };
