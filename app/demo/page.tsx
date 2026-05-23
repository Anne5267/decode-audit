// app/demo/page.tsx — Offentlig demo-side for Decode Audit
// Version 1.0 — 2026-05-23
// Viser eksempeldata — ingen DB, ingen auth

import Link from "next/link";

// ── Sample data ───────────────────────────────────────────────────────────────

const SYSTEMS = [
  {
    id: 1,
    name: "KundeServiceBot v2.3",
    provider: "Internt udviklet",
    risk_level: "high",
    status: "active",
    description: "Automatiseret kundebetjening via chat — besvarer spørgsmål, eskalerer til agent",
    compliance_met: 9,
    compliance_total: 17,
    passed_tests: 34,
    failed_tests: 8,
    open_incidents: 2,
  },
  {
    id: 2,
    name: "Screening AI — Ansøgninger",
    provider: "TalentTech GmbH",
    risk_level: "unacceptable",
    status: "active",
    description: "Automatisk screening af jobansøgninger — rangerer og filtrerer kandidater",
    compliance_met: 4,
    compliance_total: 17,
    passed_tests: 11,
    failed_tests: 22,
    open_incidents: 5,
  },
  {
    id: 3,
    name: "Logistik Optimering",
    provider: "SAP SE",
    risk_level: "limited",
    status: "active",
    description: "Optimerer lagerplacering og leveringsruter — ingen direkte menneskepåvirkning",
    compliance_met: 14,
    compliance_total: 17,
    passed_tests: 52,
    failed_tests: 3,
    open_incidents: 0,
  },
];

const COMPLIANCE_ITEMS = [
  { article: "Art. 9", title: "Risikomanagement-system", status: "met",     risk: "high" },
  { article: "Art. 10", title: "Data governance & kvalitet", status: "gap",     risk: "unacceptable" },
  { article: "Art. 11", title: "Teknisk dokumentation",     status: "partial",  risk: "high" },
  { article: "Art. 12", title: "Logning & monitorering",    status: "met",     risk: "high" },
  { article: "Art. 13", title: "Transparens over for brugere", status: "gap",  risk: "unacceptable" },
  { article: "Art. 14", title: "Menneskelig oversight",     status: "partial",  risk: "high" },
  { article: "Art. 16", title: "CE-mærkning & registrering", status: "gap",   risk: "unacceptable" },
  { article: "Art. 26", title: "Forpligtelser for udbydere", status: "met",   risk: "limited" },
  { article: "Art. 50", title: "Transparensforpligtelser",  status: "partial",  risk: "high" },
];

const INCIDENTS = [
  {
    title: "Screening AI: uønsket demografisk bias detekteret",
    severity: "sev1",
    date: "2026-05-18",
    status: "open",
    desc: "Modellen viser systematisk lavere score for kvindelige ansøgere i ingeniørroller.",
  },
  {
    title: "KundeServiceBot: GDPR Art. 22 — manglende menneskelig oversight",
    severity: "sev2",
    date: "2026-05-15",
    status: "open",
    desc: "Automatiserede afgørelser tages uden mulighed for menneskelig gennemgang i 23% af tilfælde.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_LABEL: Record<string, string> = {
  unacceptable: "Kritisk",
  high:         "Høj",
  limited:      "Begrænset",
  minimal:      "Minimal",
};

const RISK_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  unacceptable: { text: "#e05050", bg: "#1a0808", border: "#3a1010" },
  high:         { text: "#c87848", bg: "#1a1008", border: "#3a2010" },
  limited:      { text: "#7a9a60", bg: "#0e1a0e", border: "#1a3010" },
  minimal:      { text: "#6a8aaa", bg: "#0e1018", border: "#1a2030" },
};

const STATUS_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  met:     { text: "#7a9a60", bg: "#0e1a0e", border: "#1a3010" },
  partial: { text: "#c8a878", bg: "#1a1608", border: "#3a3010" },
  gap:     { text: "#e05050", bg: "#1a0808", border: "#3a1010" },
};

const STATUS_DA: Record<string, string> = {
  met:     "Opfyldt",
  partial: "Delvist opfyldt",
  gap:     "Mangler",
};

const SEV_COLOR: Record<string, string> = {
  sev1: "#e05050",
  sev2: "#c87848",
  sev3: "#c8a878",
};

function pct(met: number, total: number) {
  return total > 0 ? Math.round(met / total * 100) : 0;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, background: "#2a2420", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const totalSystems     = SYSTEMS.length;
  const criticalSystems  = SYSTEMS.filter(s => s.risk_level === "unacceptable").length;
  const openIncidents    = INCIDENTS.length;
  const avgCompliance    = Math.round(
    SYSTEMS.reduce((s, sys) => s + pct(sys.compliance_met, sys.compliance_total), 0) / SYSTEMS.length
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* Header */}
      <nav style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 52,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 15 }}>Decode Audit</span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 4,
            background: "#1a1008", border: "1px solid #3a2010", color: "#c87848",
          }}>
            Demo — eksempeldata
          </span>
        </div>
        <a
          href="mailto:anne@decodeai.dk?subject=Decode Audit — jeg vil se min virksomheds data&body=Hej Anne,%0A%0AJeg har set demo-versionen af Decode Audit og vil gerne se min virksomheds faktiske AI-risikoprofil.%0A%0AVirksomhed:%0AKontaktperson:%0A%0AVenlig hilsen"
          style={{
            background: "var(--surface)", border: "1px solid var(--accent)",
            color: "var(--accent)", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Kontakt Anne →
        </a>
      </nav>

      <main style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Demo banner */}
        <div style={{
          background: "#1a1008", border: "1px solid #3a2010", borderRadius: 10,
          padding: "14px 20px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 13, color: "#c87848" }}>
            Dette er en demo med eksempeldata fra en fiktiv mellemstor virksomhed.
            Decode Audit kortlægger din virksomheds faktiske AI-systemer mod EU AI Act.
          </span>
          <a
            href="mailto:anne@decodeai.dk?subject=Decode Audit — jeg vil se min virksomheds data"
            style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 6,
              background: "#c87848", color: "#0f0d0c", fontSize: 12, fontWeight: 600,
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            Få din egen analyse →
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28,
        }}>
          {[
            { label: "AI systemer kortlagt",  value: totalSystems,   warn: false },
            { label: "Kritisk risiko",         value: criticalSystems, warn: criticalSystems > 0 },
            { label: "Åbne hændelser",         value: openIncidents,   warn: openIncidents > 0 },
            { label: "Compliance gennemsnit",  value: `${avgCompliance}%`, warn: avgCompliance < 60 },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--surface)",
              border: `1px solid ${stat.warn ? "#3a1010" : "var(--border)"}`,
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.warn ? "#e05050" : "var(--accent)" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Critical incident banner */}
        {INCIDENTS.filter(i => i.severity === "sev1").map(inc => (
          <div key={inc.title} style={{
            background: "#1a0808", border: "1px solid #3a1010", borderRadius: 8,
            padding: "12px 16px", marginBottom: 14,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e05050", marginBottom: 2 }}>{inc.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{inc.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

          {/* AI Systems */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>AI Systemer</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SYSTEMS.map(sys => {
                const risk  = RISK_COLOR[sys.risk_level ?? "minimal"];
                const score = pct(sys.compliance_met, sys.compliance_total);
                return (
                  <div key={sys.id} style={{
                    background: "var(--surface)", border: `1px solid ${risk.border}`,
                    borderRadius: 9, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{sys.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sys.provider}</div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: risk.bg, border: `1px solid ${risk.border}`, color: risk.text,
                      }}>
                        {RISK_LABEL[sys.risk_level ?? "minimal"]}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, lineHeight: 1.4 }}>
                      {sys.description}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--muted)" }}>
                      <span style={{ color: score >= 70 ? "#7a9a60" : score >= 40 ? "#c8a878" : "#e05050" }}>
                        Compliance: {score}%
                      </span>
                      <span>Tests: {sys.passed_tests} ✓ / {sys.failed_tests} ✗</span>
                      {sys.open_incidents > 0 && (
                        <span style={{ color: "#e05050" }}>{sys.open_incidents} åbne hændelser</span>
                      )}
                    </div>
                    <ScoreBar
                      value={score}
                      color={score >= 70 ? "#7a9a60" : score >= 40 ? "#c8a878" : "#e05050"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance overview */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>EU AI Act Compliance</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {COMPLIANCE_ITEMS.map(item => {
                const s = STATUS_COLOR[item.status];
                return (
                  <div key={item.article} style={{
                    background: "var(--surface)", border: `1px solid ${s.border}`,
                    borderRadius: 7, padding: "10px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--muted)", marginRight: 6 }}>{item.article}</span>
                      <span style={{ fontSize: 12, color: "var(--text)" }}>{item.title}</span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
                      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
                    }}>
                      {STATUS_DA[item.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active incidents */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Aktive hændelser</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INCIDENTS.map(inc => (
              <div key={inc.title} style={{
                background: "var(--surface)", border: `1px solid ${SEV_COLOR[inc.severity]}33`,
                borderRadius: 9, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: SEV_COLOR[inc.severity] }}>
                    {inc.title}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 4,
                      background: `${SEV_COLOR[inc.severity]}22`,
                      border: `1px solid ${SEV_COLOR[inc.severity]}44`,
                      color: SEV_COLOR[inc.severity],
                    }}>
                      {inc.severity === "sev1" ? "Kritisk" : "Høj"}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{inc.date}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "32px 40px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Hvad er din virksomheds reelle AI-risiko?
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Decode Audit kortlægger dine faktiske AI-systemer, identificerer compliance-gaps mod EU AI Act
            og genererer audit-rapport klar til dokumentation.
            Første analyse starter med et afklarende opkald — ingen kode, ingen IT-adgang krævet.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:anne@decodeai.dk?subject=Decode Audit — jeg vil booke et opkald&body=Hej Anne,%0A%0AJeg er interesseret i en AI-risikoanalyse af min virksomheds AI-systemer.%0A%0AVirksomhed:%0AAntal AI-systemer (ca.):%0ANavn:%0A%0AJeg er tilgængelig:%0A%0AVenlig hilsen"
              style={{
                padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: "var(--accent)", color: "#0f0d0c", textDecoration: "none",
              }}
            >
              Book et afklarende opkald →
            </a>
            <Link
              href="/landing"
              style={{
                padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: "var(--surface)", color: "var(--accent)",
                border: "1px solid var(--border)", textDecoration: "none",
              }}
            >
              Læs mere om Decode Audit
            </Link>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>
            anne@decodeai.dk · Anne Ringgaard · decodeai.dk
          </p>
        </div>

      </main>
    </div>
  );
}
