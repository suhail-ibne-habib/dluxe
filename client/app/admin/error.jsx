"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">This page failed</h1>
      <p className="text-sm text-muted-foreground">{error?.message || "Something went wrong."}</p>
      <button type="button" onClick={reset} className="text-sm font-medium text-[#ea580c]">Try again</button>
    </div>
  );
}
