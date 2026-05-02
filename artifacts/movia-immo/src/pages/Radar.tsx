import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Building2, Phone, MapPin, Tag, Home, CheckCircle2, Loader2, Radio, Facebook, MessageCircle, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  facebook:  { label: "Facebook",  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",     icon: <Facebook className="h-3 w-3" /> },
  whatsapp:  { label: "WhatsApp",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <MessageCircle className="h-3 w-3" /> },
  avito:     { label: "Avito",     color: "text-amber-400 bg-amber-500/10 border-amber-500/20",   icon: <Globe className="h-3 w-3" /> },
  manuel:    { label: "Manuel",    color: "text-muted-foreground bg-muted/50 border-muted",       icon: <Building2 className="h-3 w-3" /> },
};

function useRadarProperties() {
  return useQuery({
    queryKey: ["radar-properties"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/properties/radar`);
      if (!r.ok) throw new Error("Failed to fetch radar");
      return r.json();
    },
    refetchInterval: 30_000,
  });
}

function useVerifyProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${BASE}/api/properties/${id}/verify`, { method: "PATCH" });
      if (!r.ok) throw new Error("Failed to verify");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Bien validé et publié dans le portefeuille !");
      qc.invalidateQueries({ queryKey: ["radar-properties"] });
      qc.invalidateQueries({ queryKey: ["radar-count"] });
    },
    onError: () => toast.error("Erreur lors de la validation"),
  });
}

export default function Radar() {
  const { data: properties, isLoading } = useRadarProperties();
  const verifyMutation = useVerifyProperty();
  const [verifying, setVerifying] = useState<number | null>(null);

  const handleVerify = async (id: number) => {
    setVerifying(id);
    await verifyMutation.mutateAsync(id);
    setVerifying(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
            <Radio className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Le Radar</h1>
            <p className="text-muted-foreground">Biens reçus via WhatsApp / Facebook — en attente de validation.</p>
          </div>
        </div>
        {!isLoading && properties && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
            <span className="text-3xl font-mono font-bold text-amber-400">{properties.length}</span>
            <span className="text-sm text-amber-400/70">bien{properties.length !== 1 ? "s" : ""} en attente</span>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-card/30 border border-card-border rounded-xl p-4 flex items-start gap-3 text-sm">
        <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Radio className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="text-muted-foreground">
          Ces biens ont été ingérés automatiquement via <span className="text-foreground font-medium">OpenClaw</span> (WhatsApp, Facebook, Avito). 
          Appelez le propriétaire pour confirmer, puis cliquez <span className="text-amber-400 font-medium">Valider & Publier</span> pour les ajouter à votre portefeuille officiel.
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : properties && properties.length > 0 ? (
          properties.map((property: any) => {
            const src = SOURCE_CONFIG[property.source] || SOURCE_CONFIG["manuel"];
            const isVerifying = verifying === property.id;
            return (
              <Card key={property.id} className="overflow-hidden bg-card/50 backdrop-blur border-card-border border-amber-500/20 flex flex-col hover:border-amber-500/40 transition-colors">
                {/* Photo or placeholder */}
                <div className="h-32 bg-sidebar-accent relative overflow-hidden shrink-0">
                  {property.photos && property.photos.length > 0 ? (
                    <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-background/20">
                      <Building2 className="h-10 w-10 text-amber-500/20" />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className={`border text-xs flex items-center gap-1.5 ${src.color}`}>
                      {src.icon} {src.label}
                    </Badge>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <div className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2 py-1 rounded-md">
                      {formatCurrency(property.rentAmount)}/mois
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Tag className="h-3 w-3" />
                      <span className="font-mono">{property.reference}</span>
                    </div>
                    <h3 className="font-semibold text-base text-foreground line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 text-primary/60" />
                      <span className="line-clamp-1">{property.address} · {property.zone?.replace(/_/g, " ")}</span>
                    </div>
                  </div>

                  {property.surface > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Home className="h-3.5 w-3.5" /> {property.surface} m²
                    </div>
                  )}

                  {/* Contact owner */}
                  {property.contactOwner && (
                    <div className="bg-[hsl(211,53%,11%)] rounded-lg p-2.5 border border-card-border">
                      <p className="text-xs text-muted-foreground mb-1">Contact propriétaire</p>
                      <p className="text-sm font-mono text-foreground font-medium">{property.contactOwner}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-2 border-t border-card-border">
                    {property.contactOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        asChild
                      >
                        <a href={`tel:${property.contactOwner}`}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" /> Appeler
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className={`flex-1 bg-amber-500 hover:bg-amber-500/90 text-[hsl(211,53%,11%)] font-semibold text-xs ${!property.contactOwner ? "w-full" : ""}`}
                      onClick={() => handleVerify(property.id)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Valider & Publier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-amber-500/20 rounded-xl bg-amber-500/5">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Radar vide — tout est à jour !</h3>
            <p className="text-muted-foreground mt-1 text-sm">Aucun bien en attente de validation. OpenClaw enverra les prochains automatiquement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
