"use client"

import { useEffect, useState } from 'react';
import { useMockTestStore } from '@/lib/store/mock-test-store';

export default function TestStorePage() {
  const [mounted, setMounted] = useState(false);
  const { testState } = useMockTestStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mock Test Store Test</h1>
      <div className="bg-card p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          Store Status: {testState ? 'Has State' : 'No State'}
        </p>
        <pre className="mt-4 text-xs">
          {JSON.stringify(testState, null, 2)}
        </pre>
      </div>
    </div>
  );
}
