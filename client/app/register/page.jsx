"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthFrame, { AuthError, AuthField, fieldClass } from "@/components/auth/AuthFrame";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signUpError) {
      setError(signUpError.message || "Could not create the account");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <AuthFrame
      title="Create account"
      subtitle="Register to manage your D'LUXE bookings"
      footer={<p>Already registered? <a href="/login" className="text-orange-600 font-semibold hover:underline">Sign in</a></p>}
    >
      <form onSubmit={handleRegister} className="space-y-6">
        <AuthError message={error} />
        <AuthField label="Name">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} required />
          </div>
        </AuthField>
        <AuthField label="Email address">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} required />
          </div>
        </AuthField>
        <AuthField label="Password">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} required />
          </div>
        </AuthField>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
        </button>
      </form>
    </AuthFrame>
  );
}
