'use client'

import { useState } from 'react'

export default function SendReportButton({ systemId }: { systemId: number }) {
  const [open,    setOpen]    = useState(false)
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function send() {
    if (!email.includes('@')) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/systems/${systemId}/report`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ to: email, message }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Fejl')
      setDone(true)
      setOpen(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: 6, padding: '8px 14px',
          fontSize: 13, color: '#16a34a', cursor: 'pointer',
        }}
      >
        {done ? '✓ Sendt' : '✉ Send til kunde'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '28px 32px',
            width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Send rapport til kunde</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>Kundens email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kunde@firma.dk"
                autoFocus
                style={{
                  width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 6, padding: '8px 12px', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                Personlig besked <span style={{ fontWeight: 300 }}>(valgfri)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Skriv en kort besked der inkluderes i emailen..."
                rows={3}
                style={{
                  width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 6, padding: '8px 12px', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={send}
                disabled={sending || !email.includes('@')}
                style={{
                  background: sending ? '#e5e7eb' : '#1a1a1a',
                  color: sending ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: 8, padding: '10px 20px',
                  fontSize: 14, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? 'Sender...' : 'Send →'}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: '1px solid #e5e7eb',
                  borderRadius: 8, padding: '10px 16px',
                  fontSize: 14, color: '#6b7280', cursor: 'pointer',
                }}
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
