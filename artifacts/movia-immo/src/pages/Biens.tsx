import { useState } from "react";
import { useListProperties, getListPropertiesQueryKey, useGetPropertiesStatsByZone, getGetPropertiesStatsByZoneQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Home, Building2, Tag, Pencil, Video, LayoutGrid, List, BedDouble, Bath, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormDialog } from "@/components/forms/PropertyFormDialog";
import { PropertyDetailSheet } from "@/components/sheets/PropertyDetailSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  if (url.includes("youtube.com/watch")) {
    try { const id = new URL(url).searchParams.get("v"); return `https://www.youtube.com/embed/${id}`; } catch {}
  }
  return url;
}

function CardMediaCarousel({ property }: { property: any }) {
  const [idx, setIdx] = useState(0);
  const photos: string[] = property.photos || [];
  const hasVideo = !!property.videoUrl;
  const total = photos.length + (hasVideo ? 1 : 0);
  const isVideoSlide = hasVideo && idx === photos.length;
  const st = STATUS_CONFIG[property.status] || STATUS_CONFIG["disponible"];

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i + 1) % total); };

  return (
    <div className="h-40 bg-sidebar-accent relative overflow-hidden shrink-0">
      {isVideoSlide && property.videoUrl ? (
        <iframe
          src={getEmbedUrl(property.videoUrl)}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={property.title}
          onClick={(e) => e.stopPropagation()}
        />
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

      {/* Carousel arrows */}
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
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`rounded-full transition-all ${i === idx ? "w-3.5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Video pill */}
      {hasVideo && !isVideoSlide && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(photos.length); }}
          className="absolute top-2.5 left-2.5 z-10 bg-black/60 backdrop-blur text-white border-none text-xs flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-primary/80 transition-colors"
        >
          <Video className="h-2.5 w-2.5" /> Vidéo
        </button>
      )}
      {isVideoSlide && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(0); }}
          className="absolute top-2.5 left-2.5 z-10 bg-primary text-primary-foreground text-xs flex items-center gap-1 px-2 py-0.5 rounded-full"
        >
          <Video className="h-2.5 w-2.5" /> Vidéo
        </button>
      )}

      {/* Status badge */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <Badge className={`border text-xs font-medium flex items-center gap-1 ${st.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </Badge>
      </div>

      {/* Price */}
      <div className="absolute bottom-2.5 left-2.5 z-10">
        <div className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-lg">
          {formatCurrency(property.rentAmount)}<span className="font-normal opacity-75">/mois</span>
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  disponible:  { label: "Disponible",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",  dot: "bg-emerald-400" },
  occupe:      { label: "Occupé",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",           dot: "bg-blue-400" },
  maintenance: { label: "Maintenance", color: "text-amber-400 bg-amber-500/10 border-amber-500/20",        dot: "bg-amber-400" },
  reserve:     { label: "Réservé",     color: "text-purple-400 bg-purple-500/10 border-purple-500/20",     dot: "bg-purple-400" },
};

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau",
  local_commercial: "Local commercial", riad: "Riad", studio: "Studio",
  duplex: "Duplex", terrain: "Terrain",
};

export default function Biens() {
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

  const { data: properties, isLoading } = useListProperties(
    {
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { query: { queryKey: getListPropertiesQueryKey({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const filteredProperties = properties
    ? typeFilter !== "all"
      ? properties.filter((p) => p.type === typeFilter)
      : properties
    : [];

  const { data: statsZone, isLoading: isLoadingStats } = useGetPropertiesStatsByZone({
    query: { queryKey: getGetPropertiesStatsByZoneQueryKey() }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Zone stats */}
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

      {/* Filters + view toggle */}
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
            <SelectTrigger className="w-full sm:w-[160px] bg-background/50 border-input">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="occupe">Occupé</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reserve">Réservé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background/50 border-input">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
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

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-background/50 border border-input rounded-md p-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-7 px-2.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-7 px-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground px-1">
            {filteredProperties.length} bien{filteredProperties.length !== 1 ? "s" : ""} trouvé{filteredProperties.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => {
              const st = STATUS_CONFIG[property.status] || STATUS_CONFIG["disponible"];
              return (
                <Card
                  key={property.id}
                  onClick={() => openDetail(property)}
                  className="overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all bg-card/50 backdrop-blur border-card-border group cursor-pointer flex flex-col"
                >
                  {/* Photo + Video carousel */}
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

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-card-border text-xs text-muted-foreground">
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
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-primary text-xs font-medium">
                          Voir <span className="text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
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

      {/* List view */}
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
                  <TableHead className="font-semibold text-muted-foreground">Loyer</TableHead>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => openEdit(property)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Aucun bien trouvé
                    </TableCell>
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
