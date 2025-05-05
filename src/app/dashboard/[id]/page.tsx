import ReportEditorClient from '@/components/client/ReportEditorClient';

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: { params: { id: string } }) {
  return <ReportEditorClient params={params} />;
}