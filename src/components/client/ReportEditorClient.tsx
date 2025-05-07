'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), {
  ssr: false,
  loading: () => (
    <main className="bg-[#020a18] text-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 sm:h-10 sm:w-10 border-4 border-[#3942f2] border-t-transparent rounded-full animate-spin" />
        <p className="text-base text-[#8c9eff]">Loading Report Editor...</p>
      </div>
    </main>
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