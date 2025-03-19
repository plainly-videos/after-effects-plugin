import type { Endpoints } from '@octokit/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
  adapter: 'http',
});

type LatestReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

export const useGetLatestGithubRelease = (enabled = true) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['github-latest-release'],
    queryFn: async () => {
      const { data } = await instance.get<LatestReleaseResponse>(
        'https://api.github.com/repos/plainly-videos/after-effects-plugin/releases/latest',
      );
      return data;
    },
    // disable all refetching, fetch only when mounted first time, because there is a limit of 60 requests per hour
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    enabled: enabled,
  });

  return { isLoading, error, data };
};
