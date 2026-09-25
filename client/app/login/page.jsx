"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, Plane, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthFrame, { AuthError, AuthField, fieldClass } from "@/components/auth/AuthFrame";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signInError) {
      setError(signInError.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <AuthFrame
      title="Mission Control"
      subtitle="Log in to track your VIP journey"
      footer={
        <div className="space-y-2">
          <a href="/forgot-password" className="block text-orange-600 font-semibold hover:underline">Forgot password?</a>
          <p>
            New here? <a href="/register" className="text-orange-600 font-semibold hover:underline">Create an account</a>
          </p>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <AuthError message={error} />
        <AuthField label="Email address">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" className={fieldClass} required />
          </div>
        </AuthField>
        <AuthField label="Password">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={`${fieldClass} pr-12`}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </AuthField>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in <Plane className="h-5 w-5" /></>}
        </button>
      </form>
    </AuthFrame>
  );
}
