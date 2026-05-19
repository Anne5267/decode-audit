# Decode Audit

**AI quality management and EU AI Act compliance tracking — in production at [audit.decodeai.dk](https://audit.decodeai.dk)**

A platform for organizations running AI systems in production. Tracks test cases, incidents, compliance requirements, and maintains an immutable audit trail of all changes — built around EU AI Act obligations for high-risk AI systems.

---

## What it does

| Module | Description |
|--------|-------------|
| **Dashboard** | Aggregated KPIs: test pass rate, open incidents, compliance rate, critical alerts |
| **AI Systems** | Register AI systems with EU AI Act risk classification (minimal / limited / high / unacceptable) |
| **Test Cases** | Structured test management with categories aligned to AI-specific failure modes |
| **Incidents** | Full lifecycle tracking from detection through investigation to resolution |
| **Compliance** | Per-framework requirement tracking with evidence and deadlines (EU AI Act, GDPR, ISO 42001) |
| **Audit Log** | Immutable, append-only change history — who changed what and when, with field-level diffs |

---

## Design decisions worth noting

**Audit log is append-only by design.**
The `tracker_audit_log` table has no DELETE route exposed. Immutability is the point — EU AI Act Article 12 requires ongoing documentation of risk management measures. A mutable log is not a compliance artifact.

**DB constraints enforce domain rules.**
`test_cases.category` is constrained to `safety | accuracy | bias | hallucination | performance | edge_case | regression | compliance`. The database rejects invalid inputs — domain correctness is not left to the application layer.

**No ORM, no query builder.**
Direct fetch against Supabase REST API. Fewer abstractions means fewer ways for things to go wrong silently. The `db.ts` helper is 76 lines.

**Audit failures are non-fatal.**
`auditLog()` wraps its fetch in `.catch(() => {})`. A failed audit write should never block a successful mutation. Observability is important; it should never be a point of failure.

**Server Components for data fetching.**
All data fetching happens in async server components. No client-side data fetching for initial page renders. Interactive forms and panels are isolated client components that call API routes.

---

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **Supabase** (PostgreSQL, REST API)
- **Vercel** (deployment, edge middleware for auth)
- **TypeScript** throughout, zero runtime type errors

---

## Test case categories

Aligned with AI-specific failure modes rather than generic software test categories:

| Category | What it covers |
|----------|----------------|
| `bias` | Systematic unfairness across demographic groups |
| `hallucination` | Fabricated facts, non-existent citations, invented clauses |
| `safety` | Harmful outputs, jailbreak resistance, escalation paths |
| `accuracy` | Factual correctness, task completion quality |
| `performance` | Latency, context window handling, degradation under load |
| `edge_case` | Boundary conditions, unusual inputs, adversarial prompts |
| `regression` | Previously passing behavior that has degraded |
| `compliance` | Regulatory and policy adherence |

---

## EU AI Act compliance modules

The compliance tracker covers obligations most relevant to high-risk AI systems:

| Article | Requirement |
|---------|-------------|
| EUAIA-9 | Risk Management System (ongoing — not a one-time assessment) |
| EUAIA-10 | Data Governance & Bias Testing |
| EUAIA-13 | Transparency & Explainability obligations |
| EUAIA-14 | Human Oversight requirements |
| EUAIA-15 | Accuracy, Robustness & Cybersecurity |
| GDPR-22 | Automated decision-making and profiling |

---

## Project structure

```
app/
├── api/
│   ├── audit-log/        # GET — filtered audit trail with pagination
│   ├── compliance/       # CRUD compliance requirements
│   ├── dashboard/        # GET aggregated KPIs
│   ├── incidents/        # CRUD + /resolve + /comments
│   ├── systems/          # CRUD AI systems
│   └── test-cases/       # CRUD test cases
├── audit-log/            # Immutable change history UI
├── compliance/           # Per-framework compliance tracking UI
├── components/           # Isolated client components
│   ├── AddCommentForm.tsx      # Post comments on incidents
│   ├── NavLinks.tsx            # Active-state navigation
│   ├── ResolveIncidentPanel.tsx # Close incidents with root cause
│   ├── RunTestForm.tsx          # Register test run results
│   └── UpdateComplianceForm.tsx # Update compliance status + evidence
├── incidents/            # Incident lifecycle management UI
├── lib/
│   ├── auth.ts           # Password gate middleware
│   ├── db.ts             # Supabase REST helpers + auditLog()
│   ├── labels.ts         # Domain label maps (status, category, severity)
│   └── url.ts            # Base URL resolution for server-side fetch
├── systems/              # AI system registry UI
└── test-cases/           # Test case management UI
```

---

## The audit log

Every mutation writes to `tracker_audit_log`:

```typescript
await auditLog({
  table: "incidents",
  recordId: incident.id,
  action: "UPDATE",
  oldValues: previousState,
  newValues: { status: "resolved", root_cause: "...", resolved_at: "..." },
});
```

The UI renders field-level diffs — exactly which fields changed, from what value to what. INSERT entries show key fields at creation time. This creates a complete, readable history of every AI system's quality journey.

---

## Local setup

```bash
npm install

# Copy and fill in environment variables
cp .env.local.example .env.local
```

`.env.local` requires:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
npm run dev   # http://localhost:3000
```

---

## Context

Built by [Anne Ringgaard](https://www.linkedin.com/in/anne-ringgaard) — ISTQB CT-AI certified QA specialist.

Most organizations running AI in production lack systematic tooling for the combination of test management, incident tracking, and compliance documentation that EU AI Act requires. This is an attempt to show what that tooling looks like in practice.

---

*Live demo: [audit.decodeai.dk](https://audit.decodeai.dk) — password: `anne`*
