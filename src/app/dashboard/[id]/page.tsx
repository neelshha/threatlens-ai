// src/app/dashboard/[id]/page.tsx
interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <div>Report ID: {params.id}</div>;
}