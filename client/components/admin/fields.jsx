"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function SelectField({ className = "", ...props }) {
  return (
    <select
      className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${className}`}
      {...props}
    />
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
      {onDelete ? <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button> : null}
    </div>
  );
}
