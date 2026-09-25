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
  code: z.string().max(10).optional(),
  isActive: z.boolean(),
});

export default function AirlinesPage() {
  const { rows, loading, reload } = useList("/api/airlines");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", code: "", isActive: true } });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ name: "", code: "", isActive: true });
      return;
    }
    form.reset({
      name: editing.name || "",
      code: editing.code || "",
      isActive: Boolean(editing.isActive),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      if (editing === "new") await api.post("/api/airlines", values);
      else await api.put(`/api/airlines/${editing.id}`, values);
      toast.success(editing === "new" ? "Airline added" : "Airline updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the airline");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this airline?")) return;
    try {
      await api.delete(`/api/airlines/${id}`);
      toast.success("Airline deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the airline");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>Add airline</Button>
      </div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No airlines."
        columns={[
          { key: "name", header: "Airline", cell: (row) => row.name },
          { key: "code", header: "Code", cell: (row) => row.code || "—" },
          { key: "active", header: "In the form", cell: (row) => row.isActive ? "Yes" : "No" },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add airline" : "Edit airline"} description="Active airlines appear in the booking flight form." onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Code"><Input {...form.register("code")} placeholder="DL" /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> Show in the booking form</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
