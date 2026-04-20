"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  Home,
  ClipboardList,
  BarChart3,
  Users,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/standup", label: "Standup", icon: ClipboardList },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/students", label: "Students", icon: Users },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-mentrex bg-mentrex-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mentrex-primary shadow-mentrex-glow transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Mentrex<span className="text-mentrex-primary"> Academy</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-mentrex-primary/20 text-mentrex-primary"
                    : "text-mentrex-text-secondary hover:bg-mentrex-elevated hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side - Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mentrex-primary/20">
                  <span className="text-xs font-bold text-mentrex-primary">
                    A
                  </span>
                </div>
                <span className="text-sm font-medium text-white">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-input border border-mentrex px-3 py-1.5 text-sm text-mentrex-text-secondary transition-all duration-200 hover:border-mentrex-danger/30 hover:text-mentrex-danger"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="mentrex-btn-primary !px-4 !py-2 text-sm"
            >
              <LogIn className="h-4 w-4" />
              Admin Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-2"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-mentrex bg-mentrex-bg md:hidden animate-fade-in">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-input px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-mentrex-primary/20 text-mentrex-primary"
                      : "text-mentrex-text-secondary hover:bg-mentrex-elevated hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-mentrex pt-3 mt-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-input px-4 py-3 text-sm text-mentrex-danger hover:bg-mentrex-elevated"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-input px-4 py-3 text-sm font-medium text-mentrex-primary hover:bg-mentrex-elevated"
                >
                  <LogIn className="h-5 w-5" />
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
