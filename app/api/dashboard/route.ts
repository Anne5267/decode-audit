import { dbGet } from "@/app/lib/db";

interface SystemRow {
  id: number;
  name: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  open_incidents: number;
  critical_incidents: number;
  compliance_total: number;
  compliance_met: number;
}

// GET /api/dashboard — aggregeret overblik
export async function GET() {
  try {
    const [systems, incidents, tests, compliance] = await Promise.all([
      dbGet<SystemRow[]>("/system_quality_overview?order=name.asc"),
      dbGet<{ status: string; severity: number }[]>("/incidents?select=status,severity&limit=500"),
      dbGet<{ status: string }[]>("/test_cases?select=status&limit=1000"),
      dbGet<{ status: string }[]>("/compliance_requirements?select=status&limit=500"),
    ]);

    // Test stats
    const totalTests = tests.length;
    const passedTests = tests.filter((t) => t.status === "passed").length;
    const failedTests = tests.filter((t) => t.status === "failed").length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // Incident stats
    const openIncidents = (incidents as Array<{ status: string; severity: number }>).filter(
      (i) => i.status === "open" || i.status === "investigating"
    ).length;
    const criticalIncidents = (incidents as Array<{ status: string; severity: number }>).filter(
      (i) => (i.status === "open" || i.status === "investigating") && i.severity <= 2
    ).length;

    // Compliance stats
    const totalCompliance = compliance.length;
    const metCompliance = compliance.filter((c) => c.status === "met").length;
    const complianceRate =
      totalCompliance > 0 ? Math.round((metCompliance / totalCompliance) * 100) : 0;

    return Response.json({
      systems: {
        total: systems.length,
        list: systems,
      },
      tests: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        pass_rate: passRate,
      },
      incidents: {
        open: openIncidents,
        critical: criticalIncidents,
        total: incidents.length,
      },
      compliance: {
        total: totalCompliance,
        met: metCompliance,
        rate: complianceRate,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
