"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditSheet } from "@/components/admin/edit-sheet";
import { Field, RowActions } from "@/components/admin/fields";
import { featuresToHtml, htmlToFeatures, plainHtml, RichText } from "@/components/admin/rich-text";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  basePrice: z.coerce.number().min(0, "Price is required"),
  description: z.string().optional(),
  features: z.string().optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
});

export default function PackagesPage() {
  const { rows, loading, reload } = useList("/api/packages");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { isActive: true, isPopular: false } });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ name: "", basePrice: 0, description: "", features: "", isActive: true, isPopular: false });
      return;
    }
    form.reset({
      name: editing.name || "",
      basePrice: Number(editing.basePrice || 0),
      description: editing.description || "",
      features: featuresToHtml(editing.features),
      isActive: Boolean(editing.isActive),
      isPopular: Boolean(editing.isPopular),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    const body = {
      ...values,
      description: plainHtml(values.description),
      features: htmlToFeatures(values.features),
    };
    try {
      if (editing === "new") await api.post("/api/packages", body);
      else await api.put(`/api/packages/${editing.id}`, body);
      toast.success(editing === "new" ? "Package created" : "Package updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the package");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this package?")) return;
    try {
      await api.delete(`/api/packages/${id}`);
      toast.success("Package deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the package");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Add package</Button></div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No packages."
        columns={[
          { key: "name", header: "Name", cell: (row) => row.name },
          { key: "price", header: "Base price", cell: (row) => `$${Number(row.basePrice || 0).toLocaleString()}` },
          { key: "active", header: "Active", cell: (row) => row.isActive ? "Yes" : "No" },
          { key: "orders", header: "Orders", cell: (row) => row.totalOrders || 0 },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add package" : "Edit package"} description="Use the editor for the description and the included features." className="data-[side=right]:sm:max-w-2xl" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Base price" error={form.formState.errors.basePrice?.message}><Input type="number" step="0.01" {...form.register("basePrice")} /></Field>
          <Field label="Description">
            <Controller name="description" control={form.control} render={({ field }) => <RichText value={field.value} onChange={field.onChange} placeholder="Package details" />} />
          </Field>
          <Field label="Features">
            <Controller name="features" control={form.control} render={({ field }) => <RichText value={field.value} onChange={field.onChange} placeholder="Add a bullet for each included feature" />} />
          </Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isPopular")} /> Popular</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
