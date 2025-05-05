'use client';

import dynamic from 'next/dynamic';

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), { ssr: false });

interface ReportEditorClientProps {
  params: { id: string };
}

const ReportEditorClient: React.FC<ReportEditorClientProps> = ({ params }) => {
  return <ReportEditor params={params} />;
};

export default ReportEditorClient;