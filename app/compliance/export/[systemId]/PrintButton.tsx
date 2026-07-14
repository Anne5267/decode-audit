"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: "var(--accent)", color: "#0a0807", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
    >
      Print / Gem som PDF
    </button>
  );
}
