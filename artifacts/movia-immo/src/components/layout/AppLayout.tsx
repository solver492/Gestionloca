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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";

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
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Portefeuille Vente", href: "/biens", icon: Building },
  { name: "Contrats de Vente", href: "/contrats-vente", icon: FileText },
  { name: "Analytique & Ads", href: "/analytique", icon: BarChart3 },
];

const NAV_LUCRATIF = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Portefeuille Location", href: "/biens", icon: Building },
  { name: "Locataires", href: "/locataires", icon: Users },
  { name: "Paiements Loyers", href: "/paiements", icon: CreditCard },
  { name: "Contrats & Baux", href: "/contrats", icon: FileText },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Analytique", href: "/analytique", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { mode, setMode, theme, toggleTheme } = useAppContext();

  const { data: notifications } = useListNotifications(
    { unreadOnly: true },
    { query: { queryKey: getListNotificationsQueryKey({ unreadOnly: true }) } }
  );
  const { data: radarData } = useRadarCount();

  const unreadCount = notifications?.length || 0;
  const radarCount = radarData?.count || 0;
  const navigation = mode === "VENTE" ? NAV_VENTE : NAV_LUCRATIF;

  const isVente = mode === "VENTE";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--glass-border)',
        }}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-serif font-bold text-xl glass-iridescent"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(44 80% 65%))',
                boxShadow: '0 4px 16px hsl(var(--primary) / 0.4)',
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

        {/* Mode Switch — VENTE / LUCRATIF */}
        <div className="px-4 pt-4 pb-3">
          <div
            className="relative flex rounded-xl p-1 cursor-pointer select-none"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), 0 1px 0 var(--glass-highlight)',
            }}
          >
            {/* Sliding background */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-in-out"
              style={{
                left: isVente ? '4px' : 'calc(50%)',
                background: isVente
                  ? 'linear-gradient(135deg, rgba(220,60,40,0.8), rgba(240,100,60,0.7))'
                  : 'linear-gradient(135deg, rgba(40,160,100,0.8), rgba(60,200,120,0.7))',
                boxShadow: isVente
                  ? '0 2px 12px rgba(220,60,40,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                  : '0 2px 12px rgba(40,160,100,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            />
            <button
              onClick={() => setMode("VENTE")}
              className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
              style={{ color: isVente ? 'white' : 'hsl(var(--muted-foreground))' }}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              VENTE
            </button>
            <button
              onClick={() => setMode("LUCRATIF")}
              className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
              style={{ color: !isVente ? 'white' : 'hsl(var(--muted-foreground))' }}
            >
              <Home className="h-3.5 w-3.5" />
              LOCATIF
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Mode actif: <span className="font-semibold" style={{ color: isVente ? 'rgb(240,100,60)' : 'rgb(40,180,110)' }}>{isVente ? "Vente" : "Gestion Locative"}</span>
          </p>
        </div>

        <ScrollArea className="flex-1 px-3 pb-2">
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'nav-glass-active text-primary' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'}`}
                  style={isActive ? {} : { ':hover': { background: 'var(--glass-bg)' } } as any}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-sidebar-foreground/40'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                  {item.name}
                </Link>
              );
            })}

            <div className="my-3" style={{ borderTop: '1px solid var(--glass-border)' }} />

            {/* Radar */}
            {(() => {
              const isActive = location === "/radar";
              return (
                <Link
                  href="/radar"
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-amber-500/15 text-amber-400' : 'text-sidebar-foreground/70 hover:text-amber-400'}`}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <span className="flex items-center gap-3">
                    <Radio className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-amber-500/50'} ${radarCount > 0 ? 'animate-pulse' : ''}`} />
                    Le Radar
                  </span>
                  {radarCount > 0 && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(251,191,36,0.9))',
                        color: 'hsl(211,53%,11%)',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                      }}
                    >
                      {radarCount > 9 ? "9+" : radarCount}
                    </span>
                  )}
                </Link>
              );
            })()}

            {/* Vitrine publique */}
            <a
              href="/catalogue"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <ExternalLink className="h-4 w-4" />
              Vitrine Publique
            </a>
          </nav>
        </ScrollArea>

        {/* User + Theme Toggle */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl mb-2 text-sm font-medium text-muted-foreground transition-all"
            style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--glass-highlight)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'; }}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-500" />}
              {theme === 'dark' ? 'Mode Nuit' : 'Mode Jour'}
            </span>
            {/* Toggle pill */}
            <div
              className="relative h-5 w-9 rounded-full transition-all duration-300"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(44,56%,54%,0.4), rgba(44,80%,65%,0.3))'
                  : 'linear-gradient(135deg, rgba(245,158,11,0.7), rgba(251,191,36,0.6))',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div
                className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300"
                style={{
                  left: theme === 'dark' ? '2px' : '18px',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-5 h-auto rounded-xl"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar
                    className="h-8 w-8 border"
                    style={{ border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px var(--glass-shadow)' }}
                  >
                    <AvatarFallback
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--primary)/0.15))',
                        color: 'hsl(var(--primary))',
                      }}
                    >AM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="text-sm font-semibold text-sidebar-foreground truncate w-full">Adil M.</span>
                    <span className="text-xs text-sidebar-foreground/50 truncate w-full">Administrateur</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/40" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)' }}>
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
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
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid var(--glass-border)',
            boxShadow: '0 4px 24px var(--glass-shadow)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="-m-2.5 p-2.5 text-muted-foreground md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Mode indicator in header */}
            <div className="flex items-center gap-2">
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: isVente
                    ? 'linear-gradient(135deg, rgba(220,60,40,0.15), rgba(240,100,60,0.1))'
                    : 'linear-gradient(135deg, rgba(40,160,100,0.15), rgba(60,200,120,0.1))',
                  border: isVente ? '1px solid rgba(220,60,40,0.3)' : '1px solid rgba(40,160,100,0.3)',
                  color: isVente ? 'rgb(240,100,60)' : 'rgb(40,180,110)',
                }}
              >
                {isVente ? <TrendingUp className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                {isVente ? 'MODE VENTE' : 'MODE LOCATIF'}
              </span>
            </div>

            <div className="flex flex-1" />

            <div className="flex items-center gap-x-3">
              {/* Radar badge */}
              {radarCount > 0 && (
                <Link
                  href="/radar"
                  className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-all"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    boxShadow: '0 2px 12px rgba(245,158,11,0.15)',
                  }}
                >
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  {radarCount} en attente
                </Link>
              )}

              {/* Theme toggle in header (icon) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 2px 8px var(--glass-shadow)',
                }}
                title={theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications */}
              <Link
                href="/notifications"
                className={`relative p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all ${location === '/notifications' ? 'text-primary' : ''}`}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 2px 8px var(--glass-shadow)',
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full animate-pulse"
                    style={{ background: 'hsl(var(--destructive))' }}
                  />
                )}
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
