import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Scan,
  QrCode,
  History,
  Package,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogOut,
  Sparkles,
  BookOpen,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function PainelAluno() {
  const navigate = useNavigate();
  const { user, logout, fetchMateriais, fetchAtividades, fetchFeedback, seedDemoData } = useApp();
  const [feedback, setFeedback] = useState({ feedbacks: [], aproveitamento: 0, tempo_medio: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      await seedDemoData();
      await fetchMateriais();
      const atividades = await fetchAtividades({ usuario_id: user.id });
      setRecentActivities(atividades.slice(0, 5));
      
      const fb = await fetchFeedback(user.id);
      setFeedback(fb);
    };
    
    loadData();
  }, [user, navigate, fetchMateriais, fetchAtividades, fetchFeedback, seedDemoData]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getClassificacaoColor = (classificacao) => {
    switch (classificacao) {
      case "Excelente": return "text-success";
      case "Bom": return "text-primary";
      case "Regular": return "text-warning";
      default: return "text-destructive";
    }
  };

  const mainActions = [
    {
      title: "Ler QR Code",
      description: "Escaneie QR Codes logísticos",
      icon: Scan,
      path: "/scanner-qr",
      color: "bg-primary",
    },
    {
      title: "Ler Código de Barras",
      description: "Escaneie códigos de barras",
      icon: QrCode,
      path: "/scanner-barcode",
      color: "bg-secondary",
    },
    {
      title: "Gerador de QR Code",
      description: "Crie QR Codes logísticos",
      icon: Package,
      path: "/gerador-qr",
      color: "bg-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="painel-aluno">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold">Logi3A Soluções</h1>
              <p className="text-xs text-muted-foreground">Área do Aluno</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm">{user.nome}</p>
              <p className="text-xs text-muted-foreground">{user.turma}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-primary/10 text-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {user.classificacao || "Iniciante"}
                </Badge>
                <h2 className="font-heading text-2xl font-bold">
                  Olá, {user.nome.split(" ")[0]}!
                </h2>
                <p className="text-muted-foreground">
                  Continue praticando para melhorar seu desempenho.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/como-funciona">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Como Funciona
                  </Button>
                </Link>
                <Link to="/o-que-aprende">
                  <Button variant="outline" className="gap-2">
                    <Zap className="w-4 h-4" />
                    O que Aprendo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{user.pontuacao_total}</p>
                  <p className="text-xs text-muted-foreground">Pontuação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{user.aproveitamento}%</p>
                  <p className="text-xs text-muted-foreground">Aproveitamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{user.atividades_concluidas}</p>
                  <p className="text-xs text-muted-foreground">Atividades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{user.tempo_medio}s</p>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Meu Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classification */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className={`font-heading text-3xl font-bold ${getClassificacaoColor(user.classificacao)}`}>
                  {user.classificacao || "Iniciante"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Classificação Atual</p>
              </div>

              {/* Acertos vs Erros */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Acertos: {user.acertos}
                  </span>
                  <span className="text-sm flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-destructive" />
                    Erros: {user.erros}
                  </span>
                </div>
                <Progress value={user.aproveitamento} className="h-3" />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {user.aproveitamento}% de aproveitamento
                </p>
              </div>

              {/* Time */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="font-mono text-3xl font-bold text-primary">
                  {Math.floor(user.tempo_total / 60)}:{String(user.tempo_total % 60).padStart(2, "0")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Tempo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Card */}
        {feedback.feedbacks.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Feedback Pedagógico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.feedbacks.map((fb, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-sm">{fb}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <section>
          <h3 className="font-heading text-xl font-bold mb-4">Atividades</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mainActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="card-hover h-full cursor-pointer" data-testid={`action-${action.path.slice(1)}`}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${action.color} text-white flex items-center justify-center mb-4`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-heading text-lg font-bold mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/historico">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Histórico</p>
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
          <Link to="/como-funciona">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Como Funciona</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/o-que-aprende">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">O que Aprendo</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                <Link to="/historico">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver tudo <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivities.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        atividade.acerto ? "bg-success/10" : "bg-destructive/10"
                      }`}>
                        {atividade.acerto ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{atividade.produto}</p>
                        <p className="text-xs text-muted-foreground">{atividade.operacao_escolhida}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      +{atividade.pontuacao}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
