import api from '@/lib/api/client';
import { 
  SubscriptionCancelRequest, 
  SubscriptionUpgradeRequest, 
  SubscriptionDowngradeRequest, 
  SubscriptionChangeResponse,
  ApiResponse,
  SaleType 
} from '@/lib/types';

export interface CreateCheckoutRequest {
  purchaseType: 'subscription' | 'lifetime';
  subscriptionPackageId: number;
  billingPeriod: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface EntitlementStatusResponse {
  hasAccess: boolean;
  entitlements: Array<{
    id: number;
    jurisdictionId: number;
    status: string;
    startDate: string;
    endDate?: string;
    saleTypeApplied: SaleType;
    saleAmount: number;
    withTranslation: boolean;
  }>;
}

export const createCheckoutSession = async (
  jurisdictionId: number,
  request: CreateCheckoutRequest
): Promise<CreateCheckoutResponse> => {
  const response = await api.post(
    `/api/v1/jurisdictions/${jurisdictionId}/payments/create-checkout`,
    request
  );
  
  return response.data.data || response.data;
};

export const checkEntitlementStatus = async (
  jurisdictionId: number
): Promise<EntitlementStatusResponse> => {
  const response = await api.get(
    `/api/v1/jurisdictions/${jurisdictionId}/entitlements/status`
  );
  
  return response.data.data || response.data;
};

export const getEntitlements = async () => {
  const response = await api.get('/api/v1/entitlements');
  return response.data.data || response.data;
};

export const getUserSubscriptions = async (jurisdictionId: number) => {
  const response = await api.get(`/api/v1/jurisdictions/${jurisdictionId}/entitlements/status`);
  return response.data.data || response.data;
};

export const cancelSubscription = async (jurisdictionId: number, entitlementId: number) => {
  const response = await api.post(`/api/v1/jurisdictions/${jurisdictionId}/entitlements/${entitlementId}/cancel`);
  return response.data.data || response.data;
};

export const reactivateSubscription = async (jurisdictionId: number, entitlementId: number) => {
  const response = await api.post(`/api/v1/jurisdictions/${jurisdictionId}/entitlements/${entitlementId}/reactivate`);
  return response.data.data || response.data;
};

// Subscription Management Functions

export const cancelSubscriptionManagement = async (
  jurisdictionId: number,
  request: SubscriptionCancelRequest
): Promise<SubscriptionChangeResponse> => {
  const response = await api.post<ApiResponse<SubscriptionChangeResponse>>(
    `/api/v1/jurisdictions/${jurisdictionId}/subscriptions/cancel`,
    request
  );
  return response.data.data;
};

export const upgradeSubscription = async (
  jurisdictionId: number,
  request: SubscriptionUpgradeRequest
): Promise<SubscriptionChangeResponse> => {
  const response = await api.post<ApiResponse<SubscriptionChangeResponse>>(
    `/api/v1/jurisdictions/${jurisdictionId}/subscriptions/upgrade`,
    request
  );
  return response.data.data;
};

export const downgradeSubscription = async (
  jurisdictionId: number,
  request: SubscriptionDowngradeRequest
): Promise<SubscriptionChangeResponse> => {
  const response = await api.post<ApiResponse<SubscriptionChangeResponse>>(
    `/api/v1/jurisdictions/${jurisdictionId}/subscriptions/downgrade`,
    request
  );
  return response.data.data;
};
