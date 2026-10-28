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

const categories = ["Scooter tours", "Scooter rental", "ATV tours", "ATV rental", "Hiking tours"];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  summary: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  price: z.coerce.number().min(0, "Price is required"),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
});

const blank = {
  name: "",
  category: categories[0],
  summary: "",
  description: "",
  duration: "",
  price: 0,
  imageUrl: "",
  isActive: true,
  isPopular: false,
};

export default function ToursAdminPage() {
  const { rows, loading, reload } = useList("/api/tours");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: blank });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset(blank);
      return;
    }
    form.reset({
      name: editing.name || "",
      category: editing.category || categories[0],
      summary: editing.summary || "",
      description: editing.description || "",
      duration: editing.duration || "",
      price: Number(editing.price || 0),
      imageUrl: editing.imageUrl || "",
      isActive: Boolean(editing.isActive),
      isPopular: Boolean(editing.isPopular),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      if (editing === "new") await api.post("/api/tours", values);
      else await api.put(`/api/tours/${editing.id}`, values);
      toast.success(editing === "new" ? "Tour created" : "Tour updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the tour");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this tour?")) return;
    try {
      await api.delete(`/api/tours/${id}`);
      toast.success("Tour deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the tour");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Add tour</Button></div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No tours."
        columns={[
          { key: "name", header: "Name", cell: (row) => row.name },
          { key: "category", header: "Category", cell: (row) => row.category },
          { key: "price", header: "Price", cell: (row) => `€${Number(row.price || 0).toLocaleString()}` },
          { key: "active", header: "Active", cell: (row) => row.isActive ? "Yes" : "No" },
          { key: "bookings", header: "Requests", cell: (row) => row.totalBookings || 0 },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add tour" : "Edit tour"} description="This package appears on the public tours page." className="data-[side=right]:sm:max-w-xl" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <select {...form.register("category")} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>
          <Field label="Short summary"><Input {...form.register("summary")} /></Field>
          <Field label="Description"><textarea {...form.register("description")} rows={5} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
          <Field label="Duration"><Input {...form.register("duration")} placeholder="3 hours" /></Field>
          <Field label="Price per person" error={form.formState.errors.price?.message}><Input type="number" step="0.01" {...form.register("price")} /></Field>
          <Field label="Image URL"><Input {...form.register("imageUrl")} placeholder="https://" /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isPopular")} /> Popular</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
