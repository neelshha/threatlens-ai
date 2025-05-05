'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useState, useEffect } from 'react';

interface ReportEditorClientProps {
  reportId: string;
}

interface ReportData {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  iocs: string[];
  mitreTags: string[];
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
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return; // Don't fetch if no reportId

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || `Failed to fetch report: ${res.status}`);
        }
        const data: ReportData = await res.json();
        setReportData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]); // Re-fetch if reportId changes

  if (!reportId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Oops!</strong>
        <span className="block sm:inline"> It seems we're missing the Report ID. Please ensure it's provided.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        <p className="text-gray-600 ml-4">Loading Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load report: {error}</span>
      </div>
    );
  }

  return (
    <div className="rounded-md shadow-md overflow-hidden">
      {reportData && <ReportEditor id={reportId} />}
    </div>
  );
};

export default ReportEditorClient;