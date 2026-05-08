import { useState } from "react";
import { useListTenants, getListTenantsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Phone, Building2, CreditCard, LayoutGrid, List, Pencil, TrendingUp, TrendingDown, Mail, Star, Home, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TenantFormDialog } from "@/components/forms/TenantFormDialog";
import { TenantDetailSheet } from "@/components/sheets/TenantDetailSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

type ViewMode = "grid" | "list";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; cardBorder: string; glow: string }> = {
  actif:     { label: "Actif",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400", cardBorder: "rgba(52,211,153,0.15)", glow: "rgba(52,211,153,0.08)" },
  inactif:   { label: "Inactif",   color: "text-muted-foreground bg-muted/30 border-muted-foreground/20", dot: "bg-muted-foreground", cardBorder: "rgba(255,255,255,0.08)", glow: "rgba(0,0,0,0)" },
  en_retard: { label: "En retard", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400", cardBorder: "rgba(245,158,11,0.2)", glow: "rgba(245,158,11,0.06)" },
  expulse:   { label: "Expulsé",   color: "text-red-400 bg-red-500/10 border-red-500/30", dot: "bg-red-400", cardBorder: "rgba(239,68,68,0.2)", glow: "rgba(239,68,68,0.06)" },
};

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#34d399" : score >= 50 ? "#f59e0b" : "#f87171";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
      </svg>
      <span className="absolute text-xs font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

export default function Locataires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const openCreate = () => { setSelectedTenant(null); setDialogOpen(true); };
  const openEdit = (tenant: any) => { setSheetOpen(false); setSelectedTenant(tenant); setDialogOpen(true); };
  const openDetail = (tenant: any) => { setSelectedTenant(tenant); setSheetOpen(true); };

  const { data: tenants, isLoading } = useListTenants(
    { search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListTenantsQueryKey({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const glassCard = (borderColor: string, glowColor: string): React.CSSProperties => ({
    background: "rgba(18,18,18,0.72)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    border: `1px solid ${borderColor}`,
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${glowColor}`,
    borderRadius: "1.25rem",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Fiches Locataires</h1>
          <p className="text-muted-foreground">Gestion des locataires, dossiers et historiques.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
          style={{
            background: "linear-gradient(135deg, rgba(193,125,42,0.9), rgba(220,160,60,0.85))",
            border: "1px solid rgba(255,200,100,0.3)",
            boxShadow: "0 4px 16px rgba(193,125,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un locataire
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div
          className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl"
          style={{ background: "rgba(18,18,18,0.6)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, CIN, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[175px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }}>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
              <SelectItem value="expulse">Expulsé</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg p-1 shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {(["grid", "list"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setViewMode(m)} className={`h-7 px-2.5 rounded-md flex items-center text-sm transition-all ${viewMode === m ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} style={viewMode === m ? { background: "linear-gradient(135deg, hsl(44 56% 54% / 0.8), hsl(44 80% 65% / 0.7))" } : {}}>
                {m === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
        {!isLoading && tenants && (
          <p className="text-xs text-muted-foreground px-1">
            {tenants.length} locataire{tenants.length !== 1 ? "s" : ""} trouvé{tenants.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
          ) : tenants && tenants.length > 0 ? (
            tenants.map((tenant) => {
              const st = STATUS_CONFIG[tenant.status] || STATUS_CONFIG["actif"];
              const score = tenant.paymentScore ?? 0;
              const initials = `${tenant.firstName?.charAt(0) || ""}${tenant.lastName?.charAt(0) || ""}`.toUpperCase();

              return (
                <div
                  key={tenant.id}
                  onClick={() => openDetail(tenant)}
                  className="cursor-pointer group"
                  style={glassCard(st.cardBorder, st.glow)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${st.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${st.glow}`;
                  }}
                >
                  {/* Top highlight line */}
                  <div className="h-[1px] w-full rounded-t-[1.25rem]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }} />

                  <div className="p-5">
                    {/* Avatar + Name + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-13 w-13" style={{ width: 52, height: 52, border: "2px solid rgba(193,125,42,0.35)", boxShadow: "0 0 16px rgba(193,125,42,0.20)" }}>
                            <AvatarFallback className="font-serif text-lg font-bold" style={{ background: "linear-gradient(135deg, rgba(193,125,42,0.25), rgba(220,160,60,0.15))", color: "hsl(44 56% 65%)" }}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online dot */}
                          {tenant.status === "actif" && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2" style={{ borderColor: "rgba(18,18,18,0.9)", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
                            {tenant.firstName} {tenant.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tenant.profession || `CIN: ${tenant.cin}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border text-[10px] font-semibold flex items-center gap-1 shrink-0 ml-2 rounded-full px-2 ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </Badge>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="text-sm">{tenant.phone}</span>
                      </div>

                      {/* Property relationship section */}
                      {tenant.propertyTitle ? (
                        <div
                          className="rounded-xl p-3 mt-3"
                          style={{ background: "rgba(193,125,42,0.07)", border: "1px solid rgba(193,125,42,0.15)" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                            <span className="text-sm font-medium text-foreground line-clamp-1">{tenant.propertyTitle}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            {tenant.rentAmount !== undefined && tenant.rentAmount !== null && (
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="h-3 w-3 text-primary/60" />
                                <span className="text-xs font-mono font-semibold text-primary">
                                  {formatCurrency(tenant.rentAmount)}/mois
                                </span>
                              </div>
                            )}
                            {tenant.balance !== undefined && (
                              <span className={`text-xs font-mono font-semibold ${(tenant.balance ?? 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {(tenant.balance ?? 0) >= 0 ? "+" : ""}{formatCurrency(tenant.balance ?? 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/40 mt-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm italic">Aucun bien assigné</span>
                        </div>
                      )}
                    </div>

                    {/* Score ring + bar */}
                    <div className="mt-4 pt-3 flex items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <ScoreRing score={score} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            {score >= 80 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-amber-400" />}
                            Score paiement
                          </span>
                          <span className={`font-semibold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {score >= 80 ? "Excellent" : score >= 50 ? "Moyen" : "Mauvais"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                              background: score >= 80 ? "linear-gradient(90deg, #34d399, #6ee7b7)" : score >= 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #f87171, #fca5a5)",
                              boxShadow: `0 0 8px ${score >= 80 ? "#34d39960" : score >= 50 ? "#f59e0b60" : "#f8717160"}`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.10)", background: "rgba(18,18,18,0.4)", backdropFilter: "blur(8px)" }}>
              <User className="mx-auto h-14 w-14 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun locataire trouvé</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchTerm || statusFilter !== "all" ? "Essayez de modifier vos filtres." : "Commencez par ajouter votre premier locataire."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button onClick={openCreate} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mx-auto transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, rgba(193,125,42,0.85), rgba(220,160,60,0.8))", border: "1px solid rgba(255,200,100,0.25)" }}>
                  <Plus className="h-4 w-4" /> Ajouter un locataire
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.06] hover:bg-transparent" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <TableHead className="font-semibold text-muted-foreground">Locataire</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Bien loué</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Loyer / Solde</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Score</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-b border-white/[0.06]">
                      {Array(7).fill(0).map((__, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                    </TableRow>
                  ))
                ) : tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => {
                    const st = STATUS_CONFIG[tenant.status] || STATUS_CONFIG["actif"];
                    const score = tenant.paymentScore ?? 0;
                    const initials = `${tenant.firstName?.charAt(0) || ""}${tenant.lastName?.charAt(0) || ""}`.toUpperCase();
                    const scoreColor = score >= 80 ? "#34d399" : score >= 50 ? "#f59e0b" : "#f87171";
                    return (
                      <TableRow key={tenant.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => openDetail(tenant)}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0" style={{ border: "1px solid rgba(193,125,42,0.3)" }}>
                              <AvatarFallback className="text-xs font-bold" style={{ background: "rgba(193,125,42,0.15)", color: "hsl(44 56% 65%)" }}>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{tenant.firstName} {tenant.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{tenant.cin}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {tenant.phone}</div>
                            {tenant.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {tenant.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenant.propertyTitle ? (
                            <div className="flex items-center gap-1.5">
                              <Home className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                              <span className="text-sm text-foreground line-clamp-1">{tenant.propertyTitle}</span>
                            </div>
                          ) : <span className="text-sm text-muted-foreground/40 italic">Non assigné</span>}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {tenant.rentAmount !== undefined && tenant.rentAmount !== null && (
                              <div className="text-xs font-mono font-semibold text-primary">{formatCurrency(tenant.rentAmount)}/m</div>
                            )}
                            <div className={`font-mono text-xs font-semibold ${(tenant.balance ?? 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>
                              {(tenant.balance ?? 0) >= 0 ? "+" : ""}{formatCurrency(tenant.balance ?? 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor, boxShadow: `0 0 6px ${scoreColor}60` }} />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">{score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border text-xs font-medium flex items-center gap-1 w-fit rounded-full px-2 ${st.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(tenant)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Aucun locataire trouvé</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <TenantDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} tenant={selectedTenant} onEdit={() => { setSheetOpen(false); setDialogOpen(true); }} />
      <TenantFormDialog open={dialogOpen} onOpenChange={setDialogOpen} tenant={selectedTenant} />
    </div>
  );
}
