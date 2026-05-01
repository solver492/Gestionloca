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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";

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

  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground">Aperçu général de votre portefeuille immobilier.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingKpis ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : kpis ? (
          <>
            <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenus Mensuels</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(kpis.monthlyRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium flex items-center mr-1">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    Taux d'encaissement: {Number(kpis.collectionRate).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Loyers Impayés</CardTitle>
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(kpis.unpaidAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-destructive">{kpis.unpaidRents}</span> locataires en retard
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux d'Occupation</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">{Number(kpis.occupancyRate).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{kpis.occupiedProperties}</span> sur {kpis.totalProperties} biens occupés
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Locataires Actifs</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">{kpis.totalTenants}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Contrats expirant: <span className="font-medium text-amber-500">{kpis.expiringContracts}</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Évolution des Revenus</CardTitle>
            <CardDescription>Comparaison des revenus perçus et attendus sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingRevenue ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : revenueChart && revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
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
            ) : occupancyChart && occupancyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyChart} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="zone" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--sidebar-accent))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="occupied" name="Occupé" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} barSize={20} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              Alertes & Actions Requises
              {alerts && alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 rounded-full px-2 font-mono">{alerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {isLoadingAlerts ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`flex flex-col gap-1 p-3 rounded-md border-l-4 bg-sidebar-accent/30 ${alert.severity === 'critical' ? 'border-l-destructive' : alert.severity === 'high' ? 'border-l-orange-500' : alert.severity === 'medium' ? 'border-l-primary' : 'border-l-blue-500'}`}>
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
                  <div className="rounded-full bg-sidebar-accent p-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Tout est en ordre</p>
                  <p className="text-xs mt-1">Aucune action urgente requise.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {isLoadingActivity ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1.5 bg-sidebar-accent text-primary">
                        {act.type === 'payment' && <Banknote className="h-4 w-4" />}
                        {act.type === 'maintenance' && <Wrench className="h-4 w-4" />}
                        {act.type === 'contract' && <FileText className="h-4 w-4" />}
                        {act.type === 'tenant' && <Users className="h-4 w-4" />}
                        {act.type === 'property' && <Building className="h-4 w-4" />}
                        {act.type === 'notification' && <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-foreground">{act.description}</p>
                        <span className="text-xs text-muted-foreground">{formatDateTime(act.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p className="text-sm">Aucune activité récente.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
