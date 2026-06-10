import { useEffect, useState } from 'react';
import { checkEntitlementStatus } from '@/lib/services/payment-service';

export const useEntitlement = (jurisdictionId: number | undefined) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jurisdictionId) {
      setLoading(false);
      setHasAccess(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await checkEntitlementStatus(jurisdictionId);
        setHasAccess(response.hasAccess);
      } catch (err: any) {
        console.error('Failed to check entitlement:', err);
        setError(err.response?.data?.message || 'Failed to check access');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [jurisdictionId]);

  return { hasAccess, loading, error };
};
