// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Timetable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {/* Left Sidebar */}
            <AppSidebar />

            {/* Right Content Area */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Top Header */}
              <Header leftSlot={<SidebarTrigger />} />

              {/* Page Content */}
              <main className="flex-1 p-4">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
