// Centrale oversættelser — brug disse i stedet for rå DB-værdier

export const STATUS_DA: Record<string, string> = {
  // Incidents
  open: "Åben",
  investigating: "Undersøges",
  resolved: "Løst",
  wont_fix: "Ignoreret",
  // Test cases
  passed: "Bestået",
  failed: "Fejlet",
  pending: "Afventer",
  flaky: "Ustabil",
  skipped: "Sprunget over",
  // Compliance
  met: "Opfyldt",
  not_met: "Ikke opfyldt",
  partial: "Delvist",
  na: "N/A",
  // Systems
  active: "Aktiv",
  inactive: "Inaktiv",
  deprecated: "Udfaset",
  testing: "Under test",
};

export const RISK_DA: Record<string, string> = {
  minimal: "Minimal risiko",
  limited: "Begrænset risiko",
  high: "Høj risiko",
  unacceptable: "Uacceptabel risiko",
};

export const CATEGORY_DA: Record<string, string> = {
  accuracy: "Nøjagtighed",
  bias: "Bias",
  safety: "Sikkerhed",
  hallucination: "Hallucination",
  performance: "Performance",
  edge_case: "Edge case",
  regression: "Regression",
  compliance: "Compliance",
  data_quality: "Datakvalitet",
  other: "Andet",
};

export const SEV_LABEL = ["", "Kritisk", "Høj", "Medium", "Lav", "Triviel"];

export function label(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}
