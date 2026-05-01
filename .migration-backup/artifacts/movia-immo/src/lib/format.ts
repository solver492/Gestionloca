import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "0 MAD";
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("MAD", "").trim() + " MAD";
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
  } catch (e) {
    return dateString;
  }
}
