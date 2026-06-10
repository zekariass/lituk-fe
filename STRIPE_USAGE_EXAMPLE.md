# Stripe Integration - Usage Examples

## Example 1: Protect Mock Test Start Page

To add subscription requirement to the mock test start page:

```typescript
// app/[locale]/practice/mock-test/start/page.tsx
import { EntitlementGuard } from '@/components/auth/entitlement-guard';

export default function MockTestStartPage() {
  return (
    <EntitlementGuard fallbackPath="/practice/pricing">
      {/* Existing mock test start page content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1>Start Mock Test</h1>
        {/* ... rest of the page ... */}
      </div>
    </EntitlementGuard>
  );
}
```

## Example 2: Conditional Feature Access

Show different UI based on subscription status:

```typescript
import { useEntitlement } from '@/lib/hooks/use-entitlement';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { hasAccess, loading } = useEntitlement(user?.activeJurisdictionId);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {hasAccess ? (
        <div>
          <button>Start Premium Mock Test</button>
          <button>Access All Questions</button>
          <button>View Detailed Analytics</button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2>Unlock Premium Features</h2>
          <p>Subscribe to access:</p>
          <ul>
            <li>Unlimited mock tests</li>
            <li>All question categories</li>
            <li>Detailed performance analytics</li>
          </ul>
          <Link 
            href="/practice/pricing"
            className="btn btn-primary"
          >
            View Pricing Plans
          </Link>
        </div>
      )}
    </div>
  );
}
```

## Example 3: Inline Subscription Check

Check entitlement before performing an action:

```typescript
import { checkEntitlementStatus } from '@/lib/services/payment-service';
import { useAuthStore } from '@/lib/store';

export default function QuestionPage() {
  const { user } = useAuthStore();

  const handleStartTest = async () => {
    if (!user?.activeJurisdictionId) {
      alert('Please select a jurisdiction');
      return;
    }

    try {
      const { hasAccess } = await checkEntitlementStatus(user.activeJurisdictionId);
      
      if (!hasAccess) {
        const shouldNavigate = confirm(
          'This feature requires a subscription. Would you like to view pricing?'
        );
        if (shouldNavigate) {
          router.push('/practice/pricing');
        }
        return;
      }

      // Proceed with test
      startTest();
    } catch (error) {
      console.error('Failed to check access:', error);
    }
  };

  return (
    <button onClick={handleStartTest}>
      Start Test
    </button>
  );
}
```

## Example 4: Show Subscription Status

Display user's subscription status in profile:

```typescript
import { useEntitlement } from '@/lib/hooks/use-entitlement';
import { useAuthStore } from '@/lib/store';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { hasAccess, loading } = useEntitlement(user?.activeJurisdictionId);

  return (
    <div>
      <h1>Profile</h1>
      
      <div className="bg-card border rounded-lg p-6">
        <h2>Subscription Status</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : hasAccess ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Active Subscription</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>No Active Subscription</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Example 5: Protect Multiple Routes

Create a layout wrapper for protected sections:

```typescript
// app/[locale]/practice/premium/layout.tsx
import { EntitlementGuard } from '@/components/auth/entitlement-guard';

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntitlementGuard fallbackPath="/practice/pricing">
      <div className="premium-section">
        <div className="premium-badge">Premium Content</div>
        {children}
      </div>
    </EntitlementGuard>
  );
}
```

Then all pages under `/practice/premium/*` will automatically require subscription.

## Testing Checklist

- [ ] User can view pricing page without subscription
- [ ] User can click "Subscribe Now" and be redirected to Stripe
- [ ] Payment with test card completes successfully
- [ ] User is redirected to success page after payment
- [ ] Success page polls for entitlement (shows loading)
- [ ] User is redirected to dashboard after entitlement is confirmed
- [ ] Protected routes show subscription required message
- [ ] EntitlementGuard redirects to pricing page
- [ ] User with active subscription can access protected features
- [ ] Payment cancellation redirects correctly
- [ ] Error states display properly
