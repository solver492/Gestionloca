import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  MapPin, Home, Building2, Tag, Pencil, Video, BedDouble,
  Bath, Layers, Banknote, Shield, CheckCircle2, Wifi,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useState } from "react";

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
};

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local commercial", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

export function PropertyDetailSheet({ open, onOpenChange, property, onEdit }: PropertyDetailSheetProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!property) return null;

  const photos: string[] = property.photos || [];
  const amenities: string[] = property.amenities || [];
  const status = STATUS_CONFIG[property.status] || STATUS_CONFIG["disponible"];
  const hasPhotos = photos.length > 0;

  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 bg-[hsl(212,50%,14%)] border-l border-[hsl(213,40%,18%)] overflow-y-auto flex flex-col"
      >
        {/* Photo gallery */}
        <div className="relative h-56 bg-[hsl(211,53%,11%)] shrink-0">
          {hasPhotos ? (
            <>
              <img
                key={photoIndex}
                src={photos[photoIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(211,53%,11%)] via-transparent to-transparent" />
              {photos.length > 1 && (
                <>
                  <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-4 bg-[hsl(44,56%,54%)]" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[hsl(215,20%,65%)]">
              <Building2 className="h-14 w-14 opacity-20" />
              <span className="text-sm opacity-50">Aucune photo disponible</span>
            </div>
          )}

          {/* Close + Status badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <Badge className={`border text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </Badge>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Price badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-[hsl(44,56%,54%)] text-[hsl(211,53%,11%)] font-mono font-bold text-sm px-3 py-1 rounded-md shadow-lg">
              {formatCurrency(property.rentAmount)}<span className="text-xs font-normal opacity-75">/mois</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <SheetHeader className="p-0 space-y-1">
            <div className="flex items-center gap-2 text-xs text-[hsl(215,20%,65%)]">
              <Tag className="h-3.5 w-3.5" />
              <span className="font-mono">{property.reference}</span>
              <span className="text-[hsl(213,40%,18%)]">•</span>
              <Building2 className="h-3.5 w-3.5" />
              <span>{TYPE_LABELS[property.type] || property.type}</span>
            </div>
            <SheetTitle className="text-2xl font-serif font-bold text-[hsl(210,40%,98%)] leading-tight">
              {property.title}
            </SheetTitle>
            <div className="flex items-center gap-1.5 text-sm text-[hsl(215,20%,65%)]">
              <MapPin className="h-4 w-4 shrink-0 text-[hsl(44,56%,54%)]" />
              <span>{property.address}</span>
              <span className="text-[hsl(213,40%,18%)]">·</span>
              <span className="font-medium text-[hsl(44,56%,54%)]">{property.zone?.replace("_", " ")}</span>
            </div>
          </SheetHeader>

          <Separator className="bg-[hsl(213,40%,18%)]" />

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
              <div className="flex items-center gap-2 text-xs text-[hsl(215,20%,65%)] mb-1">
                <Home className="h-3.5 w-3.5" /> Surface
              </div>
              <div className="text-xl font-mono font-bold text-[hsl(210,40%,98%)]">{property.surface} <span className="text-sm font-normal text-[hsl(215,20%,65%)]">m²</span></div>
            </div>
            {property.rooms && (
              <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
                <div className="flex items-center gap-2 text-xs text-[hsl(215,20%,65%)] mb-1">
                  <BedDouble className="h-3.5 w-3.5" /> Chambres
                </div>
                <div className="text-xl font-mono font-bold text-[hsl(210,40%,98%)]">{property.rooms}</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
                <div className="flex items-center gap-2 text-xs text-[hsl(215,20%,65%)] mb-1">
                  <Bath className="h-3.5 w-3.5" /> Salles de bain
                </div>
                <div className="text-xl font-mono font-bold text-[hsl(210,40%,98%)]">{property.bathrooms}</div>
              </div>
            )}
            {property.floor != null && (
              <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
                <div className="flex items-center gap-2 text-xs text-[hsl(215,20%,65%)] mb-1">
                  <Layers className="h-3.5 w-3.5" /> Étage
                </div>
                <div className="text-xl font-mono font-bold text-[hsl(210,40%,98%)]">{property.floor}</div>
              </div>
            )}
          </div>

          {/* Financier */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(210,40%,98%)] mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[hsl(44,56%,54%)]" /> Détails financiers
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-[hsl(213,40%,18%)]">
                <span className="text-sm text-[hsl(215,20%,65%)]">Loyer mensuel</span>
                <span className="font-mono font-bold text-[hsl(44,56%,54%)] text-base">{formatCurrency(property.rentAmount)}</span>
              </div>
              {property.chargesAmount > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-[hsl(213,40%,18%)]">
                  <span className="text-sm text-[hsl(215,20%,65%)]">Charges</span>
                  <span className="font-mono text-[hsl(210,40%,98%)]">{formatCurrency(property.chargesAmount)}</span>
                </div>
              )}
              {property.depositAmount > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-[hsl(213,40%,18%)]">
                  <span className="text-sm text-[hsl(215,20%,65%)]">Caution</span>
                  <span className="font-mono text-[hsl(210,40%,98%)]">{formatCurrency(property.depositAmount)}</span>
                </div>
              )}
              {property.chargesAmount > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[hsl(215,20%,65%)]">Total mensuel</span>
                  <span className="font-mono font-bold text-[hsl(210,40%,98%)]">
                    {formatCurrency(Number(property.rentAmount) + Number(property.chargesAmount))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Locataire actuel */}
          {property.currentTenantId && property.status === "occupe" && (
            <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)] flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[hsl(44,56%,54%)]/20 flex items-center justify-center text-[hsl(44,56%,54%)]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[hsl(215,20%,65%)]">Locataire actuel</p>
                <p className="text-sm font-medium text-[hsl(210,40%,98%)]">Bien occupé</p>
              </div>
              <Badge className="ml-auto bg-blue-500/10 text-blue-400 border-blue-500/20 border">
                Actif
              </Badge>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-sm font-semibold text-[hsl(210,40%,98%)] mb-2">Description</h3>
              <p className="text-sm text-[hsl(215,20%,65%)] leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Équipements */}
          {amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[hsl(210,40%,98%)] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[hsl(44,56%,54%)]" /> Équipements & commodités
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span key={amenity} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[hsl(211,53%,11%)] text-[hsl(210,40%,98%)] border border-[hsl(213,40%,18%)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(44,56%,54%)]" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vidéo */}
          {property.videoUrl && (
            <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)] flex items-center gap-3">
              <Video className="h-5 w-5 text-[hsl(44,56%,54%)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[hsl(215,20%,65%)]">Vidéo disponible</p>
                <a href={property.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[hsl(44,56%,54%)] hover:underline truncate block">
                  Voir la vidéo →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(213,40%,18%)] bg-[hsl(211,53%,11%)] flex gap-3">
          <Button variant="outline" className="flex-1 border-[hsl(213,40%,18%)] text-[hsl(210,40%,98%)] hover:bg-[hsl(213,40%,18%)]" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button className="flex-1 bg-[hsl(44,56%,54%)] text-[hsl(211,53%,11%)] hover:bg-[hsl(44,56%,54%)]/90 font-semibold" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" /> Modifier
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
