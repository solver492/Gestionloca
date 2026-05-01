import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/format";
import {
  Phone, Mail, Building2, CreditCard, User, Briefcase,
  Globe, Calendar, AlertCircle, FileText, Pencil, X,
  TrendingUp, TrendingDown, Shield, MapPin
} from "lucide-react";

interface TenantDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  onEdit: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  actif:     { label: "Actif",     color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  inactif:   { label: "Inactif",   color: "text-[hsl(215,20%,65%)]", dot: "bg-[hsl(215,20%,65%)]", bg: "bg-[hsl(213,40%,18%)] border-[hsl(213,40%,25%)]" },
  en_retard: { label: "En retard", color: "text-amber-400", dot: "bg-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  expulse:   { label: "Expulsé",   color: "text-red-400",    dot: "bg-red-400",    bg: "bg-red-500/10 border-red-500/20" },
};

function InfoRow({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value?: string | number | null; highlight?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[hsl(213,40%,18%)] last:border-0">
      <div className="h-7 w-7 rounded-md bg-[hsl(211,53%,11%)] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-[hsl(44,56%,54%)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[hsl(215,20%,65%)]">{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${highlight ? "text-[hsl(44,56%,54%)] font-mono" : "text-[hsl(210,40%,98%)]"}`}>{value}</p>
      </div>
    </div>
  );
}

export function TenantDetailSheet({ open, onOpenChange, tenant, onEdit }: TenantDetailSheetProps) {
  if (!tenant) return null;

  const status = STATUS_CONFIG[tenant.status] || STATUS_CONFIG["actif"];
  const initials = `${tenant.firstName?.charAt(0) || ""}${tenant.lastName?.charAt(0) || ""}`.toUpperCase();
  const score = tenant.paymentScore ?? 0;
  const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 50 ? "Moyen" : "Mauvais";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-[hsl(212,50%,14%)] border-l border-[hsl(213,40%,18%)] overflow-y-auto flex flex-col"
      >
        {/* Header card */}
        <div className="relative bg-gradient-to-br from-[hsl(211,53%,13%)] to-[hsl(212,50%,16%)] px-6 pt-10 pb-6 border-b border-[hsl(213,40%,18%)]">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[hsl(213,40%,18%)] flex items-center justify-center text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-[hsl(44,56%,54%)]/30 shadow-lg shrink-0">
              <AvatarFallback className="bg-[hsl(44,56%,54%)]/20 text-[hsl(44,56%,54%)] font-serif text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-1">
              <SheetHeader className="p-0 space-y-1">
                <SheetTitle className="text-xl font-serif font-bold text-[hsl(210,40%,98%)] leading-tight">
                  {tenant.firstName} {tenant.lastName}
                </SheetTitle>
              </SheetHeader>
              {tenant.profession && (
                <p className="text-sm text-[hsl(215,20%,65%)] mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" /> {tenant.profession}
                </p>
              )}
              <div className="mt-2">
                <Badge className={`border text-xs font-medium flex items-center gap-1.5 w-fit ${status.bg} ${status.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Score de paiement */}
          <div className="mt-5 bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-[hsl(215,20%,65%)]">
                {score >= 80 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-amber-400" />}
                Score de paiement
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[hsl(210,40%,98%)]">{score}</span>
                <span className="text-xs text-[hsl(215,20%,65%)]">/100</span>
                <span className={`text-xs font-medium ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  — {scoreLabel}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-[hsl(213,40%,18%)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Solde */}
          {tenant.balance !== undefined && (
            <div className={`rounded-xl p-4 border flex items-center gap-3 ${tenant.balance < 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <CreditCard className={`h-5 w-5 shrink-0 ${tenant.balance < 0 ? "text-red-400" : "text-emerald-400"}`} />
              <div>
                <p className="text-xs text-[hsl(215,20%,65%)]">Solde du compte</p>
                <p className={`text-lg font-mono font-bold ${tenant.balance < 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {tenant.balance >= 0 ? "+" : ""}{formatCurrency(tenant.balance)}
                </p>
              </div>
              {tenant.rentAmount && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-[hsl(215,20%,65%)]">Loyer mensuel</p>
                  <p className="text-sm font-mono font-bold text-[hsl(44,56%,54%)]">{formatCurrency(tenant.rentAmount)}</p>
                </div>
              )}
            </div>
          )}

          {/* Bien loué */}
          {tenant.propertyTitle && (
            <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)] flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[hsl(44,56%,54%)]/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[hsl(44,56%,54%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[hsl(215,20%,65%)]">Bien loué</p>
                <p className="text-sm font-medium text-[hsl(210,40%,98%)] truncate">{tenant.propertyTitle}</p>
              </div>
              <MapPin className="h-4 w-4 text-[hsl(215,20%,65%)]" />
            </div>
          )}

          <Separator className="bg-[hsl(213,40%,18%)]" />

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(215,20%,65%)] mb-3">Contact</h3>
            <div>
              <InfoRow icon={Phone} label="Téléphone" value={tenant.phone} />
              <InfoRow icon={Mail} label="Email" value={tenant.email} />
            </div>
          </div>

          {/* Identité */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(215,20%,65%)] mb-3">Identité</h3>
            <div>
              <InfoRow icon={Shield} label="CIN" value={tenant.cin} />
              <InfoRow icon={Globe} label="Nationalité" value={tenant.nationality} />
              <InfoRow icon={Calendar} label="Date de naissance" value={tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" }) : undefined} />
              <InfoRow icon={Briefcase} label="Profession" value={tenant.profession} />
            </div>
          </div>

          {/* Contact urgence */}
          {(tenant.emergencyContact || tenant.emergencyPhone) && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(215,20%,65%)] mb-3">Contact d'urgence</h3>
              <div>
                <InfoRow icon={User} label="Nom" value={tenant.emergencyContact} />
                <InfoRow icon={Phone} label="Téléphone" value={tenant.emergencyPhone} />
              </div>
            </div>
          )}

          {/* Notes */}
          {tenant.notes && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(215,20%,65%)] mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Notes internes
              </h3>
              <div className="bg-[hsl(211,53%,11%)] rounded-xl p-4 border border-[hsl(213,40%,18%)]">
                <p className="text-sm text-[hsl(215,20%,65%)] leading-relaxed whitespace-pre-wrap">{tenant.notes}</p>
              </div>
            </div>
          )}

          {/* Alert si en retard */}
          {tenant.status === "en_retard" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Loyer en retard</p>
                <p className="text-xs text-[hsl(215,20%,65%)] mt-0.5">Ce locataire a des paiements en attente. Pensez à envoyer une relance.</p>
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
