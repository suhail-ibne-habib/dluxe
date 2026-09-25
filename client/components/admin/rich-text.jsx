"use client";

import dynamic from "next/dynamic";

export const RichText = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg border bg-white" />,
});

export function featuresToHtml(features) {
  if (!Array.isArray(features) || features.length === 0) return "";
  return `<ul>${features.map((feature) => `<li>${feature}</li>`).join("")}</ul>`;
}

export function htmlToFeatures(html) {
  if (!html || typeof document === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const items = [...doc.querySelectorAll("li")].map((item) => item.innerHTML.trim()).filter((item) => item && item !== "<br>");
  if (items.length) return items;
  return [...doc.querySelectorAll("p")]
    .map((item) => item.innerHTML.trim())
    .filter((item) => item && item !== "<br>");
}

export function plainHtml(html) {
  const value = String(html || "").trim();
  if (!value || value === "<p><br></p>") return "";
  return value;
}
