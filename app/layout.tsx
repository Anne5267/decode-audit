import type { Metadata } from "next";
import NavLinks from "@/app/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decode Audit",
  description: "AI compliance og kvalitetsaudit — Decode AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <nav style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          height: 52,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
            Decode Audit
          </span>
          <NavLinks />
        </nav>
        <main style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
