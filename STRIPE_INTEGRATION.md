# Stripe Payment Integration Guide

## Overview

This project includes a complete Stripe payment integration for subscription management. Users can subscribe to packages, make payments through Stripe Checkout, and access protected features based on their entitlements.

## Environment Variables

Add the following environment variable to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**Note:** Use `pk_test_` for testing and `pk_live_` for production.

## Architecture

### 1. **Subscription Packages**
- Stored in Zustand store (`useSubscriptionStore`)
- Fetched from: `GET /api/v1/jurisdictions/{jurisdictionId}/subscription-packages`
- Displayed on: `/practice/pricing`

### 2. **Payment Flow**

```
User clicks "Subscribe Now"
    ↓
Frontend creates checkout session
    ↓
Backend returns Stripe Checkout URL
    ↓
User redirected to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe webhook processes payment (backend)
    ↓
User redirected to success page
    ↓
Frontend polls for entitlement
    ↓
User redirected to dashboard
```

### 3. **Key Files**

#### Configuration
- `lib/stripe/config.ts` - Stripe initialization
- `lib/services/payment-service.ts` - Payment API calls
- `lib/hooks/use-entitlement.ts` - Entitlement checking hook

#### Pages
- `app/[locale]/practice/pricing/page.tsx` - Pricing page with subscription cards
- `app/[locale]/practice/payment/success/page.tsx` - Payment success handler
- `app/[locale]/practice/payment/cancel/page.tsx` - Payment cancellation page

#### Components
- `components/auth/entitlement-guard.tsx` - Route protection component

## Usage Examples

### 1. Display Pricing Page

The pricing page automatically fetches and displays subscription packages for the user's active jurisdiction.

```typescript
// Already implemented at /practice/pricing
// Accessible via sidebar "Pricing" link in Controls section
```

### 2. Protect Routes with Entitlement

Wrap any component that requires a subscription:

```typescript
import { EntitlementGuard } from '@/components/auth/entitlement-guard';

export default function ProtectedFeaturePage() {
  return (
    <EntitlementGuard>
      <div>
        {/* Your protected content here */}
        <h1>Premium Feature</h1>
        <p>This content requires an active subscription.</p>
      </div>
    </EntitlementGuard>
  );
}
```

### 3. Check Entitlement in Component

Use the hook directly for conditional rendering:

```typescript
import { useEntitlement } from '@/lib/hooks/use-entitlement';
import { useAuthStore } from '@/lib/store';

export default function MyComponent() {
  const { user } = useAuthStore();
  const { hasAccess, loading } = useEntitlement(user?.activeJurisdictionId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {hasAccess ? (
        <button>Start Premium Test</button>
      ) : (
        <Link href="/practice/pricing">Subscribe to Access</Link>
      )}
    </div>
  );
}
```

## API Endpoints Used

### Frontend → Backend

1. **Get Subscription Packages**
   ```
   GET /api/v1/jurisdictions/{jurisdictionId}/subscription-packages
   ```

2. **Create Checkout Session**
   ```
   POST /api/v1/jurisdictions/{jurisdictionId}/payments/create-checkout
   Body: {
     purchaseType: 'subscription' | 'lifetime',
     subscriptionPackageId: number,
     billingPeriod: string,
     priceId: string,
     successUrl: string,
     cancelUrl: string
   }
   Response: {
     sessionId: string,
     url: string
   }
   ```

3. **Check Entitlement Status**
   ```
   GET /api/v1/jurisdictions/{jurisdictionId}/entitlements/status
   Response: {
     hasAccess: boolean,
     entitlements: Array<{...}>
   }
   ```

4. **Get User Entitlements**
   ```
   GET /api/v1/entitlements
   Response: Array<Entitlement>
   ```

## Payment Success Flow

1. User completes payment on Stripe
2. Stripe redirects to: `/practice/payment/success?session_id={CHECKOUT_SESSION_ID}`
3. Success page polls `/api/v1/entitlements` every 2 seconds (max 10 retries)
4. Once entitlement is found, user is redirected to dashboard after 3 seconds

## Payment Cancellation

If user cancels payment:
- Redirected to: `/practice/pricing?canceled=true`
- Or to: `/practice/payment/cancel` for dedicated cancel page

## Testing

### Test Mode
1. Use Stripe test publishable key: `pk_test_...`
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Test the Flow
1. Navigate to `/practice/pricing`
2. Click "Subscribe Now" on any package
3. Complete payment with test card
4. Verify redirect to success page
5. Verify entitlement is activated
6. Verify protected routes are accessible

## Security Considerations

1. **Never expose secret keys** - Only use publishable keys in frontend
2. **Validate on backend** - All payment verification happens server-side
3. **Use HTTPS** - Required for Stripe in production
4. **Webhook signatures** - Backend must verify Stripe webhook signatures
5. **Entitlement checks** - Always verify on backend before granting access

## Troubleshooting

### Payment not completing
- Check browser console for errors
- Verify Stripe publishable key is correct
- Check backend logs for webhook processing

### Entitlement not activating
- Webhook may be delayed (up to 20 seconds polling)
- Check backend webhook endpoint is accessible
- Verify Stripe webhook is configured correctly

### Redirect issues
- Ensure success/cancel URLs are correct
- Check for CORS issues
- Verify environment variables are set

## Production Checklist

- [ ] Replace test Stripe key with live key
- [ ] Configure Stripe webhooks for production domain
- [ ] Test complete payment flow in production
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for successful subscriptions
- [ ] Test subscription cancellation flow
- [ ] Verify entitlement expiration handling
