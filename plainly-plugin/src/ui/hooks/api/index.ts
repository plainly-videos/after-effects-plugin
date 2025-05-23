import { isProd } from '@src/env';

export * from './useProjectApi';
export * from './useProfileApi';
export * from './useExternalApi';

export const API_REFETCH_INTERVAL = isProd ? 5000 : 3000;
