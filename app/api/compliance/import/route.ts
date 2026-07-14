import { NextRequest } from "next/server";
import { dbPost, auditLog } from "@/app/lib/db";

// ═══════════════════════════════════════════════════════════
// EU AI Act — Foruddefinerede krav
// Baseret på EU AI Act (Forordning 2024/1689), ikrafttræden 2024-08-01,
// fuld anvendelse for høj-risiko systemer: 2026-08-02
// ═══════════════════════════════════════════════════════════

const EU_AI_ACT_REQUIREMENTS = [
  // ── Art. 5 — Forbudte praksisser ──────────────────────────────
  {
    requirement_id: "Art. 5.1a",
    title: "Ingen subliminal eller manipulativ AI",
    description:
      "AI-systemet må ikke anvende teknikker der bevidst manipulerer en persons handlinger på en måde der underminerer deres autonomi, uden at de er klar over det. Kontrol: Gennemgå systemets output-mekanismer og brugergrænseflade for manipulative mønstre.",
  },
  {
    requirement_id: "Art. 5.1b",
    title: "Ingen udnyttelse af sårbare grupper",
    description:
      "AI-systemet må ikke udnytte svagheder hos specifikke persongrupper, herunder mindreårige, ældre eller personer med psykisk sygdom. Kontrol: Risikovurdering af brugergrupper og systemets påvirkning på disse.",
  },
  {
    requirement_id: "Art. 5.1c",
    title: "Ingen social scoring af enkeltpersoner",
    description:
      "AI-systemet må ikke bruges til at evaluere eller klassificere enkeltpersoner på basis af deres sociale adfærd på tværs af kontekster (social scoring). Kontrol: Verificér at systemets formål ikke indebærer generel person-rangordning.",
  },

  // ── Art. 9 — Risikostyringssystem ────────────────────────────
  {
    requirement_id: "Art. 9.1",
    title: "Risikostyringssystem etableret og vedligeholdt",
    description:
      "Et løbende risikostyringssystem skal etableres, implementeres, dokumenteres og vedligeholdes for AI-systemets fulde livscyklus. Skal revideres ved væsentlige ændringer.",
  },
  {
    requirement_id: "Art. 9.2",
    title: "Risici identificeret og analyseret",
    description:
      "Alle kendte og forudsigelige risici ved AI-systemet skal identificeres og analyseres. Dette inkluderer: fejlbrug, forkert brug, uventede resultater og kumulerede risici ved kombination med andre systemer.",
  },
  {
    requirement_id: "Art. 9.4",
    title: "Risikomitigering implementeret og testet",
    description:
      "Passende risikomitigeringstiltag skal implementeres. Residualrisici skal vurderes og kommunikeres til relevante brugere. Dokumentation kræves.",
  },
  {
    requirement_id: "Art. 9.6",
    title: "Testning under realistiske vilkår",
    description:
      "AI-systemet skal testes under betingelser der svarer til det virkelige anvendelsesscenarie, herunder med repræsentative data. Testresultater skal dokumenteres.",
  },

  // ── Art. 10 — Data og datastyring ────────────────────────────
  {
    requirement_id: "Art. 10.1",
    title: "Praksisser for datastyring dokumenteret",
    description:
      "Datastyringspraksisser for trænings-, validerings- og testdata skal dokumenteres. Inkluderer: datakilde, indsamlingsmetode, forbehandling og eventuelle kendte begrænsninger.",
  },
  {
    requirement_id: "Art. 10.2",
    title: "Data er relevant og repræsentativ",
    description:
      "Trænings- og valideringsdata skal være relevant for det tilsigtede formål og repræsentativ for den population systemet anvendes på. Manglende repræsentation skal identificeres og adresseres.",
  },
  {
    requirement_id: "Art. 10.3",
    title: "Bias-evaluering gennemført",
    description:
      "Data skal undersøges for mulige bias, fejl og mangler. Evalueringen skal dokumenteres og potentielle diskriminerende mønstre skal adresseres inden systemet tages i brug.",
  },
  {
    requirement_id: "Art. 10.5",
    title: "Personoplysninger i træningsdata minimeret",
    description:
      "Brug af personoplysninger i træningsdata skal minimeres i overensstemmelse med databeskyttelsesforordningen (GDPR). Pseudonymisering og anonymisering skal anvendes hvor muligt.",
  },

  // ── Art. 11 — Teknisk dokumentation ──────────────────────────
  {
    requirement_id: "Art. 11.1",
    title: "Teknisk dokumentation udarbejdet",
    description:
      "Teknisk dokumentation skal udarbejdes inden systemet bringes i omsætning og holdes opdateret. Dokumentationen skal muliggøre vurdering af systemets overensstemmelse med AI-forordningen.",
  },
  {
    requirement_id: "Art. 11.2",
    title: "Systemarkitektur og komponenter dokumenteret",
    description:
      "Den tekniske dokumentation skal indeholde: systemets overordnede arkitektur, anvendte algoritmer og modeller, design-valg og begrundelser, samt information om tredjeparts-komponenter.",
  },

  // ── Art. 12 — Record-keeping og logging ──────────────────────
  {
    requirement_id: "Art. 12.1",
    title: "Automatisk logning aktiveret",
    description:
      "Høj-risiko AI-systemer skal automatisk logge hændelser og vigtige beslutninger. Logning skal muliggøre sporing af systemets output og identificere situationer der udgør risici.",
  },
  {
    requirement_id: "Art. 12.2",
    title: "Logdata opbevaret og tilgængeligt",
    description:
      "Logfiler skal opbevares i en passende periode tilpasset det tilsigtede formål. For systemet der anvendes af offentlige myndigheder gælder mindst 3 år. Logs skal være tilgængelige for tilsynsmyndigheder.",
  },

  // ── Art. 13 — Gennemsigtighed og information til brugere ─────
  {
    requirement_id: "Art. 13.1",
    title: "Brugervejledning udarbejdet og tilgængelig",
    description:
      "En klar og forståelig brugervejledning skal stilles til rådighed. Vejledningen skal inkludere: systemets kapabiliteter og begrænsninger, overvågningskrav, og kontaktoplysninger til udbyderen.",
  },
  {
    requirement_id: "Art. 13.2",
    title: "Systemets begrænsninger kommunikeret",
    description:
      "Brugere skal informeres om AI-systemets kendte begrænsninger, herunder præcisionsgrænser, scenarier hvor systemet kan fejle, og situationer der kræver menneskelig vurdering.",
  },
  {
    requirement_id: "Art. 13.3",
    title: "Brugere informeret om AI-beslutninger der berører dem",
    description:
      "Fysiske personer der er genstand for et AI-systems beslutninger skal informeres om dette, i det omfang det er rimeligt og praktisk muligt. Relevant for HR-systemer, kreditvurdering m.v.",
  },

  // ── Art. 14 — Menneskelig kontrol ────────────────────────────
  {
    requirement_id: "Art. 14.1",
    title: "Menneskelig oversight muliggjort",
    description:
      "AI-systemet skal designes og udvikles så det effektivt kan overvåges af mennesker under anvendelse. Systemet skal muliggøre menneskelig indgriben, Override og stop.",
  },
  {
    requirement_id: "Art. 14.2",
    title: "Stop-funktionalitet implementeret",
    description:
      "Systemet skal have en 'stop'-funktion som autoriserede brugere kan aktivere. Systemet skal kunne standse helt eller delvist i tilfælde af risici.",
  },
  {
    requirement_id: "Art. 14.3",
    title: "Brugere kompetente og trænet",
    description:
      "Brugere af AI-systemet skal have tilstrækkelig teknisk viden og forståelse til at udøve effektiv menneskelig kontrol. Træning og kompetencevurdering skal dokumenteres.",
  },
  {
    requirement_id: "Art. 14.4",
    title: "Automatiske output kan gennemgås og korrigeres",
    description:
      "Systemets automatiske output og beslutninger skal kunne gennemgås og om nødvendigt korrigeres eller tilsidesættes af mennesker inden der handles på dem.",
  },

  // ── Art. 15 — Nøjagtighed, robusthed og cybersikkerhed ───────
  {
    requirement_id: "Art. 15.1",
    title: "Nøjagtighedsmål defineret og målt",
    description:
      "AI-systemet skal dokumentere de nøjagtighedsniveauer det er testet for, samt de metrics der er anvendt. Nøjagtighed skal måles under repræsentative betingelser.",
  },
  {
    requirement_id: "Art. 15.2",
    title: "Robusthed overfor fejl testet",
    description:
      "Systemet skal testes for robusthed overfor fejl, fejlagtig brug og modstridende input. Edge cases og corner cases skal identificeres og dokumenteres.",
  },
  {
    requirement_id: "Art. 15.3",
    title: "Cybersikkerhedsvurdering gennemført",
    description:
      "AI-systemet skal have passende cybersikkerhedstiltag. En sikkerhedsvurdering skal gennemføres og dokumenteres, herunder vurdering af risiko for adversarial attacks og data poisoning.",
  },
  {
    requirement_id: "Art. 15.4",
    title: "Fallback-mekanismer implementeret",
    description:
      "Systemet skal have fallback-mekanismer der aktiveres ved fejl. Systemet skal sikre acceptable output og undgå katastrofale fejl, selv når det oplever uventede inputs.",
  },

  // ── Art. 17 — Kvalitetsstyringssystem ────────────────────────
  {
    requirement_id: "Art. 17.1",
    title: "Kvalitetsstyringssystem etableret",
    description:
      "Udbydere af høj-risiko AI-systemer skal etablere et kvalitetsstyringssystem. Systemet skal sikre overholdelse af AI-forordningen og dokumentation af alle relevante processer.",
  },

  // ── Art. 52 — Gennemsigtighedsforpligtelser ───────────────────
  {
    requirement_id: "Art. 52.1",
    title: "Brugere informeres om AI-interaktion",
    description:
      "Systemer der er designet til at interagere med mennesker skal informere brugerne om at de kommunikerer med en AI, med mindre det er tydeligt fra konteksten. Krav gælder chatbots, voicebots og lignende systemer.",
  },
  {
    requirement_id: "Art. 52.3",
    title: "Deepfake-indhold mærkes",
    description:
      "AI-genereret billede-, lyd- og videoindhold der ikke tydeligt er kunstnerisk eller satirisk, skal mærkes som AI-genereret. Mærkning skal være maskinlæsbar og for videoindhold synlig for brugerne.",
  },
] as const;

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Forsøger at oprette ét krav — returnerer null hvis det allerede eksisterer (duplicate key)
async function tryCreate(payload: Record<string, unknown>): Promise<{ id: number } | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/compliance_requirements`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    // Ignorer duplikat-fejl (23505 = unique violation i PostgreSQL)
    if (text.includes("23505") || text.includes("duplicate") || text.includes("unique")) return null;
    throw new Error(`DB POST compliance_requirements: ${res.status} ${text}`);
  }
  const rows = await res.json();
  if (!rows || (Array.isArray(rows) && rows.length === 0)) return null;
  return Array.isArray(rows) ? rows[0] : rows;
}

// POST /api/compliance/import
// Body: { system_id: number }
// Opretter alle EU AI Act-krav for et system med deadline 2026-08-02.
// Eksisterende krav (samme system_id + requirement_id) springes over.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { system_id } = body as { system_id?: number };

    if (!system_id) {
      return Response.json({ error: "system_id er påkrævet" }, { status: 400 });
    }

    const deadline = "2026-08-02";
    let created = 0;
    let skipped = 0;

    for (const req_def of EU_AI_ACT_REQUIREMENTS) {
      const payload = {
        system_id,
        framework: "EU AI Act",
        requirement_id: req_def.requirement_id,
        title: req_def.title,
        description: req_def.description,
        status: "pending",
        evidence: null,
        due_date: deadline,
      };

      try {
        const row = await tryCreate(payload);
        if (row) {
          await auditLog({ table: "compliance_requirements", recordId: row.id, action: "INSERT", newValues: row });
          created++;
        } else {
          skipped++;
        }
      } catch {
        // Ignorer enkeltfejl — log ikke for at undgå noise
        skipped++;
      }
    }

    return Response.json({
      ok: true,
      created,
      skipped,
      total: EU_AI_ACT_REQUIREMENTS.length,
      message: `${created} krav oprettet${skipped > 0 ? `, ${skipped} sprunget over (eksisterer allerede)` : ""}.`,
    }, { status: 201 });

  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
