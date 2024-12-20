import { useCallback, useEffect, useState } from 'react';

export const useSessionStorage = () => {
  const [storage, setStorage] = useState<Storage | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorage(window.sessionStorage);
    }
  }, []);

  const setItem = useCallback(
    (key: string, value: string) => {
      if (storage) {
        storage.setItem(key, value);
      }
    },
    [storage],
  );

  const getItem = useCallback(
    (key: string) => {
      if (storage) {
        return storage.getItem(key);
      }
      return null;
    },
    [storage],
  );

  const removeItem = useCallback(
    (key: string) => {
      if (storage) {
        storage.removeItem(key);
      }
    },
    [storage],
  );

  return {
    storage,
    setItem,
    getItem,
    removeItem,
  };
};
