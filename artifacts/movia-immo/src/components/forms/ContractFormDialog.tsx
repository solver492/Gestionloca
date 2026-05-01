import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateContract,
  useUpdateContract,
  useListTenants,
  useListProperties,
  getListContractsQueryKey,
  getGetExpiringContractsQueryKey,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: any;
}

const defaultValues = {
  tenantId: "",
  propertyId: "",
  startDate: "",
  endDate: "",
  rentAmount: "",
  chargesAmount: "",
  depositAmount: "",
  depositPaid: false,
  type: "bail_habitation",
  status: "actif",
  specialConditions: "",
  witnessName: "",
  witnessPhone: "",
};

export function ContractFormDialog({ open, onOpenChange, contract }: ContractFormDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!contract;
  const [form, setForm] = useState(defaultValues);

  const { data: tenants } = useListTenants();
  const { data: properties } = useListProperties();

  useEffect(() => {
    if (contract) {
      setForm({
        tenantId: contract.tenantId?.toString() || "",
        propertyId: contract.propertyId?.toString() || "",
        startDate: contract.startDate ? contract.startDate.substring(0, 10) : "",
        endDate: contract.endDate ? contract.endDate.substring(0, 10) : "",
        rentAmount: contract.rentAmount?.toString() || "",
        chargesAmount: contract.chargesAmount?.toString() || "",
        depositAmount: contract.depositAmount?.toString() || "",
        depositPaid: contract.depositPaid || false,
        type: contract.type || "bail_habitation",
        status: contract.status || "actif",
        specialConditions: contract.specialConditions || "",
        witnessName: contract.witnessName || "",
        witnessPhone: contract.witnessPhone || "",
      });
    } else {
      const now = new Date();
      const startDate = now.toISOString().substring(0, 10);
      const endDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString().substring(0, 10);
      setForm({ ...defaultValues, startDate, endDate });
    }
  }, [contract, open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListContractsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetExpiringContractsQueryKey() });
  };

  const createMutation = useCreateContract({
    mutation: {
      onSuccess: () => {
        toast.success("Contrat créé avec succès");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    },
  });

  const updateMutation = useUpdateContract({
    mutation: {
      onSuccess: () => {
        toast.success("Contrat mis à jour");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la mise à jour"),
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.tenantId || !form.propertyId || !form.startDate || !form.endDate || !form.rentAmount) {
      toast.error("Locataire, bien, dates et loyer sont obligatoires");
      return;
    }
    const payload = {
      tenantId: parseInt(form.tenantId),
      propertyId: parseInt(form.propertyId),
      startDate: form.startDate,
      endDate: form.endDate,
      rentAmount: parseFloat(form.rentAmount),
      chargesAmount: form.chargesAmount ? parseFloat(form.chargesAmount) : undefined,
      depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
      depositPaid: form.depositPaid,
      type: form.type,
      status: form.status,
      specialConditions: form.specialConditions || undefined,
      witnessName: form.witnessName || undefined,
      witnessPhone: form.witnessPhone || undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: contract.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            {isEdit ? "Modifier le contrat" : "Nouveau contrat"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Locataire <span className="text-destructive">*</span></Label>
              <Select value={form.tenantId || "none"} onValueChange={(v) => handleChange("tenantId", v === "none" ? "" : v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Choisir un locataire..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Choisir --</SelectItem>
                  {tenants?.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Bien loué <span className="text-destructive">*</span></Label>
              <Select value={form.propertyId || "none"} onValueChange={(v) => handleChange("propertyId", v === "none" ? "" : v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Choisir un bien..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Choisir --</SelectItem>
                  {properties?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.title} — {p.zone.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Type de bail</Label>
              <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bail_habitation">Bail habitation</SelectItem>
                  <SelectItem value="bail_commercial">Bail commercial</SelectItem>
                  <SelectItem value="bail_saisonnier">Bail saisonnier</SelectItem>
                  <SelectItem value="bail_meuble">Bail meublé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                  <SelectItem value="resilie">Résilié</SelectItem>
                  <SelectItem value="renouvele">Renouvelé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Date de début <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)}
                className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Date de fin <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)}
                className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Loyer mensuel (MAD) <span className="text-destructive">*</span></Label>
              <Input type="number" value={form.rentAmount} onChange={(e) => handleChange("rentAmount", e.target.value)}
                placeholder="ex: 8500" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Charges (MAD/mois)</Label>
              <Input type="number" value={form.chargesAmount} onChange={(e) => handleChange("chargesAmount", e.target.value)}
                placeholder="ex: 500" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Caution (MAD)</Label>
              <Input type="number" value={form.depositAmount} onChange={(e) => handleChange("depositAmount", e.target.value)}
                placeholder="ex: 17000" className="bg-background/50 border-input" />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <Checkbox
                id="depositPaid"
                checked={form.depositPaid}
                onCheckedChange={(v) => handleChange("depositPaid", !!v)}
              />
              <Label htmlFor="depositPaid" className="cursor-pointer">Caution perçue</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Nom du témoin</Label>
              <Input value={form.witnessName} onChange={(e) => handleChange("witnessName", e.target.value)}
                placeholder="Nom complet" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Téléphone du témoin</Label>
              <Input value={form.witnessPhone} onChange={(e) => handleChange("witnessPhone", e.target.value)}
                placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Conditions particulières</Label>
              <Textarea
                value={form.specialConditions}
                onChange={(e) => handleChange("specialConditions", e.target.value)}
                placeholder="Clauses particulières du bail..."
                className="bg-background/50 border-input resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-card-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-card-border">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le contrat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
