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

const queryClient = new QueryClient();

function Router() {
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
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
