import { prisma } from '@/app/prisma';
import { type Report } from '@prisma/client';
import { FormattedDate } from '@/components/FormattedDate';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ReportDetail({ params }: { params: { id: string } }) {
  const report: Report | null = await prisma.report.findUnique({ where: { id: params.id } });

  if (!report) return notFound();

  return (
    <main className="bg-white dark:bg-black min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg p-8">
        <Link href="/dashboard" className="text-black dark:text-white hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{report.title}</h1>
        <FormattedDate iso={report.createdAt.toString()} />

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Summary</h2>
          <p className="text-black/70 dark:text-white/70">{report.summary}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-2">IOCs</h2>
          <div className="flex flex-wrap gap-2">
            {report.iocs.length > 0 ? (
              report.iocs.map((ioc) => (
                <span key={ioc} className="border border-black dark:border-white text-black dark:text-white px-2 py-1 rounded-full text-sm">
                  {ioc}
                </span>
              ))
            ) : (
              <p className="text-black/60 dark:text-white/60">N/A</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-2">MITRE TTPs</h2>
          <div className="flex flex-wrap gap-2">
            {report.mitreTags.length > 0 ? (
              report.mitreTags.map((tag) => (
                <span key={tag} className="border border-black dark:border-white text-black dark:text-white px-2 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-black/60 dark:text-white/60">N/A</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}