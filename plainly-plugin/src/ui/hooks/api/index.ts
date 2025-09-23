import { isProd } from '@src/env';

export * from './useExternalApi';
export * from './useProfileApi';
export * from './useProjectApi';

export const API_REFETCH_INTERVAL = isProd ? 5000 : 3000;
