"use client";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex overflow-hidden h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
