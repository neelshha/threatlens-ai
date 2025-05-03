'use client';

export function FormattedDate({ iso }: { iso: string | Date }) {
  const date = new Date(iso);
  return (
    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
      Created at: {date.toLocaleString()}
    </p>
  );
}