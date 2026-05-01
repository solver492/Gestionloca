import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useListProperties,
  getListTenantsQueryKey,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: any;
}

const defaultValues = {
  firstName: "",
  lastName: "",
  cin: "",
  email: "",
  phone: "",
  profession: "",
  nationality: "Marocaine",
  dateOfBirth: "",
  emergencyContact: "",
  emergencyPhone: "",
  status: "actif",
  propertyId: "",
  notes: "",
};

export function TenantFormDialog({ open, onOpenChange, tenant }: TenantFormDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!tenant;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(defaultValues);

  const { data: properties } = useListProperties();

  useEffect(() => {
    if (tenant) {
      setForm({
        firstName: tenant.firstName || "",
        lastName: tenant.lastName || "",
        cin: tenant.cin || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        profession: tenant.profession || "",
        nationality: tenant.nationality || "Marocaine",
        dateOfBirth: tenant.dateOfBirth ? tenant.dateOfBirth.substring(0, 10) : "",
        emergencyContact: tenant.emergencyContact || "",
        emergencyPhone: tenant.emergencyPhone || "",
        status: tenant.status || "actif",
        propertyId: tenant.propertyId?.toString() || "",
        notes: tenant.notes || "",
      });
    } else {
      setForm(defaultValues);
    }
  }, [tenant, open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListTenantsQueryKey() });
  };

  const createMutation = useCreateTenant({
    mutation: {
      onSuccess: () => {
        toast.success("Locataire créé avec succès");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    },
  });

  const updateMutation = useUpdateTenant({
    mutation: {
      onSuccess: () => {
        toast.success("Locataire mis à jour");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la mise à jour"),
    },
  });

  const deleteMutation = useDeleteTenant({
    mutation: {
      onSuccess: () => {
        toast.success("Locataire supprimé");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la suppression"),
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.cin || !form.phone) {
      toast.error("Prénom, nom, CIN et téléphone sont obligatoires");
      return;
    }
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      cin: form.cin,
      email: form.email,
      phone: form.phone,
      profession: form.profession || undefined,
      nationality: form.nationality || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      emergencyContact: form.emergencyContact || undefined,
      emergencyPhone: form.emergencyPhone || undefined,
      status: form.status,
      propertyId: form.propertyId ? parseInt(form.propertyId) : undefined,
      notes: form.notes || undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: tenant.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-foreground">
              {isEdit ? "Modifier le locataire" : "Ajouter un locataire"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom <span className="text-destructive">*</span></Label>
                <Input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Youssef" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Nom <span className="text-destructive">*</span></Label>
                <Input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Benali" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>CIN <span className="text-destructive">*</span></Label>
                <Input value={form.cin} onChange={(e) => handleChange("cin", e.target.value)}
                  placeholder="AB123456" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Date de naissance</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone <span className="text-destructive">*</span></Label>
                <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@exemple.com" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Profession</Label>
                <Input value={form.profession} onChange={(e) => handleChange("profession", e.target.value)}
                  placeholder="ex: Ingénieur" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Nationalité</Label>
                <Input value={form.nationality} onChange={(e) => handleChange("nationality", e.target.value)}
                  placeholder="Marocaine" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact urgence</Label>
                <Input value={form.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  placeholder="Nom du contact" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Tél. urgence</Label>
                <Input value={form.emergencyPhone} onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                  placeholder="+212 6XX XXX XXX" className="bg-background/50 border-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="bg-background/50 border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="en_retard">En retard</SelectItem>
                    <SelectItem value="expulse">Expulsé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Bien assigné</Label>
                <Select
                  value={form.propertyId || "none"}
                  onValueChange={(v) => handleChange("propertyId", v === "none" ? "" : v)}
                >
                  <SelectTrigger className="bg-background/50 border-input">
                    <SelectValue placeholder="Choisir un bien..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun bien</SelectItem>
                    {properties?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes internes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Notes sur le locataire..."
                  className="bg-background/50 border-input resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-card-border">
            {isEdit && (
              <Button variant="destructive" onClick={() => setConfirmDelete(true)} className="sm:mr-auto">
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-card-border">
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer le locataire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-card-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce locataire ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{tenant?.firstName} {tenant?.lastName}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-card-border">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: tenant.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
