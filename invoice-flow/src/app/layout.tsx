import type { Metadata } from "next";
import Sidebar from "../components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "InvoiceFlow",
    template: "%s | InvoiceFlow",
  },
  description: "Invoice and billing management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}