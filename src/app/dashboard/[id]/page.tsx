import dynamic from 'next/dynamic';

const ReportEditor = dynamic(() => import('@/components/ReportEditor'), { ssr: false });

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ReportEditor params={params} />;
}