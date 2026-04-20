"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BarChart3,
  Users,
  ClipboardList,
  TrendingUp,
  Flame,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Panel — Branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center purple-gradient-bg">
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-mentrex-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-mentrex-primary/5 blur-3xl" />

        <div className="relative z-10 max-w-md px-12">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mentrex-primary shadow-mentrex-glow">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Mentrex<span className="text-mentrex-primary"> Academy</span>
            </span>
          </div>

          {/* Tagline */}
          <h1 className="mb-3 text-4xl font-bold text-white">
            Master Your Craft.
          </h1>
          <p className="mb-10 text-lg text-mentrex-text-secondary">
            Track progress, run standups, and help every student reach their potential.
          </p>

          {/* Feature bullets */}
          <div className="mb-10 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mentrex-primary/20">
                <ClipboardList className="h-5 w-5 text-mentrex-primary" />
              </div>
              <div>
                <p className="font-medium text-white">Daily Standups</p>
                <p className="text-sm text-mentrex-text-secondary">
                  Track what students worked on and plan their day
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mentrex-success/20">
                <BarChart3 className="h-5 w-5 text-mentrex-success" />
              </div>
              <div>
                <p className="font-medium text-white">Progress Analytics</p>
                <p className="text-sm text-mentrex-text-secondary">
                  WPM charts, speaking levels, and presentation tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mentrex-warning/20">
                <Users className="h-5 w-5 text-mentrex-warning" />
              </div>
              <div>
                <p className="font-medium text-white">Student Management</p>
                <p className="text-sm text-mentrex-text-secondary">
                  Photo uploads, course tracking, and skill assessment
                </p>
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="flex gap-4">
            <div className="flex items-center gap-3 rounded-card border border-mentrex bg-mentrex-card/80 px-5 py-3 backdrop-blur-md shadow-mentrex">
              <TrendingUp className="h-5 w-5 text-mentrex-success" />
              <div>
                <p className="text-lg font-bold text-white">98%</p>
                <p className="text-xs text-mentrex-text-secondary">
                  Completion Rate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-mentrex bg-mentrex-card/80 px-5 py-3 backdrop-blur-md shadow-mentrex">
              <Flame className="h-5 w-5 text-mentrex-warning" />
              <div>
                <p className="text-lg font-bold text-white">12 Days</p>
                <p className="text-xs text-mentrex-text-secondary">
                  Current Streak
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full items-center justify-center bg-mentrex-bg px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mentrex-primary shadow-mentrex-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Mentrex<span className="text-mentrex-primary"> Academy</span>
            </span>
          </div>

          <div className="rounded-card border border-mentrex bg-mentrex-card p-8 shadow-mentrex">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mentrex-primary/20">
                <GraduationCap className="h-8 w-8 text-mentrex-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-mentrex-text-secondary">
                Sign in to manage your academy
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-input border border-mentrex-danger/30 bg-mentrex-danger/10 px-4 py-3 text-sm text-mentrex-danger animate-fade-in">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mentrex-text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mentrex-input pl-10"
                    placeholder="admin@mentrex.academy"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mentrex-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mentrex-input pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mentrex-text-secondary hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-mentrex-text-secondary bg-mentrex-card text-mentrex-primary focus:ring-mentrex-primary"
                  />
                  <span className="text-sm text-mentrex-text-secondary">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-mentrex-primary hover:text-mentrex-primary-hover transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mentrex-btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-mentrex-text-secondary">
                Need access?{" "}
                <button className="text-mentrex-primary hover:text-mentrex-primary-hover transition-colors">
                  Contact Admin
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
