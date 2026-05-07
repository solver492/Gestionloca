import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Eye, MessageCircle, Star, BarChart3, Wifi, Zap } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CHANNEL_COLORS: Record<string, string> = {
  WhatsApp:  "#25D366",
  Facebook:  "#1877F2",
  Instagram: "#C13584",
  Avito:     "#FF6600",
  Direct:    "hsl(var(--primary))",
  Google:    "#EA4335",
};

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appart.", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

export default function AnalytiqueVente() {
  const [overview, setOverview] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/api/vente-analytics/overview`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/api/vente-analytics/properties`).then(r => r.ok ? r.json() : []),
      fetch(`${BASE}/api/vente-analytics/monthly`).then(r => r.ok ? r.json() : []),
    ]).then(([ov, props, mon]) => {
      setOverview(ov);
      setProperties(props || []);
      setMonthly(mon || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Annonces Actives",   value: overview?.publicProperties ?? "—", icon: Wifi,          color: "text-primary" },
    { label: "Vues Totales",       value: overview?.totalViews ?? "—",        icon: Eye,           color: "text-blue-400" },
    { label: "Contacts Reçus",     value: overview?.totalContacts ?? "—",     icon: MessageCircle, color: "text-emerald-400" },
    { label: "Taux de Conversion", value: overview ? `${overview.conversionRate}%` : "—", icon: TrendingUp, color: "text-amber-400" },
  ];

  const topProperties = properties.slice(0, 10).map(p => ({
    name: p.title.length > 22 ? p.title.substring(0, 22) + "…" : p.title,
    vues: p.views,
    contacts: p.contacts,
  }));

  const channelData = overview?.channelDistribution || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytique & Ads — Vente
        </h1>
        <p className="text-muted-foreground">Performance des annonces, sources de trafic et classement des biens.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-card/50 backdrop-blur border-card-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  {loading ? <Skeleton className="h-6 w-16 mt-1" /> : <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évolution mensuelle (6 derniers mois)
            </CardTitle>
            <CardDescription>Vues, contacts et mandats signés</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? <Skeleton className="w-full h-full rounded-xl" /> : monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Line type="monotone" dataKey="vues" name="Vues" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="contacts" name="Contacts" stroke="#25D366" strokeWidth={2} dot={{ r: 3, fill: "#25D366" }} />
                  <Line type="monotone" dataKey="mandats" name="Mandats" stroke="#C13584" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#C13584" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Top 10 biens les plus consultés
            </CardTitle>
            <CardDescription>Nombre de vues par annonce</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? <Skeleton className="w-full h-full rounded-xl" /> : topProperties.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProperties} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={130} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="vues" name="Vues" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="contacts" name="Contacts" fill="#25D366" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Sources de contact
            </CardTitle>
            <CardDescription>Canaux d'acquisition des prospects</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? <Skeleton className="w-full h-full rounded-xl" /> : channelData.length > 0 ? (
              <div className="flex items-center h-full gap-4">
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={channelData} dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {channelData.map((entry: any) => (
                        <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || "hsl(var(--primary))"} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {channelData.slice(0, 6).map((ch: any) => {
                    const total = channelData.reduce((s: number, x: any) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((ch.count / total) * 100) : 0;
                    return (
                      <div key={ch.channel} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[ch.channel] || "hsl(var(--primary))" }} />
                        <span className="text-xs text-muted-foreground flex-1 truncate">{ch.channel}</span>
                        <span className="text-xs font-mono font-bold text-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Classement des biens par performance
            </CardTitle>
            <CardDescription>Score basé sur les vues, contacts et taux d'engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-sidebar-accent/50">
                  <TableRow className="border-card-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground w-10">#</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Bien</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Zone · Type</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Prix</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Vues</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Contacts</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Canal principal</TableHead>
                    <TableHead className="font-semibold text-right text-muted-foreground">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-card-border">
                        {Array(8).fill(0).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : properties.length > 0 ? (
                    properties.map((p: any, idx: number) => (
                      <TableRow key={p.id} className="border-card-border hover:bg-sidebar-accent/30 transition-colors">
                        <TableCell className="font-mono text-muted-foreground font-bold">{idx + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm line-clamp-1">{p.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.reference}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.zone?.replace(/_/g, " ")} · {TYPE_LABELS[p.type] || p.type}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-primary text-sm">
                          {p.price ? `${p.price.toLocaleString("fr-FR")} MAD` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-400 font-semibold">{p.views}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-400 font-semibold">{p.contacts}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${CHANNEL_COLORS[p.topChannel] || "hsl(var(--primary))"}20`, color: CHANNEL_COLORS[p.topChannel] || "hsl(var(--primary))", border: `1px solid ${CHANNEL_COLORS[p.topChannel] || "hsl(var(--primary))"}40` }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CHANNEL_COLORS[p.topChannel] || "hsl(var(--primary))" }} />
                            {p.topChannel}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={`font-mono border-none ${p.score >= 80 ? "bg-emerald-500" : p.score >= 50 ? "bg-primary text-primary-foreground" : "bg-amber-500"}`}>
                            {p.score}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">Aucune donnée disponible</TableCell>
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
