import { useState, useRef, useEffect } from "react";
import { useListProperties, getListPropertiesQueryKey, useGetPropertiesStatsByZone, getGetPropertiesStatsByZoneQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, MapPin, Home, Building2, Tag, Pencil, Video,
  LayoutGrid, List, BedDouble, Bath, ChevronLeft, ChevronRight,
  MoreVertical, Globe, ExternalLink, Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormDialog } from "@/components/forms/PropertyFormDialog";
import { PropertyDetailSheet } from "@/components/sheets/PropertyDetailSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ViewMode = "grid" | "list";

function getEmbedUrl(url: string): string {
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop()?.split("?")[0];
    return `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/shorts/")) {
    const id = url.split("shorts/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/watch")) {
    try { const id = new URL(url).searchParams.get("v"); return `https://www.youtube.com/embed/${id}`; } catch { /* empty */ }
  }
  return url;
}

function CardMediaCarousel({ property }: { property: any }) {
  const [idx, setIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const photos: string[] = property.photos || [];
  const hasVideo = !!property.videoUrl;
  const total = photos.length + (hasVideo ? 1 : 0);
  const isVideoSlide = hasVideo && idx === photos.length;
  const st = STATUS_CONFIG[property.status] || STATUS_CONFIG["disponible"];

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); setVideoPlaying(false); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i + 1) % total); setVideoPlaying(false); };

  return (
    <div className="h-48 bg-sidebar-accent relative overflow-hidden shrink-0">
      {isVideoSlide && property.videoUrl ? (
        videoPlaying ? (
          <iframe
            src={`${getEmbedUrl(property.videoUrl)}?autoplay=1`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={property.title}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer relative bg-black/90"
            onClick={(e) => { e.stopPropagation(); setVideoPlaying(true); }}
          >
            <img
              src={`https://img.youtube.com/vi/${getEmbedUrl(property.videoUrl).split("/embed/")[1]?.split("?")[0]}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/50 hover:bg-white/30 transition-all">
                <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-1"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">Cliquez pour lancer</span>
            </div>
          </div>
        )
      ) : photos.length > 0 ? (
        <img
          src={photos[idx] || photos[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sidebar-accent to-background/30">
          <Building2 className="h-12 w-12 text-muted-foreground/20" />
        </div>
      )}

      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {Array(total).fill(0).map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); setVideoPlaying(false); }}
                className={`rounded-full transition-all ${i === idx ? "w-3.5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}

      {hasVideo && !isVideoSlide && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(photos.length); setVideoPlaying(false); }}
          className="absolute top-2.5 left-2.5 z-10 bg-black/60 backdrop-blur text-white border-none text-xs flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-primary/80 transition-colors"
        >
          <Video className="h-2.5 w-2.5" /> Vidéo
        </button>
      )}
      {isVideoSlide && !videoPlaying && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(0); setVideoPlaying(false); }}
          className="absolute top-2.5 left-2.5 z-10 bg-primary text-primary-foreground text-xs flex items-center gap-1 px-2 py-0.5 rounded-full"
        >
          <Video className="h-2.5 w-2.5" /> Vidéo
        </button>
      )}

      <div className="absolute top-2.5 right-2.5 z-10">
        <Badge className={`border text-xs font-medium flex items-center gap-1 ${st.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </Badge>
      </div>

      <div className="absolute bottom-2.5 left-2.5 z-10">
        <div className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-lg">
          {formatCurrency(property.rentAmount)}<span className="font-normal opacity-75">/mois</span>
        </div>
      </div>
    </div>
  );
}

function PropertyCardMenu({ property, onDetail, onEdit, onPublish }: {
  property: any;
  onDetail: () => void;
  onEdit: () => void;
  onPublish: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-9 w-52 rounded-xl shadow-2xl overflow-hidden z-[100]"
          style={{ background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)" }}
        >
          {[
            { icon: Eye, label: "Voir le détail", action: onDetail },
            { icon: Pencil, label: "Modifier", action: onEdit },
            { icon: Globe, label: "Publier sur la Vitrine", action: onPublish },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={() => { setOpen(false); action(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-sidebar-accent transition-all"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  disponible:  { label: "Disponible",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",  dot: "bg-emerald-400" },
  occupe:      { label: "Occupé",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",           dot: "bg-blue-400" },
  maintenance: { label: "Maintenance", color: "text-amber-400 bg-amber-500/10 border-amber-500/20",        dot: "bg-amber-400" },
  reserve:     { label: "Réservé",     color: "text-purple-400 bg-purple-500/10 border-purple-500/20",     dot: "bg-purple-400" },
  public:      { label: "PUBLIC ✓",    color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",  dot: "bg-emerald-400" },
};

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local commercial", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

export default function Biens() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const openCreate = () => { setSelectedProperty(null); setDialogOpen(true); };
  const openEdit = (property: any) => { setSheetOpen(false); setSelectedProperty(property); setDialogOpen(true); };
  const openDetail = (property: any) => { setSelectedProperty(property); setSheetOpen(true); };

  const handleQuickPublish = async (property: any) => {
    try {
      const r = await fetch(`${BASE}/api/properties/${property.id}/publish`, { method: "PATCH" });
      if (!r.ok) throw new Error();
      toast.success("✅ Bien publié sur la Vitrine !");
      qc.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    } catch {
      toast.error("Erreur lors de la publication");
    }
  };

  const { data: properties, isLoading } = useListProperties(
    {
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { query: { queryKey: getListPropertiesQueryKey({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const filteredProperties = properties
    ? typeFilter !== "all" ? properties.filter((p) => p.type === typeFilter) : properties
    : [];

  const { data: statsZone, isLoading: isLoadingStats } = useGetPropertiesStatsByZone({
    query: { queryKey: getGetPropertiesStatsByZoneQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Portefeuille Immobilier</h1>
          <p className="text-muted-foreground">Gérez l'ensemble de vos biens à Tanger et alentours.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {isLoadingStats ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : statsZone?.map((stat) => (
          <Card key={stat.zone} className="bg-card/50 backdrop-blur border-card-border hover:border-primary/30 transition-colors cursor-default">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground truncate">{stat.zone.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold font-mono text-foreground">{stat.count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="text-blue-400">{stat.occupied}</span> occ. · <span className="text-emerald-400">{stat.count - stat.occupied}</span> libres
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 bg-card/30 p-3 rounded-xl border border-card-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, titre, adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background/50 border-input"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="occupe">Occupé</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reserve">Réservé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background/50 border-input"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="bureau">Bureau</SelectItem>
              <SelectItem value="local_commercial">Local commercial</SelectItem>
              <SelectItem value="riad">Riad</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-background/50 border border-input rounded-md p-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")}
              className={`h-7 px-2.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}
              className={`h-7 px-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isLoading && (
          <p className="text-xs text-muted-foreground px-1">
            {filteredProperties.length} bien{filteredProperties.length !== 1 ? "s" : ""} trouvé{filteredProperties.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {viewMode === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Card
                key={property.id}
                onClick={() => openDetail(property)}
                className="overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all bg-card/50 backdrop-blur border-card-border group cursor-pointer flex flex-col"
              >
                <CardMediaCarousel property={property} />

                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <Tag className="h-3 w-3" />
                    <span className="font-mono">{property.reference}</span>
                    <span className="text-card-border">·</span>
                    <span>{TYPE_LABELS[property.type] || property.type}</span>
                  </div>
                  <h3 className="font-semibold text-base leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="line-clamp-1 text-xs">{property.address}, {property.zone?.replace(/_/g, " ")}</span>
                  </div>

                  {property.description && (
                    <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-card-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      {property.surface} m²
                    </div>
                    {property.rooms && (
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {property.rooms}
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        {property.bathrooms}
                      </div>
                    )}
                    <div className="ml-auto" onClick={e => e.stopPropagation()}>
                      <PropertyCardMenu
                        property={property}
                        onDetail={() => openDetail(property)}
                        onEdit={() => openEdit(property)}
                        onPublish={() => handleQuickPublish(property)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-card-border rounded-xl bg-card/20">
              <Building2 className="mx-auto h-14 w-14 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun bien trouvé</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Essayez de modifier vos filtres."
                  : "Commencez par ajouter votre premier bien."}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={openCreate} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un bien
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === "list" && (
        <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-sidebar-accent/50">
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground w-10"></TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Bien</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Zone</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Surface</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Prix/mois</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-card-border">
                      <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => {
                    const st = STATUS_CONFIG[property.status] || STATUS_CONFIG["disponible"];
                    return (
                      <TableRow
                        key={property.id}
                        className="border-card-border hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(property)}
                      >
                        <TableCell>
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-sidebar-accent flex items-center justify-center shrink-0">
                            {property.photos?.[0] ? (
                              <img src={property.photos[0]} alt="" className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">{property.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{property.reference}</p>
                            {property.description && (
                              <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{property.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{TYPE_LABELS[property.type] || property.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{property.zone?.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">{property.surface} m²</TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-primary text-sm">{formatCurrency(property.rentAmount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border text-xs font-medium flex items-center gap-1 w-fit ${st.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openDetail(property)}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(property)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">Aucun bien trouvé</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <PropertyDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        property={selectedProperty}
        onEdit={() => { setSheetOpen(false); setDialogOpen(true); }}
      />
      <PropertyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} property={selectedProperty} />
    </div>
  );
}
