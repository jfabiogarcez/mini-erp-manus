import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Equipe from "./pages/Equipe";
import Multas from "./pages/Multas";
import Dashboard from "./pages/Dashboard";
import Cobranca from "./pages/Cobranca";
import Aprendizados from "./pages/Aprendizados";
import Modelos from "./pages/Modelos";
import Missoes from "./pages/Missoes";
import Relatorios from "./pages/Relatorios";
import Metricas from "./pages/Metricas";
import Whatsapp from "./pages/Whatsapp";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/equipe"} component={Equipe} />
      <Route path={"/multas"} component={Multas} />
      <Route path={"/cobranca"} component={Cobranca} />
      <Route path={"/aprendizados"} component={Aprendizados} />
      <Route path={"/modelos"} component={Modelos} />
      <Route path={"/missoes"} component={Missoes} />
      <Route path={"/relatorios"} component={Relatorios} />
      <Route path={"/metricas"} component={Metricas} />
      <Route path={"/whatsapp"} component={Whatsapp} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
