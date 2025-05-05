// src/hooks/useReports.ts

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useReports() {
  const { data, error, isLoading, mutate } = useSWR('/api/reports', fetcher);
  return { reports: data, error, isLoading, mutate };
}