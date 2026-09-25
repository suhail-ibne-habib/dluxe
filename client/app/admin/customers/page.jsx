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
import { Field, RowActions } from "@/components/admin/fields";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});

export default function CustomersPage() {
  const { rows, loading, reload } = useList("/api/admin/customers");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!editing) return;
    form.reset({ name: editing.name || "", email: editing.email || "", phone: editing.phone || "" });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      await api.patch(`/api/user/${editing.id}`, values);
      toast.success("Customer updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the customer");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this customer?")) return;
    try {
      await api.delete(`/api/user/${id}`);
      toast.success("Customer deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the customer");
    }
  }

  return (
    <div className="space-y-4">
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No customers."
        columns={[
          { key: "name", header: "Name", cell: (row) => row.name },
          { key: "email", header: "Email", cell: (row) => row.email },
          { key: "phone", header: "Phone", cell: (row) => row.phone || "—" },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title="Edit customer" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
          <Field label="Phone"><Input {...form.register("phone")} /></Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
