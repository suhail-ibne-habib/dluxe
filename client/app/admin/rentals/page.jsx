"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const statuses = ["Inquiry", "Confirmed", "Cancelled"];

export default function RentalRequestsPage() {
  const { rows, loading, reload } = useList("/api/rental-requests");
  const [savingId, setSavingId] = useState(null);

  async function updateStatus(id, status) {
    setSavingId(id);
    try {
      await api.put(`/api/rental-requests/${id}`, { status });
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
      empty="No rental requests."
      columns={[
        { key: "car", header: "Car", cell: (row) => row.carName },
        { key: "guest", header: "Guest", cell: (row) => row.name || row.email },
        { key: "email", header: "Email", cell: (row) => row.email },
        { key: "pickup", header: "Pickup", cell: (row) => row.pickupLocation || "—" },
        { key: "date", header: "Date", cell: (row) => row.pickupDate ? String(row.pickupDate).slice(0, 10) : "—" },
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
