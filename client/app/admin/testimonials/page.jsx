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
  author_name: z.string().min(2, "Name is required"),
  author_title: z.string().optional(),
  content: z.string().min(8, "Write a short review"),
  rating: z.coerce.number().min(1).max(5),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

export default function TestimonialsPage() {
  const { rows, loading, reload } = useList("/api/testimonials");
  const [editing, setEditing] = useState(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { author_name: "", author_title: "", content: "", rating: 5, is_published: true, is_featured: false },
  });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ author_name: "", author_title: "", content: "", rating: 5, is_published: true, is_featured: false });
      return;
    }
    form.reset({
      author_name: editing.author_name || "",
      author_title: editing.author_title || "",
      content: editing.content || "",
      rating: Number(editing.rating || 5),
      is_published: Boolean(editing.is_published),
      is_featured: Boolean(editing.is_featured),
    });
  }, [editing, form]);

  async function onSubmit(values) {
    const body = { ...values, author_image_url: editing?.author_image_url || "", is_published: values.is_published ? 1 : 0, is_featured: values.is_featured ? 1 : 0 };
    try {
      if (editing === "new") await api.post("/api/testimonials", body);
      else await api.put(`/api/testimonials/${editing.id}`, body);
      toast.success(editing === "new" ? "Testimonial added" : "Testimonial updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the testimonial");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/api/testimonials/${id}`);
      toast.success("Testimonial deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the testimonial");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Add review</Button></div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No testimonials."
        columns={[
          { key: "name", header: "Name", cell: (row) => row.author_name },
          { key: "content", header: "Review", cell: (row) => row.content },
          { key: "rating", header: "Rating", cell: (row) => row.rating },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add review" : "Edit review"} onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.author_name?.message}><Input {...form.register("author_name")} /></Field>
          <Field label="Title"><Input {...form.register("author_title")} /></Field>
          <Field label="Rating"><Input type="number" min="1" max="5" {...form.register("rating")} /></Field>
          <Field label="Review" error={form.formState.errors.content?.message}><Input {...form.register("content")} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_published")} /> Published</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_featured")} /> Featured</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
