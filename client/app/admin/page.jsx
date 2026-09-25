"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  total: { label: "Revenue", color: "var(--chart-1)" },
};

export default function AdminHome() {
  const [counts, setCounts] = useState({ Reservations: null, Leads: null, Customers: null, Revenue: null });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/api/reservations"),
      api.get("/api/leads"),
      api.get("/api/admin/customers"),
      api.get("/api/admin/analytics/revenue"),
    ]).then(([reservations, leads, customers, revenue]) => {
      if (cancelled) return;
      const rows = Array.isArray(reservations.data) ? reservations.data : [];
      const booked = rows.filter((row) => row.status !== "Cancelled").reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
      setCounts({
        Reservations: rows.length,
        Leads: Array.isArray(leads.data) ? leads.data.length : 0,
        Customers: Array.isArray(customers.data) ? customers.data.length : 0,
        Revenue: booked,
      });
      setSeries(Array.isArray(revenue.data) ? revenue.data : []);
    }).catch((error) => {
      if (!cancelled) toast.error(error.response?.data?.message || "Could not load the dashboard");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const previous = series.length > 1 ? Number(series[series.length - 2].total) : 0;
  const latest = series.length ? Number(series[series.length - 1].total) : 0;
  const change = previous ? ((latest - previous) / previous) * 100 : null;

  const cards = [
    ["Total revenue", counts.Revenue == null ? "—" : `$${Number(counts.Revenue).toLocaleString()}`, "Booked amount", "Excludes cancelled trips"],
    ["Reservations", counts.Reservations ?? "—", "All bookings", "Trips currently on file"],
    ["Customers", counts.Customers ?? "—", "Registered accounts", "People who can sign in"],
    ["Leads", counts.Leads ?? "—", "Inbound inquiries", "Quotes that are not bookings yet"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, caption, detail], index) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardDescription>{label}</CardDescription>
              {index === 0 && change != null ? (
                <Badge variant="outline">
                  {change >= 0 ? <TrendingUp /> : <TrendingDown />}
                  {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="mt-2 text-sm">{caption}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Total for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No revenue in the last 6 months.</p>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
              <AreaChart data={series}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="total" type="natural" fill="var(--color-total)" stroke="var(--color-total)" fillOpacity={0.35} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
