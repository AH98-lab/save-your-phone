import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SecurityDashboard from "@/pages/security-dashboard";
import AllThreats from "@/pages/all-threats";
import Suggestions from "@/pages/suggestions";
import NotFound from "@/pages/not-found";
import Subscribe from "@/pages/subscribe";
import Payment from "@/pages/payment";
import LocalPayment from "@/pages/local-payment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SecurityDashboard} />
      <Route path="/threats" component={AllThreats} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment" component={Payment} />
      <Route path="/local-payment" component={LocalPayment} />
      <Route path="/suggestions" component={Suggestions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
