import DashboardGuard from "@/components/dashboard/DashboardGuard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNotice from "@/components/dashboard/DashboardMobileNotice";

export const metadata = {
  title: "Dashboard · OriginalReels",
};

export default function DashboardLayout({ children }) {
  return (
    <DashboardGuard>
      <DashboardMobileNotice />
      <div className="hidden md:flex min-h-screen bg-gray-50 dark:bg-zinc-950 w-full transition-colors duration-200">
        <DashboardSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </DashboardGuard>
  );
}
