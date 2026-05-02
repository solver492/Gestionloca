import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Biens from "@/pages/Biens";
import Locataires from "@/pages/Locataires";
import Paiements from "@/pages/Paiements";
import Contrats from "@/pages/Contrats";
import Maintenance from "@/pages/Maintenance";
import Analytique from "@/pages/Analytique";
import Notifications from "@/pages/Notifications";
import Radar from "@/pages/Radar";
import Catalogue from "@/pages/Catalogue";

const queryClient = new QueryClient();

function AdminRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/biens" component={Biens} />
        <Route path="/locataires" component={Locataires} />
        <Route path="/paiements" component={Paiements} />
        <Route path="/contrats" component={Contrats} />
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/analytique" component={Analytique} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/radar" component={Radar} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={base}>
          <Switch>
            <Route path="/catalogue" component={Catalogue} />
            <Route component={AdminRouter} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
