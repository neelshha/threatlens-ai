import ReportEditorClient from '@/components/client/ReportEditorClient';

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  return <ReportEditorClient params={params} />;
}