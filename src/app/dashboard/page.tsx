'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type Report } from '@prisma/client'; // Assuming Report type from Prisma
import { FormattedDate } from '@/components/FormattedDate'; // Ensure this component exists
import { Loader2, AlertTriangle, FileText } from 'lucide-react'; // Icons for states

// Define the expected shape of the report data coming from the API
// Use Omit & intersection to correctly handle type changes (Date->string, required->optional)
type ReportFromAPI = Omit<Report, 'createdAt' | 'updatedAt' | 'iocs' | 'mitreTags'> & {
  createdAt: string;      // Dates from API are strings
  updatedAt: string;      // Dates from API are strings
  iocs?: string[];        // Allow iocs to be undefined or string[] from API
  mitreTags?: string[];   // Allow mitreTags to be undefined or string[] from API
};


export default function Dashboard() {
  // Use the corrected type here
  const [reports, setReports] = useState<ReportFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/reports'); // Ensure this API route exists and returns Report[]
        if (!res.ok) {
          // Try to get error message from response body
          let errorMsg = `Failed to fetch reports (Status: ${res.status})`;
          try {
              const errData = await res.json();
              errorMsg = errData.error || errorMsg;
          } catch(e) { /* Ignore if response not json */ }
          throw new Error(errorMsg);
        }
        const data = await res.json();
        // Cast the received data to the specific API type
        setReports(data as ReportFromAPI[]);
      } catch (err: any) {
        console.error("Error fetching reports:", err);
        setError(err.message || 'An unknown error occurred.');
        setReports([]); // Clear reports on error
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Loading State ---
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

  // --- Error State ---
  if (error) {
    return (
      <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4">
        <div className="bg-neutral-800 border border-red-700/50 p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-300 mb-3">Loading Error</h2>
          <p className="text-neutral-300 mb-6">{error}</p>
          <button
             onClick={() => window.location.reload()} // Simple reload action
             className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white transition-colors duration-200 text-sm font-medium"
           >
             Try Again
           </button>
        </div>
      </main>
    );
  }

  // --- Main Content ---
  return (
    // Consistent padding and background with Navbar/ReportPage
    <main className="bg-neutral-950 text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Use max-w-7xl for potentially wider content area */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-10">
          Stored Threat Reports
        </h1>

        {reports.length === 0 ? (
          // Enhanced "No Reports" state
          <div className="text-center text-neutral-400 p-10 mt-8 bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-700 max-w-2xl mx-auto">
             <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-neutral-300 mb-2">No Reports Found</p>
            <p className="text-sm">There are currently no threat reports stored in the system.</p>
             {/* Optional: Add a link/button to create/upload a report */}
             {/* <Link href="/upload">
                <span className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium">
                  Upload Report
                </span>
             </Link> */}
          </div>
        ) : (
          // Grid layout for report cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map((report) => (
              // Link wraps the entire card for better clickability
              <Link href={`/dashboard/${report.id}`} key={report.id} className="block group">
                {/* Card styling consistent with ReportPage */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-neutral-600 group-hover:scale-[1.02]">
                  <div className="p-5 flex flex-col flex-grow"> {/* Use p-5 for slightly tighter padding */}
                    {/* Card Header */}
                    <div className="mb-3">
                       <h2 className="text-lg font-semibold text-white line-clamp-2 leading-snug mb-1 group-hover:text-blue-400 transition-colors">
                         {report.title || "Untitled Report"} {/* Fallback title */}
                       </h2>
                       <p className="text-xs text-neutral-400">
                         {/* Ensure FormattedDate handles string input */}
                         Created on <FormattedDate iso={report.createdAt} />
                       </p>
                    </div>

                    {/* Card Body (Summary) - Takes up remaining space */}
                    <p className="text-sm text-neutral-300 line-clamp-4 flex-grow"> {/* Increased line-clamp */}
                      {report.summary || <span className="italic text-neutral-500">No summary available.</span>}
                    </p>

                    {/* Optional: Add tags/indicators preview here if needed */}
                     <div className="mt-3 pt-3 border-t border-neutral-700/50 flex flex-wrap gap-1">
                       {(report.mitreTags || []).slice(0, 3).map(tag => ( // Added default empty array
                         <span key={tag} className="text-xs bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded-full">{tag}</span>
                       ))}
                       {report.mitreTags && report.mitreTags.length > 3 && <span className="text-xs text-neutral-500">...</span>}
                     </div>

                    {/* Removed explicit "View Details" - whole card is the link */}
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