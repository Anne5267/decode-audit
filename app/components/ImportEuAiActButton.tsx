"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportEuAiActButton({ systemId }: { systemId: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function doImport() {
    if (state === "loading") return;
    setState("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/compliance/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_id: systemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      setMsg(data.message ?? `${data.created} krav importeret.`);
      setState("done");
      router.refresh();
    } catch (e) {
      setMsg(String(e));
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span style={{ fontSize: 12, color: "var(--passed)", display: "flex", alignItems: "center", gap: 4 }}>
        ✓ {msg}
      </span>
    );
  }

  if (state === "error") {
    return (
      <span style={{ fontSize: 12, color: "var(--failed)" }}>
        ⚠ {msg}
      </span>
    );
  }

  return (
    <button
      onClick={doImport}
      disabled={state === "loading"}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        background: state === "loading" ? "var(--surface)" : "rgba(99,149,196,0.08)",
        border: "1px solid rgba(99,149,196,0.2)",
        borderRadius: 6,
        color: state === "loading" ? "var(--muted)" : "rgba(147,197,253,0.9)",
        cursor: state === "loading" ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {state === "loading" ? "Importerer…" : "↓ Import EU AI Act krav"}
    </button>
  );
}
