"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditSheet } from "@/components/admin/edit-sheet";
import { Field, RowActions, SelectField } from "@/components/admin/fields";
import { RecordTable } from "@/components/admin/record-table";
import { plainHtml, RichText } from "@/components/admin/rich-text";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  page_title: z.string().min(2, "Title is required"),
  meta_description: z.string().optional(),
  hero_image_url: z.string().optional(),
  content: z.string().optional(),
  additional_info: z.string().optional(),
  airport_id: z.string().min(1, "Select an airport"),
  is_published: z.boolean(),
});

function slugify(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

export default function PagesPage() {
  const { rows, loading, reload } = useList("/api/airport-pages");
  const { rows: locations } = useList("/api/locations");
  const { rows: packages } = useList("/api/packages");
  const [editing, setEditing] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [overrides, setOverrides] = useState({ excluded: [], prices: {}, extras: [] });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { is_published: true, airport_id: "" } });
  const title = form.watch("page_title");
  const slug = slugify(title || "");
  const airports = useMemo(() => locations.flatMap((location) => (location.airports || []).map((airport) => ({
    id: airport.id,
    label: `${location.countryName} — ${airport.name}`,
    excludedPackages: airport.excludedPackages || [],
    customPricing: airport.customPricing || [],
  }))), [locations]);

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ page_title: "", meta_description: "", hero_image_url: "", content: "", additional_info: "", airport_id: "", is_published: true });
      setFaqs([{ question: "", answer: "" }]);
      setOverrides({ excluded: [], prices: {}, extras: [] });
      return;
    }
    const saved = readJson(editing.package_overrides, null);
    const airport = airports.find((item) => String(item.id) === String(editing.airport_id));
    form.reset({
      page_title: editing.page_title || "",
      meta_description: editing.meta_description || "",
      hero_image_url: editing.hero_image_url || "",
      content: editing.content || "",
      additional_info: editing.additional_info || "",
      airport_id: editing.airport_id ? String(editing.airport_id) : "",
      is_published: Boolean(editing.is_published),
    });
    setFaqs(readJson(editing.faqs, []).length ? readJson(editing.faqs, []) : [{ question: "", answer: "" }]);
    setOverrides(saved || {
      excluded: (airport?.excludedPackages || []).map(Number),
      prices: Object.fromEntries((airport?.customPricing || []).map((item) => [item.package_id, item.custom_price])),
      extras: [],
    });
  }, [editing, form, airports]);

  function togglePackage(id) {
    setOverrides((current) => {
      const excluded = new Set((current.excluded || []).map(Number));
      if (excluded.has(id)) excluded.delete(id);
      else excluded.add(id);
      return { ...current, excluded: [...excluded] };
    });
  }

  async function onSubmit(values) {
    const body = {
      ...values,
      slug: slug || editing?.slug,
      content: plainHtml(values.content),
      additional_info: plainHtml(values.additional_info),
      airport_id: Number(values.airport_id),
      is_published: values.is_published ? 1 : 0,
      faqs: faqs.filter((faq) => faq.question.trim()),
      package_overrides: overrides,
    };
    try {
      if (editing === "new") await api.post("/api/airport-pages", body);
      else await api.put(`/api/airport-pages/${editing.id}`, body);
      toast.success(editing === "new" ? "Page created" : "Page updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the page");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this page?")) return;
    try {
      await api.delete(`/api/airport-pages/${id}`);
      toast.success("Page deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the page");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Add page</Button></div>
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No airport pages."
        columns={[
          { key: "title", header: "Title", cell: (row) => row.page_title || row.slug },
          { key: "url", header: "URL", cell: (row) => `/airport/${row.slug}` },
          { key: "airport", header: "Airport", cell: (row) => row.airport_name || "—" },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet open={!!editing} title={editing === "new" ? "Add page" : "Edit page"} description="The booking search is added on every page and uses the airport you select." className="data-[side=right]:sm:max-w-2xl" onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Field label="Title" error={form.formState.errors.page_title?.message}><Input {...form.register("page_title")} /></Field>
          <p className="text-sm text-muted-foreground">URL: /airport/{slug || "page-title"}</p>
          <Field label="Airport" error={form.formState.errors.airport_id?.message}>
            <SelectField {...form.register("airport_id")}>
              <option value="">Select an airport</option>
              {airports.map((airport) => <option key={airport.id} value={airport.id}>{airport.label}</option>)}
            </SelectField>
          </Field>
          <Field label="Short description"><Input {...form.register("meta_description")} /></Field>
          <Field label="Hero image URL"><Input {...form.register("hero_image_url")} placeholder="https://" /></Field>
          <Field label="Page content">
            <Controller name="content" control={form.control} render={({ field }) => <RichText value={field.value} onChange={field.onChange} placeholder="About this airport" />} />
          </Field>
          <Field label="Additional information">
            <Controller name="additional_info" control={form.control} render={({ field }) => <RichText value={field.value} onChange={field.onChange} placeholder="Extra details for this page" />} />
          </Field>
          <div className="grid gap-2">
            <p className="text-sm font-medium">FAQs</p>
            {faqs.map((faq, index) => (
              <div key={index} className="grid gap-2 rounded-xl border p-3">
                <Input value={faq.question} placeholder="Question" onChange={(event) => setFaqs((list) => list.map((item, i) => i === index ? { ...item, question: event.target.value } : item))} />
                <Input value={faq.answer} placeholder="Answer" onChange={(event) => setFaqs((list) => list.map((item, i) => i === index ? { ...item, answer: event.target.value } : item))} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setFaqs((list) => [...list, { question: "", answer: "" }])}>Add FAQ</Button>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Packages for this page</p>
            <p className="text-xs text-muted-foreground">These start from the airport packages. A price here applies only to this page.</p>
            {packages.map((pkg) => {
              const id = Number(pkg.id || pkg._id);
              const offered = !(overrides.excluded || []).map(Number).includes(id);
              return (
                <div key={id} className={`rounded-xl border p-3 ${offered ? "border-primary/30 bg-primary/5" : "opacity-70"}`}>
                  <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => togglePackage(id)}>
                    <span className="text-sm font-medium">{pkg.name}</span>
                    <Badge variant={offered ? "default" : "outline"}>{offered ? "Shown" : "Hidden"}</Badge>
                  </button>
                  {offered ? (
                    <Input className="mt-2" type="number" step="0.01" placeholder={`Base ${pkg.basePrice}`} value={overrides.prices?.[id] ?? ""} onChange={(event) => setOverrides((current) => ({ ...current, prices: { ...current.prices, [id]: event.target.value } }))} />
                  ) : null}
                </div>
              );
            })}
            {(overrides.extras || []).map((extra, index) => (
              <div key={index} className="grid gap-2 rounded-xl border p-3">
                <Input value={extra.name} placeholder="Page-only package name" onChange={(event) => setOverrides((current) => ({ ...current, extras: current.extras.map((item, i) => i === index ? { ...item, name: event.target.value } : item) }))} />
                <Input type="number" value={extra.price} placeholder="Price" onChange={(event) => setOverrides((current) => ({ ...current, extras: current.extras.map((item, i) => i === index ? { ...item, price: event.target.value } : item) }))} />
                <Input value={extra.description} placeholder="Short description" onChange={(event) => setOverrides((current) => ({ ...current, extras: current.extras.map((item, i) => i === index ? { ...item, description: event.target.value } : item) }))} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setOverrides((current) => ({ ...current, extras: [...(current.extras || []), { name: "", price: "", description: "" }] }))}>Add a package for this page</Button>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_published")} /> Published</label>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
