import { useState } from "react";
import { useListProperties, getListPropertiesQueryKey, useGetPropertiesStatsByZone, getGetPropertiesStatsByZoneQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Home, Building2, Tag, Pencil, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormDialog } from "@/components/forms/PropertyFormDialog";

export default function Biens() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const openCreate = () => { setSelectedProperty(null); setDialogOpen(true); };
  const openEdit = (property: any) => { setSelectedProperty(property); setDialogOpen(true); };

  const { data: properties, isLoading } = useListProperties(
    { search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListPropertiesQueryKey({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  const { data: statsZone, isLoading: isLoadingStats } = useGetPropertiesStatsByZone({
    query: { queryKey: getGetPropertiesStatsByZoneQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Propriétés</h1>
          <p className="text-muted-foreground">Gérez votre portefeuille de biens immobiliers.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {isLoadingStats ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : statsZone?.map((stat) => (
          <Card key={stat.zone} className="bg-card/50 backdrop-blur border-card-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">{stat.zone.replace("_", " ")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold font-mono text-foreground">{stat.count}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.occupied} occupés
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-card-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par référence, adresse..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-input">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : properties && properties.length > 0 ? (
          properties.map((property) => (
            <Card
              key={property.id}
              onClick={() => openEdit(property)}
              className="overflow-hidden hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-card-border group cursor-pointer flex flex-col"
            >
              <div className="h-36 bg-sidebar-accent relative overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <Badge variant="outline" className={`
                    bg-background/80 backdrop-blur border-none font-medium text-xs
                    ${property.status === 'disponible' ? 'text-emerald-500' : ''}
                    ${property.status === 'occupe' ? 'text-blue-500' : ''}
                    ${property.status === 'maintenance' ? 'text-amber-500' : ''}
                    ${property.status === 'reserve' ? 'text-purple-500' : ''}
                  `}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </Badge>
                  {(property as any).videoUrl && (
                    <Badge className="bg-background/80 backdrop-blur text-primary border-none text-xs flex items-center gap-1">
                      <Video className="h-3 w-3" /> Vidéo
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                    {formatCurrency(property.rentAmount)}/mois
                  </Badge>
                </div>
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background/80 backdrop-blur rounded-md p-1.5">
                    <Pencil className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Tag className="h-3 w-3" /> {property.reference}
                  <span className="mx-1">•</span>
                  <Building2 className="h-3 w-3" /> {property.type.replace("_", " ")}
                </div>
                <h3 className="font-semibold text-base leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">{property.title}</h3>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-auto">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{property.address}, {property.zone.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-card-border text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    {property.surface} m²
                  </div>
                  {property.rooms && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      {property.rooms} pièces
                    </div>
                  )}
                  {property.photos && property.photos.length > 1 && (
                    <div className="ml-auto text-xs text-muted-foreground/70">
                      {property.photos.length} photos
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-card-border rounded-xl bg-card/20">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Aucun bien trouvé</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || statusFilter !== "all" ? "Essayez de modifier vos filtres." : "Commencez par ajouter votre premier bien."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={openCreate} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un bien
              </Button>
            )}
          </div>
        )}
      </div>

      <PropertyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} property={selectedProperty} />
    </div>
  );
}
