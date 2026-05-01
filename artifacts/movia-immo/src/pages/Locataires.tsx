import { useState } from "react";
import { useListTenants, getListTenantsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Phone, MapPin, Building2, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Locataires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tenants, isLoading } = useListTenants(
    { search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListTenantsQueryKey({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Locataires</h1>
          <p className="text-muted-foreground">Gestion des locataires et de leurs dossiers.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un locataire
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-card-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom, CIN, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-input">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : tenants && tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-card-border group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-sidebar-accent text-primary font-serif text-lg">
                        {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg leading-none text-foreground group-hover:text-primary transition-colors">
                        {tenant.firstName} {tenant.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">CIN: {tenant.cin}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`
                    bg-background/80 border-none font-medium
                    ${tenant.status === 'actif' ? 'text-emerald-500 bg-emerald-500/10' : ''}
                    ${tenant.status === 'inactif' ? 'text-muted-foreground bg-muted' : ''}
                    ${tenant.status === 'en_retard' ? 'text-amber-500 bg-amber-500/10' : ''}
                    ${tenant.status === 'expulse' ? 'text-destructive bg-destructive/10' : ''}
                  `}>
                    {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1).replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                    <span>{tenant.phone}</span>
                  </div>
                  {tenant.propertyTitle ? (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-primary/70 mt-0.5" />
                      <span className="line-clamp-1">{tenant.propertyTitle}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/50">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>Aucun bien assigné</span>
                    </div>
                  )}
                  {tenant.balance !== undefined && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 shrink-0 text-primary/70" />
                      <span className={tenant.balance < 0 ? 'text-destructive font-medium' : 'text-emerald-500 font-medium'}>
                        Solde: {formatCurrency(tenant.balance)}
                      </span>
                    </div>
                  )}
                </div>

                {tenant.paymentScore !== undefined && (
                  <div className="mt-4 pt-4 border-t border-card-border">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Score de paiement</span>
                      <span className="font-mono font-medium text-foreground">{tenant.paymentScore}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-sidebar-accent rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          tenant.paymentScore >= 80 ? 'bg-emerald-500' : 
                          tenant.paymentScore >= 50 ? 'bg-amber-500' : 'bg-destructive'
                        }`}
                        style={{ width: `${tenant.paymentScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-card-border rounded-xl bg-card/20">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Aucun locataire trouvé</h3>
            <p className="text-muted-foreground mt-1">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
