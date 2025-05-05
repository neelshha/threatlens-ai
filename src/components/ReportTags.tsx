// src/components/ReportTags.tsx

import { getIOCType } from '@/lib/iocUtils';
import { mitreDescriptions } from '@/lib/mitreTags';

export function ReportTags({ iocs = [], mitreTags = [] }: { iocs?: string[]; mitreTags?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {iocs.map((ioc, idx) => (
          <span key={idx} className="px-2 py-1 text-xs rounded bg-neutral-700 text-white font-mono">
            {ioc} <span className="opacity-60">({getIOCType(ioc)})</span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {mitreTags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 text-xs rounded-full bg-blue-800/80 text-blue-100 cursor-help"
            title={mitreDescriptions[tag] || 'Unknown technique'}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}