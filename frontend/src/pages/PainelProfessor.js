import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
} from "recharts";
import {
  Users,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  LogOut,
  Package,
  History,
  BarChart3,
  PieChartIcon,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { formatDateTime, exportToCSV } from "../lib/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const COLORS = ["#0052CC", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function PainelProfessor() {
  const navigate = useNavigate();
  const { user, logout, fetchEstatisticas, fetchTurmas, fetchAlunos, fetchAtividades, estatisticas, turmas, seedDemoData } = useApp();
  
  const [selectedTurma, setSelectedTurma] = useState("all");
  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.tipo !== "professor") {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await seedDemoData();
      await fetchEstatisticas();
      await fetchTurmas();
      const alunosData = await fetchAlunos();
      setAlunos(alunosData);
      const atividadesData = await fetchAtividades({});
      setAtividades(atividadesData);
      setLoading(false);
    };
    
    loadData();
  }, [user, navigate, fetchEstatisticas, fetchTurmas, fetchAlunos, fetchAtividades, seedDemoData]);

  useEffect(() => {
    const loadFilteredData = async () => {
      if (selectedTurma === "all") {
        const alunosData = await fetchAlunos();
        setAlunos(alunosData);
        const atividadesData = await fetchAtividades({});
        setAtividades(atividadesData);
      } else {
        const alunosData = await fetchAlunos(selectedTurma);
        setAlunos(alunosData);
        const atividadesData = await fetchAtividades({ turma: selectedTurma });
        setAtividades(atividadesData);
      }
    };
    
    if (selectedTurma) {
      loadFilteredData();
    }
  }, [selectedTurma, fetchAlunos, fetchAtividades]);

  if (!user || user.tipo !== "professor") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Prepare chart data
  const operacoesData = estatisticas?.leituras_por_operacao
    ? Object.entries(estatisticas.leituras_por_operacao).map(([name, value]) => ({ name, value }))
    : [];

  const acertosErrosData = [
    { name: "Acertos", value: estatisticas?.acertos_total || 0 },
    { name: "Erros", value: estatisticas?.erros_total || 0 },
  ];

  // Ranking
  const ranking = [...alunos].sort((a, b) => b.pontuacao_total - a.pontuacao_total).slice(0, 10);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 82, 204);
    doc.text("Logi3A Soluções - Relatório do Professor", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${formatDateTime(new Date())}`, 14, 28);
    doc.text(`Turma: ${selectedTurma === "all" ? "Todas" : selectedTurma}`, 14, 34);

    // Stats
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total de Alunos: ${alunos.length}`, 14, 45);
    doc.text(`Total de Atividades: ${estatisticas?.total_atividades || 0}`, 14, 52);
    doc.text(`Média de Aproveitamento: ${estatisticas?.media_aproveitamento || 0}%`, 14, 59);

    // Ranking table
    const tableData = ranking.map((aluno, index) => [
      index + 1,
      aluno.nome,
      aluno.turma,
      aluno.pontuacao_total,
      `${aluno.aproveitamento}%`,
      aluno.atividades_concluidas,
      aluno.classificacao
    ]);

    doc.autoTable({
      startY: 70,
      head: [["#", "Nome", "Turma", "Pontuação", "Aproveit.", "Atividades", "Classificação"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [0, 82, 204] },
      styles: { fontSize: 8 },
    });

    doc.save(`relatorio_professor_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExportCSV = () => {
    const dataToExport = alunos.map((a) => ({
      Nome: a.nome,
      Turma: a.turma,
      Pontuação: a.pontuacao_total,
      "Aproveitamento (%)": a.aproveitamento,
      Acertos: a.acertos,
      Erros: a.erros,
      "Atividades Concluídas": a.atividades_concluidas,
      "Tempo Médio (s)": a.tempo_medio,
      Classificação: a.classificacao,
    }));
    exportToCSV(dataToExport, "relatorio_alunos");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="painel-professor">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold">Logi3A Soluções</h1>
              <p className="text-xs text-muted-foreground">Painel do Professor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm">{user.nome}</p>
              <Badge variant="outline">Professor</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-[180px]" data-testid="filter-turma">
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map((t) => (
                  <SelectItem key={t.turma} value={t.turma}>
                    {t.turma} ({t.alunos} alunos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                fetchEstatisticas();
                fetchAlunos(selectedTurma === "all" ? null : selectedTurma);
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2" data-testid="export-csv-btn">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2" data-testid="export-pdf-btn">
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{alunos.length}</p>
                  <p className="text-xs text-muted-foreground">Alunos</p>
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
                  <p className="font-mono text-2xl font-bold">{estatisticas?.media_aproveitamento || 0}%</p>
                  <p className="text-xs text-muted-foreground">Média Aproveit.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">{estatisticas?.total_atividades || 0}</p>
                  <p className="text-xs text-muted-foreground">Atividades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold">
                    {estatisticas?.acertos_total || 0}/{(estatisticas?.acertos_total || 0) + (estatisticas?.erros_total || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Atividades por Operação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {operacoesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={operacoesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0052CC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acertos vs Erros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Acertos vs Erros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acertosErrosData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={acertosErrosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Ranking de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead className="text-center">Pontuação</TableHead>
                    <TableHead className="text-center">Aproveit.</TableHead>
                    <TableHead className="text-center">Atividades</TableHead>
                    <TableHead>Classificação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((aluno, index) => (
                    <TableRow key={aluno.id}>
                      <TableCell>
                        {index === 0 ? (
                          <Trophy className="w-5 h-5 text-warning" />
                        ) : index === 1 ? (
                          <Trophy className="w-5 h-5 text-gray-400" />
                        ) : index === 2 ? (
                          <Trophy className="w-5 h-5 text-amber-600" />
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{aluno.turma}</TableCell>
                      <TableCell className="text-center font-mono">{aluno.pontuacao_total}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={aluno.aproveitamento} className="w-16 h-2" />
                          <span className="text-xs">{aluno.aproveitamento}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{aluno.atividades_concluidas}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            aluno.classificacao === "Excelente" ? "border-success text-success" :
                            aluno.classificacao === "Bom" ? "border-primary text-primary" :
                            aluno.classificacao === "Regular" ? "border-warning text-warning" :
                            "border-destructive text-destructive"
                          }
                        >
                          {aluno.classificacao}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum aluno encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/produtos">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Gerenciar Produtos</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/historico">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Ver Histórico</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/gerador-qr">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Gerador QR Code</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/scanner-qr">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Testar Scanner</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
