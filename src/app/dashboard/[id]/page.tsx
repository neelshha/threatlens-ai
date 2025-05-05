'use client';

import ReportEditor from '@/components/ReportEditor';

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ReportEditor params={params} />;
}