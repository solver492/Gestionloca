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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

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

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Propriétés", href: "/biens", icon: Building },
  { name: "Locataires", href: "/locataires", icon: Users },
  { name: "Paiements", href: "/paiements", icon: CreditCard },
  { name: "Contrats", href: "/contrats", icon: FileText },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Analytique", href: "/analytique", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: notifications } = useListNotifications(
    { unreadOnly: true },
    { query: { queryKey: getListNotificationsQueryKey({ unreadOnly: true }) } }
  );
  const { data: radarData } = useRadarCount();

  const unreadCount = notifications?.length || 0;
  const radarCount = radarData?.count || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 bg-sidebar-accent/50 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-serif font-bold text-xl">
              M
            </div>
            <span className="font-semibold text-lg tracking-wide text-sidebar-foreground">Movia Immo</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4 px-3">
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-sidebar-primary/10 text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Separator before Radar */}
            <div className="my-3 border-t border-sidebar-border" />

            {/* Radar */}
            {(() => {
              const isActive = location === "/radar";
              return (
                <Link href="/radar" className={`flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-amber-500/15 text-amber-400' : 'text-sidebar-foreground/70 hover:bg-amber-500/10 hover:text-amber-400'}`}>
                  <span className="flex items-center gap-3">
                    <Radio className={`h-5 w-5 ${isActive ? 'text-amber-400' : 'text-sidebar-foreground/50'} ${radarCount > 0 ? 'animate-pulse' : ''}`} />
                    Le Radar
                  </span>
                  {radarCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[hsl(211,53%,11%)] text-xs font-bold">
                      {radarCount > 9 ? "9+" : radarCount}
                    </span>
                  )}
                </Link>
              );
            })()}

            {/* Catalogue public */}
            <a 
              href="/catalogue"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              Vitrine Publique
            </a>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-6 h-auto hover:bg-sidebar-accent">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-9 w-9 border border-sidebar-border">
                    <AvatarFallback className="bg-primary/20 text-primary">AM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="text-sm font-medium text-sidebar-foreground truncate w-full">Adil M.</span>
                    <span className="text-xs text-sidebar-foreground/50 truncate w-full">Admin</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-card-border">
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden w-full relative">
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/50 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 z-10 sticky top-0">
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground md:hidden" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {radarCount > 0 && (
                <Link href="/radar" className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  {radarCount} en attente
                </Link>
              )}
              <Link href="/notifications" className={`relative p-2.5 text-muted-foreground hover:text-foreground transition-colors ${location === '/notifications' ? 'text-primary' : ''}`}>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
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
