import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { generateQRContent } from "../lib/utils";
import {
  ArrowLeft,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Package,
  Plus,
} from "lucide-react";

export default function GeradorQR() {
  const { materiais, fetchMateriais } = useApp();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [customContent, setCustomContent] = useState("");
  const [qrContent, setQrContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchMateriais();
  }, [fetchMateriais]);

  const handleSelectMaterial = (materialId) => {
    const material = materiais.find((m) => m.id === materialId);
    if (material) {
      setSelectedMaterial(material);
      const content = generateQRContent(material);
      setQrContent(content);
      setCustomContent("");
    }
  };

  const handleCustomContent = () => {
    if (customContent.trim()) {
      setQrContent(customContent);
      setSelectedMaterial(null);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(qrContent);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode_${selectedMaterial?.codigo || "custom"}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("QR Code baixado!");
    }
  };

  const handleTogglePrint = (material) => {
    setSelectedForPrint((prev) => {
      const exists = prev.find((m) => m.id === material.id);
      if (exists) {
        return prev.filter((m) => m.id !== material.id);
      }
      return [...prev, material];
    });
  };

  const handlePrintSelected = () => {
    if (selectedForPrint.length === 0) {
      toast.error("Selecione pelo menos um material para imprimir");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Erro ao abrir janela de impressão");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiquetas QR Code - Logi3A Soluções</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0052CC;
            padding-bottom: 10px;
          }
          .print-header h1 {
            color: #0052CC;
            margin: 0;
            font-size: 24px;
          }
          .print-header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 12px;
          }
          .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .qr-item {
            border: 2px solid #0052CC;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            page-break-inside: avoid;
          }
          .qr-item h3 {
            margin: 10px 0 5px;
            font-size: 14px;
            color: #0F172A;
          }
          .qr-item p {
            margin: 2px 0;
            font-size: 11px;
            color: #666;
          }
          .qr-item .code {
            font-family: monospace;
            font-weight: bold;
            color: #0052CC;
          }
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Logi3A Soluções</h1>
          <p>Escola Estadual Professora Elídia Tedesco de Oliveira</p>
        </div>
        <div class="qr-grid">
          ${selectedForPrint
            .map(
              (material) => `
            <div class="qr-item">
              <div id="qr-${material.id}"></div>
              <h3>${material.nome}</h3>
              <p class="code">${material.codigo}</p>
              <p>Setor: ${material.setor}</p>
              <p>Qtd: ${material.quantidade}</p>
            </div>
          `
            )
            .join("")}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <script>
          ${selectedForPrint
            .map(
              (material) => `
            QRCode.toCanvas(document.createElement('canvas'), '${generateQRContent(material).replace(/\n/g, "\\n")}', { width: 150 }, function(err, canvas) {
              if (!err) {
                document.getElementById('qr-${material.id}').appendChild(canvas);
              }
            });
          `
            )
            .join("")}
          setTimeout(function() { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="gerador-qr-page">
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
              <CardTitle className="font-heading text-xl">
                Gerador de QR Code
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crie e imprima QR Codes para seus materiais
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="material" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="material" data-testid="tab-material">
            Material
          </TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">
            Personalizado
          </TabsTrigger>
          <TabsTrigger value="print" data-testid="tab-print">
            Impressão
          </TabsTrigger>
        </TabsList>

        {/* From Material */}
        <TabsContent value="material">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selecionar Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Material Cadastrado</Label>
                  <Select onValueChange={handleSelectMaterial}>
                    <SelectTrigger data-testid="select-material">
                      <SelectValue placeholder="Selecione um material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materiais.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.nome} - {material.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMaterial && (
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="font-medium">{selectedMaterial.nome}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Código: <span className="font-mono">{selectedMaterial.codigo}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Setor: {selectedMaterial.setor}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {selectedMaterial.quantidade}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {qrContent ? (
                  <div className="space-y-4">
                    <div
                      ref={qrRef}
                      className="flex justify-center p-6 bg-white rounded-lg"
                    >
                      <QRCodeSVG
                        value={qrContent}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Conteúdo:</p>
                      <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                        {qrContent}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCopyContent}
                        className="gap-2 flex-1"
                        data-testid="copy-content-btn"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? "Copiado!" : "Copiar"}
                      </Button>
                      <Button
                        onClick={handleDownloadSVG}
                        className="gap-2 flex-1"
                        data-testid="download-qr-btn"
                      >
                        <Download className="w-4 h-4" />
                        Baixar SVG
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-3 opacity-50" />
                    <p>Selecione um material para gerar o QR Code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Content */}
        <TabsContent value="custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conteúdo Personalizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Digite o conteúdo do QR Code</Label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Produto: Nome do Produto&#10;Código: 123456&#10;Setor: Expedição&#10;Quantidade: 100"
                    rows={6}
                    className="font-mono"
                    data-testid="custom-content-input"
                  />
                </div>
                <Button
                  onClick={handleCustomContent}
                  disabled={!customContent.trim()}
                  className="w-full gap-2"
                  data-testid="generate-custom-btn"
                >
                  <Plus className="w-4 h-4" />
                  Gerar QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {qrContent && !selectedMaterial ? (
                  <div className="space-y-4">
                    <div
                      ref={qrRef}
                      className="flex justify-center p-6 bg-white rounded-lg"
                    >
                      <QRCodeSVG
                        value={qrContent}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCopyContent}
                        className="gap-2 flex-1"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </Button>
                      <Button onClick={handleDownloadSVG} className="gap-2 flex-1">
                        <Download className="w-4 h-4" />
                        Baixar SVG
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-3 opacity-50" />
                    <p>Digite um conteúdo para gerar o QR Code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Print Multiple */}
        <TabsContent value="print">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Impressão de Etiquetas</CardTitle>
                <Button
                  onClick={handlePrintSelected}
                  disabled={selectedForPrint.length === 0}
                  className="gap-2"
                  data-testid="print-selected-btn"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir ({selectedForPrint.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os materiais para imprimir suas etiquetas com QR Code.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {materiais.map((material) => {
                  const isSelected = selectedForPrint.some(
                    (m) => m.id === material.id
                  );
                  return (
                    <Card
                      key={material.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTogglePrint(material)}
                      data-testid={`print-item-${material.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{material.nome}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {material.codigo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {material.setor}
                            </p>
                          </div>
                          {isSelected && (
                            <Badge className="bg-primary">
                              <Check className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
