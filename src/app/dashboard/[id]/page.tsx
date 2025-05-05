import ReportEditorClient from '@/components/client/ReportEditorClient';

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params }: PageProps) {
  return <ReportEditorClient reportId={params.id} />;
}