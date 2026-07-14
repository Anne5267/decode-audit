import { describe, it, expect } from "vitest";
import { STATUS_DA, CATEGORY_DA, RISK_DA, SEV_LABEL, label } from "./labels";

describe("STATUS_DA", () => {
  it("mapper incident-statuser korrekt", () => {
    expect(STATUS_DA["open"]).toBe("Åben");
    expect(STATUS_DA["investigating"]).toBe("Undersøges");
    expect(STATUS_DA["resolved"]).toBe("Løst");
    expect(STATUS_DA["wont_fix"]).toBe("Ignoreret");
  });

  it("mapper test case-statuser korrekt", () => {
    expect(STATUS_DA["passed"]).toBe("Bestået");
    expect(STATUS_DA["failed"]).toBe("Fejlet");
    expect(STATUS_DA["pending"]).toBe("Afventer");
    expect(STATUS_DA["flaky"]).toBe("Ustabil");
  });

  it("mapper compliance-statuser korrekt", () => {
    expect(STATUS_DA["met"]).toBe("Opfyldt");
    expect(STATUS_DA["not_met"]).toBe("Ikke opfyldt");
    expect(STATUS_DA["partial"]).toBe("Delvist");
    expect(STATUS_DA["na"]).toBe("N/A");
  });
});

describe("CATEGORY_DA", () => {
  it("mapper alle AI-testkategorier", () => {
    expect(CATEGORY_DA["bias"]).toBe("Bias");
    expect(CATEGORY_DA["hallucination"]).toBe("Hallucination");
    expect(CATEGORY_DA["safety"]).toBe("Sikkerhed");
    expect(CATEGORY_DA["accuracy"]).toBe("Nøjagtighed");
    expect(CATEGORY_DA["performance"]).toBe("Performance");
    expect(CATEGORY_DA["edge_case"]).toBe("Edge case");
    expect(CATEGORY_DA["regression"]).toBe("Regression");
    expect(CATEGORY_DA["compliance"]).toBe("Compliance");
  });
});

describe("RISK_DA", () => {
  it("mapper EU AI Act risikoniveauer", () => {
    expect(RISK_DA["minimal"]).toBe("Minimal risiko");
    expect(RISK_DA["limited"]).toBe("Begrænset risiko");
    expect(RISK_DA["high"]).toBe("Høj risiko");
    expect(RISK_DA["unacceptable"]).toBe("Uacceptabel risiko");
  });
});

describe("SEV_LABEL", () => {
  it("indekserer sværhedsgrader korrekt (1=Kritisk, 5=Triviel)", () => {
    expect(SEV_LABEL[1]).toBe("Kritisk");
    expect(SEV_LABEL[2]).toBe("Høj");
    expect(SEV_LABEL[3]).toBe("Medium");
    expect(SEV_LABEL[4]).toBe("Lav");
    expect(SEV_LABEL[5]).toBe("Triviel");
  });

  it("indeks 0 er tomt (severity er 1-baseret)", () => {
    expect(SEV_LABEL[0]).toBe("");
  });
});

describe("label helper", () => {
  it("returnerer mapping fra map", () => {
    expect(label(STATUS_DA, "open")).toBe("Åben");
  });

  it("returnerer nøglen selv hvis mapping mangler", () => {
    expect(label(STATUS_DA, "ukendt_status")).toBe("ukendt_status");
  });
});
