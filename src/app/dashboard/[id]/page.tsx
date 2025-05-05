import ReportEditorClient from '@/components/client/ReportEditorClient';
import { NextPage } from 'next';

interface PageParams {
  id: string;
}

interface PageProps {
  params: PageParams;
}

const Page: NextPage<PageProps> = ({ params }) => {
  return <ReportEditorClient params={params} />;
};

export default Page;