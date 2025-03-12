import { get } from '@src/node/request';
import { type Render, RenderState } from '@src/ui/types/render';
import { useQuery } from '@tanstack/react-query';
import { API_REFETCH_INTERVAL } from '.';

const RENDERS_CACHE_ROOT = 'renders';

const getRenderListRefreshInterval = (renders?: Render[]): number | false => {
  if (renders) {
    const anyNotDone = renders.some(
      (render) =>
        render.state &&
        ![
          RenderState.DONE,
          RenderState.FAILED,
          RenderState.INVALID,
          RenderState.CANCELLED,
        ].includes(render.state),
    );
    if (anyNotDone) {
      return API_REFETCH_INTERVAL;
    }
  }
  return false;
};

type GetRendersParams = {
  projectId?: string;
  templateId?: string;
  state?: string;
  page?: number;
  size?: number;
  searchTerm?: string;
};

export const useGetRenders = (apiKey: string, params: GetRendersParams) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [RENDERS_CACHE_ROOT],
    queryFn: async () => {
      const { data } = await get<Render[]>('/api/v2/renders', apiKey, {
        params,
      });
      return data;
    },
    refetchInterval: (): number | false => getRenderListRefreshInterval(data),
  });

  return { isLoading, error, data };
};
