'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const ReportLink: React.FC<{ reportId: string }> = ({ reportId }) => (
  <Link
    href={`/dashboard/${reportId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline mt-3 font-medium group"
  >
    View Full Report
    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
  </Link>
);

export default ReportLink; 