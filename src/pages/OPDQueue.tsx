import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { TimeToRiskBadge } from "@/components/TimeToRiskBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { ArrowUpRight, Clock, Users, Zap, TrendingUp, AlertTriangle, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type UrgencyLevel = "low" | "medium" | "high";
type TTRLevel = "safe" | "watch" | "critical";

interface Patient {
  id: string;
  risk: number;
  timeToRisk: string;
  timeMinutes: number;
  urgency: UrgencyLevel;
  ttrLevel: TTRLevel;
  condition: string;
  waitTime: string;
}

const patients: Patient[] = [
  { id: "P004", risk: 92, timeToRisk: "15 min", timeMinutes: 15, urgency: "high", ttrLevel: "critical", condition: "Post-op Cardiac", waitTime: "10m" },
  { id: "P001", risk: 85, timeToRisk: "30 min", timeMinutes: 30, urgency: "high", ttrLevel: "critical", condition: "Sepsis Watch", waitTime: "25m" },
  { id: "P007", risk: 68, timeToRisk: "45 min", timeMinutes: 45, urgency: "medium", ttrLevel: "watch", condition: "Respiratory Distress", waitTime: "15m" },
  { id: "P002", risk: 45, timeToRisk: "2 hours", timeMinutes: 120, urgency: "medium", ttrLevel: "watch", condition: "Observation", waitTime: "45m" },
  { id: "P005", risk: 30, timeToRisk: "3 hours", timeMinutes: 180, urgency: "low", ttrLevel: "safe", condition: "Routine Check", waitTime: "5m" },
  { id: "P003", risk: 12, timeToRisk: "6 hours", timeMinutes: 360, urgency: "low", ttrLevel: "safe", condition: "Stable", waitTime: "1h 10m" },
  { id: "P006", risk: 8, timeToRisk: "8 hours", timeMinutes: 480, urgency: "low", ttrLevel: "safe", condition: "Discharge Ready", waitTime: "2h" },
];

// Original FIFO order (arrival order)
const originalOrder: Patient[] = [
  patients[4], // P005
  patients[5], // P003
  patients[3], // P002
  patients[6], // P006
  patients[0], // P004
  patients[2], // P007
  patients[1], // P001
];

function QueueTable({ data, loading }: { data: Patient[]; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
      <Table>
        <TableHeader className="bg-slate-50/90 backdrop-blur-md">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-16 font-bold text-slate-400 pl-6 uppercase tracking-wider text-[11px] h-12">#</TableHead>
            <TableHead className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Patient ID</TableHead>
            <TableHead className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Condition</TableHead>
            <TableHead className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Risk Analysis</TableHead>
            <TableHead className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Time-to-Risk</TableHead>
            <TableHead className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Wait Time</TableHead>
            <TableHead className="text-right font-bold text-slate-400 pr-6 uppercase tracking-wider text-[11px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((p, idx) => (
                <TableRow key={p.id} className="group border-slate-50 hover:bg-white/80 transition-all duration-300 cursor-pointer">
                  <TableCell className="font-mono text-xs text-slate-400 pl-6">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{p.id}</span>
                       <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">OPD-A</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{p.condition}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                         <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                            <path
                              className={`${p.risk > 80 ? 'text-rose-500 drop-shadow-sm' : p.risk > 50 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                              strokeDasharray={`${p.risk}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              strokeLinecap="round"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                         </svg>
                         <span className={`absolute text-[10px] font-bold ${p.risk > 80 ? 'text-rose-600' : p.risk > 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                           {p.risk}%
                         </span>
                      </div>
                      <div className="flex flex-col">
                        <RiskBadge level={p.urgency} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TimeToRiskBadge time={p.timeToRisk} level={p.ttrLevel} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-fit border border-slate-100">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{p.waitTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl shadow-slate-200/50 border-slate-100">
                        <DropdownMenuItem className="text-slate-700 font-medium cursor-pointer rounded-lg focus:bg-slate-50 focus:text-blue-600">
                           <ArrowUpRight className="mr-2 h-4 w-4" /> View Patient Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-700 font-medium cursor-pointer rounded-lg focus:bg-slate-50">Assign Doctor</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 font-medium focus:text-rose-700 focus:bg-rose-50 rounded-lg cursor-pointer">Mark as Critical</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function OPDQueue() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">OPD Queue Management</h2>
            <p className="text-slate-500 mt-1">
              Real-time patient prioritization based on multimodal risk analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
               <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-600">Live Updates Active</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg shadow-blue-900/5 bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Users className="h-32 w-32 text-blue-600 transform translate-x-8 -translate-y-8" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm ring-1 ring-blue-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Patients</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-slate-900">24</p>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-rose-900/5 bg-gradient-to-br from-white to-rose-50/50 hover:shadow-xl hover:shadow-rose-900/10 transition-all duration-300 group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Zap className="h-32 w-32 text-rose-600 transform translate-x-8 -translate-y-8" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm ring-1 ring-rose-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-600/80 uppercase tracking-wide">Critical Attention</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-rose-700">3</p>
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                      Immediate Action
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-emerald-900/5 bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Clock className="h-32 w-32 text-emerald-600 transform translate-x-8 -translate-y-8" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm ring-1 ring-emerald-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Wait Time</p>
                  <div className="flex items-baseline gap-2 mt-1">
                     <p className="text-3xl font-black text-slate-900">12m</p>
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> -5%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ai" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
            <TabsList className="bg-white p-1 border border-slate-200 rounded-xl h-12 shadow-sm self-start">
              <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 px-4 font-medium transition-all">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                AI-Prioritized Queue
              </TabsTrigger>
              <TabsTrigger value="original" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 px-4 font-medium transition-all">
                <Clock className="h-4 w-4 mr-2 text-slate-500" />
                Standard FIFO
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
               <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
               Auto-refreshing (30s)
            </div>
          </div>

          <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                     Sorted by Time-to-Risk
                     <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                       Recommended
                     </span>
                   </CardTitle>
                   <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                      View Full Analysis <ArrowUpRight className="ml-1 h-3 w-3" />
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <QueueTable data={patients} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original" className="mt-0 focus-visible:outline-none">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-base font-semibold text-slate-700">
                  Arrival Order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <QueueTable data={originalOrder} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
