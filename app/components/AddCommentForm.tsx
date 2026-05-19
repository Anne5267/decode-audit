"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
};

export default function AddCommentForm({ incidentId }: { incidentId: number }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim() || "Anonym", content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fejl");
      }
      setContent("");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        style={INPUT}
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Dit navn (valgfrit)"
      />
      <textarea
        style={{ ...INPUT, minHeight: 72, resize: "vertical" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tilføj kommentar, observation eller opfølgning..."
        required
      />
      {error && <div style={{ color: "var(--failed)", fontSize: 12 }}>{error}</div>}
      <button
        type="submit"
        disabled={saving || !content.trim()}
        style={{
          alignSelf: "flex-start",
          background: saving || !content.trim() ? "var(--border)" : "var(--surface)",
          color: saving || !content.trim() ? "var(--muted)" : "var(--accent)",
          border: "1px solid var(--border)", borderRadius: 6,
          padding: "7px 16px", fontWeight: 500, fontSize: 13,
          cursor: saving || !content.trim() ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Gemmer..." : "Tilføj kommentar"}
      </button>
    </form>
  );
}
