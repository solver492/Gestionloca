import { useState } from "react";
import { useListMaintenanceTickets, getListMaintenanceTicketsQueryKey, useGetMaintenanceStatsByStatus, getGetMaintenanceStatsByStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const { data: tickets, isLoading: isLoadingTickets } = useListMaintenanceTickets(
    { 
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined
    },
    { 
      query: { 
        queryKey: getListMaintenanceTicketsQueryKey({ 
          status: statusFilter !== "all" ? statusFilter : undefined,
          priority: priorityFilter !== "all" ? priorityFilter : undefined
        }) 
      } 
    }
  );

  const { data: stats, isLoading: isLoadingStats } = useGetMaintenanceStatsByStatus({
    query: { queryKey: getGetMaintenanceStatsByStatusQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground">Gestion des interventions et tickets de maintenance.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {isLoadingStats ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : stats ? (
          <>
            {['ouvert', 'en_cours', 'en_attente_pieces', 'resolu'].map(status => {
              const stat = stats.find(s => s.status === status);
              return (
                <Card key={status} className="bg-card/50 backdrop-blur border-card-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                      {status.replace(/_/g, " ").charAt(0).toUpperCase() + status.replace(/_/g, " ").slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-foreground">{stat?.count || 0}</div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-card-border">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-input">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ouvert">Ouvert</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="en_attente_pieces">En attente pièces</SelectItem>
            <SelectItem value="resolu">Résolu</SelectItem>
            <SelectItem value="ferme">Fermé</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-input">
            <SelectValue placeholder="Filtrer par priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="haute">Haute</SelectItem>
            <SelectItem value="normale">Normale</SelectItem>
            <SelectItem value="faible">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingTickets ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-card-border flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.reference}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`
                      border-none text-xs font-medium px-2 py-0.5
                      ${ticket.priority === 'urgente' ? 'text-destructive bg-destructive/10' : ''}
                      ${ticket.priority === 'haute' ? 'text-orange-500 bg-orange-500/10' : ''}
                      ${ticket.priority === 'normale' ? 'text-blue-500 bg-blue-500/10' : ''}
                      ${ticket.priority === 'faible' ? 'text-muted-foreground bg-muted' : ''}
                    `}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-lg text-foreground mb-1">{ticket.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ticket.description}</p>

                <div className="space-y-2 mt-auto text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                    <span className="line-clamp-1">{ticket.propertyTitle}</span>
                  </div>
                  {ticket.technicianName && (
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>{ticket.technicianName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                    <span>Créé le: {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between">
                  <Badge variant="outline" className={`
                    border-none font-medium
                    ${ticket.status === 'ouvert' ? 'text-blue-500 bg-blue-500/10' : ''}
                    ${ticket.status === 'en_cours' ? 'text-amber-500 bg-amber-500/10' : ''}
                    ${ticket.status === 'en_attente_pieces' ? 'text-orange-500 bg-orange-500/10' : ''}
                    ${ticket.status === 'resolu' ? 'text-emerald-500 bg-emerald-500/10' : ''}
                    ${ticket.status === 'ferme' ? 'text-muted-foreground bg-muted' : ''}
                  `}>
                    {ticket.status.replace(/_/g, " ").charAt(0).toUpperCase() + ticket.status.replace(/_/g, " ").slice(1)}
                  </Badge>
                  
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-8">
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-card-border rounded-xl bg-card/20">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Aucun ticket trouvé</h3>
            <p className="text-muted-foreground mt-1">Aucune intervention de maintenance ne correspond à vos critères.</p>
          </div>
        )}
      </div>
    </div>
  );
}
