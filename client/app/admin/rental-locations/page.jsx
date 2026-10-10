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
});

export default function RentalLocationsPage() {
  const { rows, loading, reload } = useList("/api/rental-locations");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "" } });

  useEffect(() => {
    if (!editing) return;
    form.reset({ name: editing === "new" ? "" : editing.name || "" });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      if (editing === "new") await api.post("/api/rental-locations", values);
      else await api.put(`/api/rental-locations/${editing.id}`, values);
      toast.success(editing === "new" ? "Location added" : "Location updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the location");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this location?")) return;
    try {
      await api.delete(`/api/rental-locations/${id}`);
      toast.success("Location deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the location");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>Add location</Button>
      </div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No rental locations."
        columns={[
          { key: "name", header: "Location", cell: (row) => row.name },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add location" : "Edit location"} description="These names appear in the pickup and return menus on the rentals page." onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} placeholder="Princess Juliana Airport, SXM" /></Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
