import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  QrCode,
  Scan,
  Package,
  Truck,
  Warehouse,
  Box,
  RotateCcw,
  Tag,
  Brain,
  Target,
  Clock,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Zap,
  TrendingUp,
  Code,
  Eye,
  Database,
  Route,
  Settings,
  Search,
  BarChart,
} from "lucide-react";

const learningTopics = [
  {
    icon: QrCode,
    title: "QR Code e Código de Barras",
    description: "Entenda o que são e para que servem",
    items: [
      "O que é QR Code e código de barras",
      "Diferenças entre os tipos de códigos",
      "Por que são usados na logística",
      "Vantagens da identificação automática"
    ]
  },
  {
    icon: Scan,
    title: "Leitura Óptica",
    description: "Como funciona a leitura de códigos",
    items: [
      "Como funciona um scanner/leitor",
      "Captura de imagem pela câmera",
      "Decodificação da informação",
      "Transmissão de dados para sistemas"
    ]
  },
  {
    icon: Database,
    title: "Transformação em Dados Digitais",
    description: "De produto físico para informação digital",
    items: [
      "Como um produto vira dados digitais",
      "Estrutura de informação logística",
      "Campos: produto, código, setor, quantidade",
      "Codificação e armazenamento de dados"
    ]
  },
  {
    icon: Code,
    title: "Geração de QR Code",
    description: "Como os dados viram um QR Code",
    items: [
      "Conversão de texto em código visual",
      "Estrutura do QR Code",
      "Níveis de correção de erro",
      "Impressão e aplicação em etiquetas"
    ]
  },
  {
    icon: Eye,
    title: "Leitura por Sistemas Logísticos",
    description: "Como os sistemas leem e usam os códigos",
    items: [
      "Leitura automática em esteiras",
      "Portais de leitura em docas",
      "Coletores de dados portáteis",
      "Integração com sistemas WMS/ERP"
    ]
  },
  {
    icon: Tag,
    title: "Identificação de Materiais",
    description: "Reconhecer e classificar itens",
    items: [
      "Identificar produto pelo código",
      "Verificar quantidade em estoque",
      "Localizar setor de armazenamento",
      "Confirmar tipo de operação"
    ]
  },
];

const interpretationSkills = [
  { label: "Produto", description: "Nome e descrição do item", icon: Package },
  { label: "Código", description: "Identificador único", icon: QrCode },
  { label: "Setor", description: "Localização no CD", icon: Warehouse },
  { label: "Quantidade", description: "Volume disponível", icon: BarChart },
  { label: "Operação", description: "Tipo de movimentação", icon: Settings },
];

const logisticsFlow = [
  {
    icon: Truck,
    title: "Recebimento",
    description: "Entrada de mercadorias",
    details: "Conferência, descarga e registro de entrada de produtos no centro de distribuição",
    color: "bg-blue-500"
  },
  {
    icon: Warehouse,
    title: "Estoque",
    description: "Armazenamento",
    details: "Guarda organizada dos produtos em endereços específicos do armazém",
    color: "bg-green-500"
  },
  {
    icon: Box,
    title: "Expedição",
    description: "Saída de produtos",
    details: "Separação, embalagem e envio de pedidos para os clientes",
    color: "bg-orange-500"
  },
  {
    icon: RotateCcw,
    title: "Devolução",
    description: "Logística reversa",
    details: "Retorno de produtos por defeito, arrependimento ou troca",
    color: "bg-purple-500"
  },
];

const concepts = [
  {
    icon: Route,
    title: "Rastreabilidade",
    description: "Capacidade de acompanhar um produto em toda a cadeia logística, desde a origem até o destino final",
  },
  {
    icon: Warehouse,
    title: "Organização Logística",
    description: "Estruturação de processos para movimentar produtos de forma eficiente e ordenada",
  },
  {
    icon: Zap,
    title: "Digitalização",
    description: "Transformação de informações físicas em dados digitais para processamento por sistemas",
  },
  {
    icon: Settings,
    title: "Automação",
    description: "Uso de tecnologia para executar tarefas repetitivas de forma automática e precisa",
  },
];

const skills = [
  { 
    icon: Target, 
    title: "Atenção", 
    description: "Foco nos detalhes para leitura precisa e identificação correta de materiais" 
  },
  { 
    icon: Brain, 
    title: "Raciocínio Lógico", 
    description: "Análise de dados e tomada de decisões baseadas em informações" 
  },
  { 
    icon: Search, 
    title: "Interpretação de Dados", 
    description: "Compreender e extrair significado das informações decodificadas" 
  },
  { 
    icon: Lightbulb, 
    title: "Tomada de Decisão", 
    description: "Escolher a operação logística correta com base nos dados" 
  },
  { 
    icon: TrendingUp, 
    title: "Visão Prática", 
    description: "Aplicação real dos conceitos de logística no dia a dia" 
  },
  { 
    icon: Clock, 
    title: "Agilidade", 
    description: "Executar tarefas com rapidez e eficiência" 
  },
];

export default function OQueAprende() {
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
            <h1 className="font-heading text-xl font-bold">O que o Aluno Aprende</h1>
            <p className="text-sm text-muted-foreground">Conteúdo educacional do sistema</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary">
            <BookOpen className="w-3 h-3 mr-1" />
            Conteúdo Educacional
          </Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Aprenda Logística na Prática
          </h2>
          <p className="text-muted-foreground text-lg">
            Este sistema ensina, de forma visual e interativa, como funciona a 
            identificação e rastreamento de materiais em centros de distribuição.
          </p>
        </div>

        {/* Learning Topics Grid */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">O que você vai aprender</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTopics.map((topic, index) => (
              <Card key={index} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <topic.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interpretation Skills */}
        <section className="bg-muted/30 rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-2 text-center">
            Interpretação de Dados Logísticos
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            Aprenda a interpretar cada campo de informação:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {interpretationSkills.map((skill, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <skill.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-heading font-bold">{skill.label}</h4>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Logistics Flow */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-2">Fluxo Logístico</h3>
          <p className="text-muted-foreground mb-6">
            Entenda como funciona cada etapa do processo logístico:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {logisticsFlow.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 ${step.color}`} />
                <CardContent className="p-5">
                  <div className={`w-14 h-14 rounded-xl ${step.color} text-white flex items-center justify-center mb-3`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm font-medium text-primary mb-2">{step.description}</p>
                  <p className="text-xs text-muted-foreground">{step.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Conceitos Importantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((concept, index) => (
              <Card key={index} className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <concept.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-lg mb-1">{concept.title}</h4>
                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills Developed */}
        <section className="bg-gradient-to-br from-primary-50 to-background rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-2 text-center">
            Habilidades Desenvolvidas
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            O sistema também ajuda a desenvolver competências importantes:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {skills.map((skill, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <skill.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-heading font-bold text-sm mb-1">{skill.title}</h4>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Transformation Flow */}
        <section className="bg-secondary text-secondary-foreground rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-6 text-center">
            Transformação: Do Produto ao Código Digital
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Produto Físico</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Dados Digitais</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <QrCode className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">QR Code</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Scan className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Leitura</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Interpretação</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Ação Logística</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Pronto para colocar em prática o que aprendeu?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/scanner-qr">
              <Button size="lg" className="gap-2">
                <Scan className="w-5 h-5" />
                Começar a Praticar
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button size="lg" variant="outline" className="gap-2">
                <Zap className="w-5 h-5" />
                Ver Como Funciona
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
