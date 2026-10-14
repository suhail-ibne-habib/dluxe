"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const statuses = ["Inquiry", "Confirmed", "Cancelled"];

export default function TourBookingsPage() {
  const { rows, loading, reload } = useList("/api/tour-bookings");
  const [savingId, setSavingId] = useState(null);

  async function updateStatus(id, status) {
    setSavingId(id);
    try {
      await api.put(`/api/tour-bookings/${id}`, { status });
      toast.success("Request updated");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the request");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <RecordTable
      loading={loading}
      rows={rows}
      empty="No tour requests."
      columns={[
        { key: "tour", header: "Tour", cell: (row) => row.tourName },
        { key: "guest", header: "Guest", cell: (row) => row.name },
        { key: "email", header: "Email", cell: (row) => row.email },
        { key: "date", header: "Date", cell: (row) => row.date },
        { key: "guests", header: "Guests", cell: (row) => row.guests },
        { key: "phone", header: "Phone", cell: (row) => row.phone || "—" },
        {
          key: "status",
          header: "Status",
          cell: (row) => (
            <select
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
              value={row.status}
              disabled={savingId === row.id}
              onChange={(event) => updateStatus(row.id, event.target.value)}
            >
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          ),
        },
      ]}
    />
  );
}
