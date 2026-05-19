"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/systems", label: "Systemer" },
  { href: "/incidents", label: "Incidents" },
  { href: "/test-cases", label: "Tests" },
  { href: "/compliance", label: "Compliance" },
  { href: "/audit-log", label: "Audit Log" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {NAV.map((n) => {
        const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 13,
              color: active ? "var(--accent)" : "var(--muted)",
              fontWeight: active ? 600 : 400,
              background: active ? "rgba(200, 168, 120, 0.08)" : "transparent",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}
