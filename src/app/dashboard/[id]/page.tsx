import ReportEditorClient from '@/components/client/ReportEditorClient';
import { NextPage } from 'next';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: NextPage<PageProps> = ({ params }: { params: { id: string } }) => {
  return <ReportEditorClient params={params} />;
};

export default Page;