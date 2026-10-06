"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plane,
  MapPin,
  MessageSquareQuote,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient, clearSessionToken } from "@/lib/auth-client";

const groups = [
  {
    label: "Home",
    links: [
      ["Dashboard", "/admin", LayoutDashboard],
      ["Reservations", "/admin/reservations", Inbox],
      ["Leads", "/admin/leads", FileText],
      ["Transactions", "/admin/transactions", CreditCard],
      ["Customers", "/admin/customers", Users],
      ["Rental requests", "/admin/rentals", Car],
    ],
  },
  {
    label: "Catalog",
    links: [
      ["Locations", "/admin/locations", MapPin],
      ["Airlines", "/admin/airlines", Plane],
      ["Cars", "/admin/cars", Car],
      ["Packages", "/admin/packages", Package],
      ["Pages", "/admin/pages", FileText],
      ["Testimonials", "/admin/testimonials", MessageSquareQuote],
      ["Settings", "/admin/settings", Settings],
    ],
  },
];

const titles = {
  "/admin": "Dashboard",
  "/admin/reservations": "Reservations",
  "/admin/leads": "Leads",
  "/admin/transactions": "Transactions",
  "/admin/customers": "Customers",
  "/admin/rentals": "Rental requests",
  "/admin/cars": "Cars",
  "/admin/locations": "Locations",
  "/admin/airlines": "Airlines",
  "/admin/packages": "Packages",
  "/admin/pages": "Airport pages",
  "/admin/testimonials": "Testimonials",
  "/admin/settings": "Settings",
};

export function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const title = titles[pathname] || "Admin";

  useEffect(() => {
    if (isPending) return;
    if (error) {
      toast.error("Could not check the admin session");
      return;
    }
    if (session?.user?.role !== "admin") router.replace("/admin/login");
  }, [isPending, error, session?.user?.role, router]);

  async function signOut() {
    await authClient.signOut();
    clearSessionToken();
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">D</span>
          <div>
            <p className="text-sm font-semibold">D&apos;LUXE</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-auto p-3">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-2 text-xs text-muted-foreground">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.links.map(([label, href, Icon]) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(buttonVariants({ variant: active ? "secondary" : "ghost" }), "justify-start")}
                    >
                      <Icon />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-6">
          <h1 className="text-base font-medium">{title}</h1>
        </header>
        <main className="min-w-0 flex-1 p-6">
          {isPending ? <p className="text-sm text-muted-foreground">Checking session...</p> : children}
        </main>
      </div>
    </div>
  );
}
