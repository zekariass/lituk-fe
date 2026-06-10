import { redirect } from 'next/navigation';

interface MockTestRedirectPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MockTestRedirectPage({ params }: MockTestRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/practice/mock-test`);
}
