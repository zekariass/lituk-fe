"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeMockTestPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/practice/mock-test/start');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to mock test...</p>
    </div>
  );
}
