import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mentrex Standup — Daily Standup Tracker",
  description:
    "Track daily standups, monitor student progress, and manage your Mentrex Academy cohort with the Mentrex Standup tracker.",
  keywords: ["standup", "tracker", "mentrex", "academy", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased">
        <ToastProvider>
          <NavBar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
