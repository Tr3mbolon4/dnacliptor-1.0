import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Scan,
  QrCode,
  Package,
  TrendingUp,
  Calendar,
  Zap,
  BarChart3,
  PieChartIcon,
} from "lucide-react";

const COLORS = ["#0052CC", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Dashboard() {
  const {
    estatisticas,
    fetchEstatisticas,
    fetchLeituras,
    leituras,
    materiais,
    loading,
  } = useApp();

  useEffect(() => {
    fetchEstatisticas();
    fetchLeituras();
  }, [fetchEstatisticas, fetchLeituras]);

  const operacoesData = estatisticas?.leituras_por_operacao
    ? Object.entries(estatisticas.leituras_por_operacao).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const setoresData = estatisticas?.leituras_por_setor
    ? Object.entries(estatisticas.leituras_por_setor).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const tipoLeituraData = [
    { name: "QR Code", value: estatisticas?.leituras_qrcode || 0 },
    { name: "Código de Barras", value: estatisticas?.leituras_barcode || 0 },
  ];

  const stats = [
    {
      title: "Total de Leituras",
      value: estatisticas?.total_leituras || 0,
      icon: Scan,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "QR Codes Lidos",
      value: estatisticas?.leituras_qrcode || 0,
      icon: QrCode,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Códigos de Barras",
      value: estatisticas?.leituras_barcode || 0,
      icon: BarChart3,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Materiais Cadastrados",
      value: estatisticas?.total_materiais || materiais.length,
      icon: Package,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Leituras Hoje",
      value: estatisticas?.leituras_hoje || 0,
      icon: Calendar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Pontuação Total",
      value: estatisticas?.pontuacao_total || 0,
      icon: Zap,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <CardTitle className="font-heading text-xl">Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Estatísticas e relatórios do sistema
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="font-mono text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading text-lg">
                Leituras por Operação
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {operacoesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operacoesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0052CC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Type Distribution Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading text-lg">
                Distribuição por Tipo
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {tipoLeituraData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tipoLeituraData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tipoLeituraData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sectors Chart */}
      {setoresData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading text-lg">
                Leituras por Setor
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={setoresData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Atividade Recente
            </CardTitle>
            <Link to="/historico">
              <Button variant="ghost" size="sm">
                Ver tudo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {leituras.length > 0 ? (
            <div className="space-y-3">
              {leituras.slice(0, 5).map((leitura) => (
                <div
                  key={leitura.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {leitura.tipo_leitura === "qrcode" ? (
                        <Scan className="w-4 h-4 text-primary" />
                      ) : (
                        <QrCode className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{leitura.produto}</p>
                      <p className="text-xs text-muted-foreground">
                        {leitura.codigo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{leitura.tipo_operacao}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
