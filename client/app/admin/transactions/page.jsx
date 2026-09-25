"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { EditSheet } from "@/components/admin/edit-sheet";
import { Field, RowActions, SelectField } from "@/components/admin/fields";
import { RecordTable } from "@/components/admin/record-table";
import { useList } from "@/components/admin/use-list";

const schema = z.object({
  status: z.enum(["Succeeded", "Failed", "Refunded"]),
});

export default function TransactionsPage() {
  const { rows, loading, reload } = useList("/api/admin/transactions");
  const [editing, setEditing] = useState(null);
  const form = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!editing) return;
    form.reset({ status: editing.status || "Succeeded" });
  }, [editing, form]);

  async function onSubmit(values) {
    try {
      await api.put(`/api/admin/transactions/${editing.id}`, values);
      toast.success("Transaction updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the transaction");
    }
  }

  return (
    <div className="space-y-4">
      <RecordTable
        loading={loading}
        rows={rows}
        empty="No transactions."
        columns={[
          { key: "id", header: "ID", cell: (row) => row.id },
          { key: "customer", header: "Customer", cell: (row) => row.customer_name || "—" },
          { key: "amount", header: "Amount", cell: (row) => `$${Number(row.amount || 0).toLocaleString()}` },
          { key: "status", header: "Status", cell: (row) => row.status },
          { key: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setEditing(row)} /> },
        ]}
      />
      <EditSheet open={!!editing} title="Update transaction" description={editing ? editing.customer_name : ""} onClose={() => setEditing(null)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Status">
            <SelectField {...form.register("status")}>
              <option>Succeeded</option><option>Failed</option><option>Refunded</option>
            </SelectField>
          </Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </form>
      </EditSheet>
    </div>
  );
}
