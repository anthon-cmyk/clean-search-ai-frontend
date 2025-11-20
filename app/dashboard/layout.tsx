import { ReactQueryProvider } from "@/src/providers/react-query-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </>
  );
}
