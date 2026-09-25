"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditSheet } from "@/components/admin/edit-sheet";
import { Field, RowActions, SelectField } from "@/components/admin/fields";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Enter a valid email"),
  fromAirport: z.string().min(2, "From airport is required"),
  toAirport: z.string().optional(),
  serviceLevel: z.string().min(1, "Service is required"),
  status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]),
  paymentStatus: z.enum(["Unpaid", "Paid", "Refunded"]),
  totalAmount: z.coerce.number().min(0, "Amount is required"),
});

export default function ReservationsPage() {
  const { rows, loading, reload } = useList("/api/reservations");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!editing) return;
    form.reset({
      customerName: editing.customerName || "",
      customerEmail: editing.customerEmail || "",
      fromAirport: editing.fromAirport || "",
      toAirport: editing.toAirport || "",
      serviceLevel: editing.serviceLevel || "",
      status: editing.status || "Pending",
      paymentStatus: editing.paymentStatus || "Unpaid",
      totalAmount: Number(editing.totalAmount || 0),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      await api.put(`/api/reservations/${editing.id}`, values);
      toast.success("Reservation updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the reservation");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this reservation?")) return;
    try {
      await api.delete(`/api/reservations/${id}`);
      toast.success("Reservation deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the reservation");
    }
  }

  return (
    <div className="space-y-4">
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No reservations."
        columns={[
          { key: "customer", header: "Customer", cell: (row) => row.customerName },
          { key: "email", header: "Email", cell: (row) => row.customerEmail },
          { key: "route", header: "Route", cell: (row) => `${row.fromAirport || "—"} → ${row.toAirport || "—"}` },
          { key: "status", header: "Status", cell: (row) => row.status },
          { key: "amount", header: "Amount", cell: (row) => `$${Number(row.totalAmount || 0).toLocaleString()}` },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title="Edit reservation" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.customerName?.message}><Input {...form.register("customerName")} /></Field>
          <Field label="Email" error={form.formState.errors.customerEmail?.message}><Input {...form.register("customerEmail")} /></Field>
          <Field label="From" error={form.formState.errors.fromAirport?.message}><Input {...form.register("fromAirport")} /></Field>
          <Field label="To"><Input {...form.register("toAirport")} /></Field>
          <Field label="Service" error={form.formState.errors.serviceLevel?.message}><Input {...form.register("serviceLevel")} /></Field>
          <Field label="Status">
            <SelectField {...form.register("status")}>
              <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
            </SelectField>
          </Field>
          <Field label="Payment">
            <SelectField {...form.register("paymentStatus")}>
              <option>Unpaid</option><option>Paid</option><option>Refunded</option>
            </SelectField>
          </Field>
          <Field label="Amount" error={form.formState.errors.totalAmount?.message}><Input type="number" step="0.01" {...form.register("totalAmount")} /></Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
