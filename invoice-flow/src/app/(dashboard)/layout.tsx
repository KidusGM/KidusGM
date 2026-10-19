import Sidebar from "../../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}