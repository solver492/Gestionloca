import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  getListPropertiesQueryKey,
  getGetPropertiesStatsByZoneQueryKey,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Trash2, Image, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: any;
}

const ZONES = [
  "Malabata", "Cap_Spartel", "Medina", "Asilah", "Tetouan",
  "Martil", "Fnideq", "Centre_Ville", "Iberia",
];

const TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "bureau", label: "Bureau" },
  { value: "local_commercial", label: "Local commercial" },
  { value: "riad", label: "Riad" },
  { value: "studio", label: "Studio" },
  { value: "duplex", label: "Duplex" },
  { value: "terrain", label: "Terrain" },
];

const AMENITIES_LIST = [
  "Parking", "Ascenseur", "Piscine", "Gardien", "Climatisation",
  "Terrasse", "Balcon", "Jardin", "WiFi", "Meublé", "Cave",
  "Digicode", "Interphone", "Vue mer", "Double vitrage",
];

const defaultValues = {
  title: "",
  type: "appartement",
  zone: "Centre_Ville",
  address: "",
  floor: "",
  surface: "",
  rooms: "",
  bathrooms: "",
  rentAmount: "",
  chargesAmount: "",
  depositAmount: "",
  status: "disponible",
  description: "",
  amenities: [] as string[],
  photos: [] as string[],
  videoUrl: "",
};

export function PropertyFormDialog({ open, onOpenChange, property }: PropertyFormDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!property;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(defaultValues);
  const [newPhoto, setNewPhoto] = useState("");

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || "",
        type: property.type || "appartement",
        zone: property.zone || "Centre_Ville",
        address: property.address || "",
        floor: property.floor?.toString() || "",
        surface: property.surface?.toString() || "",
        rooms: property.rooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        rentAmount: property.rentAmount?.toString() || "",
        chargesAmount: property.chargesAmount?.toString() || "",
        depositAmount: property.depositAmount?.toString() || "",
        status: property.status || "disponible",
        description: property.description || "",
        amenities: property.amenities || [],
        photos: property.photos || [],
        videoUrl: property.videoUrl || "",
      });
    } else {
      setForm(defaultValues);
    }
  }, [property, open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetPropertiesStatsByZoneQueryKey() });
  };

  const createMutation = useCreateProperty({
    mutation: {
      onSuccess: () => {
        toast.success("Bien créé avec succès");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    },
  });

  const updateMutation = useUpdateProperty({
    mutation: {
      onSuccess: () => {
        toast.success("Bien mis à jour");
        invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la mise à jour"),
    },
  });

  const deleteMutation = useDeleteProperty({
    mutation: {
      onSuccess: () => {
        toast.success("Bien supprimé");
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

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const addPhoto = () => {
    const url = newPhoto.trim();
    if (!url) return;
    setForm((f) => ({ ...f, photos: [...f.photos, url] }));
    setNewPhoto("");
  };

  const removePhoto = (idx: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.address || !form.surface || !form.rentAmount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const payload = {
      title: form.title,
      type: form.type,
      zone: form.zone,
      address: form.address,
      floor: form.floor ? parseInt(form.floor) : undefined,
      surface: parseFloat(form.surface),
      rooms: form.rooms ? parseInt(form.rooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
      rentAmount: parseFloat(form.rentAmount),
      chargesAmount: form.chargesAmount ? parseFloat(form.chargesAmount) : undefined,
      depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
      status: form.status,
      description: form.description || undefined,
      amenities: form.amenities,
      photos: form.photos,
      videoUrl: form.videoUrl || undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id: property.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-card-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-foreground">
              {isEdit ? "Modifier le bien" : "Ajouter un bien"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="bg-sidebar-accent border border-card-border p-1 w-full">
              <TabsTrigger value="infos" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Informations
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Détails
              </TabsTrigger>
              <TabsTrigger value="medias" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Médias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-foreground">Titre du bien <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="ex: Appartement lumineux Malabata"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Type</Label>
                  <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                    <SelectTrigger className="bg-background/50 border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Zone</Label>
                  <Select value={form.zone} onValueChange={(v) => handleChange("zone", v)}>
                    <SelectTrigger className="bg-background/50 border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((z) => (
                        <SelectItem key={z} value={z}>{z.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-foreground">Adresse <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="ex: 14 Rue Ibn Batouta, Tanger"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Surface (m²) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={form.surface}
                    onChange={(e) => handleChange("surface", e.target.value)}
                    placeholder="ex: 85"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Étage</Label>
                  <Input
                    type="number"
                    value={form.floor}
                    onChange={(e) => handleChange("floor", e.target.value)}
                    placeholder="ex: 3"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Chambres</Label>
                  <Input
                    type="number"
                    value={form.rooms}
                    onChange={(e) => handleChange("rooms", e.target.value)}
                    placeholder="ex: 3"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Salles de bain</Label>
                  <Input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => handleChange("bathrooms", e.target.value)}
                    placeholder="ex: 2"
                    className="bg-background/50 border-input"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground">Loyer mensuel (MAD) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={form.rentAmount}
                    onChange={(e) => handleChange("rentAmount", e.target.value)}
                    placeholder="ex: 8500"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Charges (MAD/mois)</Label>
                  <Input
                    type="number"
                    value={form.chargesAmount}
                    onChange={(e) => handleChange("chargesAmount", e.target.value)}
                    placeholder="ex: 500"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Caution (MAD)</Label>
                  <Input
                    type="number"
                    value={form.depositAmount}
                    onChange={(e) => handleChange("depositAmount", e.target.value)}
                    placeholder="ex: 17000"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground">Statut</Label>
                  <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="bg-background/50 border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="occupe">Occupé</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserve">Réservé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-foreground">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Description détaillée du bien..."
                    className="bg-background/50 border-input resize-none"
                    rows={3}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-foreground">Équipements & commodités</Label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="outline"
                        className={`cursor-pointer transition-colors ${
                          form.amenities.includes(amenity)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-card-border text-muted-foreground hover:border-primary/50"
                        }`}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medias" className="space-y-6 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" />
                  <Label className="text-foreground">Photos du bien</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajoutez des URLs d'images (Imgur, Cloudinary, Google Drive partagé, etc.)
                </p>

                {form.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {form.photos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-card-border bg-sidebar-accent">
                        <img
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-28 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                            (e.target as HTMLImageElement).className = "hidden";
                          }}
                        />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => removePhoto(idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="p-1.5 text-xs text-muted-foreground truncate">{url}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto())}
                    placeholder="https://... URL de l'image"
                    className="bg-background/50 border-input flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPhoto}
                    className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-card-border">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  <Label className="text-foreground">Lien vidéo du bien</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Collez le lien de la vidéo : Vimeo, YouTube, ou tout autre hébergeur vidéo.
                </p>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  placeholder="https://vimeo.com/... ou https://youtu.be/..."
                  className="bg-background/50 border-input"
                />
                {form.videoUrl && (
                  <div className="mt-2 p-3 bg-sidebar-accent rounded-lg border border-card-border flex items-center gap-3">
                    <Video className="h-5 w-5 text-primary shrink-0" />
                    <a
                      href={form.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {form.videoUrl}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleChange("videoUrl", "")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-card-border mt-2">
            {isEdit && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-card-border">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Enregistrer les modifications" : "Créer le bien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-card-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le bien "{property?.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-card-border">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: property.id })}
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
