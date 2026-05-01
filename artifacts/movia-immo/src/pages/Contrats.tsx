import { useState } from "react";
import { useListContracts, getListContractsQueryKey, useGetExpiringContracts, getGetExpiringContractsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, FileSignature, CheckCircle2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractFormDialog } from "@/components/forms/ContractFormDialog";

export default function Contrats() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const openCreate = () => { setSelectedContract(null); setDialogOpen(true); };
  const openEdit = (contract: any) => { setSelectedContract(contract); setDialogOpen(true); };
  
  const { data: contracts, isLoading: isLoadingContracts } = useListContracts(
    { status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListContractsQueryKey({ status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const { data: expiringContracts, isLoading: isLoadingExpiring } = useGetExpiringContracts({
    query: { queryKey: getGetExpiringContractsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Contrats</h1>
          <p className="text-muted-foreground">Gestion des baux et renouvellements.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contrat
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-card/50 backdrop-blur border border-card-border p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Tous les contrats
          </TabsTrigger>
          <TabsTrigger value="expiring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Expire bientôt
            {expiringContracts && expiringContracts.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-500 border-none">
                {expiringContracts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-card-border">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-input">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="expire">Expiré</SelectItem>
              <SelectItem value="resilie">Résilié</SelectItem>
              <SelectItem value="renouvele">Renouvelé</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-sidebar-accent/50">
                  <TableRow className="border-card-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground">Référence</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Locataire & Bien</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Période</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Loyer</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingContracts ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-card-border">
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : contracts && contracts.length > 0 ? (
                    contracts.map((contract) => (
                      <TableRow key={contract.id} className="border-card-border hover:bg-sidebar-accent/30 transition-colors">
                        <TableCell className="font-mono text-sm text-muted-foreground">{contract.reference}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{contract.tenantName}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{contract.propertyTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {contract.type.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>Du: {formatDate(contract.startDate)}</span>
                            <span className="text-muted-foreground">Au: {formatDate(contract.endDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">{formatCurrency(contract.rentAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`
                            border-none font-medium
                            ${contract.status === 'actif' ? 'text-emerald-500 bg-emerald-500/10' : ''}
                            ${contract.status === 'expire' ? 'text-destructive bg-destructive/10' : ''}
                            ${contract.status === 'resilie' ? 'text-muted-foreground bg-muted' : ''}
                            ${contract.status === 'renouvele' ? 'text-blue-500 bg-blue-500/10' : ''}
                            ${contract.status === 'en_attente' ? 'text-amber-500 bg-amber-500/10' : ''}
                          `}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1).replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => openEdit(contract)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Aucun contrat trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingExpiring ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
            ) : expiringContracts && expiringContracts.length > 0 ? (
              expiringContracts.map((contract) => (
                <Card key={contract.id} className="border-amber-500/30 bg-card/50 backdrop-blur">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">{contract.reference}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{contract.type.replace("_", " ")}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-amber-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        J-{contract.daysUntilExpiry}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-3 mt-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{contract.tenantName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{contract.propertyTitle}</p>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-card-border pt-3">
                        <span className="text-muted-foreground">Expire le:</span>
                        <span className="font-medium text-foreground">{formatDate(contract.endDate)}</span>
                      </div>
                      <div className="flex gap-2 mt-4 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-xs h-8 border-primary/20 hover:bg-primary/10"
                          onClick={() => openEdit(contract)}
                        >
                          <FileSignature className="h-3 w-3 mr-1" /> Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-card-border rounded-xl bg-card/20">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Tout est en ordre</h3>
                <p className="text-muted-foreground mt-1">Aucun contrat n'expire prochainement.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ContractFormDialog open={dialogOpen} onOpenChange={setDialogOpen} contract={selectedContract} />
    </div>
  );
}
