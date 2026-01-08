import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileUp,
  Grid3X3,
  History,
  Home,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Importar Mãos", href: "/import", icon: FileUp },
  { title: "Histórico", href: "/hands", icon: History },
  { title: "Ranges GTO", href: "/ranges", icon: Grid3X3 },
  { title: "Estatísticas", href: "/stats", icon: BarChart3 },
  { title: "Sessões", href: "/sessions", icon: Clock },
  { title: "Análise IA", href: "/analysis", icon: Sparkles },
  { title: "Configurações", href: "/settings", icon: Settings },
];

interface PokerLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PokerLayout({ children, title }: PokerLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return <PokerLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
        <div className="glass-card p-8 rounded-lg border border-neon-pink hud-corners max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neon-pink tracking-wider">
                POKER ANALYZER
              </h1>
              <p className="text-muted-foreground">
                Faça login para acessar suas análises
              </p>
            </div>
            <Button
              asChild
              className="w-full btn-neon font-semibold tracking-wide"
            >
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            {!collapsed && (
              <Link href="/dashboard">
                <span className="text-xl font-bold text-neon-pink tracking-wider cursor-pointer hover:opacity-80 transition-opacity">
                  POKER<span className="text-neon-cyan">PRO</span>
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-neon-pink border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive && "text-neon-pink"
                        )}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User section */}
          <div className="border-t border-border/50 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-2 hover:bg-muted",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-neon-pink">
                    <User className="h-4 w-4" />
                  </div>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium truncate max-w-[140px]">
                        {user.name || "Jogador"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {user.email}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-4">
            {title && (
              <h1 className="text-xl font-bold tracking-wide text-foreground">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function PokerLayoutSkeleton() {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-sidebar">
        <div className="flex h-16 items-center px-4 border-b border-border/50">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 ml-64">
        <header className="h-16 border-b border-border/50 px-6 flex items-center">
          <Skeleton className="h-6 w-48" />
        </header>
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </div>
  );
}

export default PokerLayout;
