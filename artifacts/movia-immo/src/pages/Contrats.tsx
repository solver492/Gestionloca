import { useState } from "react";
import { useListContracts, getListContractsQueryKey, useGetExpiringContracts, getGetExpiringContractsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, FileSignature, CheckCircle2, Pencil, Printer } from "lucide-react";

function printBailContract(contract: any) {
  const w = window.open("", "_blank");
  if (!w) { alert("Popup bloquée — veuillez autoriser les popups pour ce site."); return; }

  const startDate = contract.startDate ? new Date(contract.startDate).toLocaleDateString("fr-FR") : "—";
  const endDate = contract.endDate ? new Date(contract.endDate).toLocaleDateString("fr-FR") : "—";
  const typeLabel: Record<string, string> = {
    bail_habitation: "Bail d'Habitation",
    bail_commercial: "Bail Commercial",
    bail_meuble: "Bail Meublé",
    contrat_location: "Contrat de Location",
    renouvellement: "Renouvellement de Bail",
  };

  w.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bail ${contract.reference}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; line-height: 1.7; }
    .header { text-align: center; border-bottom: 3px double #1a1a2e; padding-bottom: 20px; margin-bottom: 28px; }
    .agency-name { font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #c17d2a; }
    .agency-sub { font-size: 12px; color: #666; margin-top: 4px; }
    .contract-title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; margin-top: 14px; }
    .ref { font-size: 12px; color: #888; margin-top: 4px; font-family: monospace; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 12px; color: #444; }
    .row { display: flex; gap: 24px; margin-bottom: 8px; }
    .field { flex: 1; }
    .field-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 14px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 22px; }
    .amount { font-size: 18px; color: #c17d2a; font-weight: bold; font-family: monospace; }
    .conditions-box { border: 1px solid #ccc; padding: 12px; min-height: 80px; font-size: 13px; border-radius: 4px; }
    .sigs { display: flex; gap: 40px; margin-top: 48px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-line { border-bottom: 1px solid #333; height: 60px; margin: 8px 0; }
    .sig-label { font-size: 11px; color: #666; text-transform: uppercase; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 14px; }
    .print-btn { position: fixed; top: 20px; right: 20px; background: #c17d2a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-family: sans-serif; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimer / PDF</button>
  <div class="header">
    <div class="agency-name">MOVIA IMMO</div>
    <div class="agency-sub">Agence Immobilière — Tanger, Maroc</div>
    <div class="contract-title">${typeLabel[contract.type] || contract.type?.replace(/_/g, " ") || "Contrat de Location"}</div>
    <div class="ref">Réf: ${contract.reference || "—"} &nbsp;|&nbsp; Signé le: ${new Date().toLocaleDateString("fr-FR")}</div>
  </div>

  <div class="section">
    <div class="section-title">Parties</div>
    <div class="row">
      <div class="field">
        <div class="field-label">Locataire</div>
        <div class="field-value">${contract.tenantName || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">Bien loué</div>
        <div class="field-value">${contract.propertyTitle || "—"}</div>
      </div>
    </div>
    ${contract.witnessName ? `<div class="row">
      <div class="field"><div class="field-label">Témoin</div><div class="field-value">${contract.witnessName}</div></div>
      <div class="field"><div class="field-label">Téléphone témoin</div><div class="field-value">${contract.witnessPhone || "—"}</div></div>
    </div>` : ""}
  </div>

  <div class="section">
    <div class="section-title">Durée & Conditions financières</div>
    <div class="row">
      <div class="field"><div class="field-label">Date début</div><div class="field-value">${startDate}</div></div>
      <div class="field"><div class="field-label">Date fin</div><div class="field-value">${endDate}</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="field-label">Loyer mensuel</div><div class="field-value amount">${Number(contract.rentAmount || 0).toLocaleString("fr-FR")} MAD</div></div>
      <div class="field"><div class="field-label">Charges</div><div class="field-value amount">${Number(contract.chargesAmount || 0).toLocaleString("fr-FR")} MAD</div></div>
      <div class="field"><div class="field-label">Caution</div><div class="field-value amount">${Number(contract.depositAmount || 0).toLocaleString("fr-FR")} MAD</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Conditions particulières</div>
    <div class="conditions-box">${contract.specialConditions || "Néant"}</div>
  </div>

  <div class="section">
    <div class="section-title">Engagement des parties</div>
    <p style="font-size:13px; color:#444">Le présent bail est conclu et accepté par les parties soussignées pour une durée débutant le <strong>${startDate}</strong> et se terminant le <strong>${endDate}</strong>, moyennant un loyer mensuel de <strong>${Number(contract.rentAmount || 0).toLocaleString("fr-FR")} MAD</strong>, plus charges de <strong>${Number(contract.chargesAmount || 0).toLocaleString("fr-FR")} MAD</strong>. Une caution équivalente à <strong>${Number(contract.depositAmount || 0).toLocaleString("fr-FR")} MAD</strong> a été versée préalablement.</p>
  </div>

  <div class="sigs">
    <div class="sig-block">
      <div class="sig-label">Le Propriétaire / L'Agence</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">Movia Immo — Représentant<br>Date: ___________</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Le Locataire</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">${contract.tenantName || "Locataire"}<br>Date: ___________</div>
    </div>
    ${contract.witnessName ? `<div class="sig-block">
      <div class="sig-label">Le Témoin</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">${contract.witnessName}<br>Date: ___________</div>
    </div>` : ""}
  </div>

  <div class="footer">Movia Immo — Tanger, Maroc · Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</div>
</body>
</html>`);
  w.document.close();
}
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
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => printBailContract(contract)}
                              title="Imprimer / Télécharger PDF"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => openEdit(contract)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
