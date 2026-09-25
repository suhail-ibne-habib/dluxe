"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Shell } from "@/components/admin/shell";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="dark min-h-screen bg-background text-foreground [--primary:#ea580c] [--primary-foreground:#ffffff] [--chart-1:#f97316] [--chart-2:#fdba74]">
      <Toaster />
      {pathname === "/admin/login" ? children : <Shell>{children}</Shell>}
    </div>
  );
}
