import { prisma } from '@/app/prisma';
import { FormattedDate } from '@/components/FormattedDate';
import { type Report } from '@prisma/client';
import Link from 'next/link';

export default async function Dashboard() {
  const reports: Report[] = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="bg-white dark:bg-gray-950 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Stored Threat Reports
        </h1>

        {reports.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <p>No reports found.</p>
          </div>
        ) : (
          <div className="rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 shadow-md transition-shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg"
                >
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      <Link
                        href={`/dashboard/${report.id}`}
                        className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {report.title}
                      </Link>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      <FormattedDate iso={report.createdAt.toString()} />
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mt-2">
                      {report.summary}
                    </p>
                    <div className="mt-4 text-right">
                      <Link
                        href={`/dashboard/${report.id}`}
                        className="text-sm text-gray-900 dark:text-white hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

