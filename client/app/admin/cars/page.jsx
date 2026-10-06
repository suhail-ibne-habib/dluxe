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
  year: z.coerce.number().min(1980, "Enter a year"),
  pricePerDay: z.coerce.number().min(0, "Enter a daily price"),
  location: z.string().optional(),
  transmission: z.string().optional(),
  seats: z.coerce.number().min(1).optional(),
  imageUrl: z.string().optional(),
  available: z.boolean(),
});

export default function CarsPage() {
  const { rows, loading, reload } = useList("/api/cars");
  const [editing, setEditing] = useState(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", year: 2020, pricePerDay: 0, location: "", transmission: "Auto", seats: 2, imageUrl: "", available: true },
  });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ name: "", year: new Date().getFullYear(), pricePerDay: 0, location: "", transmission: "Auto", seats: 2, imageUrl: "", available: true });
      return;
    }
    form.reset({
      name: editing.name || "",
      year: editing.year || new Date().getFullYear(),
      pricePerDay: editing.pricePerDay || 0,
      location: editing.location || "",
      transmission: editing.transmission || "Auto",
      seats: editing.seats || 2,
      imageUrl: editing.imageUrl || "",
      available: Boolean(editing.available),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      if (editing === "new") await api.post("/api/cars", values);
      else await api.put(`/api/cars/${editing.id}`, values);
      toast.success(editing === "new" ? "Car added" : "Car updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the car");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this car?")) return;
    try {
      await api.delete(`/api/cars/${id}`);
      toast.success("Car deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the car");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>Add car</Button>
      </div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No cars."
        columns={[
          { key: "name", header: "Car", cell: (row) => row.name },
          { key: "year", header: "Year", cell: (row) => row.year },
          { key: "price", header: "Per day", cell: (row) => `$${row.pricePerDay}` },
          { key: "location", header: "Pickup", cell: (row) => row.location || "—" },
          { key: "available", header: "Available", cell: (row) => row.available ? "Yes" : "No" },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add car" : "Edit car"} description="Shown on the public rentals page." className="data-[side=right]:sm:max-w-xl" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Year" error={form.formState.errors.year?.message}><Input type="number" {...form.register("year")} /></Field>
            <Field label="Price per day (USD)" error={form.formState.errors.pricePerDay?.message}><Input type="number" {...form.register("pricePerDay")} /></Field>
          </div>
          <Field label="Pickup location"><Input {...form.register("location")} placeholder="Sint Maarten" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Transmission"><Input {...form.register("transmission")} /></Field>
            <Field label="Seats"><Input type="number" {...form.register("seats")} /></Field>
          </div>
          <Field label="Photo URL"><Input {...form.register("imageUrl")} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("available")} /> Available to book</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
