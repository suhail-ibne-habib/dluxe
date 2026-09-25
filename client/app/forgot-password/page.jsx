"use client";

import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthFrame, { AuthError, AuthField, fieldClass } from "@/components/auth/AuthFrame";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Could not send the reset email");
      return;
    }
    setSent(true);
  }

  return (
    <AuthFrame
      title="Reset password"
      subtitle="We will email you a link to choose a new password"
      footer={<a href="/login" className="text-orange-600 font-semibold hover:underline">Back to sign in</a>}
    >
      {sent ? (
        <p className="text-center text-gray-700">If an account exists for {email}, a reset link is on its way.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthError message={error} />
          <AuthField label="Email address">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} required />
            </div>
          </AuthField>
          <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}
