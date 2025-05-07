'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 w-full bg-[#0e1629] border border-[#3942f2] rounded-xl shadow-lg relative overflow-hidden">
      {/* Pulsing blurred background glow */}
      <div className="absolute w-40 h-40 bg-[#3942f2] opacity-30 rounded-full blur-2xl animate-ping-slow"></div>

      {/* Spinner */}
      <div className="relative z-10">
        <div className="h-14 w-14 sm:h-16 sm:w-16 border-4 border-[#3942f2] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>

      {/* Text */}
      <p className="mt-6 text-sm sm:text-base text-[#a0aaff] font-medium z-10">
        Initializing Threat Report Editor...
      </p>
    </div>
  ),
});

// Custom slow ping animation via Tailwind plugin or utilities
// If you're using `tailwind.config.js`, add this:
// extend: { animation: { 'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' } }

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