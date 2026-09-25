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
  email: z.string().email("Enter a valid email"),
  airport: z.string().optional(),
  service_type: z.string().optional(),
  passengers: z.coerce.number().min(1).optional(),
  date: z.string().optional(),
  status: z.enum(["Inquiry", "Contacted", "Booked"]),
});

function dateValue(value) {
  if (!value) return "";
  return String(value).slice(0, 16);
}

export default function LeadsPage() {
  const { rows, loading, reload } = useList("/api/leads");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!editing) return;
    form.reset({
      email: editing.email || "",
      airport: editing.airport || "",
      service_type: editing.service_type || "",
      passengers: editing.passengers || 1,
      status: editing.status || "Inquiry",
      date: dateValue(editing.date),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      await api.put(`/api/leads/${editing.id}`, {
        ...values,
        date: values.date ? values.date.replace("T", " ") : null,
      });
      toast.success("Lead updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the lead");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this lead?")) return;
    try {
      await api.delete(`/api/leads/${id}`);
      toast.success("Lead deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the lead");
    }
  }

  return (
    <div className="space-y-4">
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No leads."
        columns={[
          { key: "email", header: "Email", cell: (row) => row.email },
          { key: "airport", header: "Airport", cell: (row) => row.airport },
          { key: "service", header: "Service", cell: (row) => row.service_type },
          { key: "status", header: "Status", cell: (row) => row.status },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title="Edit lead" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
          <Field label="Airport"><Input {...form.register("airport")} /></Field>
          <Field label="Service"><Input {...form.register("service_type")} /></Field>
          <Field label="Date"><Input type="datetime-local" {...form.register("date")} /></Field>
          <Field label="Passengers"><Input type="number" min="1" {...form.register("passengers")} /></Field>
          <Field label="Status">
            <SelectField {...form.register("status")}>
              <option>Inquiry</option><option>Contacted</option><option>Booked</option>
            </SelectField>
          </Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
