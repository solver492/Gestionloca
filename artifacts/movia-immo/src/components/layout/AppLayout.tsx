import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  FileText,
  Wrench,
  BarChart3,
  Bell,
  Menu,
  LogOut,
  ChevronDown,
  Radio,
  ExternalLink,
  Sun,
  Moon,
  TrendingUp,
  Home,
  Languages,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useRadarCount() {
  return useQuery({
    queryKey: ["radar-count"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/properties/radar/count`);
      if (!r.ok) return { count: 0 };
      return r.json();
    },
    refetchInterval: 30_000,
  });
}

const NAV_VENTE = [
  { nameKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { nameKey: "nav.portfolio_sale", href: "/biens", icon: Building },
  { nameKey: "nav.sale_contracts", href: "/contrats-vente", icon: FileText },
  { nameKey: "nav.analytics_ads", href: "/analytique", icon: BarChart3 },
];

const NAV_LUCRATIF = [
  { nameKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { nameKey: "nav.portfolio_rental", href: "/biens", icon: Building },
  { nameKey: "nav.tenants", href: "/locataires", icon: Users },
  { nameKey: "nav.payments", href: "/paiements", icon: CreditCard },
  { nameKey: "nav.contracts", href: "/contrats", icon: FileText },
  { nameKey: "nav.maintenance", href: "/maintenance", icon: Wrench },
  { nameKey: "nav.analytics", href: "/analytique", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { mode, setMode, theme, toggleTheme } = useAppContext();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const { data: notifications } = useListNotifications(
    { unreadOnly: true },
    { query: { queryKey: getListNotificationsQueryKey({ unreadOnly: true }) } }
  );
  const { data: radarData } = useRadarCount();

  const unreadCount = notifications?.length || 0;
  const radarCount = radarData?.count || 0;
  const navigation = mode === "VENTE" ? NAV_VENTE : NAV_LUCRATIF;
  const isVente = mode === "VENTE";

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("movia-lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const sidebarStyle: React.CSSProperties = {
    background: "rgba(10,12,20,0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-serif font-bold text-xl"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(44 80% 65%))",
                boxShadow: "0 4px 16px hsl(var(--primary) / 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              M
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wide text-foreground leading-none">Movia Immo</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">CRM Immobilier</span>
            </div>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="px-4 pt-4 pb-3">
          <div
            className="relative flex rounded-xl p-1 cursor-pointer select-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-in-out"
              style={{
                left: isVente ? "4px" : "calc(50%)",
                background: isVente
                  ? "linear-gradient(135deg, rgba(220,60,40,0.8), rgba(240,100,60,0.7))"
                  : "linear-gradient(135deg, rgba(40,160,100,0.8), rgba(60,200,120,0.7))",
                boxShadow: isVente
                  ? "0 2px 12px rgba(220,60,40,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
                  : "0 2px 12px rgba(40,160,100,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            />
            {[
              { key: "VENTE", icon: TrendingUp, label: t("mode.vente") },
              { key: "LUCRATIF", icon: Home, label: t("mode.locatif") },
            ].map(({ key, icon: Icon, label }) => {
              const active = (key === "VENTE") === isVente;
              return (
                <button
                  key={key}
                  onClick={() => setMode(key as any)}
                  className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
                  style={{ color: active ? "white" : "hsl(var(--muted-foreground))" }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Mode actif: <span className="font-semibold" style={{ color: isVente ? "rgb(240,100,60)" : "rgb(40,180,110)" }}>
              {isVente ? t("mode.vente") : t("mode.locatif")}
            </span>
          </p>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 pb-2">
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "nav-glass-active text-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"}`}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <Icon className={`shrink-0 ${isActive ? "text-primary" : "text-sidebar-foreground/40"}`} style={{ width: "1.125rem", height: "1.125rem" }} />
                  {t(item.nameKey)}
                </Link>
              );
            })}

            <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

            {/* Radar */}
            {(() => {
              const isActive = location === "/radar";
              return (
                <Link
                  href="/radar"
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-amber-500/15 text-amber-400" : "text-sidebar-foreground/70 hover:text-amber-400"}`}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.08)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <span className="flex items-center gap-3">
                    <Radio className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-amber-500/50"} ${radarCount > 0 ? "animate-pulse" : ""}`} />
                    {t("nav.radar")}
                  </span>
                  {radarCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.9), rgba(251,191,36,0.9))", color: "hsl(211,53%,11%)", boxShadow: "0 2px 8px rgba(245,158,11,0.4)" }}>
                      {radarCount > 9 ? "9+" : radarCount}
                    </span>
                  )}
                </Link>
              );
            })()}

            {/* Vitrine */}
            <a
              href="/catalogue"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <ExternalLink className="h-4 w-4" />
              {t("nav.vitrine")}
            </a>
          </nav>
        </ScrollArea>

        {/* Footer: Lang + Theme + User */}
        <div className="p-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>

          {/* Language switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Languages className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
            {[
              { code: "fr", flag: "🇫🇷", label: "FR" },
              { code: "ar", flag: "🇲🇦", label: "AR" },
            ].map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={i18n.language === code ? {
                  background: "linear-gradient(135deg, rgba(193,125,42,0.6), rgba(220,160,60,0.5))",
                  color: "white",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
                } : { color: "hsl(var(--muted-foreground))" }}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-500" />}
              {theme === "dark" ? "Mode Nuit" : "Mode Jour"}
            </span>
            <div className="relative h-5 w-9 rounded-full transition-all duration-300" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300" style={{ left: theme === "dark" ? "2px" : "18px", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </div>
          </button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-5 h-auto rounded-xl" onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8" style={{ border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                    <AvatarFallback style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--primary)/0.15))", color: "hsl(var(--primary))" }}>AM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="text-sm font-semibold text-sidebar-foreground truncate w-full">Adil M.</span>
                    <span className="text-xs text-sidebar-foreground/50 truncate w-full">Administrateur</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/40" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" style={{ background: "rgba(14,16,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "0.75rem" }}>
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden w-full relative">
        {/* Header */}
        <header
          className="flex h-16 shrink-0 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8 z-10 sticky top-0"
          style={{
            background: "rgba(10,12,20,0.80)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground md:hidden" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-2">
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: isVente ? "linear-gradient(135deg, rgba(220,60,40,0.15), rgba(240,100,60,0.10))" : "linear-gradient(135deg, rgba(40,160,100,0.15), rgba(60,200,120,0.10))",
                  border: isVente ? "1px solid rgba(220,60,40,0.3)" : "1px solid rgba(40,160,100,0.3)",
                  color: isVente ? "rgb(240,100,60)" : "rgb(40,180,110)",
                }}
              >
                {isVente ? <TrendingUp className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                {isVente ? "MODE VENTE" : "MODE LOCATIF"}
              </span>
            </div>

            <div className="flex flex-1" />

            <div className="flex items-center gap-x-3">
              {radarCount > 0 && (
                <Link href="/radar" className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-all" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 2px 12px rgba(245,158,11,0.15)" }}>
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  {radarCount} en attente
                </Link>
              )}

              <button onClick={toggleTheme} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} title={theme === "dark" ? "Mode Jour" : "Mode Nuit"}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Link href="/notifications" className={`relative p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all ${location === "/notifications" ? "text-primary" : ""}`} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full animate-pulse" style={{ background: "hsl(var(--destructive))" }} />}
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
