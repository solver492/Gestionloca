import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Building2, Phone, MapPin, Tag, Home, CheckCircle2, Loader2, Radio, Facebook, MessageCircle, Globe, Pencil, X, Save } from "lucide-react";
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
    mutationFn: async ({ id, edits }: { id: number; edits?: { title?: string; rentAmount?: number } }) => {
      if (edits) {
        await fetch(`${BASE}/api/properties/${id}/quick-edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edits),
        });
      }
      const r = await fetch(`${BASE}/api/properties/${id}/verify`, { method: "PATCH" });
      if (!r.ok) throw new Error("Failed to verify");
      return r.json();
    },
    onSuccess: () => {
      toast.success("✅ Bien validé et transféré au portefeuille !");
      qc.invalidateQueries({ queryKey: ["radar-properties"] });
      qc.invalidateQueries({ queryKey: ["radar-count"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: () => toast.error("Erreur lors de la validation"),
  });
}

interface QuickEditState {
  title: string;
  rentAmount: string;
}

function RadarCard({ property, onVerify, verifying }: { property: any; onVerify: (id: number, edits?: QuickEditState) => void; verifying: boolean }) {
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<QuickEditState>({
    title: property.title,
    rentAmount: String(property.rentAmount),
  });

  const src = SOURCE_CONFIG[property.source] || SOURCE_CONFIG["manuel"];

  const handleVerify = () => {
    onVerify(property.id, editing ? edits : undefined);
  };

  return (
    <Card
      className="overflow-hidden flex flex-col transition-all duration-200"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px var(--glass-shadow)',
      }}
    >
      {/* Photo */}
      <div className="h-32 relative overflow-hidden shrink-0" style={{ background: 'hsl(var(--background))' }}>
        {property.photos && property.photos.length > 0 ? (
          <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(0,0,0,0.1))' }}>
            <Building2 className="h-10 w-10 text-amber-500/20" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Badge className={`border text-xs flex items-center gap-1.5 ${src.color}`}>
            {src.icon} {src.label}
          </Badge>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <div
            className="font-mono font-bold text-xs px-2 py-1 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(44 80% 65%))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            {formatCurrency(property.rentAmount)}/mois
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        {editing ? (
          /* Quick Edit Form */
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Titre</label>
              <input
                type="text"
                value={edits.title}
                onChange={(e) => setEdits((p) => ({ ...p, title: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-foreground bg-transparent outline-none"
                style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prix (MAD/mois)</label>
              <input
                type="number"
                value={edits.rentAmount}
                onChange={(e) => setEdits((p) => ({ ...p, rentAmount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-foreground font-mono bg-transparent outline-none"
                style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
              />
            </div>
          </div>
        ) : (
          /* Normal view */
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
        )}

        {!editing && property.surface > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Home className="h-3.5 w-3.5" /> {property.surface} m²
          </div>
        )}

        {!editing && property.contactOwner && (
          <div
            className="rounded-lg p-2.5"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <p className="text-xs text-muted-foreground mb-0.5">Contact propriétaire</p>
            <p className="text-sm font-mono text-foreground font-medium">{property.contactOwner}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
          {/* Edit toggle */}
          <button
            onClick={() => setEditing((e) => !e)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: editing ? 'rgba(245,158,11,0.15)' : 'var(--glass-bg)',
              border: editing ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--glass-border)',
              color: editing ? 'rgb(245,158,11)' : 'hsl(var(--muted-foreground))',
            }}
          >
            {editing ? <><X className="h-3.5 w-3.5" /> Annuler édition</> : <><Pencil className="h-3.5 w-3.5" /> Édition rapide</>}
          </button>

          <div className="flex gap-2">
            {!editing && property.contactOwner && (
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: 'rgba(40,160,100,0.12)',
                  border: '1px solid rgba(40,160,100,0.3)',
                  color: 'rgb(40,180,110)',
                }}
                onClick={() => window.open(`tel:${property.contactOwner}`, '_self')}
              >
                <Phone className="h-3.5 w-3.5" /> Appeler
              </button>
            )}
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(251,191,36,0.85))',
                border: '1px solid rgba(251,191,36,0.4)',
                color: 'hsl(211,53%,11%)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
              }}
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : editing ? (
                <Save className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {editing ? "Sauver & Valider" : "Transférer →"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Radar() {
  const { data: properties, isLoading } = useRadarProperties();
  const verifyMutation = useVerifyProperty();
  const [verifying, setVerifying] = useState<number | null>(null);

  const handleVerify = async (id: number, edits?: QuickEditState) => {
    setVerifying(id);
    const editData = edits
      ? {
          title: edits.title || undefined,
          rentAmount: edits.rentAmount ? parseFloat(edits.rentAmount) : undefined,
        }
      : undefined;
    await verifyMutation.mutateAsync({ id, edits: editData });
    setVerifying(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              boxShadow: '0 4px 16px rgba(245,158,11,0.15)',
            }}
          >
            <Radio className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Le Radar</h1>
            <p className="text-muted-foreground text-sm">Biens reçus via WhatsApp / OpenClaw / Zapier — validation requise.</p>
          </div>
        </div>
        {!isLoading && properties && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-3xl font-mono font-bold text-amber-400">{properties.length}</span>
            <span className="text-sm text-amber-400/70">bien{properties.length !== 1 ? "s" : ""} en attente</span>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-4 flex items-start gap-3 text-sm"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(245,158,11,0.2)' }}
        >
          <Radio className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="text-muted-foreground">
          Ces biens ont été ingérés automatiquement via <span className="text-foreground font-semibold">OpenClaw/Zapier</span> (WhatsApp, Facebook, Avito).
          Utilisez <span className="text-amber-400 font-semibold">Édition rapide</span> pour corriger le titre/prix, puis cliquez <span className="text-amber-400 font-semibold">Transférer →</span> pour les ajouter au portefeuille.
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : properties && properties.length > 0 ? (
          properties.map((property: any) => (
            <RadarCard
              key={property.id}
              property={property}
              onVerify={handleVerify}
              verifying={verifying === property.id}
            />
          ))
        ) : (
          <div
            className="col-span-full py-16 text-center rounded-xl"
            style={{
              background: 'rgba(245,158,11,0.04)',
              border: '1px dashed rgba(245,158,11,0.2)',
            }}
          >
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Radar vide — tout est à jour !</h3>
            <p className="text-muted-foreground mt-1 text-sm">Aucun bien en attente. OpenClaw enverra les prochains automatiquement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
