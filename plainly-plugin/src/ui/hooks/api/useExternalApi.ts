import type { Endpoints } from '@octokit/types';
import { get } from '@src/node/request';
import { useQuery } from '@tanstack/react-query';

type LatestReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

export const useGetLatestGithubRelease = (enabled = true) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['github-latest-release'],
    queryFn: async () => {
      const { data } = await get<LatestReleaseResponse>(
        'https://api.github.com/repos/plainly-videos/after-effects-plugin/releases/latest',
        undefined,
      );
      console.log('fetched again');
      return data;
    },
    // disable all refetching, fetch only when mounted first time
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    enabled: enabled,
  });

  return { isLoading, error, data };
};
