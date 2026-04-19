import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Scanner } from "../components/Scanner";
import {
  playSuccessSound,
  calculatePoints,
  formatDateTime,
} from "../lib/utils";
import {
  ArrowLeft,
  Play,
  Square,
  Trophy,
  Timer,
  Zap,
  Target,
  GraduationCap,
  Scan,
  RotateCcw,
} from "lucide-react";

const ACTIVITY_DURATION = 300; // 5 minutes in seconds
const OPERACOES = [
  { value: "Recebimento", label: "Recebimento", points: 10 },
  { value: "Expedição", label: "Expedição", points: 15 },
  { value: "Estoque", label: "Estoque", points: 10 },
  { value: "Logística Reversa", label: "Logística Reversa", points: 20 },
  { value: "Identificação", label: "Identificação", points: 5 },
];

export default function Atividade() {
  const {
    alunoNome,
    setAlunoNome,
    turmaNome,
    setTurmaNome,
    activityScores,
    saveActivityScore,
    startActivityMode,
    endActivityMode,
  } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(ACTIVITY_DURATION);
  const [score, setScore] = useState(0);
  const [scansCount, setScansCount] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("Identificação");
  const [sessionScans, setSessionScans] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleEndActivity();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleEndActivity, isActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartActivity = () => {
    if (!alunoNome.trim()) {
      return;
    }
    setIsActive(true);
    setScore(0);
    setScansCount(0);
    setSessionScans([]);
    setTimeRemaining(ACTIVITY_DURATION);
    setShowResults(false);
    startActivityMode();
  };

  const handleEndActivity = useCallback(() => {
    setIsActive(false);
    endActivityMode();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Save score
    if (scansCount > 0) {
      saveActivityScore({
        pontuacao: score,
        leituras: scansCount,
        tempo: ACTIVITY_DURATION - timeRemaining,
      });
    }

    setShowResults(true);
  }, [endActivityMode, saveActivityScore, score, scansCount, timeRemaining]);

  const handleScanComplete = (result) => {
    if (!isActive) return;

    const points = calculatePoints(currentOperation);
    setScore((prev) => prev + points);
    setScansCount((prev) => prev + 1);
    setSessionScans((prev) => [
      {
        ...result,
        pontuacao: points,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    playSuccessSound();
  };

  const handleRestart = () => {
    setShowResults(false);
    setScore(0);
    setScansCount(0);
    setSessionScans([]);
    setTimeRemaining(ACTIVITY_DURATION);
  };

  const progress = ((ACTIVITY_DURATION - timeRemaining) / ACTIVITY_DURATION) * 100;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="atividade-page">
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
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Atividade Prática
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pratique leitura de códigos e ganhe pontos
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isActive && !showResults ? (
        /* Setup Form */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurar Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aluno">Nome do Aluno *</Label>
                <Input
                  id="aluno"
                  value={alunoNome}
                  onChange={(e) => setAlunoNome(e.target.value)}
                  placeholder="Digite seu nome"
                  data-testid="input-aluno"
                />
              </div>
              <div>
                <Label htmlFor="turma">Turma</Label>
                <Input
                  id="turma"
                  value={turmaNome}
                  onChange={(e) => setTurmaNome(e.target.value)}
                  placeholder="Ex: 3º Ano A"
                  data-testid="input-turma"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Pontuação por Operação
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {OPERACOES.map((op) => (
                  <div
                    key={op.value}
                    className="p-2 rounded bg-card text-center"
                  >
                    <p className="text-sm font-medium">{op.label}</p>
                    <p className="text-lg font-bold text-primary">
                      +{op.points}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Tempo da Atividade</p>
                  <p className="text-sm text-muted-foreground">5 minutos</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-mono">
                05:00
              </Badge>
            </div>

            <Button
              onClick={handleStartActivity}
              disabled={!alunoNome.trim()}
              className="w-full gap-2 h-12 text-lg"
              data-testid="start-activity-btn"
            >
              <Play className="w-5 h-5" />
              Iniciar Atividade
            </Button>
          </CardContent>
        </Card>
      ) : showResults ? (
        /* Results */
        <div className="space-y-6">
          <Card className="border-primary">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="font-heading text-3xl font-bold mb-2">
                Atividade Concluída!
              </h2>
              <p className="text-muted-foreground mb-6">
                Parabéns, {alunoNome}! Veja seus resultados:
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-3xl font-bold text-primary">{score}</p>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10">
                  <p className="text-3xl font-bold text-success">{scansCount}</p>
                  <p className="text-sm text-muted-foreground">Leituras</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10">
                  <p className="text-3xl font-bold text-accent">
                    {formatTime(ACTIVITY_DURATION - timeRemaining)}
                  </p>
                  <p className="text-sm text-muted-foreground">Tempo</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRestart} className="gap-2" data-testid="restart-btn">
                  <RotateCcw className="w-4 h-4" />
                  Nova Atividade
                </Button>
                <Link to="/historico">
                  <Button variant="outline">Ver Histórico</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Session scans */}
          {sessionScans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leituras da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionScans.map((scan, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {scan.produto}
                        </TableCell>
                        <TableCell className="font-mono">{scan.codigo}</TableCell>
                        <TableCell>{scan.tipo_operacao}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-warning text-warning-foreground">
                            +{scan.pontuacao}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Active Activity */
        <div className="space-y-6">
          {/* Status bar */}
          <Card className="sticky top-20 z-40 border-primary">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <span className="font-bold text-xl">{score}</span>
                    <span className="text-muted-foreground text-sm">pontos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scan className="w-5 h-5 text-primary" />
                    <span className="font-bold">{scansCount}</span>
                    <span className="text-muted-foreground text-sm">leituras</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-muted-foreground" />
                    <span
                      className={`font-mono text-xl font-bold ${
                        timeRemaining <= 60 ? "text-destructive" : ""
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEndActivity}
                    className="gap-2"
                    data-testid="stop-activity-btn"
                  >
                    <Square className="w-4 h-4" />
                    Encerrar
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Operation selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block">Operação Atual</Label>
                  <Select
                    value={currentOperation}
                    onValueChange={setCurrentOperation}
                  >
                    <SelectTrigger data-testid="activity-operacao-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERACOES.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label} (+{op.points} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge className="bg-warning text-warning-foreground text-lg px-4 py-2">
                  +{OPERACOES.find((o) => o.value === currentOperation)?.points || 5} pontos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Scanner */}
          <div className="max-w-2xl mx-auto">
            <Scanner type="qrcode" onScanComplete={handleScanComplete} />
          </div>
        </div>
      )}

      {/* Ranking */}
      {activityScores.length > 0 && !isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Ranking de Pontuações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Leituras</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityScores
                  .sort((a, b) => b.pontuacao - a.pontuacao)
                  .slice(0, 10)
                  .map((record, index) => (
                    <TableRow key={record.id}>
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
                      <TableCell className="font-medium">{record.aluno}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.turma || "-"}
                      </TableCell>
                      <TableCell className="text-center">{record.leituras}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-mono">
                          {record.pontuacao}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
