"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Verify passcode: 12345
    if (password.trim() === "12345") {
      try {
        localStorage.setItem("cherra_admin_auth", "true");
        sessionStorage.setItem("cherra_admin_auth", "true");
      } catch {}
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 250);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setError("Invalid password. Please enter 12345.");
        inputRef.current?.select();
      }, 200);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d281e] p-4 sm:p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="relative h-12 w-48 mx-auto">
            <Image
              src="/images/cherrapunji-hotels-logo-dark.png"
              alt="Cherrapunji Hotels"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Management Console</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Administrator Access
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enter the master administrative password to manage hotel inventory, inquiries, and live website data.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Master Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className={`w-full pl-10 pr-11 py-3 text-sm rounded-xl border transition-all outline-none font-medium ${
                  error
                    ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                }`}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium pt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <span>✕</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full py-3 px-4 rounded-xl bg-[#0a3a2a] hover:bg-[#072b1e] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Unlock Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Default system password is <span className="font-mono font-semibold text-slate-600">12345</span>
          </p>
        </div>
      </div>
    </div>
  );
}
