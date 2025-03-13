export declare enum AeItemType {
  COMPOSITION = 'COMPOSITION',
  MEDIA = 'MEDIA',
  TEXT = 'TEXT',
}

export declare type AnyAeItem = CompositionAeItem;

export type AeItem<T extends AeItemType> = {
  readonly internalId: string;
  readonly type: T;
  readonly name: string;
  readonly value?: string;
  readonly guideLayer?: boolean;
  readonly enabled?: boolean;
  readonly adjustmentLayer?: boolean;
  readonly shy?: boolean;
  readonly effects?: unknown[]; // change if needed
};

export type CompositionAeItem = AeItem<AeItemType.COMPOSITION> & {
  readonly children: AnyAeItem[];
  readonly layerName?: string;
  readonly id: number;
  readonly duration: number;
  readonly width?: number;
  readonly height?: number;
};
