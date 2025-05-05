import type { FC } from 'react';

interface ReportTagsProps {
  iocs?: string[];
  mitreTags?: string[];
  onRemove: (type: 'ioc' | 'mitre', value: string) => void;
  type: 'ioc' | 'mitre';
}

export const ReportTags: FC<ReportTagsProps> = ({ iocs, mitreTags, onRemove, type }) => {
  const tagsToRender = type === 'ioc' ? iocs : mitreTags;

  if (!tagsToRender || tagsToRender.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tagsToRender.map((tag) => (
        <button
          key={tag}
          onClick={() => onRemove(type, tag)}
          className={`inline-flex items-center bg-neutral-700 text-neutral-300 text-xs rounded-full px-2 py-1 hover:bg-neutral-600 focus:outline-none`}
        >
          {tag}
          <span className="ml-1 text-neutral-500 cursor-pointer">✕</span>
        </button>
      ))}
    </div>
  );
};

export type { ReportTagsProps };