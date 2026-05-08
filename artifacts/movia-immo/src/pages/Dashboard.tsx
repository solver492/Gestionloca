import { 
  useGetDashboardKpis, 
  getGetDashboardKpisQueryKey,
  useGetDashboardRevenueChart,
  getGetDashboardRevenueChartQueryKey,
  useGetDashboardOccupancyChart,
  getGetDashboardOccupancyChartQueryKey,
  useGetDashboardAlerts,
  getGetDashboardAlertsQueryKey,
  useGetDashboardActivity,
  getGetDashboardActivityQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Building, Users, Banknote, AlertTriangle, ArrowUpRight, TrendingUp, Wrench, FileText, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import AgendaWidget from "@/components/widgets/AgendaWidget";

export default function Dashboard() {
  const { data: kpis, isLoading: isLoadingKpis } = useGetDashboardKpis({ 
    query: { queryKey: getGetDashboardKpisQueryKey() } 
  });
  
  const { data: revenueChart, isLoading: isLoadingRevenue } = useGetDashboardRevenueChart({
    query: { queryKey: getGetDashboardRevenueChartQueryKey() }
  });
  
  const { data: occupancyChart, isLoading: isLoadingOccupancy } = useGetDashboardOccupancyChart({
    query: { queryKey: getGetDashboardOccupancyChartQueryKey() }
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useGetDashboardAlerts({
    query: { queryKey: getGetDashboardAlertsQueryKey() }
  });
  const alertsList = Array.isArray(alerts) ? alerts : [];

  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() }
  });
  const revenueChartData = Array.isArray(revenueChart) ? revenueChart : [];
  const occupancyChartData = Array.isArray(occupancyChart) ? occupancyChart : [];
  const activityList = Array.isArray(activity) ? activity : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground">Aperçu général de votre portefeuille immobilier.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingKpis ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : kpis ? (
          <>
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Revenus Mensuels</p>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(44 56% 54% / 0.15)", border: "1px solid hsl(44 56% 54% / 0.25)" }}>
                  <Banknote className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(kpis.monthlyRevenue)}</div>
              <div className="flex items-center text-xs text-emerald-400 mt-1.5">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Taux: {Number(kpis.collectionRate).toFixed(1)}%
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Loyers Impayés</p>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(kpis.unpaidAmount)}</div>
              <div className="text-xs text-muted-foreground mt-1.5">
                <span className="font-medium text-destructive">{kpis.unpaidRents}</span> locataires en retard
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Taux d'Occupation</p>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(44 56% 54% / 0.15)", border: "1px solid hsl(44 56% 54% / 0.25)" }}>
                  <Building className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">{Number(kpis.occupancyRate).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1.5">
                <span className="font-medium text-foreground">{kpis.occupiedProperties}</span> sur {kpis.totalProperties} biens
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Locataires Actifs</p>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(44 56% 54% / 0.15)", border: "1px solid hsl(44 56% 54% / 0.25)" }}>
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">{kpis.totalTenants}</div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Expirant: <span className="font-medium text-amber-500">{kpis.expiringContracts}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Évolution des Revenus</CardTitle>
            <CardDescription>Comparaison des revenus perçus et attendus sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingRevenue ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "rgba(14,16,28,0.95)", borderColor: "rgba(255,255,255,0.10)", color: "hsl(var(--foreground))", borderRadius: "0.75rem", backdropFilter: "blur(12px)" }} formatter={(v: number) => [formatCurrency(v), ""]} />
                  <Area type="monotone" dataKey="collected" name="Encaissé" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Occupation par Zone</CardTitle>
            <CardDescription>Répartition à Tanger</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingOccupancy ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : occupancyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="zone" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip cursor={{ fill: "hsl(var(--sidebar-accent))" }} contentStyle={{ backgroundColor: "rgba(14,16,28,0.95)", borderColor: "rgba(255,255,255,0.10)", color: "hsl(var(--foreground))", borderRadius: "0.75rem" }} />
                  <Bar dataKey="occupied" name="Occupé" stackId="a" fill="hsl(var(--primary))" barSize={20} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agenda — full width */}
      <AgendaWidget />

      {/* Alerts + Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              Alertes & Actions Requises
              {alertsList.length > 0 && (
                <Badge variant="destructive" className="ml-2 rounded-full px-2 font-mono">{alertsList.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              {isLoadingAlerts ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
              ) : alertsList.length > 0 ? (
                <div className="space-y-3">
                  {alertsList.map((alert) => (
                    <div key={alert.id} className={`flex flex-col gap-1 p-3 rounded-xl border-l-4 bg-sidebar-accent/20 ${alert.severity === "critical" ? "border-l-destructive" : alert.severity === "high" ? "border-l-orange-500" : alert.severity === "medium" ? "border-l-primary" : "border-l-blue-500"}`} style={{ backdropFilter: "blur(8px)" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{alert.title}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{alert.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <div className="rounded-full bg-sidebar-accent p-3 mb-3"><TrendingUp className="h-6 w-6 text-primary" /></div>
                  <p className="text-sm font-medium">Tout est en ordre</p>
                  <p className="text-xs mt-1">Aucune action urgente requise.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader><CardTitle className="font-serif">Activité Récente</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              {isLoadingActivity ? (
                <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-3 w-full" /><Skeleton className="h-2 w-20" /></div></div>)}</div>
              ) : activityList.length > 0 ? (
                <div className="space-y-4">
                  {activityList.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1.5 bg-sidebar-accent text-primary">
                        {act.type === "payment" && <Banknote className="h-4 w-4" />}
                        {act.type === "maintenance" && <Wrench className="h-4 w-4" />}
                        {act.type === "contract" && <FileText className="h-4 w-4" />}
                        {act.type === "tenant" && <Users className="h-4 w-4" />}
                        {act.type === "property" && <Building className="h-4 w-4" />}
                        {act.type === "notification" && <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-foreground">{act.description}</p>
                        <span className="text-xs text-muted-foreground">{formatDateTime(act.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground"><p className="text-sm">Aucune activité récente.</p></div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
