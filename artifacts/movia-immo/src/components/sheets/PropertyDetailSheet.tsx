import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  MapPin, Home, Building2, Tag, Pencil, Video, BedDouble,
  Bath, Layers, Banknote, Shield, CheckCircle2,
  ChevronLeft, ChevronRight, X, Globe, Share2, Zap, Loader2,
  Facebook, Instagram, Youtube, Linkedin, Check, UserCircle,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface PropertyDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onEdit: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  disponible: { label: "Disponible", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  occupe:     { label: "Occupé",     color: "text-blue-400 bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-400" },
  maintenance:{ label: "Maintenance",color: "text-amber-400 bg-amber-500/10 border-amber-500/20",    dot: "bg-amber-400" },
  reserve:    { label: "Réservé",    color: "text-purple-400 bg-purple-500/10 border-purple-500/20", dot: "bg-purple-400" },
  public:     { label: "PUBLIC ✓",   color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", dot: "bg-emerald-400" },
};

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local commercial", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

const SOCIAL_CHANNELS = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "rgba(24,119,242,0.85)" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "rgba(193,53,132,0.85)" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "rgba(255,0,0,0.85)" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "rgba(0,119,181,0.85)" },
];

function GlassModal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 z-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 24px 64px var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes("youtube.com/shorts/")) {
    const id = url.split("shorts/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes("youtube.com/watch")) {
    try { const id = new URL(url).searchParams.get("v"); return id ? `https://www.youtube.com/embed/${id}` : null; } catch { return null; }
  }
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop()?.split("?")[0];
    return id ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0` : null;
  }
  return url;
}

export function PropertyDetailSheet({ open, onOpenChange, property, onEdit }: PropertyDetailSheetProps) {
  const [, navigate] = useLocation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [publishLoading, setPublishLoading] = useState(false);
  const [diffuseOpen, setDiffuseOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [sponsorBudget, setSponsorBudget] = useState("");
  const [sponsorPlatform, setSponsorPlatform] = useState<"tiktok" | "google" | "meta">("meta");
  const [diffuseLoading, setDiffuseLoading] = useState(false);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const qc = useQueryClient();

  if (!property) return null;

  const photos: string[] = property.photos || [];
  const amenities: string[] = property.amenities || [];
  const currentStatus = localStatus || property.status;
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["disponible"];
  const hasPhotos = photos.length > 0;

  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length);

  const handlePublishVitrine = async () => {
    setPublishLoading(true);
    try {
      const r = await fetch(`${BASE}/api/properties/${property.id}/publish`, { method: "PATCH" });
      if (!r.ok) throw new Error();
      setLocalStatus("public");
      toast.success("✅ Bien publié sur la Vitrine publique !");
      qc.invalidateQueries({ queryKey: ["properties"] });
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDiffuse = async () => {
    if (!selectedChannels.length) {
      toast.error("Sélectionnez au moins un réseau");
      return;
    }
    setDiffuseLoading(true);
    try {
      const r = await fetch(`${BASE}/api/properties/${property.id}/diffuse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels: selectedChannels }),
      });
      if (!r.ok) throw new Error();
      toast.success(`🚀 Diffusion lancée sur ${selectedChannels.join(", ")} via Zapier !`);
      setDiffuseOpen(false);
      setSelectedChannels([]);
    } catch {
      toast.error("Erreur lors de la diffusion");
    } finally {
      setDiffuseLoading(false);
    }
  };

  const handleSponsor = async () => {
    if (!sponsorBudget || parseFloat(sponsorBudget) <= 0) {
      toast.error("Entrez un budget valide");
      return;
    }
    setSponsorLoading(true);
    try {
      const r = await fetch(`${BASE}/api/properties/${property.id}/sponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: sponsorPlatform, budget: parseFloat(sponsorBudget) }),
      });
      if (!r.ok) throw new Error();
      toast.success(`💰 Campagne ${sponsorPlatform.toUpperCase()} lancée — Budget: ${sponsorBudget} MAD`);
      setSponsorOpen(false);
      setSponsorBudget("");
    } catch {
      toast.error("Erreur lors du sponsoring");
    } finally {
      setSponsorLoading(false);
    }
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 overflow-y-auto flex flex-col border-l"
          style={{
            background: 'hsl(var(--card))',
            borderLeftColor: 'var(--glass-border)',
          }}
        >
          {/* Photo gallery */}
          <div className="relative h-56 shrink-0 overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
            {hasPhotos ? (
              <>
                <img
                  key={photoIndex}
                  src={photos[photoIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {photos.length > 1 && (
                  <>
                    <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-white transition-all" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)' }}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-white transition-all" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)' }}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {photos.map((_, i) => (
                        <button key={i} onClick={() => setPhotoIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-4 bg-primary" : "w-1.5 bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Building2 className="h-14 w-14 opacity-20" />
                <span className="text-sm opacity-50">Aucune photo disponible</span>
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              <Badge className={`border text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </Badge>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-white transition-all"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <div
                className="font-mono font-bold text-sm px-3 py-1 rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(44 80% 65%))',
                  color: 'hsl(var(--primary-foreground))',
                  boxShadow: '0 4px 16px hsl(var(--primary) / 0.4)',
                }}
              >
                {formatCurrency(property.rentAmount)}<span className="text-xs font-normal opacity-75">/mois</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-5">
            <SheetHeader className="p-0 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-mono">{property.reference}</span>
                <span className="opacity-30">•</span>
                <Building2 className="h-3.5 w-3.5" />
                <span>{TYPE_LABELS[property.type] || property.type}</span>
              </div>
              <SheetTitle className="text-2xl font-serif font-bold text-foreground leading-tight">
                {property.title}
              </SheetTitle>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{property.address}</span>
                <span className="opacity-30">·</span>
                <span className="font-medium text-primary">{property.zone?.replace("_", " ")}</span>
              </div>
            </SheetHeader>

            <Separator style={{ background: 'var(--glass-border)' }} />

            {/* ─── 3 ACTION BUTTONS ─── */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions Rapides</p>

              {/* Action 1: Publier Vitrine */}
              <button
                onClick={handlePublishVitrine}
                disabled={publishLoading || currentStatus === "public"}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: currentStatus === "public"
                    ? 'linear-gradient(135deg, rgba(40,160,100,0.2), rgba(60,200,120,0.15))'
                    : 'linear-gradient(135deg, rgba(40,160,100,0.85), rgba(60,200,120,0.8))',
                  border: currentStatus === "public" ? '1px solid rgba(40,160,100,0.3)' : '1px solid rgba(60,200,120,0.4)',
                  color: currentStatus === "public" ? 'rgb(40,180,110)' : 'white',
                  boxShadow: currentStatus === "public" ? 'none' : '0 4px 20px rgba(40,160,100,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {publishLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                ) : currentStatus === "public" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <Globe className="h-5 w-5 shrink-0" />
                )}
                <div className="text-left">
                  <div>{currentStatus === "public" ? "Bien publié sur la Vitrine ✓" : "Action 1 — Publier Vitrine"}</div>
                  <div className="text-xs opacity-70 font-normal">
                    {currentStatus === "public" ? "Visible aux clients" : "Rend le bien visible sur le portail client"}
                  </div>
                </div>
              </button>

              {/* Action 2: Diffusion Réseaux */}
              <button
                onClick={() => setDiffuseOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(24,119,242,0.85), rgba(60,140,255,0.8))',
                  border: '1px solid rgba(120,180,255,0.4)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(24,119,242,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <Share2 className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <div>Action 2 — Diffusion Réseaux</div>
                  <div className="text-xs opacity-70 font-normal">FB · IG · YT · LinkedIn via Zapier</div>
                </div>
              </button>

              {/* Action 3: Sponsoring Premium */}
              <button
                onClick={() => setSponsorOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.85), rgba(168,85,247,0.8))',
                  border: '1px solid rgba(196,130,255,0.4)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(147,51,234,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <Zap className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <div>Action 3 — Sponsoring Premium</div>
                  <div className="text-xs opacity-70 font-normal">TikTok Ads · Google · Meta — Budget libre</div>
                </div>
              </button>
            </div>

            <Separator style={{ background: 'var(--glass-border)' }} />

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Home, label: "Surface", value: `${property.surface} m²` },
                property.rooms ? { icon: BedDouble, label: "Chambres", value: property.rooms } : null,
                property.bathrooms ? { icon: Bath, label: "Salles de bain", value: property.bathrooms } : null,
                property.floor != null ? { icon: Layers, label: "Étage", value: property.floor } : null,
              ].filter(Boolean).map((stat: any, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <stat.icon className="h-3.5 w-3.5" /> {stat.label}
                  </div>
                  <div className="text-xl font-mono font-bold text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Financier */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" /> Détails financiers
              </h3>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
              >
                {[
                  { label: "Loyer mensuel", value: formatCurrency(property.rentAmount), highlight: true },
                  property.chargesAmount > 0 ? { label: "Charges", value: formatCurrency(property.chargesAmount) } : null,
                  property.depositAmount > 0 ? { label: "Caution", value: formatCurrency(property.depositAmount) } : null,
                  property.chargesAmount > 0 ? { label: "Total mensuel", value: formatCurrency(Number(property.rentAmount) + Number(property.chargesAmount)), bold: true } : null,
                ].filter(Boolean).map((item: any, i, arr) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--glass-border)' : 'none' }}
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`font-mono ${item.highlight ? 'font-bold text-primary text-base' : item.bold ? 'font-bold text-foreground' : 'text-foreground'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Équipements */}
            {amenities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Équipements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vidéo — embedded iframe player */}
            {property.videoUrl && (() => {
              const embedUrl = getEmbedUrl(property.videoUrl);
              return embedUrl ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" /> Vidéo du bien
                  </h3>
                  <div className="rounded-xl overflow-hidden border" style={{ border: '1px solid var(--glass-border)', aspectRatio: '16/9', background: '#000' }}>
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                      title={property.title}
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <Video className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Vidéo disponible</p>
                    <a href={property.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">Voir la vidéo →</a>
                  </div>
                </div>
              );
            })()}

            {/* Locataire — avec bouton de navigation */}
            {property.currentTenantId && (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Locataire actuel</p>
                  <p className="text-sm font-medium text-foreground">Bien occupé · ID {property.currentTenantId}</p>
                </div>
                <button
                  onClick={() => { onOpenChange(false); setTimeout(() => navigate("/locataires"), 150); }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                  style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary)/0.3)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary)/0.25)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary)/0.15)'; }}
                >
                  <Shield className="h-3 w-3" />
                  Voir fiche
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-4 flex gap-3"
            style={{
              borderTop: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <button
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'hsl(var(--foreground))',
              }}
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </button>
            <button
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(44 80% 65%))',
                boxShadow: '0 4px 16px hsl(var(--primary)/0.4)',
              }}
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── DIFFUSION MODAL ─── */}
      <GlassModal open={diffuseOpen} onClose={() => setDiffuseOpen(false)} title="Diffusion Réseaux Sociaux">
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez les réseaux. Un webhook sera envoyé à Zapier avec toutes les métadonnées du bien (liens Drive/Vimeo inclus).
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {SOCIAL_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannels.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isSelected ? `${ch.color}33` : 'var(--glass-bg)',
                  border: isSelected ? `1px solid ${ch.color}` : '1px solid var(--glass-border)',
                  color: isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: isSelected ? `0 4px 16px ${ch.color}40` : 'none',
                }}
              >
                <Icon className="h-5 w-5" style={{ color: isSelected ? ch.color : undefined }} />
                {ch.label}
                {isSelected && <Check className="h-4 w-4 ml-auto" style={{ color: ch.color }} />}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          📎 Liens médias inclus: vidéo Vimeo, photos Google Drive, métadonnées complètes.
        </div>

        <button
          onClick={handleDiffuse}
          disabled={diffuseLoading || !selectedChannels.length}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(24,119,242,0.9), rgba(60,140,255,0.85))',
            border: '1px solid rgba(120,180,255,0.4)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(24,119,242,0.35)',
          }}
        >
          {diffuseLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {diffuseLoading ? "Envoi en cours…" : `Diffuser sur ${selectedChannels.length || 0} réseau(x)`}
        </button>
      </GlassModal>

      {/* ─── SPONSORING MODAL ─── */}
      <GlassModal open={sponsorOpen} onClose={() => setSponsorOpen(false)} title="Sponsoring Premium">
        <p className="text-sm text-muted-foreground mb-4">
          Lancez une campagne publicitaire payante pour ce bien.
        </p>

        {/* Platform selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["tiktok", "google", "meta"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSponsorPlatform(p)}
              className="py-2 rounded-xl text-xs font-bold uppercase transition-all"
              style={{
                background: sponsorPlatform === p
                  ? 'linear-gradient(135deg, rgba(147,51,234,0.85), rgba(168,85,247,0.8))'
                  : 'var(--glass-bg)',
                border: sponsorPlatform === p ? '1px solid rgba(196,130,255,0.5)' : '1px solid var(--glass-border)',
                color: sponsorPlatform === p ? 'white' : 'hsl(var(--muted-foreground))',
                boxShadow: sponsorPlatform === p ? '0 4px 16px rgba(147,51,234,0.3)' : 'none',
              }}
            >
              {p === "tiktok" ? "TikTok" : p === "google" ? "Google" : "Meta"}
            </button>
          ))}
        </div>

        {/* Budget input */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground block mb-2">Budget (MAD / jour)</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              placeholder="Ex: 500"
              value={sponsorBudget}
              onChange={(e) => setSponsorBudget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground text-sm font-mono outline-none transition-all"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(8px)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'hsl(var(--primary)/0.5)'; e.target.style.boxShadow = '0 0 0 3px hsl(var(--primary)/0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = ''; }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">MAD</span>
          </div>
        </div>

        <button
          onClick={handleSponsor}
          disabled={sponsorLoading || !sponsorBudget}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.9), rgba(168,85,247,0.85))',
            border: '1px solid rgba(196,130,255,0.4)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(147,51,234,0.35)',
          }}
        >
          {sponsorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {sponsorLoading ? "Lancement…" : `Lancer sur ${sponsorPlatform.toUpperCase()} — ${sponsorBudget || "0"} MAD/j`}
        </button>
      </GlassModal>
    </>
  );
}
