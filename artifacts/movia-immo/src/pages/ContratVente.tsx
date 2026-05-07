import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Printer, FileText, Trash2, CheckCircle2, TrendingUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CONTRACT_TYPES: Record<string, { label: string; color: string }> = {
  mandat_exclusif:  { label: "Mandat Exclusif",   color: "text-primary bg-primary/10 border-primary/20" },
  mandat_simple:    { label: "Mandat Simple",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  compromis_vente:  { label: "Compromis de Vente", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  offre_achat:      { label: "Offre d'Achat",      color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  promesse_vente:   { label: "Promesse de Vente",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  actif:    { label: "Actif",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  expire:   { label: "Expiré",   color: "text-destructive bg-destructive/10 border-destructive/20" },
  resilie:  { label: "Résilié",  color: "text-muted-foreground bg-muted/30 border-muted/30" },
  signe:    { label: "Signé ✓", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
};

const defaultForm = {
  type: "mandat_exclusif",
  propertyTitle: "",
  propertyAddress: "",
  propertyZone: "Centre_Ville",
  propertySurface: "",
  priceAsked: "",
  ownerName: "",
  ownerCin: "",
  ownerPhone: "",
  ownerEmail: "",
  ownerAddress: "",
  buyerName: "",
  buyerPhone: "",
  agencyCommission: "2.5",
  durationDays: "90",
  startDate: new Date().toISOString().substring(0, 10),
  endDate: "",
  status: "actif",
  conditions: "",
  notes: "",
};

function generateContractHTML(contract: any): string {
  const typeDef = CONTRACT_TYPES[contract.type || "mandat_exclusif"];
  const dateStr = contract.start_date ? new Date(contract.start_date).toLocaleDateString("fr-FR") : "";
  const endDateStr = contract.end_date ? new Date(contract.end_date).toLocaleDateString("fr-FR") : "";
  const priceFormatted = contract.price_asked ? `${Number(contract.price_asked).toLocaleString("fr-FR")} MAD` : "À définir";
  const commissionAmount = contract.price_asked && contract.agency_commission
    ? `${((Number(contract.price_asked) * Number(contract.agency_commission)) / 100).toLocaleString("fr-FR")} MAD`
    : "À calculer";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${typeDef?.label || "Contrat"} — ${contract.reference}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px double #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
    .agency-name { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #c17d2a; }
    .agency-sub { font-size: 13px; color: #666; margin-top: 4px; }
    .contract-title { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; margin-top: 16px; }
    .ref { font-size: 12px; color: #888; margin-top: 4px; font-family: monospace; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 14px; color: #444; }
    .row { display: flex; gap: 12px; margin-bottom: 8px; }
    .field { flex: 1; }
    .field-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 14px; font-weight: bold; border-bottom: 1px dotted #ccc; padding-bottom: 2px; min-height: 22px; }
    .amount { font-size: 18px; color: #c17d2a; font-weight: bold; font-family: monospace; }
    .conditions-box { border: 1px solid #ccc; padding: 12px; min-height: 80px; font-size: 13px; border-radius: 4px; }
    .signatures { display: flex; gap: 40px; margin-top: 48px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-line { border-bottom: 1px solid #333; height: 60px; margin: 8px 0; }
    .sig-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
    .print-btn { position: fixed; top: 20px; right: 20px; background: #c17d2a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-family: sans-serif; }
    @media print { .print-btn { display: none; } body { padding: 20px; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimer / PDF</button>
  <div class="header">
    <div class="agency-name">MOVIA IMMO</div>
    <div class="agency-sub">Agence Immobilière — Tanger, Maroc</div>
    <div class="contract-title">${typeDef?.label || "Contrat"}</div>
    <div class="ref">Réf: ${contract.reference || "—"} &nbsp;|&nbsp; Date: ${dateStr}</div>
  </div>

  <div class="section">
    <div class="section-title">Objet du Contrat</div>
    <div class="row">
      <div class="field">
        <div class="field-label">Titre du bien</div>
        <div class="field-value">${contract.property_title || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">Zone</div>
        <div class="field-value">${(contract.property_zone || "—").replace(/_/g, " ")}</div>
      </div>
    </div>
    <div class="row">
      <div class="field">
        <div class="field-label">Adresse</div>
        <div class="field-value">${contract.property_address || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">Surface</div>
        <div class="field-value">${contract.property_surface ? contract.property_surface + " m²" : "—"}</div>
      </div>
    </div>
    <div class="row">
      <div class="field">
        <div class="field-label">Prix demandé</div>
        <div class="field-value amount">${priceFormatted}</div>
      </div>
      <div class="field">
        <div class="field-label">Commission agence</div>
        <div class="field-value amount">${contract.agency_commission || "2.5"}% — ${commissionAmount}</div>
      </div>
    </div>
    ${contract.duration_days ? `<div class="row">
      <div class="field">
        <div class="field-label">Durée du mandat</div>
        <div class="field-value">${contract.duration_days} jours (du ${dateStr} au ${endDateStr || "—"})</div>
      </div>
    </div>` : ""}
  </div>

  <div class="section">
    <div class="section-title">Propriétaire (Mandant)</div>
    <div class="row">
      <div class="field">
        <div class="field-label">Nom complet</div>
        <div class="field-value">${contract.owner_name || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">CIN</div>
        <div class="field-value">${contract.owner_cin || "—"}</div>
      </div>
    </div>
    <div class="row">
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${contract.owner_phone || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${contract.owner_email || "—"}</div>
      </div>
    </div>
    <div class="field" style="margin-bottom:8px">
      <div class="field-label">Adresse</div>
      <div class="field-value">${contract.owner_address || "—"}</div>
    </div>
  </div>

  ${contract.buyer_name ? `<div class="section">
    <div class="section-title">Acheteur / Acquéreur</div>
    <div class="row">
      <div class="field">
        <div class="field-label">Nom complet</div>
        <div class="field-value">${contract.buyer_name}</div>
      </div>
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${contract.buyer_phone || "—"}</div>
      </div>
    </div>
  </div>` : ""}

  <div class="section">
    <div class="section-title">Conditions Particulières</div>
    <div class="conditions-box">${contract.conditions || "Néant"}</div>
  </div>

  <div class="section">
    <div class="section-title">Engagement</div>
    <p style="font-size:13px; color:#444; margin-bottom:12px">
      Le propriétaire soussigné donne mandat à l'agence <strong>MOVIA IMMO</strong> de rechercher un acquéreur pour le bien désigné
      ci-dessus, aux conditions indiquées, et ce pour une durée de <strong>${contract.duration_days || 90} jours</strong> à compter de la
      date de signature.
      ${contract.type === "mandat_exclusif" ? "Ce mandat est accordé à titre <strong>EXCLUSIF</strong> — le propriétaire s'engage à ne pas confier ce mandat à une autre agence pendant la durée ci-dessus." : ""}
    </p>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-label">Le Propriétaire (Mandant)</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">${contract.owner_name || "Nom & Signature"}<br>Date: ___________</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">L'Agence — MOVIA IMMO</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">Représentant autorisé<br>Date: ___________</div>
    </div>
    ${contract.buyer_name ? `<div class="sig-block">
      <div class="sig-label">L'Acquéreur</div>
      <div class="sig-line"></div>
      <div style="font-size:12px; color:#666">${contract.buyer_name}<br>Date: ___________</div>
    </div>` : ""}
  </div>

  <div class="footer">
    Movia Immo — Agence Immobilière · Tanger, Maroc<br>
    Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
  </div>
</body>
</html>`;
}

export default function ContratVente() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const loadContracts = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${BASE}/api/sales-contracts`);
      if (r.ok) setContracts(await r.json());
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContracts(); }, []);

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const openCreate = () => {
    setForm({ ...defaultForm, startDate: new Date().toISOString().substring(0, 10) });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.propertyTitle || !form.ownerName || !form.startDate) {
      toast.error("Bien, propriétaire et date de début sont obligatoires");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${BASE}/api/sales-contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertySurface: form.propertySurface ? Number(form.propertySurface) : undefined,
          priceAsked: form.priceAsked ? Number(form.priceAsked) : undefined,
          agencyCommission: Number(form.agencyCommission),
          durationDays: Number(form.durationDays),
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Contrat créé avec succès");
      setDialogOpen(false);
      loadContracts();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce contrat ?")) return;
    await fetch(`${BASE}/api/sales-contracts/${id}`, { method: "DELETE" });
    setContracts(c => c.filter((x: any) => x.id !== id));
    toast.success("Contrat supprimé");
  };

  const handlePrint = (contract: any) => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Popup bloquée — autorisez les popups"); return; }
    w.document.write(generateContractHTML(contract));
    w.document.close();
  };

  const kpiActive = contracts.filter((c: any) => c.status === "actif").length;
  const kpiSigned = contracts.filter((c: any) => c.status === "signe").length;
  const kpiTotal = contracts.length;
  const totalValue = contracts.reduce((sum: number, c: any) => sum + (Number(c.price_asked) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Contrats de Vente
          </h1>
          <p className="text-muted-foreground">Mandats de vente, compromis et engagements — génération & impression PDF.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau mandat
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total contrats", value: kpiTotal, color: "text-foreground" },
          { label: "Mandats actifs", value: kpiActive, color: "text-primary" },
          { label: "Signés / conclus", value: kpiSigned, color: "text-emerald-400" },
          { label: "Valeur portefeuille", value: totalValue > 0 ? `${(totalValue / 1_000_000).toFixed(1)}M MAD` : "—", color: "text-amber-400" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card/50 backdrop-blur border-card-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-card-border bg-sidebar-accent/30">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Registre des mandats
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-sidebar-accent/50">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="font-semibold text-muted-foreground">Réf</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Bien / Propriétaire</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Prix demandé</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Commission</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Durée</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-card-border">
                    {Array(8).fill(0).map((__, j) => <TableCell key={j}><div className="h-4 bg-sidebar-accent/50 rounded animate-pulse w-24" /></TableCell>)}
                  </TableRow>
                ))
              ) : contracts.length > 0 ? (
                contracts.map((c: any) => {
                  const typeDef = CONTRACT_TYPES[c.type] || CONTRACT_TYPES.mandat_exclusif;
                  const statusDef = STATUS_CONFIG[c.status] || STATUS_CONFIG.actif;
                  const commission = c.price_asked && c.agency_commission
                    ? `${c.agency_commission}% (${((Number(c.price_asked) * Number(c.agency_commission)) / 100).toLocaleString("fr-FR")} MAD)`
                    : `${c.agency_commission || 2.5}%`;
                  return (
                    <TableRow key={c.id} className="border-card-border hover:bg-sidebar-accent/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.reference}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs border ${typeDef.color}`}>{typeDef.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm line-clamp-1">{c.property_title}</p>
                          <p className="text-xs text-muted-foreground">{c.owner_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-primary text-sm">
                        {c.price_asked ? `${Number(c.price_asked).toLocaleString("fr-FR")} MAD` : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{commission}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.duration_days || 90}j</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs border ${statusDef.color}`}>{statusDef.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handlePrint(c)} title="Imprimer / PDF">
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)} title="Supprimer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="h-12 w-12 opacity-20" />
                      <p>Aucun mandat enregistré</p>
                      <Button size="sm" onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Créer le premier mandat
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Nouveau contrat de vente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <Label>Type de contrat</Label>
              <Select value={form.type} onValueChange={v => handleChange("type", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandat_exclusif">Mandat de Vente Exclusif</SelectItem>
                  <SelectItem value="mandat_simple">Mandat de Vente Simple</SelectItem>
                  <SelectItem value="compromis_vente">Compromis de Vente</SelectItem>
                  <SelectItem value="offre_achat">Offre d'Achat</SelectItem>
                  <SelectItem value="promesse_vente">Promesse de Vente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bien immobilier</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Titre du bien <span className="text-destructive">*</span></Label>
                  <Input value={form.propertyTitle} onChange={e => handleChange("propertyTitle", e.target.value)} placeholder="ex: Villa Moderne — Tanger" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Adresse</Label>
                  <Input value={form.propertyAddress} onChange={e => handleChange("propertyAddress", e.target.value)} placeholder="Rue / Quartier" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Zone</Label>
                  <Select value={form.propertyZone} onValueChange={v => handleChange("propertyZone", v)}>
                    <SelectTrigger className="bg-background/50 border-input"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Centre_Ville", "Tanger_City_Center", "Malabata", "Marshan", "Moujahidine", "Achakar"].map(z => (
                        <SelectItem key={z} value={z}>{z.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Surface (m²)</Label>
                  <Input type="number" value={form.propertySurface} onChange={e => handleChange("propertySurface", e.target.value)} placeholder="ex: 180" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Prix demandé (MAD)</Label>
                  <Input type="number" value={form.priceAsked} onChange={e => handleChange("priceAsked", e.target.value)} placeholder="ex: 1500000" className="bg-background/50 border-input" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Propriétaire / Mandant</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nom complet <span className="text-destructive">*</span></Label>
                  <Input value={form.ownerName} onChange={e => handleChange("ownerName", e.target.value)} placeholder="Nom & Prénom" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>CIN</Label>
                  <Input value={form.ownerCin} onChange={e => handleChange("ownerCin", e.target.value)} placeholder="AB123456" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Téléphone</Label>
                  <Input value={form.ownerPhone} onChange={e => handleChange("ownerPhone", e.target.value)} placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={form.ownerEmail} onChange={e => handleChange("ownerEmail", e.target.value)} placeholder="email@exemple.com" className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Adresse</Label>
                  <Input value={form.ownerAddress} onChange={e => handleChange("ownerAddress", e.target.value)} placeholder="Adresse complète" className="bg-background/50 border-input" />
                </div>
              </div>
            </div>

            {(form.type === "compromis_vente" || form.type === "offre_achat" || form.type === "promesse_vente") && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acheteur / Acquéreur</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom complet</Label>
                    <Input value={form.buyerName} onChange={e => handleChange("buyerName", e.target.value)} placeholder="Nom & Prénom" className="bg-background/50 border-input" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input value={form.buyerPhone} onChange={e => handleChange("buyerPhone", e.target.value)} placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Conditions du mandat</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Commission (%)</Label>
                  <Input type="number" step="0.5" value={form.agencyCommission} onChange={e => handleChange("agencyCommission", e.target.value)} className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Durée (jours)</Label>
                  <Input type="number" value={form.durationDays} onChange={e => handleChange("durationDays", e.target.value)} className="bg-background/50 border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Date début <span className="text-destructive">*</span></Label>
                  <Input type="date" value={form.startDate} onChange={e => handleChange("startDate", e.target.value)} className="bg-background/50 border-input" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Conditions particulières</Label>
              <Textarea value={form.conditions} onChange={e => handleChange("conditions", e.target.value)} placeholder="Clauses spéciales, exclusions, modalités de paiement..." className="bg-background/50 border-input resize-none" rows={3} />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-card-border">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-card-border">
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Créer le contrat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
