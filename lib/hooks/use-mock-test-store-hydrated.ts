import { useEffect, useState } from 'react';
import { useMockTestStore } from '@/lib/store/mock-test-store';

export function useMockTestStoreHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useMockTestStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    isHydrated,
  };
}
