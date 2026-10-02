import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NekoHub — Painel",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
