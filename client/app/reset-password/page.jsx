"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import AuthFrame, { AuthError, AuthField, fieldClass } from "@/components/auth/AuthFrame";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const tokenError = params.get("error");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(tokenError ? "This reset link is invalid or expired." : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Could not reset the password");
      return;
    }
    window.location.href = "/login";
  }

  return (
    <AuthFrame title="Choose a new password" subtitle="Use at least 8 characters" footer={<a href="/login" className="text-orange-600 font-semibold hover:underline">Back to sign in</a>}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthError message={error} />
        <AuthField label="New password">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} required />
          </div>
        </AuthField>
        <button type="submit" disabled={loading || !token} className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
        </button>
      </form>
    </AuthFrame>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResetForm />
    </Suspense>
  );
}
