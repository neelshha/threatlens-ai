'use client'; // 👈 This makes the page a Client Component

import ReportEditor from '@/components/ReportEditor';

export default function Page({ params }: { params: { id: string } }) {
  return <ReportEditor params={params} />;
}