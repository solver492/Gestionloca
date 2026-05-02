import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Home, BedDouble, Bath, Search, MessageCircle, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const WHATSAPP_NUMBER = "212661000000"; // ← remplacez par votre numéro WhatsApp

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local commercial", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

function usePublicCatalogue(params: { zone?: string; type?: string }) {
  return useQuery({
    queryKey: ["public-catalogue", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.zone && params.zone !== "all") qs.set("zone", params.zone);
      if (params.type && params.type !== "all") qs.set("type", params.type);
      const r = await fetch(`${BASE}/api/catalogue?${qs}`);
      if (!r.ok) throw new Error("Failed to load catalogue");
      return r.json();
    },
  });
}

function MediaCard({ property }: { property: any }) {
  const [idx, setIdx] = useState(0);
  const photos: string[] = property.photos || [];
  const hasVideo = !!property.videoUrl;
  const total = photos.length + (hasVideo ? 1 : 0);
  const isVideoSlide = hasVideo && idx === photos.length;
  const waMsg = encodeURIComponent(`Bonjour, je souhaite réserver une visite pour le bien : ${property.title} (${property.reference})`);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  return (
    <div className="bg-[hsl(212,50%,14%)] rounded-2xl overflow-hidden border border-[hsl(213,40%,18%)] hover:border-[hsl(44,56%,54%)]/40 transition-all hover:shadow-xl hover:shadow-[hsl(44,56%,54%)]/5 flex flex-col group">
      {/* Media area */}
      <div className="relative h-52 bg-[hsl(211,53%,11%)] overflow-hidden">
        {isVideoSlide && property.videoUrl ? (
          <iframe
            src={getEmbedUrl(property.videoUrl)}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={property.title}
          />
        ) : photos.length > 0 ? (
          <img
            src={photos[idx]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-14 w-14 text-[hsl(215,20%,65%)]/20" />
          </div>
        )}

        {/* Carousel dots */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {Array(total).fill(0).map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? "w-5 h-1.5 bg-[hsl(44,56%,54%)]" : "w-1.5 h-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-[hsl(44,56%,54%)] text-[hsl(211,53%,11%)] font-mono font-bold text-sm px-3 py-1 rounded-lg shadow-lg">
            {formatCurrency(property.rentAmount)}<span className="text-xs font-normal opacity-75">/mois</span>
          </div>
        </div>

        {/* Video badge */}
        {hasVideo && (
          <button
            onClick={() => setIdx(photos.length)}
            className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              isVideoSlide
                ? "bg-[hsl(44,56%,54%)] text-[hsl(211,53%,11%)]"
                : "bg-black/60 text-white hover:bg-[hsl(44,56%,54%)]/80"
            }`}
          >
            ▶ Vidéo
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-[hsl(215,20%,65%)] mb-1">
          <Building2 className="h-3 w-3" />
          {TYPE_LABELS[property.type] || property.type}
          <span className="text-[hsl(213,40%,20%)]">·</span>
          <span className="font-mono">{property.reference}</span>
        </div>
        <h3 className="font-semibold text-base text-[hsl(210,40%,98%)] line-clamp-1 mb-1 group-hover:text-[hsl(44,56%,54%)] transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[hsl(215,20%,65%)] mb-3">
          <MapPin className="h-3 w-3 text-[hsl(44,56%,54%)]" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[hsl(215,20%,65%)] mb-4">
          <div className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {property.surface} m²</div>
          {property.rooms && <div className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.rooms} ch.</div>}
          {property.bathrooms && <div className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms} SDB</div>}
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {property.amenities.slice(0, 4).map((a: string) => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-[hsl(211,53%,11%)] text-[hsl(215,20%,65%)] border border-[hsl(213,40%,18%)]">
                {a}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(211,53%,11%)] text-[hsl(215,20%,65%)]">
                +{property.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        <Button
          className="mt-auto w-full bg-[hsl(44,56%,54%)] hover:bg-[hsl(44,56%,54%)]/90 text-[hsl(211,53%,11%)] font-bold shadow-lg"
          asChild
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" /> Réserver une visite
          </a>
        </Button>
      </div>
    </div>
  );
}

function getEmbedUrl(url: string): string {
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop()?.split("?")[0];
    return `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

export default function Catalogue() {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [type, setType] = useState("all");

  const { data: properties, isLoading } = usePublicCatalogue({ zone, type });

  const filtered = properties
    ? search
      ? properties.filter((p: any) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.zone.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase())
        )
      : properties
    : [];

  return (
    <div className="min-h-screen bg-[hsl(211,53%,9%)]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[hsl(211,53%,9%)]/95 backdrop-blur border-b border-[hsl(213,40%,14%)] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-[hsl(44,56%,54%)] flex items-center justify-center font-serif font-bold text-[hsl(211,53%,11%)] text-xl">M</div>
            <span className="font-semibold text-lg text-[hsl(210,40%,98%)] hidden sm:block">Movia Immo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)]" asChild>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <Phone className="h-4 w-4 mr-1.5" /> Nous contacter
              </a>
            </Button>
            <Button size="sm" className="bg-[hsl(44,56%,54%)] hover:bg-[hsl(44,56%,54%)]/90 text-[hsl(211,53%,11%)] font-bold" asChild>
              <a href="/">Admin →</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8">
        <div className="text-center mb-10">
          <Badge className="bg-[hsl(44,56%,54%)]/15 text-[hsl(44,56%,54%)] border-[hsl(44,56%,54%)]/30 border mb-4">
            Tanger · Asilah · Région Nord
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[hsl(210,40%,98%)] mb-3">
            Catalogue Immobilier
          </h1>
          <p className="text-[hsl(215,20%,65%)] text-lg max-w-xl mx-auto">
            Découvrez nos biens disponibles à la location. Contactez-nous directement sur WhatsApp pour visiter.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-[hsl(212,50%,14%)] p-3 rounded-xl border border-[hsl(213,40%,18%)] mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(215,20%,65%)]" />
            <Input
              placeholder="Rechercher par titre, zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[hsl(211,53%,11%)] border-[hsl(213,40%,18%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,65%)]"
            />
          </div>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-full sm:w-[160px] bg-[hsl(211,53%,11%)] border-[hsl(213,40%,18%)] text-[hsl(210,40%,98%)]">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes zones</SelectItem>
              <SelectItem value="Malabata">Malabata</SelectItem>
              <SelectItem value="Cap_Spartel">Cap Spartel</SelectItem>
              <SelectItem value="Medina">Médina</SelectItem>
              <SelectItem value="Centre_Ville">Centre Ville</SelectItem>
              <SelectItem value="Asilah">Asilah</SelectItem>
              <SelectItem value="Tetouan">Tétouan</SelectItem>
              <SelectItem value="Iberia">Iberia</SelectItem>
              <SelectItem value="Martil">Martil</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-[160px] bg-[hsl(211,53%,11%)] border-[hsl(213,40%,18%)] text-[hsl(210,40%,98%)]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="bureau">Bureau</SelectItem>
              <SelectItem value="riad">Riad</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isLoading && (
          <p className="text-xs text-[hsl(215,20%,65%)] px-1 mb-6">
            {filtered.length} bien{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl bg-[hsl(212,50%,14%)]" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((p: any) => <MediaCard key={p.id} property={p} />)
          ) : (
            <div className="col-span-full py-20 text-center">
              <Building2 className="mx-auto h-14 w-14 text-[hsl(215,20%,65%)]/30 mb-4" />
              <h3 className="text-lg font-medium text-[hsl(210,40%,98%)]">Aucun bien trouvé</h3>
              <p className="text-[hsl(215,20%,65%)] mt-1 text-sm">Essayez de modifier vos filtres ou contactez-nous directement.</p>
              <Button className="mt-4 bg-[hsl(44,56%,54%)] text-[hsl(211,53%,11%)] font-bold" asChild>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> Nous contacter sur WhatsApp
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[hsl(213,40%,14%)] text-center text-sm text-[hsl(215,20%,65%)]">
          <p>© {new Date().getFullYear()} Movia Immo — Agence immobilière à Tanger, Maroc</p>
        </footer>
      </div>
    </div>
  );
}
