'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useState, useEffect } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      <p className="text-gray-600 ml-4">Preparing the Editor...</p>
    </div>
  ),
});

const ReportEditorClient: FC<ReportEditorClientProps> = ({ reportId }) => {
  if (!reportId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Oops!</strong>
        <span className="block sm:inline"> It seems we're missing the Report ID. Please ensure it's provided.</span>
      </div>
    );
  }

  return (
    <div className="rounded-md shadow-md overflow-hidden">
      <ReportEditor id={reportId} />
    </div>
  );
};

export default ReportEditorClient;
