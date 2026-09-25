"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { fetchWithTimeout } from "@/lib/api";

const SESSION_KEY = "dluxe_session";

export function getSessionToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SESSION_KEY) || "";
}

export function setSessionToken(token) {
  if (!token || typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
    customFetchImpl: (input, init) => fetchWithTimeout(input, init),
    onSuccess(context) {
      const token = context.response.headers.get("set-auth-token");
      if (token) setSessionToken(token);
    },
  },
});
