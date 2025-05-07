'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16" />
      <p className="mt-4 text-sm text-neutral-500">Preparing the editor...</p>
    </div>
  ),
});

const ReportEditorClient: FC<ReportEditorClientProps> = ({ reportId }) => {
  if (!reportId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm max-w-md mx-auto mt-10" role="alert">
        <strong className="font-semibold">Oops!</strong>
        <span className="block mt-1">Missing Report ID. Please ensure it's provided.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:p-6">
        <ReportEditor id={reportId} />
      </div>
    </div>
  );
};

export default ReportEditorClient;
