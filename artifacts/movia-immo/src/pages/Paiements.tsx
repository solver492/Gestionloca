import { useState } from "react";
import { useListPayments, getListPaymentsQueryKey, useGetPaymentsSummary, getGetPaymentsSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Paiements() {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: payments, isLoading: isLoadingPayments } = useListPayments(
    { status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListPaymentsQueryKey({ status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const { data: summary, isLoading: isLoadingSummary } = useGetPaymentsSummary({
    query: { queryKey: getGetPaymentsSummaryQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Paiements</h1>
          <p className="text-muted-foreground">Suivi des loyers et historiques de paiement.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Enregistrer un paiement
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingSummary ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : summary ? (
          <>
            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendu (Mois)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(summary.totalExpected)}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Perçu</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono text-emerald-500">{formatCurrency(summary.totalCollected)}</div>
                <p className="text-xs text-muted-foreground mt-1">Taux: {summary.collectionRate}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono text-amber-500">{formatCurrency(summary.totalPending)}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary.partialCount} paiements partiels</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Impayés</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(summary.totalLateAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary.lateCount} locataires en retard</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-card-border">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-input">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="paye">Payé</SelectItem>
            <SelectItem value="en_retard">En retard</SelectItem>
            <SelectItem value="partiel">Partiel</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-sidebar-accent/50">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="font-semibold text-muted-foreground">Référence</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Locataire & Bien</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Montant</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Échéance</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPayments ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-card-border">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="border-card-border hover:bg-sidebar-accent/30 transition-colors">
                    <TableCell className="font-mono text-sm text-muted-foreground">{payment.reference}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{payment.tenantName}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{payment.propertyTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-medium text-foreground">{formatCurrency(payment.amount)}</span>
                        {payment.paidAmount && payment.paidAmount > 0 && payment.paidAmount < payment.amount && (
                          <span className="text-xs text-amber-500">Payé: {formatCurrency(payment.paidAmount)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        border-none font-medium
                        ${payment.status === 'paye' ? 'text-emerald-500 bg-emerald-500/10' : ''}
                        ${payment.status === 'en_retard' ? 'text-destructive bg-destructive/10' : ''}
                        ${payment.status === 'partiel' ? 'text-amber-500 bg-amber-500/10' : ''}
                        ${payment.status === 'en_attente' ? 'text-muted-foreground bg-muted' : ''}
                        ${payment.status === 'annule' ? 'text-muted-foreground bg-muted opacity-50' : ''}
                      `}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1).replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'paye' || payment.status === 'partiel' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground">
                          Encaisser
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
