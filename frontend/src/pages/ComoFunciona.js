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
  Database,
  Settings,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";

const interactionSteps = [
  {
    number: 1,
    icon: LogIn,
    title: "Fazer Login",
    description: "O aluno acessa o sistema com seu nome, turma e senha",
    color: "bg-blue-500",
    detail: "Identificação para registro de desempenho"
  },
  {
    number: 2,
    icon: ListChecks,
    title: "Escolher Atividade",
    description: "Seleciona uma atividade logística para praticar",
    color: "bg-purple-500",
    detail: "Recebimento, Estoque, Expedição ou Devolução"
  },
  {
    number: 3,
    icon: Package,
    title: "Cadastrar ou Visualizar Material",
    description: "Pode cadastrar um novo produto ou usar um material de exemplo",
    color: "bg-green-500",
    detail: "10 materiais de demonstração disponíveis"
  },
  {
    number: 4,
    icon: QrCode,
    title: "Gerar QR Code Logístico",
    description: "Cria um QR Code com as informações do material",
    color: "bg-orange-500",
    detail: "Produto, código, setor, quantidade e operação"
  },
  {
    number: 5,
    icon: Scan,
    title: "Escanear o Código",
    description: "Usa a câmera para escanear QR Code ou código de barras",
    color: "bg-pink-500",
    detail: "Câmera traseira do celular é usada automaticamente"
  },
  {
    number: 6,
    icon: Eye,
    title: "Ver Informações Decodificadas",
    description: "O sistema mostra as informações logísticas na tela",
    color: "bg-cyan-500",
    detail: "Cards organizados com todos os dados"
  },
  {
    number: 7,
    icon: Database,
    title: "Interpretar os Dados",
    description: "O aluno analisa e compreende as informações",
    color: "bg-indigo-500",
    detail: "Produto, código, setor, quantidade"
  },
  {
    number: 8,
    icon: CheckSquare,
    title: "Selecionar a Operação Logística",
    description: "Escolhe ou confirma a operação correta",
    color: "bg-teal-500",
    detail: "Validação do conhecimento"
  },
  {
    number: 9,
    icon: Trophy,
    title: "Ver Resultado e Pontuação",
    description: "Sistema registra tempo, acerto/erro e pontuação",
    color: "bg-amber-500",
    detail: "Feedback imediato do desempenho"
  },
  {
    number: 10,
    icon: BarChart3,
    title: "Professor Acompanha",
    description: "O professor visualiza a evolução do aluno",
    color: "bg-rose-500",
    detail: "Relatórios, ranking e estatísticas"
  },
];

const scoringRules = [
  { action: "Leitura correta", points: "+10", icon: Scan, type: "positive" },
  { action: "Operação correta", points: "+15", icon: CheckCircle2, type: "positive" },
  { action: "Atividade concluída", points: "+20", icon: Trophy, type: "positive" },
  { action: "Tempo até 30 segundos", points: "+10", icon: Timer, type: "positive" },
  { action: "Tempo 31-60 segundos", points: "+7", icon: Timer, type: "positive" },
  { action: "Tempo 61-120 segundos", points: "+4", icon: Timer, type: "neutral" },
  { action: "Tempo acima de 120s", points: "+2", icon: Timer, type: "neutral" },
  { action: "3 acertos seguidos", points: "+10 bônus", icon: Zap, type: "bonus" },
  { action: "Operação errada", points: "-5", icon: XCircle, type: "negative" },
];

const classifications = [
  { name: "Excelente", range: "90% ou mais", color: "bg-success text-white", description: "Domínio completo" },
  { name: "Bom", range: "70% a 89%", color: "bg-primary text-white", description: "Bom progresso" },
  { name: "Regular", range: "50% a 69%", color: "bg-warning text-white", description: "Em desenvolvimento" },
  { name: "Precisa melhorar", range: "Abaixo de 50%", color: "bg-destructive text-white", description: "Requer prática" },
];

const metrics = [
  "Percentual de aproveitamento",
  "Tempo médio por atividade",
  "Total de atividades concluídas",
  "Total de acertos e erros",
  "Sequência de acertos",
  "Evolução ao longo do tempo",
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
            <h1 className="font-heading text-xl font-bold">Como Funciona a Interação</h1>
            <p className="text-sm text-muted-foreground">Fluxo completo de aprendizado</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary">
            <GraduationCap className="w-3 h-3 mr-1" />
            Guia de Interação
          </Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Interação do Aluno com o Sistema
          </h2>
          <p className="text-muted-foreground text-lg">
            Entenda o fluxo completo que ajuda o aluno a compreender a transformação 
            de informação logística em código digital e sua aplicação real.
          </p>
        </div>

        {/* 10 Steps */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Os 10 Passos da Interação</h3>
          <div className="space-y-4">
            {interactionSteps.map((step, index) => (
              <Card key={step.number} className="overflow-hidden">
                <div className="flex items-stretch">
                  <div className={`w-2 ${step.color}`} />
                  <CardContent className="flex-1 p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${step.color} text-white flex items-center justify-center shrink-0`}>
                      <step.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Passo {step.number}</Badge>
                        <h4 className="font-heading font-bold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs text-primary mt-1">{step.detail}</p>
                    </div>
                    {index < interactionSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground/30 hidden md:block" />
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Transformation Flow Visual */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-6 text-center">
            Transformação: Informação → Código → Ação
          </h3>
          <p className="text-center text-white/80 mb-6">
            Este fluxo demonstra como uma informação logística é transformada em código digital 
            e depois usada em processos reais de logística
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Informação Logística</p>
              <p className="text-xs text-white/60">Produto, setor, qtd</p>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <Database className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Codificação Digital</p>
              <p className="text-xs text-white/60">Estrutura de dados</p>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <QrCode className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">QR Code</p>
              <p className="text-xs text-white/60">Código visual</p>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <Scan className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Leitura</p>
              <p className="text-xs text-white/60">Decodificação</p>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Interpretação</p>
              <p className="text-xs text-white/60">Análise dos dados</p>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
              <Settings className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Ação Logística</p>
              <p className="text-xs text-white/60">Operação real</p>
            </div>
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
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        rule.type === "positive" ? "bg-success/5" :
                        rule.type === "bonus" ? "bg-warning/5" :
                        rule.type === "negative" ? "bg-destructive/5" :
                        "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <rule.icon className={`w-4 h-4 ${
                          rule.type === "positive" ? "text-success" :
                          rule.type === "bonus" ? "text-warning" :
                          rule.type === "negative" ? "text-destructive" :
                          "text-muted-foreground"
                        }`} />
                        <span className="text-sm">{rule.action}</span>
                      </div>
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

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Classificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classifications.map((cls, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge className={cls.color}>{cls.name}</Badge>
                          <span className="text-xs text-muted-foreground">{cls.description}</span>
                        </div>
                        <span className="text-sm font-mono">{cls.range}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Métricas Acompanhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {metrics.map((metric, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Papéis no Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Aluno
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Realiza leituras de QR Code e código de barras</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Gera QR Codes logísticos para materiais</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Cadastra e visualiza materiais</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Interpreta dados e seleciona operações</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Acompanha pontuação e desempenho</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Recebe feedback pedagógico personalizado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardHeader className="bg-secondary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  Professor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Visualiza estatísticas gerais e por turma</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Acompanha ranking de desempenho</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Monitora evolução individual de cada aluno</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Gerencia materiais cadastrados</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Exporta relatórios em PDF e CSV</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                    <span>Filtra dados por turma e período</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Pronto para começar sua jornada de aprendizado?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/scanner-qr">
              <Button size="lg" className="gap-2">
                <Scan className="w-5 h-5" />
                Começar Agora
              </Button>
            </Link>
            <Link to="/o-que-aprende">
              <Button size="lg" variant="outline" className="gap-2">
                <Zap className="w-5 h-5" />
                Ver O que Aprendo
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
