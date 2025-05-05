'use client';

import ReportEditor from '@/components/ReportEditor';

export default function Page({ params }: { params: { id: string } }) {
  return <ReportEditor params={params} />;
}