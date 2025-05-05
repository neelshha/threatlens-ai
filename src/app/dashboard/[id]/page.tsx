import ReportEditorClient from '@/components/client/ReportEditorClient';

export default function Page({ params }: { params: { id: string } }) {
  return <ReportEditorClient reportId={params.id} />;
}