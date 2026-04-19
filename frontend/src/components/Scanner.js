import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useApp } from "../contexts/AppContext";
import {
  calculatePoints,
  getOperationBadgeClass,
  getOperationMessage,
  parseQRContent,
  playErrorSound,
  playSuccessSound,
} from "../lib/utils";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  Hash,
  Layers,
  MapPin,
  Package,
  RotateCcw,
  SwitchCamera,
  XCircle,
  Zap,
} from "lucide-react";

const OPERACOES = [
  { value: "Recebimento", label: "Recebimento" },
  { value: "Expedição", label: "Expedição" },
  { value: "Estoque", label: "Estoque" },
  { value: "Logística Reversa", label: "Logística Reversa" },
  { value: "Identificação", label: "Identificação" },
];

export function Scanner({ type = "qrcode", onScanComplete }) {
  const navigate = useNavigate();
  const html5QrcodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOperacao, setSelectedOperacao] = useState("Identificação");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scanStartedAt, setScanStartedAt] = useState(null);

  const {
    activityMode,
    createLeitura,
    fetchMateriais,
    findMaterialByCode,
    materiais,
    registrarAtividade,
    user,
  } = useApp();

  useEffect(() => {
    if (materiais.length === 0) {
      fetchMateriais();
    }
  }, [fetchMateriais, materiais.length]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices?.length) {
          setCameras(devices);
          const backCamera = devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("traseira") ||
              device.label.toLowerCase().includes("environment")
          );
          setSelectedCamera(backCamera?.id || devices[devices.length - 1].id);
          setPermissionGranted(true);
        }
      } catch (err) {
        console.log("Error getting cameras:", err);
      }
    };

    getCameras();
  }, []);

  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState();
        if (state === 2) {
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.log("Error stopping scanner:", e);
      }
    }

    setScanning(false);
    setCameraStatus("idle");
  }, []);

  const buildQuickCreateUrl = useCallback((scanResult) => {
    const params = new URLSearchParams({
      quickCreate: "1",
      codigo: scanResult.codigo,
      nome: scanResult.produto === "Produto Não Cadastrado" ? "" : scanResult.produto,
      quantidade: String(scanResult.quantidade || 1),
      setor: scanResult.setor || "",
      tipo_operacao: scanResult.tipo_operacao || "",
    });

    return `/produtos?${params.toString()}`;
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (result) return;

      playSuccessSound();

      const activitySeconds = Math.max(
        1,
        Math.round((Date.now() - (scanStartedAt || Date.now())) / 1000)
      );

      let matchedMaterial = null;
      let scanResult;

      if (type === "qrcode") {
        const parsed = parseQRContent(decodedText);
        matchedMaterial = findMaterialByCode(parsed.codigo || decodedText);
        scanResult = {
          codigo: matchedMaterial?.codigo || parsed.codigo || decodedText,
          produto: matchedMaterial?.nome || parsed.produto || "Produto Não Cadastrado",
          setor: matchedMaterial?.setor || parsed.setor || selectedOperacao,
          quantidade: matchedMaterial?.quantidade || Number.parseInt(parsed.quantidade, 10) || 1,
          tipo_operacao: selectedOperacao,
          tipo_leitura: "qrcode",
          operacao_esperada: matchedMaterial?.tipo_operacao || selectedOperacao,
          localizacao: matchedMaterial?.localizacao || "",
          exists: Boolean(matchedMaterial),
          raw: decodedText,
        };
      } else {
        matchedMaterial = findMaterialByCode(decodedText);
        scanResult = {
          codigo: decodedText,
          produto: matchedMaterial?.nome || "Produto Não Cadastrado",
          setor: matchedMaterial?.setor || selectedOperacao,
          quantidade: matchedMaterial?.quantidade || 1,
          tipo_operacao: selectedOperacao,
          tipo_leitura: "barcode",
          operacao_esperada: matchedMaterial?.tipo_operacao || selectedOperacao,
          localizacao: matchedMaterial?.localizacao || "",
          exists: Boolean(matchedMaterial),
        };
      }

      if (activityMode) {
        scanResult.pontuacao = calculatePoints(selectedOperacao);
      }

      setResult(scanResult);

      try {
        await createLeitura(scanResult);
      } catch (err) {
        console.error("Error saving leitura:", err);
      }

      if (user?.id && user.tipo === "aluno") {
        try {
          await registrarAtividade({
            codigo_lido: scanResult.codigo,
            produto: scanResult.produto,
            tipo_leitura: scanResult.tipo_leitura,
            operacao_esperada: scanResult.operacao_esperada,
            operacao_escolhida: selectedOperacao,
            tempo_segundos: activitySeconds,
          });
        } catch (err) {
          console.error("Error saving atividade:", err);
        }
      }

      await stopScanner();

      if (onScanComplete) {
        onScanComplete(scanResult);
        return;
      }

      if (matchedMaterial) {
        navigate(`/produtos?codigo=${encodeURIComponent(scanResult.codigo)}`);
      }
    },
    [
      activityMode,
      createLeitura,
      findMaterialByCode,
      navigate,
      onScanComplete,
      registrarAtividade,
      result,
      scanStartedAt,
      selectedOperacao,
      stopScanner,
      type,
      user,
    ]
  );

  const startScanner = useCallback(async () => {
    if (scanning) return;

    setResult(null);
    setError(null);
    setScanning(true);
    setCameraStatus("starting");
    setScanStartedAt(Date.now());

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader", { verbose: false });
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      let cameraId = selectedCamera;
      if (!cameraId) {
        const devices = await Html5Qrcode.getCameras();
        if (devices?.length) {
          setCameras(devices);
          const backCamera = devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("traseira") ||
              device.label.toLowerCase().includes("environment")
          );
          cameraId = backCamera?.id || devices[devices.length - 1].id;
          setSelectedCamera(cameraId);
          setPermissionGranted(true);
        }
      }

      const errorHandler = (errorMessage) => {
        if (!errorMessage.includes("NotFoundException")) {
          console.log("Scan error:", errorMessage);
        }
      };

      if (!cameraId) {
        await html5QrcodeRef.current.start(
          { facingMode: "environment" },
          config,
          handleScanSuccess,
          errorHandler
        );
      } else {
        await html5QrcodeRef.current.start(cameraId, config, handleScanSuccess, errorHandler);
      }

      setCameraStatus("active");
    } catch (err) {
      console.error("Error starting scanner:", err);

      let errorMsg = "Erro ao iniciar câmera.";
      if (err.message?.includes("Permission")) {
        errorMsg = "Permissão de câmera negada. Libere o acesso no navegador.";
      } else if (err.message?.includes("NotFound")) {
        errorMsg = "Nenhuma câmera encontrada no dispositivo.";
      } else if (err.message?.includes("NotReadable")) {
        errorMsg = "A câmera está em uso por outro aplicativo.";
      }

      setError(errorMsg);
      setScanning(false);
      setCameraStatus("error");
      playErrorSound();
    }
  }, [handleScanSuccess, scanning, selectedCamera]);

  const resetScanner = useCallback(() => {
    setResult(null);
    setError(null);
    startScanner();
  }, [startScanner]);

  const switchCamera = useCallback(async () => {
    if (cameras.length < 2) return;

    const currentIndex = cameras.findIndex((camera) => camera.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    setSelectedCamera(nextCamera.id);

    if (scanning) {
      await stopScanner();
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  }, [cameras, scanning, selectedCamera, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        try {
          const state = html5QrcodeRef.current.getState();
          if (state === 2) {
            html5QrcodeRef.current.stop();
          }
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }
    };
  }, []);

  const getCameraStatusBadge = () => {
    switch (cameraStatus) {
      case "starting":
        return (
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Iniciando câmera...
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="gap-1 border-success text-success">
            <div className="w-2 h-2 rounded-full bg-success" />
            Câmera ativa
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Erro na câmera
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <CameraOff className="w-3 h-3" />
            Câmera inativa
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-button">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <CardTitle className="font-heading text-xl">
                  {type === "qrcode" ? "Leitor de QR Code" : "Leitor de Código de Barras"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aponte a câmera traseira para o código do produto.
                </p>
              </div>
            </div>
            {getCameraStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Tipo de Operação</label>
              <Select
                value={selectedOperacao}
                onValueChange={setSelectedOperacao}
                disabled={scanning}
              >
                <SelectTrigger data-testid="operacao-select">
                  <SelectValue placeholder="Selecione a operação" />
                </SelectTrigger>
                <SelectContent>
                  {OPERACOES.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              {!scanning ? (
                <Button onClick={startScanner} className="gap-2" data-testid="start-scanner-btn">
                  <Camera className="w-4 h-4" />
                  Iniciar Câmera
                </Button>
              ) : (
                <>
                  {cameras.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={switchCamera}
                      className="gap-2"
                      data-testid="switch-camera-btn"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={stopScanner}
                    className="gap-2"
                    data-testid="stop-scanner-btn"
                  >
                    <CameraOff className="w-4 h-4" />
                    Parar
                  </Button>
                </>
              )}
            </div>
          </div>

          {permissionGranted && cameras.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Câmera: {cameras.find((camera) => camera.id === selectedCamera)?.label || "Padrão"}
              {cameras.length > 1 && ` (${cameras.length} disponíveis)`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative min-h-[300px] bg-secondary/5">
            <div
              id="qr-reader"
              className={`w-full ${!scanning && !result ? "hidden" : ""}`}
              style={{ minHeight: scanning ? "300px" : "0" }}
            />

            {!scanning && !result && (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold">Pronto para escanear</h3>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Clique em "Iniciar Câmera" para começar a leitura do{" "}
                  {type === "qrcode" ? "QR Code" : "código de barras"}.
                </p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/5 p-4">
                <div className="max-w-sm text-center">
                  <XCircle className="mx-auto mb-3 w-12 h-12 text-destructive" />
                  <p className="mb-2 font-medium text-destructive">Erro</p>
                  <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                  <Button variant="outline" onClick={resetScanner} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-success animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 animate-success-pulse">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg text-success">
                  {result.exists ? "Produto encontrado!" : "Produto não cadastrado"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {result.exists
                    ? "A leitura foi registrada e o produto pode ser visualizado na tela central."
                    : getOperationMessage(result.tipo_operacao)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Package className="mt-0.5 w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Produto</p>
                  <p className="font-medium">{result.produto}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Hash className="mt-0.5 w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Código</p>
                  <p className="font-mono font-medium">{result.codigo}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <MapPin className="mt-0.5 w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Setor</p>
                  <p className="font-medium">{result.setor}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Layers className="mt-0.5 w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Quantidade</p>
                  <p className="font-medium">{result.quantidade}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge className={getOperationBadgeClass(result.tipo_operacao)}>
                {result.tipo_operacao}
              </Badge>
              <Badge variant="outline">
                {type === "qrcode" ? "QR Code" : "Código de Barras"}
              </Badge>
              {activityMode && result.pontuacao && (
                <Badge className="gap-1 bg-warning text-warning-foreground">
                  <Zap className="w-3 h-3" />
                  +{result.pontuacao} pontos
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button onClick={resetScanner} className="flex-1 gap-2" data-testid="scan-again-btn">
                <RotateCcw className="w-4 h-4" />
                Nova Leitura
              </Button>
              {result.exists ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/produtos?codigo=${encodeURIComponent(result.codigo)}`)}
                  data-testid="view-product-btn"
                >
                  Ver na Tela de Produtos
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(buildQuickCreateUrl(result))}
                  data-testid="quick-register-product-btn"
                >
                  Cadastro Rápido do Produto
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
