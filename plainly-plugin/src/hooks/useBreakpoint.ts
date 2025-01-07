import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};

const screens = {
  xs: '480px',
  // => @media (min-width: 480px) { ... }
  sm: '640px',
  // => @media (min-width: 640px) { ... }
  md: '768px',
  // => @media (min-width: 768px) { ... }
  lg: '1024px',
  // => @media (min-width: 1024px) { ... }
  xl: '1280px',
  // => @media (min-width: 1280px) { ... }
  '2xl': '1536px',
  // => @media (min-width: 1536px) { ... }
};

export const useBreakpoint = (breakpoint: string) => {
  const screenSize = screens[breakpoint as keyof typeof screens];

  return useMediaQuery(`(min-width: ${screenSize})`);
};
