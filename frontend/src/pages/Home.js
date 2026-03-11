import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Scan,
  QrCode,
  History,
  Package,
  GraduationCap,
  UserCog,
  ArrowRight,
  Sparkles,
  Truck,
  Warehouse,
  Box,
  BookOpen,
  Zap,
  FileText,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { user, fetchMateriais, seedDemoData, estatisticas, fetchEstatisticas } = useApp();

  useEffect(() => {
    const init = async () => {
      await seedDemoData();
      await fetchMateriais();
      await fetchEstatisticas();
    };
    init();
  }, [fetchMateriais, seedDemoData, fetchEstatisticas]);

  // Redirect logged users to their panels
  useEffect(() => {
    if (user) {
      if (user.tipo === "professor") {
        navigate("/professor");
      } else {
        navigate("/aluno");
      }
    }
  }, [user, navigate]);

  const mainActions = [
    {
      title: "Ler QR Code",
      description: "Escaneie QR Codes com a câmera",
      icon: Scan,
      path: "/scanner-qr",
      color: "bg-primary",
      testId: "action-qr-code",
    },
    {
      title: "Ler Código de Barras",
      description: "Escaneie códigos de barras tradicionais",
      icon: QrCode,
      path: "/scanner-barcode",
      color: "bg-secondary",
      testId: "action-barcode",
    },
    {
      title: "Gerador de QR Code",
      description: "Crie QR Codes logísticos",
      icon: Package,
      path: "/gerador-qr",
      color: "bg-accent",
      testId: "action-gerador",
    },
    {
      title: "QR Code por Conteúdo",
      description: "Textos, mensagens, links e imagens",
      icon: FileText,
      path: "/gerador-conteudo",
      color: "bg-primary/80",
      testId: "action-gerador-conteudo",
    },
  ];

  const accessAreas = [
    {
      title: "Área do Aluno",
      description: "Acesse com seu login de aluno",
      icon: GraduationCap,
      path: "/login",
      color: "bg-primary",
    },
    {
      title: "Área do Professor",
      description: "Acesse o painel do professor",
      icon: UserCog,
      path: "/login",
      color: "bg-secondary",
    },
  ];

  const logisticsOperations = [
    { name: "Recebimento", icon: Truck, description: "Entrada de mercadorias" },
    { name: "Estoque", icon: Warehouse, description: "Armazenamento de produtos" },
    { name: "Expedição", icon: Box, description: "Saída para clientes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">Logi3A Soluções</h1>
              <p className="text-xs text-muted-foreground">EE Profª Elídia Tedesco de Oliveira</p>
            </div>
          </div>
          <Link to="/login">
            <Button data-testid="login-btn">Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-background p-8 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Simulador Educacional
            </Badge>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight">
              Aprenda <span className="text-primary">Logística</span> na Prática
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              Sistema educacional para ensinar leitura de QR Code e código de barras 
              aplicados a centros de distribuição, estoque e logística.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="gap-2" data-testid="hero-start-btn">
                  <GraduationCap className="w-5 h-5" />
                  Começar Agora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/o-que-aprende">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  O que Aprendo
                </Button>
              </Link>
              <Link to="/como-funciona">
                <Button size="lg" variant="outline" className="gap-2">
                  <Zap className="w-5 h-5" />
                  Como Funciona
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </section>

        {/* Access Areas */}
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">Acesso ao Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accessAreas.map((area) => (
              <Link key={area.path + area.title} to={area.path}>
                <Card className="card-hover h-full cursor-pointer border-2 hover:border-primary/50">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl ${area.color} text-white flex items-center justify-center`}>
                      <area.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{area.title}</h3>
                      <p className="text-muted-foreground">{area.description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Main Actions */}
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="card-hover h-full cursor-pointer" data-testid={action.testId}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${action.color} text-white flex items-center justify-center mb-4`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">{action.title}</h3>
                    <p className="text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Logistics Operations */}
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">Operações Logísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {logisticsOperations.map((op) => (
              <Card key={op.name} className="bg-muted/30">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <op.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">{op.name}</h3>
                    <p className="text-sm text-muted-foreground">{op.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/historico">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 text-center">
                  <History className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Ver Histórico</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/materiais">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Materiais</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/o-que-aprende">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">O que Aprendo</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/como-funciona">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Como Funciona</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Stats Preview */}
        {estatisticas && (
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Estatísticas do Sistema</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-mono text-3xl font-bold text-primary">
                    {estatisticas.total_leituras || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Atividades Realizadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-mono text-3xl font-bold text-primary">
                    {estatisticas.total_materiais || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Materiais Cadastrados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-mono text-3xl font-bold text-primary">
                    {estatisticas.total_alunos || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Alunos Cadastrados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-mono text-3xl font-bold text-primary">
                    {estatisticas.media_aproveitamento || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Média Aproveitamento</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Logi3A Soluções - Sistema Educacional de Logística
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Escola Estadual Professora Elídia Tedesco de Oliveira
          </p>
        </div>
      </footer>
    </div>
  );
}
