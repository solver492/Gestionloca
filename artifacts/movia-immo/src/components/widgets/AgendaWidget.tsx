import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, MapPin, User, Trash2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  type: "rdv" | "note" | "rappel";
  description?: string;
  propertyId?: number;
  propertyTitle?: string;
  tenantId?: number;
  tenantName?: string;
  color: string;
}

const EVENT_COLORS = { rdv: "#c17d2a", note: "#3b82f6", rappel: "#f59e0b" };
const EVENT_LABELS = { rdv: "🤝 Rendez-vous", note: "📝 Note", rappel: "⏰ Rappel" };

const emptyForm = {
  title: "", type: "rdv", description: "",
  propertyId: "", tenantId: "", startDate: "", endDate: "", allDay: true,
};

export default function AgendaWidget() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const calRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/calendar-events`);
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-for-cal"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/properties?limit=100`);
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : (d.data ?? []);
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants-for-cal"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/tenants?limit=100`);
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    },
  });

  const reset = () => { setForm({ ...emptyForm }); setEditEvent(null); };

  const openCreate = (date?: string) => {
    reset();
    if (date) setForm(f => ({ ...f, startDate: date }));
    setModalOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditEvent(ev);
    setForm({
      title: ev.title, type: ev.type, description: ev.description ?? "",
      propertyId: ev.propertyId ? String(ev.propertyId) : "",
      tenantId: ev.tenantId ? String(ev.tenantId) : "",
      startDate: ev.startDate, endDate: ev.endDate ?? "", allDay: ev.allDay,
    });
    setModalOpen(true);
  };

  const buildPayload = () => {
    const prop = (properties as any[]).find((p: any) => String(p.id) === form.propertyId);
    const ten = (tenants as any[]).find((t: any) => String(t.id) === form.tenantId);
    return {
      title: form.title,
      type: form.type,
      description: form.description || null,
      startDate: form.startDate || new Date().toISOString().split("T")[0],
      endDate: form.endDate || null,
      allDay: form.allDay,
      propertyId: form.propertyId ? Number(form.propertyId) : null,
      propertyTitle: prop?.title ?? null,
      tenantId: form.tenantId ? Number(form.tenantId) : null,
      tenantName: ten ? `${ten.firstName} ${ten.lastName}` : null,
      color: EVENT_COLORS[form.type as keyof typeof EVENT_COLORS],
    };
  };

  const createMut = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch(`${BASE}/api/calendar-events`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["calendar-events"] }); setModalOpen(false); reset(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const r = await fetch(`${BASE}/api/calendar-events/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["calendar-events"] }); setModalOpen(false); reset(); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { await fetch(`${BASE}/api/calendar-events/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["calendar-events"] }); setModalOpen(false); reset(); },
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const payload = buildPayload();
    if (editEvent) updateMut.mutate({ id: editEvent.id, ...payload });
    else createMut.mutate(payload);
  };

  const handleDrop = (info: any) => {
    const ev = info.event.extendedProps as CalendarEvent;
    updateMut.mutate({
      id: ev.id, title: ev.title, type: ev.type, description: ev.description ?? null,
      startDate: info.event.startStr, endDate: info.event.endStr || null,
      allDay: info.event.allDay,
      propertyId: ev.propertyId ?? null, propertyTitle: ev.propertyTitle ?? null,
      tenantId: ev.tenantId ?? null, tenantName: ev.tenantName ?? null,
      color: ev.color,
    });
  };

  const calEvents = (events as CalendarEvent[]).map(e => ({
    id: String(e.id), title: e.title, start: e.startDate, end: e.endDate,
    allDay: e.allDay, backgroundColor: e.color, borderColor: e.color,
    textColor: "#fff", extendedProps: e,
  }));

  return (
    <div
      className="rounded-2xl p-5 overflow-hidden"
      style={{
        background: "rgba(18,18,18,0.72)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(44 56% 54% / 0.3), hsl(44 80% 65% / 0.15))", border: "1px solid hsl(44 56% 54% / 0.3)" }}>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-foreground leading-none">Agenda</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">RDVs, notes, rappels</p>
          </div>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(193,125,42,0.9), rgba(220,160,60,0.85))",
            border: "1px solid rgba(255,200,100,0.3)",
            boxShadow: "0 3px 12px rgba(193,125,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Nouveau RDV
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1">
        {Object.entries({ rdv: "Rendez-vous", note: "Note", rappel: "Rappel" }).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: EVENT_COLORS[type as keyof typeof EVENT_COLORS], boxShadow: `0 0 6px ${EVENT_COLORS[type as keyof typeof EVENT_COLORS]}60` }} />
            {label}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="agenda-fc">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,listWeek" }}
          events={calEvents}
          selectable
          editable
          height={430}
          dateClick={(info) => openCreate(info.dateStr)}
          eventClick={(info) => openEdit(info.event.extendedProps as CalendarEvent)}
          eventDrop={handleDrop}
          buttonText={{ today: "Aujourd'hui", month: "Mois", list: "Liste" }}
          eventDisplay="block"
        />
      </div>

      {/* Event Dialog */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) { setModalOpen(false); reset(); } else setModalOpen(true); }}>
        <DialogContent
          className="max-w-md border-0"
          style={{
            background: "rgba(14,16,28,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
            borderRadius: "1.25rem",
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground text-lg">
              {editEvent ? "Modifier l'événement" : "Nouveau RDV / Note"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Titre *</Label>
              <Input
                placeholder="Titre de l'événement..."
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }}
                className="text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }} className="text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(14,16,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  {Object.entries(EVENT_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[["startDate", "Date début"], ["endDate", "Date fin"]].map(([key, label]) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
                  <Input
                    type="date"
                    value={(form as any)[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }}
                    className="text-foreground text-sm"
                  />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Bien immobilier
              </Label>
              <Select value={form.propertyId} onValueChange={(v) => setForm(f => ({ ...f, propertyId: v }))}>
                <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }} className="text-foreground">
                  <SelectValue placeholder="Associer un bien..." />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(14,16,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <SelectItem value="">Aucun</SelectItem>
                  {(properties as any[]).map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <User className="h-3 w-3" /> Locataire
              </Label>
              <Select value={form.tenantId} onValueChange={(v) => setForm(f => ({ ...f, tenantId: v }))}>
                <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }} className="text-foreground">
                  <SelectValue placeholder="Associer un locataire..." />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(14,16,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <SelectItem value="">Aucun</SelectItem>
                  {(tenants as any[]).map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.firstName} {t.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Notes</Label>
              <Textarea
                placeholder="Notes et détails..."
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.625rem" }}
                className="text-foreground placeholder:text-muted-foreground/50 min-h-[70px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            {editEvent && (
              <button
                onClick={() => deleteMut.mutate(editEvent.id)}
                className="mr-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setModalOpen(false); reset(); }}
              className="border border-white/10 text-muted-foreground hover:text-foreground"
            >
              Annuler
            </Button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim() || createMut.isPending || updateMut.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, rgba(193,125,42,0.9), rgba(220,160,60,0.85))",
                border: "1px solid rgba(255,200,100,0.3)",
                boxShadow: "0 3px 12px rgba(193,125,42,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {editEvent ? "Sauvegarder" : "Créer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
