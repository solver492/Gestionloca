import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateMaintenanceTicket,
  useUpdateMaintenanceTicket,
  useListTenants,
  useListProperties,
  getListMaintenanceTicketsQueryKey,
  getGetMaintenanceStatsByStatusQueryKey,
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

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any;
}

const defaultValues = {
  title: "",
  description: "",
  propertyId: "",
  tenantId: "",
  category: "plomberie",
  priority: "normale",
  status: "ouvert",
  technicianName: "",
  technicianPhone: "",
  estimatedCost: "",
  actualCost: "",
  scheduledDate: "",
  completedDate: "",
  notes: "",
};

export function MaintenanceFormDialog({ open, onOpenChange, ticket }: MaintenanceFormDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!ticket;
  const [form, setForm] = useState(defaultValues);

  const { data: tenants } = useListTenants();
  const { data: properties } = useListProperties();

  useEffect(() => {
    if (ticket) {
      setForm({
        title: ticket.title || "",
        description: ticket.description || "",
        propertyId: ticket.propertyId?.toString() || "",
        tenantId: ticket.tenantId?.toString() || "",
        category: ticket.category || "plomberie",
        priority: ticket.priority || "normale",
        status: ticket.status || "ouvert",
        technicianName: ticket.technicianName || "",
        technicianPhone: ticket.technicianPhone || "",
        estimatedCost: ticket.estimatedCost?.toString() || "",
        actualCost: ticket.actualCost?.toString() || "",
        scheduledDate: ticket.scheduledDate ? ticket.scheduledDate.substring(0, 10) : "",
        completedDate: ticket.completedDate ? ticket.completedDate.substring(0, 10) : "",
        notes: ticket.notes || "",
      });
    } else {
      setForm(defaultValues);
    }
  }, [ticket, open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListMaintenanceTicketsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetMaintenanceStatsByStatusQueryKey() });
  };

  const createMutation = useCreateMaintenanceTicket({
    mutation: {
      onSuccess: () => {
        toast.success("Ticket créé avec succès");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    },
  });

  const updateMutation = useUpdateMaintenanceTicket({
    mutation: {
      onSuccess: () => {
        toast.success("Ticket mis à jour");
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
    if (!form.title || !form.description || !form.propertyId) {
      toast.error("Titre, description et bien sont obligatoires");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      propertyId: parseInt(form.propertyId),
      tenantId: form.tenantId ? parseInt(form.tenantId) : undefined,
      category: form.category,
      priority: form.priority,
      status: form.status,
      technicianName: form.technicianName || undefined,
      technicianPhone: form.technicianPhone || undefined,
      estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
      actualCost: form.actualCost ? parseFloat(form.actualCost) : undefined,
      scheduledDate: form.scheduledDate || undefined,
      completedDate: form.completedDate || undefined,
      notes: form.notes || undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: ticket.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            {isEdit ? "Modifier le ticket" : "Nouveau ticket de maintenance"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="ex: Fuite sous l'évier cuisine"
                className="bg-background/50 border-input"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Décrivez le problème en détail..."
                className="bg-background/50 border-input resize-none"
                rows={3}
              />
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

            <div className="col-span-2 space-y-1.5">
              <Label>Locataire concerné</Label>
              <Select value={form.tenantId || "none"} onValueChange={(v) => handleChange("tenantId", v === "none" ? "" : v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Optionnel..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {tenants?.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plomberie">Plomberie</SelectItem>
                  <SelectItem value="electricite">Électricité</SelectItem>
                  <SelectItem value="climatisation">Climatisation / Chauffage</SelectItem>
                  <SelectItem value="serrurerie">Serrurerie</SelectItem>
                  <SelectItem value="peinture">Peinture / Revêtement</SelectItem>
                  <SelectItem value="toiture">Toiture</SelectItem>
                  <SelectItem value="menuiserie">Menuiserie</SelectItem>
                  <SelectItem value="jardinage">Jardinage / Extérieur</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priorité</Label>
              <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">🔴 Urgente</SelectItem>
                  <SelectItem value="haute">🟠 Haute</SelectItem>
                  <SelectItem value="normale">🟡 Normale</SelectItem>
                  <SelectItem value="basse">🟢 Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ouvert">Ouvert</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_attente">En attente (pièces...)</SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Technicien</Label>
              <Input value={form.technicianName} onChange={(e) => handleChange("technicianName", e.target.value)}
                placeholder="Nom du technicien" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Tél. technicien</Label>
              <Input value={form.technicianPhone} onChange={(e) => handleChange("technicianPhone", e.target.value)}
                placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Coût estimé (MAD)</Label>
              <Input type="number" value={form.estimatedCost} onChange={(e) => handleChange("estimatedCost", e.target.value)}
                placeholder="ex: 1500" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Coût réel (MAD)</Label>
              <Input type="number" value={form.actualCost} onChange={(e) => handleChange("actualCost", e.target.value)}
                placeholder="ex: 1200" className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Date prévue</Label>
              <Input type="date" value={form.scheduledDate} onChange={(e) => handleChange("scheduledDate", e.target.value)}
                className="bg-background/50 border-input" />
            </div>

            <div className="space-y-1.5">
              <Label>Date de résolution</Label>
              <Input type="date" value={form.completedDate} onChange={(e) => handleChange("completedDate", e.target.value)}
                className="bg-background/50 border-input" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Remarques sur l'intervention..." className="bg-background/50 border-input resize-none" rows={2} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-card-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-card-border">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
