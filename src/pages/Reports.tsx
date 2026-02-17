import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { TimeToRiskBadge } from "@/components/TimeToRiskBadge";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react";

interface ClinicalAnalysis {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  alert_level?: string;
  reasoning?: string;
}

interface AnalysisEntry {
  id: string;
  risk?: number;
  timeToRisk?: string;
  timeMinutes?: number;
  urgency?: string;
  ttrLevel?: string;
  condition?: string;
  waitTime?: string;
  timestamp?: string;
  details?: {
    clinical_analysis?: ClinicalAnalysis;
  };
}

export default function Reports() {
  const {
    data: analyses,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useApiQuery<AnalysisEntry[]>(["analyses"], "/analyses?limit=100");

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = analyses ?? [];
    const byId = new Map<string, AnalysisEntry[]>();

    for (const entry of list) {
      if (!entry.id) continue;
      const existing = byId.get(entry.id) ?? [];
      existing.push(entry);
      byId.set(entry.id, existing);
    }

    return Array.from(byId.entries())
      .map(([patientId, entries]) => {
        entries.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

        const latest = entries[0];
        const baseTime = latest.timestamp ? new Date(latest.timestamp) : new Date();
        const nextDue = new Date(baseTime.getTime() + 6 * 60 * 60 * 1000);

        return {
          patientId,
          latest,
          count: entries.length,
          nextDue,
        };
      })
      .sort((a, b) => a.patientId.localeCompare(b.patientId));
  }, [analyses]);

  const selectedRow = useMemo(() => {
    if (!rows.length) {
      return null;
    }
    const id = selectedPatientId ?? rows[0].patientId;
    return rows.find((row) => row.patientId === id) ?? rows[0];
  }, [rows, selectedPatientId]);

  const selectedReport: AnalysisEntry | null = useMemo(() => {
    if (!selectedRow) {
      return null;
    }
    return selectedRow.latest;
  }, [selectedRow]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reports schedule
            </h2>
            <p className="text-sm text-slate-500">
              Live overview of which reports are ready and which are pending for each patient.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-100 bg-red-50/60">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Could not load reports.
                </p>
                <p className="text-xs text-red-600">
                  Check that the backend is running and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="shadow-sm border-slate-100">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="border-dashed border-slate-200 bg-slate-50/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    No reports yet
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Multimodal analyses will appear here as soon as you start running them.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {rows.map((row) => (
                <Card
                  key={row.patientId}
                  className={`border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    selectedRow && selectedRow.patientId === row.patientId
                      ? "ring-2 ring-slate-900/10"
                      : ""
                  }`}
                  onClick={() => setSelectedPatientId(row.patientId)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Patient {row.patientId}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider"
                          >
                            {row.count} reports
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Latest multimodal risk and time-to-risk summary.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Latest report ready
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                          Risk
                        </p>
                        <div className="flex items-center gap-2">
                          <RiskBadge
                            level={
                              row.latest.urgency === "high" ||
                              row.latest.urgency === "medium" ||
                              row.latest.urgency === "low"
                                ? row.latest.urgency
                                : "low"
                            }
                          />
                          <span className="text-xs text-slate-600">
                            {typeof row.latest.risk === "number"
                              ? `${Math.round(row.latest.risk)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                          Time-to-risk
                        </p>
                        <TimeToRiskBadge
                          time={row.latest.timeToRisk ?? "-"}
                          level={
                            row.latest.ttrLevel === "critical" || row.latest.ttrLevel === "watch"
                              ? row.latest.ttrLevel
                              : "safe"
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                          Last updated
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {row.latest.timestamp
                              ? new Date(row.latest.timestamp).toLocaleString()
                              : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedRow && (
              <Card className="mt-6 border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-600 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        Clinic report
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-1">
                        Digital health record generated from the latest multimodal analysis.
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Patient {selectedRow.patientId}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedReport?.timestamp
                          ? new Date(selectedReport.timestamp).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {selectedReport?.details?.clinical_analysis ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Subjective
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {selectedReport.details.clinical_analysis.subjective}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Objective
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {selectedReport.details.clinical_analysis.objective}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Assessment
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {selectedReport.details.clinical_analysis.assessment}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Plan
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {selectedReport.details.clinical_analysis.plan}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)] items-start">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Alert level
                          </p>
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            <Activity className="h-3 w-3 text-slate-500" />
                            {selectedReport.details.clinical_analysis.alert_level ??
                              "Not specified"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                            Reasoning
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {selectedReport.details.clinical_analysis.reasoning}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          No structured report available yet.
                        </p>
                        <p className="text-xs text-slate-600">
                          Once the reasoning engine generates a SOAP note for this patient,
                          the full report will appear here automatically.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
