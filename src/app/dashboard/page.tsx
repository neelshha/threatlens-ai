'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type Report } from '@prisma/client';
import { FormattedDate } from '@/components/FormattedDate';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';

type ReportFromAPI = Omit<Report, 'createdAt' | 'updatedAt' | 'iocs' | 'mitreTags'> & {
  createdAt: string;
  updatedAt: string;
  iocs?: string[];
  mitreTags?: string[];
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<ReportFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to fetch reports (${res.status})`);
        }
        const data = (await res.json()) as ReportFromAPI[];
        setReports(data);
      } catch (err: unknown) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') fetchReports();
  }, [status]);

  if (status === 'loading') {
    return (
      <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        <p className="ml-2 text-neutral-400">Checking authentication...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          <p className="text-lg text-neutral-400">Loading Reports...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4">
        <div className="bg-neutral-800 border border-red-700/50 p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-300 mb-3">Loading Error</h2>
          <p className="text-neutral-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-neutral-950 text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
          Stored Threat Reports
        </h1>

        {reports.length === 0 ? (
          <div className="text-center text-neutral-400 p-10 mt-8 bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-700 max-w-2xl mx-auto">
            <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-neutral-300 mb-2">No Reports Found</p>
            <p className="text-sm">There are currently no threat reports stored in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/${report.id}`}
                aria-label={`View report ${report.title}`}
                className="block group"
              >
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-neutral-600 group-hover:scale-[1.02]">
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold text-white line-clamp-2 leading-snug mb-1 group-hover:text-blue-400 transition-colors">
                        {report.title || 'Untitled Report'}
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Created on <FormattedDate iso={report.createdAt} />
                      </p>
                    </div>

                    <p className="text-sm text-neutral-300 line-clamp-4 flex-grow">
                      {report.summary || (
                        <span className="italic text-neutral-500">No summary available.</span>
                      )}
                    </p>

                    <div className="mt-3 pt-3 border-t border-neutral-700/50 flex flex-wrap gap-1">
                      {(report.mitreTags || []).slice(0, 3).map((tag) =>
                        tag ? (
                          <span
                            key={tag}
                            className="text-xs bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ) : null
                      )}
                      {report.mitreTags && report.mitreTags.length > 3 && (
                        <span className="text-xs text-neutral-500">+ more</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}