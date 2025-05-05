import ReportEditor from '@/components/ReportEditor'; // direct import (not dynamic)

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ReportEditor params={params} />;
}