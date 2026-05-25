import DashboardGuard from "@/components/dashboard/DashboardGuard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const metadata = {
  title: "Dashboard · OriginalReels",
};

export default function DashboardLayout({ children }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </DashboardGuard>
  );
}
