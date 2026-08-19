"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/Sidebar/AppSidebar";
import Header from "@/components/layout/Header/Header";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import Footer from "@/components/layout/Footer/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/dashboard/apps/chat");
  const isEmailPage = pathname?.startsWith("/dashboard/apps/email");
  const isTasksPage = pathname?.startsWith("/dashboard/apps/tasks");
  const isNotesPage = pathname?.startsWith("/dashboard/apps/notes");
  const isStoragePage = pathname?.startsWith("/dashboard/apps/storage");
  const isCalendarPage = pathname?.startsWith("/dashboard/apps/calendar");
  const isEventCreatePage = pathname?.startsWith("/dashboard/event/create");
  const isAppPage = isChatPage || isEmailPage || isTasksPage || isNotesPage || isStoragePage || isCalendarPage || isEventCreatePage;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className={cn(
          "bg-background flex flex-col min-w-0 transition-all duration-300",
          isAppPage ? "h-[100dvh] overflow-hidden" : "min-h-screen"
        )}
      >
        <Header />
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 overflow-hidden",
            !isAppPage && "overflow-y-auto"
          )}
        >
          {(!isAppPage || isEventCreatePage) && (
            <Breadcrumb />
          )}
          <div
            className={cn(
              "flex-1 min-w-0 flex flex-col min-h-0",
              isAppPage ? "overflow-hidden" : "px-4 sm:px-6 lg:px-8 pt-6 pb-6"
            )}
          >
            {children}
          </div>
          {!isAppPage && <Footer />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
