import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Home,
  Scan,
  History,
  BarChart3,
  Package,
  QrCode,
  Menu,
  Moon,
  Sun,
  GraduationCap,
  Settings,
  FileText,
} from "lucide-react";

export function Header() {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useApp();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/scanner-qr", icon: Scan, label: "QR Code" },
    { path: "/scanner-barcode", icon: QrCode, label: "Código de Barras" },
    { path: "/historico", icon: History, label: "Histórico" },
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/materiais", icon: Package, label: "Materiais" },
    { path: "/gerador-qr", icon: QrCode, label: "Gerador QR" },
    { path: "/gerador-conteudo", icon: FileText, label: "QR Conteúdo" },
    { path: "/atividade", icon: GraduationCap, label: "Atividade" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="header-logo">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Package className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading text-xl font-bold text-foreground leading-tight">
                Logi3A Soluções
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                EE Profª Elídia Tedesco de Oliveira
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              data-testid="dark-mode-toggle"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Mobile menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 w-full"
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/configuracoes"
                    className="flex items-center gap-2 w-full"
                    data-testid="mobile-nav-configuracoes"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop more menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  data-testid="more-menu-trigger"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/gerador-qr"
                    className="flex items-center gap-2 w-full"
                  >
                    <QrCode className="w-4 h-4" />
                    Gerador QR
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/gerador-conteudo"
                    className="flex items-center gap-2 w-full"
                  >
                    <FileText className="w-4 h-4" />
                    QR Conteúdo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/atividade"
                    className="flex items-center gap-2 w-full"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Atividade Prática
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/configuracoes"
                    className="flex items-center gap-2 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
