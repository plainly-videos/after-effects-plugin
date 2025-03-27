import type { ModelBaseWithDates } from '.';

export interface Template extends ModelBaseWithDates {
  name: string;
  layers: unknown[];
}
