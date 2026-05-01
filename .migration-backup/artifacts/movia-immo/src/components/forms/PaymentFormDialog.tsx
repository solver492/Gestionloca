import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreatePayment,
  useUpdatePayment,
  useListTenants,
  useListProperties,
  getListPaymentsQueryKey,
  getGetPaymentsSummaryQueryKey,
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
}

const defaultValues = {
  tenantId: "",
  propertyId: "",
  amount: "",
  paidAmount: "",
  dueDate: "",
  paidDate: "",
  status: "en_attente",
  paymentMethod: "virement",
  month: "",
  penaltyAmount: "",
  notes: "",
};

export function PaymentFormDialog({ open, onOpenChange, payment }: PaymentFormDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!payment;
  const [form, setForm] = useState(defaultValues);

  const { data: tenants } = useListTenants();
  const { data: properties } = useListProperties();

  useEffect(() => {
    if (payment) {
      setForm({
        tenantId: payment.tenantId?.toString() || "",
        propertyId: payment.propertyId?.toString() || "",
        amount: payment.amount?.toString() || "",
        paidAmount: payment.paidAmount?.toString() || "",
        dueDate: payment.dueDate ? payment.dueDate.substring(0, 10) : "",
        paidDate: payment.paidDate ? payment.paidDate.substring(0, 10) : "",
        status: payment.status || "en_attente",
        paymentMethod: payment.paymentMethod || "virement",
        month: payment.month || "",
        penaltyAmount: payment.penaltyAmount?.toString() || "",
        notes: payment.notes || "",
      });
    } else {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const firstDay = `${month}-01`;
      setForm({ ...defaultValues, month, dueDate: firstDay });
    }
  }, [payment, open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetPaymentsSummaryQueryKey() });
  };

  const createMutation = useCreatePayment({
    mutation: {
      onSuccess: () => {
        toast.success("Paiement enregistré avec succès");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de l'enregistrement"),
    },
  });

  const updateMutation = useUpdatePayment({
    mutation: {
      onSuccess: () => {
        toast.success("Paiement mis à jour");
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
    if (!form.tenantId || !form.propertyId || !form.amount || !form.dueDate || !form.month) {
      toast.error("Locataire, bien, montant, mois et date d'échéance sont obligatoires");
      return;
    }
    const payload = {
      tenantId: parseInt(form.tenantId),
      propertyId: parseInt(form.propertyId),
      amount: parseFloat(form.amount),
      paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : undefined,
      dueDate: form.dueDate,
      paidDate: form.paidDate || undefined,
      status: form.status,
      paymentMethod: form.paymentMethod || undefined,
      month: form.month,
      penaltyAmount: form.penaltyAmount ? parseFloat(form.penaltyAmount) : undefined,
      notes: form.notes || undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: payment.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            {isEdit ? "Modifier le paiement" : "Enregistrer un paiement"}
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
              <Label>Bien concerné <span className="text-destructive">*</span></Label>
              <Select value={form.propertyId || "none"} onValueChange={(v) => handleChange("propertyId", v === "none" ? "" : v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Choisir un bien..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Choisir --</SelectItem>
                  {properties?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Mois (AAAA-MM) <span className="text-destructive">*</span></Label>
              <Input
                type="month"
                value={form.month}
                onChange={(e) => handleChange("month", e.target.value)}
                className="bg-background/50 border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Date d'échéance <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="bg-background/50 border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Montant loyer (MAD) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="ex: 8500"
                className="bg-background/50 border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Montant payé (MAD)</Label>
              <Input
                type="number"
                value={form.paidAmount}
                onChange={(e) => handleChange("paidAmount", e.target.value)}
                placeholder="0"
                className="bg-background/50 border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="partiel">Partiel</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Mode de paiement</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => handleChange("paymentMethod", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cmi">CMI / Carte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Date de paiement</Label>
              <Input
                type="date"
                value={form.paidDate}
                onChange={(e) => handleChange("paidDate", e.target.value)}
                className="bg-background/50 border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Pénalité (MAD)</Label>
              <Input
                type="number"
                value={form.penaltyAmount}
                onChange={(e) => handleChange("penaltyAmount", e.target.value)}
                placeholder="0"
                className="bg-background/50 border-input"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Remarques sur ce paiement..."
                className="bg-background/50 border-input resize-none"
                rows={2}
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
            {isEdit ? "Enregistrer" : "Créer le paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
