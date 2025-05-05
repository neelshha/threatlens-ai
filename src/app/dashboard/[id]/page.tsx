import ReportEditorClient from '@/components/client/ReportEditorClient';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportEditorClient reportId={id} />;
}