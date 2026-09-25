"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EditSheet } from "@/components/admin/edit-sheet";
import { Field, RowActions, TextArea } from "@/components/admin/fields";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  countryName: z.string().min(2, "Country name is required"),
  flagIcon: z.string().min(1, "Flag is required"),
});

function blankAirport() {
  return { name: "", link: "", note: "", page_id: "", excludedPackages: [], customPricing: [] };
}

function packageId(pkg) {
  return Number(pkg.id || pkg._id);
}

export default function LocationsPage() {
  const { rows, loading, reload } = useList("/api/locations");
  const { rows: packages } = useList("/api/packages");
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState([blankAirport()]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { countryName: "", flagIcon: "" },
  });

  useEffect(() => {
    if (!editing) return;
    if (editing === "new") {
      form.reset({ countryName: "", flagIcon: "" });
      setAirports([blankAirport()]);
      return;
    }
    form.reset({ countryName: editing.countryName || "", flagIcon: editing.flagIcon || "" });
    setAirports((editing.airports || []).map((airport) => ({
      name: airport.name || "",
      link: airport.link || "",
      note: airport.note || "",
      page_id: airport.page_id ? String(airport.page_id) : "",
      excludedPackages: (airport.excludedPackages || []).map(Number),
      customPricing: airport.customPricing || [],
    })));
  }, [editing, form]);

  function updateAirport(index, patch) {
    setAirports((list) => list.map((airport, i) => (i === index ? { ...airport, ...patch } : airport)));
  }

  function togglePackage(index, id) {
    setAirports((list) => list.map((airport, i) => {
      if (i !== index) return airport;
      const excluded = new Set(airport.excludedPackages.map(Number));
      if (excluded.has(id)) excluded.delete(id);
      else excluded.add(id);
      return { ...airport, excludedPackages: [...excluded] };
    }));
  }

  function setCustomPrice(index, id, value) {
    setAirports((list) => list.map((airport, i) => {
      if (i !== index) return airport;
      const customPricing = airport.customPricing.filter((item) => Number(item.package_id) !== id);
      if (value !== "") customPricing.push({ package_id: id, custom_price: value });
      return { ...airport, customPricing };
    }));
  }

  async function onSubmit(values) {
    const named = airports.filter((airport) => airport.name.trim());
    if (named.length === 0) {
      toast.error("Add at least one airport");
      return;
    }
    const body = {
      ...values,
      airports: named.map((airport) => ({
        name: airport.name.trim(),
        link: airport.link.trim(),
        note: airport.note.trim(),
        page_id: airport.page_id ? Number(airport.page_id) : null,
        excludedPackages: airport.excludedPackages,
        customPricing: airport.customPricing
          .filter((item) => item.custom_price !== "" && item.custom_price != null)
          .map((item) => ({ package_id: Number(item.package_id), custom_price: Number(item.custom_price) })),
      })),
    };
    try {
      if (editing === "new") await api.post("/api/locations", body);
      else await api.put(`/api/locations/${editing.id}`, body);
      toast.success(editing === "new" ? "Location created" : "Location updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the location");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this location?")) return;
    try {
      await api.delete(`/api/locations/${id}`);
      toast.success("Location deleted");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the location");
    }
  }

  const visible = rows.filter((row) => row.countryName?.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search countries" className="sm:max-w-xs" />
        <Button onClick={() => setEditing("new")}>Add location</Button>
      </div>
      <RecordTable
        loading={loading}
        rows={visible}
        empty="No locations."
        columns={[
          { key: "country", header: "Country", cell: (row) => `${row.flagIcon || ""} ${row.countryName}`.trim() },
          { key: "airports", header: "Airports", cell: (row) => (row.airports || []).length },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} onDelete={() => remove(row.id)} /> },
        ]}
      />
      <EditSheet
        open={!!editing}
        title={editing === "new" ? "Add location" : "Edit location"}
        description="Each airport can hide packages, set its own price, and link an airport page."
        className="data-[side=right]:sm:max-w-2xl"
        onClose={() => setEditing(null)}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Country</CardTitle>
              <CardDescription>Shown beside this location in the public network.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-[1fr_8rem]">
              <Field label="Name" error={form.formState.errors.countryName?.message}><Input {...form.register("countryName")} /></Field>
              <Field label="Flag" error={form.formState.errors.flagIcon?.message}><Input {...form.register("flagIcon")} placeholder="🇬🇧" /></Field>
            </CardContent>
          </Card>
          {airports.map((airport, index) => {
            const priceFor = (id) => airport.customPricing.find((item) => Number(item.package_id) === id)?.custom_price ?? "";
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{airport.name || `Airport ${index + 1}`}</CardTitle>
                    <CardDescription>Note and the packages offered at this airport. The public page is chosen on the Pages screen.</CardDescription>
                  </div>
                  {airports.length > 1 ? (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAirports((list) => list.filter((_, i) => i !== index))}>Remove</Button>
                  ) : null}
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Field label="Name"><Input value={airport.name} onChange={(event) => updateAirport(index, { name: event.target.value })} /></Field>
                  <Field label="Note"><TextArea value={airport.note} onChange={(event) => updateAirport(index, { note: event.target.value })} /></Field>
                  <div className="grid gap-3">
                    {packages.map((pkg) => {
                      const id = packageId(pkg);
                      const offered = !airport.excludedPackages.map(Number).includes(id);
                      return (
                        <div key={id} className={`rounded-xl border p-3 ${offered ? "border-primary/30 bg-primary/5" : "opacity-70"}`}>
                          <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => togglePackage(index, id)}>
                            <span>
                              <span className="block text-sm font-medium">{pkg.name}</span>
                              <span className="text-xs text-muted-foreground">Base ${Number(pkg.basePrice || 0).toLocaleString()}</span>
                            </span>
                            <Badge variant={offered ? "default" : "outline"}>{offered ? "Offered" : "Hidden"}</Badge>
                          </button>
                          {offered ? (
                            <div className="mt-3">
                              <Field label="Airport price (USD)">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={priceFor(id)}
                                  placeholder={String(pkg.basePrice || 0)}
                                  onChange={(event) => setCustomPrice(index, id, event.target.value)}
                                />
                              </Field>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setAirports((list) => [...list, blankAirport()])}>Add airport</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
          </div>
        </form>
      </EditSheet>
    </div>
  );
}
