// app/demo/layout.tsx — standalone layout for public demo (no auth nav)
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Demo — Decode Audit",
  description: "Se hvordan Decode Audit kortlægger din AI-risiko og hjælper med EU AI Act compliance",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        {children}
      </body>
    </html>
  );
}
