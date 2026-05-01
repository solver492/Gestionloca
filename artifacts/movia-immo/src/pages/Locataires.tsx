import { useState } from "react";
import { useListTenants, getListTenantsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Phone, Building2, CreditCard, LayoutGrid, List, Pencil, TrendingUp, TrendingDown, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TenantFormDialog } from "@/components/forms/TenantFormDialog";
import { TenantDetailSheet } from "@/components/sheets/TenantDetailSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ViewMode = "grid" | "list";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; cardBorder: string }> = {
  actif:     { label: "Actif",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400", cardBorder: "hover:border-emerald-500/30" },
  inactif:   { label: "Inactif",   color: "text-muted-foreground bg-muted/50 border-muted-foreground/20", dot: "bg-muted-foreground", cardBorder: "" },
  en_retard: { label: "En retard", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400", cardBorder: "hover:border-amber-500/30" },
  expulse:   { label: "Expulsé",   color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400", cardBorder: "hover:border-red-500/30" },
};

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Fiches Locataires</h1>
          <p className="text-muted-foreground">Gestion des locataires, dossiers et historiques.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un locataire
        </Button>
      </div>

      {/* Filters + toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 bg-card/30 p-3 rounded-xl border border-card-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, CIN, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[175px] bg-background/50 border-input">
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

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-background/50 border border-input rounded-md p-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-7 px-2.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-7 px-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </Button>
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
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          ) : tenants && tenants.length > 0 ? (
            tenants.map((tenant) => {
              const st = STATUS_CONFIG[tenant.status] || STATUS_CONFIG["actif"];
              const score = tenant.paymentScore ?? 0;
              const initials = `${tenant.firstName?.charAt(0) || ""}${tenant.lastName?.charAt(0) || ""}`.toUpperCase();
              const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

              return (
                <Card
                  key={tenant.id}
                  onClick={() => openDetail(tenant)}
                  className={`overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all bg-card/50 backdrop-blur border-card-border group cursor-pointer ${st.cardBorder}`}
                >
                  <CardContent className="p-5">
                    {/* Top: avatar + name + status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-serif text-lg font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-base leading-none text-foreground group-hover:text-primary transition-colors">
                            {tenant.firstName} {tenant.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tenant.profession || `CIN: ${tenant.cin}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border text-xs font-medium flex items-center gap-1 shrink-0 ml-2 ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </Badge>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="text-sm">{tenant.phone}</span>
                      </div>
                      {tenant.propertyTitle ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span className="text-sm line-clamp-1">{tenant.propertyTitle}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/50">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm italic">Aucun bien assigné</span>
                        </div>
                      )}
                      {tenant.balance !== undefined && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span className={`text-sm font-mono font-medium ${tenant.balance < 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {tenant.balance >= 0 ? "+" : ""}{formatCurrency(tenant.balance)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Score bar */}
                    <div className="mt-4 pt-4 border-t border-card-border">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          {score >= 80 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-amber-400" />}
                          Score de paiement
                        </span>
                        <span className={`font-mono font-semibold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {score}/100
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-sidebar-accent rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreColor}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-card-border rounded-xl bg-card/20">
              <User className="mx-auto h-14 w-14 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun locataire trouvé</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchTerm || statusFilter !== "all" ? "Essayez de modifier vos filtres." : "Commencez par ajouter votre premier locataire."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={openCreate} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un locataire
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-sidebar-accent/50">
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground">Locataire</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Bien loué</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Solde</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Score</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-card-border">
                      <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-3 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => {
                    const st = STATUS_CONFIG[tenant.status] || STATUS_CONFIG["actif"];
                    const score = tenant.paymentScore ?? 0;
                    const initials = `${tenant.firstName?.charAt(0) || ""}${tenant.lastName?.charAt(0) || ""}`.toUpperCase();
                    const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <TableRow
                        key={tenant.id}
                        className="border-card-border hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(tenant)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{tenant.firstName} {tenant.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{tenant.cin}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {tenant.phone}
                            </div>
                            {tenant.email && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" /> {tenant.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenant.propertyTitle ? (
                            <span className="text-sm text-foreground line-clamp-1">{tenant.propertyTitle}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50 italic">Non assigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono text-sm font-semibold ${(tenant.balance ?? 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {(tenant.balance ?? 0) >= 0 ? "+" : ""}{formatCurrency(tenant.balance ?? 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-sidebar-accent rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">{score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border text-xs font-medium flex items-center gap-1 w-fit ${st.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => openEdit(tenant)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Aucun locataire trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <TenantDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tenant={selectedTenant}
        onEdit={() => { setSheetOpen(false); setDialogOpen(true); }}
      />
      <TenantFormDialog open={dialogOpen} onOpenChange={setDialogOpen} tenant={selectedTenant} />
    </div>
  );
}
