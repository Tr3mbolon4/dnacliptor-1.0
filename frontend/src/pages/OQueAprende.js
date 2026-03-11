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
} from "lucide-react";

const learningTopics = [
  {
    icon: QrCode,
    title: "QR Code e Código de Barras",
    description: "Entenda o que são códigos de identificação e como são utilizados na indústria",
    items: [
      "O que é QR Code e código de barras",
      "Diferenças entre os tipos de códigos",
      "Como as informações são codificadas",
      "Aplicações práticas na logística"
    ]
  },
  {
    icon: Scan,
    title: "Leitura Óptica",
    description: "Aprenda como funciona o processo de leitura e decodificação de códigos",
    items: [
      "Como funciona um scanner/leitor",
      "Processo de captura de imagem",
      "Decodificação da informação",
      "Transmissão de dados para sistemas"
    ]
  },
  {
    icon: Code,
    title: "Codificação Digital",
    description: "Entenda como um produto é transformado em informação digital",
    items: [
      "Estrutura de dados logísticos",
      "Conversão de informação em código",
      "Geração de QR Code",
      "Rastreabilidade digital"
    ]
  },
  {
    icon: Package,
    title: "Identificação de Materiais",
    description: "Aprenda a identificar e classificar materiais em processos logísticos",
    items: [
      "Código do produto",
      "Setor de localização",
      "Quantidade em estoque",
      "Tipo de operação"
    ]
  },
];

const logisticsOperations = [
  {
    icon: Truck,
    title: "Recebimento",
    description: "Entrada de mercadorias no centro de distribuição",
    color: "bg-blue-500"
  },
  {
    icon: Warehouse,
    title: "Entrada em Estoque",
    description: "Armazenamento e organização de produtos",
    color: "bg-green-500"
  },
  {
    icon: Box,
    title: "Expedição",
    description: "Preparação e envio de pedidos",
    color: "bg-orange-500"
  },
  {
    icon: RotateCcw,
    title: "Logística Reversa",
    description: "Devolução e retorno de produtos",
    color: "bg-purple-500"
  },
  {
    icon: Tag,
    title: "Identificação",
    description: "Reconhecimento e classificação de itens",
    color: "bg-pink-500"
  },
];

const skills = [
  { icon: Brain, title: "Raciocínio Lógico", description: "Análise e interpretação de dados" },
  { icon: Target, title: "Atenção", description: "Foco nos detalhes e precisão" },
  { icon: Clock, title: "Agilidade", description: "Tomada de decisão rápida" },
  { icon: Lightbulb, title: "Visão Prática", description: "Aplicação real da logística" },
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
            <p className="text-sm text-muted-foreground">Competências desenvolvidas no sistema</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
            Este sistema foi desenvolvido para ensinar, de forma visual e interativa, 
            como funcionam os processos de leitura e identificação de materiais 
            em centros de distribuição e logística.
          </p>
        </div>

        {/* Learning Topics */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">O que você vai aprender</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Logistics Operations */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Operações Logísticas</h3>
          <p className="text-muted-foreground mb-6">
            Aprenda como funciona o fluxo logístico completo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {logisticsOperations.map((op, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${op.color} text-white flex items-center justify-center mx-auto mb-3`}>
                    <op.icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold mb-1">{op.title}</h4>
                  <p className="text-xs text-muted-foreground">{op.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills Developed */}
        <section>
          <h3 className="font-heading text-2xl font-bold mb-6">Habilidades Desenvolvidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <Card key={index} className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <skill.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h4 className="font-heading font-bold mb-1">{skill.title}</h4>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section className="bg-muted/50 rounded-2xl p-8">
          <h3 className="font-heading text-2xl font-bold mb-6 text-center">
            Conceitos Importantes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading font-bold mb-2">Rastreabilidade</h4>
              <p className="text-sm text-muted-foreground">
                Capacidade de acompanhar um produto em toda a cadeia logística
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading font-bold mb-2">Automação</h4>
              <p className="text-sm text-muted-foreground">
                Uso de tecnologia para agilizar processos logísticos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading font-bold mb-2">Digitalização</h4>
              <p className="text-sm text-muted-foreground">
                Transformação de informações físicas em dados digitais
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link to="/scanner-qr">
            <Button size="lg" className="gap-2">
              <Scan className="w-5 h-5" />
              Começar a Praticar
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
