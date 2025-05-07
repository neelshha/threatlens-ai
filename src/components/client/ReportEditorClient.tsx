'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col items-center gap-4 text-[#a0aaff]">
        <div className="h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#3942f2] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm sm:text-base font-medium">Preparing the Report Editor...</p>
      </div>
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
    <div className="w-full">
      <ReportEditor id={reportId} />
    </div>
  );
};

export default ReportEditorClient;