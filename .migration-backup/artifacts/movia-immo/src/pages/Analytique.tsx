import { useState } from "react";
import { 
  useGetFinancialAnalytics, getGetFinancialAnalyticsQueryKey,
  useGetOccupancyAnalytics, getGetOccupancyAnalyticsQueryKey,
  useGetProfitabilityAnalytics, getGetProfitabilityAnalyticsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ComposedChart, LineChart, Line, BarChart, Bar, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function Analytique() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data: financialData, isLoading: isLoadingFinancial } = useGetFinancialAnalytics(
    { year },
    { query: { queryKey: getGetFinancialAnalyticsQueryKey({ year }) } }
  );

  const { data: occupancyData, isLoading: isLoadingOccupancy } = useGetOccupancyAnalytics({
    query: { queryKey: getGetOccupancyAnalyticsQueryKey() }
  });

  const { data: profitabilityData, isLoading: isLoadingProfitability } = useGetProfitabilityAnalytics({
    query: { queryKey: getGetProfitabilityAnalyticsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytique
          </h1>
          <p className="text-muted-foreground">Performances financières et rentabilité du portefeuille.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="font-serif">Performance Financière ({year})</CardTitle>
            <CardDescription>Revenus, charges et bénéfice net mensuel</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoadingFinancial ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : financialData && financialData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={financialData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (name === "Taux de recouvrement") return [`${value}%`, name];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenus" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar yAxisId="left" dataKey="expenses" name="Charges" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="left" type="monotone" dataKey="profit" name="Bénéfice Net" stroke="hsl(var(--emerald-500))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="collectionRate" name="Taux de recouvrement" stroke="hsl(var(--blue-500))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Taux d'Occupation (12 derniers mois)</CardTitle>
            <CardDescription>Évolution de l'occupation du portefeuille</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingOccupancy ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : occupancyData && occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (name === "Taux d'occupation") return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <Line type="monotone" dataKey="occupancyRate" name="Taux d'occupation" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Top Biens par ROI</CardTitle>
            <CardDescription>Les 5 propriétés les plus rentables</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingProfitability ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : profitabilityData && profitabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="propertyTitle" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={120} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--sidebar-accent))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (name === "ROI") return [`${value}%`, name];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Bar dataKey="roi" name="ROI" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24}>
                    {/* Optional: label inside bar */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="font-serif">Rentabilité par Propriété</CardTitle>
            <CardDescription>Analyse détaillée des revenus et charges annuels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-sidebar-accent/50">
                  <TableRow className="border-card-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground">Propriété</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Zone</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Revenus Annuels</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Charges Annuelles</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Bénéfice Net</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingProfitability ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-card-border">
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 ml-auto rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : profitabilityData && profitabilityData.length > 0 ? (
                    profitabilityData.map((item) => (
                      <TableRow key={item.propertyId} className="border-card-border hover:bg-sidebar-accent/30 transition-colors">
                        <TableCell className="font-medium text-foreground">{item.propertyTitle}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.zone.replace("_", " ")}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-500">{formatCurrency(item.annualRevenue)}</TableCell>
                        <TableCell className="text-right font-mono text-destructive">{formatCurrency(item.annualExpenses)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">{formatCurrency(item.netProfit)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={`${item.roi >= 5 ? 'bg-emerald-500 hover:bg-emerald-600' : item.roi >= 3 ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-amber-500 hover:bg-amber-600'} border-none font-mono`}>
                            {item.roi >= 0 ? '+' : ''}{item.roi}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
