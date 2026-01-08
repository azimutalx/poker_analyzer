import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ImportHands from "./pages/ImportHands";
import HandHistory from "./pages/HandHistory";
import HandReplay from "./pages/HandReplay";
import RangeViewer from "./pages/RangeViewer";
import Statistics from "./pages/Statistics";
import Sessions from "./pages/Sessions";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/import" component={ImportHands} />
      <Route path="/hands" component={HandHistory} />
      <Route path="/hands/:id" component={HandReplay} />
      <Route path="/ranges" component={RangeViewer} />
      <Route path="/stats" component={Statistics} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'oklch(0.12 0.02 270)',
                border: '1px solid oklch(0.3 0.1 330)',
                color: 'oklch(0.92 0.02 180)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
