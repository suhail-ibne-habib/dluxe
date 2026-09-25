"use client";

import React from "react";
import { Plane } from "lucide-react";

export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-600 mb-6 shadow-lg shadow-orange-200">
            <Plane className="w-10 h-10 text-white transform -rotate-45" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthError({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium text-center">
      {message}
    </div>
  );
}

export function AuthField({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );
}

export const fieldClass =
  "w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-[#ea580c] focus:ring-0 focus:outline-none transition-all";
