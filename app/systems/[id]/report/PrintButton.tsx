'use client'
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#1a1a1a", border: "none",
        borderRadius: 6, padding: "8px 16px",
        fontSize: 13, color: "#fff", cursor: "pointer",
      }}
    >
      ⬇ Gem som PDF
    </button>
  )
}
