import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  LogIn,
  ListChecks,
  Package,
  QrCode,
  Scan,
  Eye,
  CheckSquare,
  Trophy,
  BarChart3,
  User,
  GraduationCap,
  Clock,
  Target,
  Zap,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: LogIn,
    title: "Fazer Login",
    description: "O aluno acessa o sistema com seu nome, turma e senha",
    color: "bg-blue-500",
  },
  {
    number: 2,
    icon: ListChecks,
    title: "Escolher Atividade",
    description: "Seleciona uma atividade logística para praticar",
    color: "bg-purple-500",
  },
  {
    number: 3,
    icon: Package,
    title: "Visualizar Material",
    description: "Pode cadastrar ou visualizar um material existente",
    color: "bg-green-500",
  },
  {
    number: 4,
    icon: QrCode,
    title: "Gerar QR Code",
    description: "Pode gerar um QR Code logístico para o material",
    color: "bg-orange-500",
  },
  {
    number: 5,
    icon: Scan,
    title: "Escanear Código",
    description: "Usa a câmera para escanear QR Code ou código de barras",
    color: "bg-pink-500",
  },
  {
    number: 6,
    icon: Eye,
    title: "Ver Informações",
    description: "O sistema decodifica e mostra as informações logísticas",
    color: "bg-cyan-500",
  },
  {
    number: 7,
    icon: CheckSquare,
    title: "Confirmar Operação",
    description: "Escolhe ou confirma a operação logística correta",
    color: "bg-indigo-500",
  },
  {
    number: 8,
    icon: Trophy,
    title: "Ver Resultado",
    description: "Sistema registra tempo, acerto/erro e pontuação",
    color: "bg-amber-500",
  },
];

const scoringRules = [
  { action: "Leitura correta", points: "+10", type: "positive" },
  { action: "Operação correta", points: "+15", type: "positive" },
  { action: "Atividade concluída", points: "+20", type: "positive" },
  { action: "Tempo até 30 segundos", points: "+10", type: "positive" },
  { action: "Tempo 31-60 segundos", points: "+7", type: "positive" },
  { action: "Tempo 61-120 segundos", points: "+4", type: "positive" },
  { action: "Tempo acima de 120s", points: "+2", type: "neutral" },
  { action: "3 acertos seguidos", points: "+10 bônus", type: "bonus" },
  { action: "Erro de leitura", points: "-2", type: "negative" },
  { action: "Operação errada", points: "-5", type: "negative" },
];

const classifications = [
  { name: "Excelente", range: "90% ou mais", color: "text-success" },
  { name: "Bom", range: "70% a 89%", color: "text-primary" },
  { name: "Regular", range: "50% a 69%", color: "text-warning" },
  { name: "Precisa melhorar", range: "Abaixo de 50%", color: "text-destructive" },
];

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/aluno">
            <Button variant="ghost" size="icon" data-testid="back-button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold">Como Funciona</h1>
            <p className="text-sm text-muted-foreground">Fluxo de interação do aluno</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary">
            <GraduationCap className="w-3 h-3 mr-1" />
            Guia de Uso
          </Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Interação do Aluno com o Sistema
          </h2>
          <p className="text-muted-foreground text-lg">
            Entenda como funciona o fluxo completo de aprendizado, desde o login 
            até o acompanhamento de desempenho.
          </p>
        </div>

        {/* Steps */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Passo a Passo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <Card key={step.number} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${step.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.color} text-white flex items-center justify-center shrink-0`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Passo {step.number}
                      </Badge>
                      <h4 className="font-heading font-bold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-muted-foreground/30 hidden lg:block" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Flow Visualization */}
        <section className="bg-muted/50 rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-6 text-center">
            Fluxo de Transformação
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Card className="w-40">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Informação Logística</p>
              </CardContent>
            </Card>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <Card className="w-40">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Codificação Digital</p>
              </CardContent>
            </Card>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <Card className="w-40">
              <CardContent className="p-4 text-center">
                <QrCode className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">QR Code</p>
              </CardContent>
            </Card>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <Card className="w-40">
              <CardContent className="p-4 text-center">
                <Scan className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Leitura</p>
              </CardContent>
            </Card>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <Card className="w-40">
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Interpretação</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Scoring System */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Sistema de Pontuação</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Regras de Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scoringRules.map((rule, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        rule.type === "positive" ? "bg-success/5" :
                        rule.type === "bonus" ? "bg-warning/5" :
                        rule.type === "negative" ? "bg-destructive/5" :
                        "bg-muted/50"
                      }`}
                    >
                      <span className="text-sm">{rule.action}</span>
                      <Badge
                        variant="outline"
                        className={
                          rule.type === "positive" ? "border-success text-success" :
                          rule.type === "bonus" ? "border-warning text-warning" :
                          rule.type === "negative" ? "border-destructive text-destructive" :
                          ""
                        }
                      >
                        {rule.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Classificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {classifications.map((cls, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className={`font-heading font-bold ${cls.color}`}>{cls.name}</span>
                      <span className="text-sm text-muted-foreground">{cls.range}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Métricas Acompanhadas
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Percentual de aproveitamento</li>
                    <li>• Tempo médio por atividade</li>
                    <li>• Total de atividades concluídas</li>
                    <li>• Total de acertos e erros</li>
                    <li>• Evolução ao longo do tempo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Roles */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Papéis no Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Aluno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Scan className="w-4 h-4 text-primary" />
                    Realiza leituras de QR Code e código de barras
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-primary" />
                    Gera QR Codes logísticos
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-primary" />
                    Cadastra e visualiza materiais
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-primary" />
                    Acompanha pontuação e desempenho
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    Recebe feedback pedagógico
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  Professor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-secondary" />
                    Visualiza estatísticas da turma
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-secondary" />
                    Acompanha ranking de desempenho
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-secondary" />
                    Monitora evolução individual
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-secondary" />
                    Gerencia materiais cadastrados
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-secondary" />
                    Exporta relatórios (PDF/CSV)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link to="/scanner-qr">
            <Button size="lg" className="gap-2">
              <Scan className="w-5 h-5" />
              Começar Agora
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
