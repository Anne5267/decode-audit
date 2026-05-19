"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.replace("/");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "40px 48px",
        width: 360,
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            Decode Audit
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Decode AI · AI compliance platform
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="password"
            placeholder="Adgangskode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              background: "var(--bg)",
              border: `1px solid ${error ? "var(--failed)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              width: "100%",
            }}
          />
          {error && (
            <div style={{ color: "var(--failed)", fontSize: 12 }}>
              Forkert adgangskode.
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: loading || !password ? "var(--border)" : "var(--accent)",
              color: loading || !password ? "var(--muted)" : "#1a1208",
              border: "none",
              borderRadius: 8,
              padding: "10px",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading || !password ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>
      </div>
    </div>
  );
}
