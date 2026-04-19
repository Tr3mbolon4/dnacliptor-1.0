import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowLeft, QrCode, Download, Printer, Copy, Check, Type,
  MessageSquare, Link2, ImageIcon, BookOpen, Lightbulb,
  ArrowRight, Scan, Eye, ChevronDown, ChevronUp, Upload,
} from "lucide-react";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

export default function GeradorConteudo() {
  const { uploadImage } = useApp();
  const [contentType, setContentType] = useState("texto");
  const [textContent, setTextContent] = useState("");
  const [linkContent, setLinkContent] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEducacional, setShowEducacional] = useState(false);
  const [showAprendizado, setShowAprendizado] = useState(false);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleGenerate = useCallback(() => {
    let value = "";
    if (contentType === "texto" || contentType === "mensagem" || contentType === "instrucao") {
      value = textContent.trim();
    } else if (contentType === "link") {
      value = linkContent.trim();
      if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
        value = "https://" + value;
      }
    }
    if (!value) {
      toast.error("Digite o conteúdo para gerar o QR Code");
      return;
    }
    setQrValue(value);
    toast.success("QR Code gerado com sucesso!");
  }, [contentType, textContent, linkContent]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    try {
      const result = await uploadImage(file);
      const imageUrl = `${BACKEND_URL}${result.url}`;
      setQrValue(imageUrl);
      toast.success("Imagem enviada! QR Code gerado.");
    } catch (err) {
      toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [qrValue]);

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement("a");
      link.download = `qrcode_${contentType}_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast.success("QR Code baixado!");
  }, [contentType]);

  const handlePrint = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>QR Code - Logi3A</title>
      <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}
      .header{color:#0052CC;margin-bottom:20px;} .content{margin:20px auto;max-width:400px;word-break:break-all;color:#666;font-size:12px;}
      @media print{@page{size:A4;margin:2cm;}}</style></head>
      <body><div class="header"><h2>Logi3A Soluções</h2><p>QR Code Gerado</p></div>
      <div>${svgData}</div><div class="content"><p>${qrValue}</p></div>
      <script>setTimeout(function(){window.print();},300);</script></body></html>`);
    printWindow.document.close();
  }, [qrValue]);

  const getPlaceholder = () => {
    switch (contentType) {
      case "texto": return "Digite qualquer texto para transformar em QR Code...";
      case "mensagem": return "Digite uma mensagem educativa ou informativa...";
      case "instrucao": return "Digite as instruções da atividade...";
      default: return "";
    }
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case "texto": return <Type className="w-5 h-5" />;
      case "mensagem": return <MessageSquare className="w-5 h-5" />;
      case "instrucao": return <BookOpen className="w-5 h-5" />;
      case "link": return <Link2 className="w-5 h-5" />;
      case "imagem": return <ImageIcon className="w-5 h-5" />;
      default: return <QrCode className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto" data-testid="gerador-conteudo-page">
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
                Gerador de QR Code por Conteúdo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crie QR Codes a partir de textos, mensagens, links ou imagens
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Type Selector */}
      <Tabs value={contentType} onValueChange={(v) => { setContentType(v); setQrValue(""); setImagePreview(null); }}>
        <TabsList className="grid w-full grid-cols-5" data-testid="content-type-tabs">
          <TabsTrigger value="texto" className="gap-1 text-xs sm:text-sm" data-testid="tab-texto">
            <Type className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Texto</span>
          </TabsTrigger>
          <TabsTrigger value="mensagem" className="gap-1 text-xs sm:text-sm" data-testid="tab-mensagem">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mensagem</span>
          </TabsTrigger>
          <TabsTrigger value="instrucao" className="gap-1 text-xs sm:text-sm" data-testid="tab-instrucao">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Instrução</span>
          </TabsTrigger>
          <TabsTrigger value="link" className="gap-1 text-xs sm:text-sm" data-testid="tab-link">
            <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Link</span>
          </TabsTrigger>
          <TabsTrigger value="imagem" className="gap-1 text-xs sm:text-sm" data-testid="tab-imagem">
            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Imagem</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Input Section */}
          <div>
            {/* Text/Message/Instruction Input */}
            <TabsContent value="texto" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Texto Livre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Digite o texto</Label>
                    <Textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
                      placeholder={getPlaceholder()} rows={6} data-testid="input-texto" />
                  </div>
                  <Button onClick={handleGenerate} disabled={!textContent.trim()} className="w-full gap-2" data-testid="btn-gerar-texto">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mensagem" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Mensagem Educativa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Digite a mensagem</Label>
                    <Textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
                      placeholder={getPlaceholder()} rows={6} data-testid="input-mensagem" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    Exemplo: "Bem-vindo à atividade de logística reversa"
                  </div>
                  <Button onClick={handleGenerate} disabled={!textContent.trim()} className="w-full gap-2" data-testid="btn-gerar-mensagem">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instrucao" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Instrução de Atividade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Instruções da atividade</Label>
                    <Textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
                      placeholder={getPlaceholder()} rows={6} data-testid="input-instrucao" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    Crie instruções escondidas em QR Code para desafios em sala de aula.
                  </div>
                  <Button onClick={handleGenerate} disabled={!textContent.trim()} className="w-full gap-2" data-testid="btn-gerar-instrucao">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="link" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" />
                    Link / URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Cole o link</Label>
                    <Input value={linkContent} onChange={(e) => setLinkContent(e.target.value)}
                      placeholder="https://exemplo.com" type="url" data-testid="input-link" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    Quando escaneado, o link abrirá no navegador do dispositivo.
                  </div>
                  <Button onClick={handleGenerate} disabled={!linkContent.trim()} className="w-full gap-2" data-testid="btn-gerar-link">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imagem" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Imagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={handleImageUpload} data-testid="input-imagem-file" />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    data-testid="image-upload-area"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Upload className="w-10 h-10" />
                        <p className="font-medium">Clique para enviar uma imagem</p>
                        <p className="text-xs">JPEG, PNG, GIF ou WebP (máx. 5MB)</p>
                      </div>
                    )}
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Enviando imagem...
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    A imagem será salva no servidor e um link será gerado como QR Code.
                    Quando escaneado, a imagem será exibida.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getContentTypeIcon()}
                QR Code Gerado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrValue ? (
                <div className="space-y-4">
                  <div ref={qrRef} className="flex justify-center p-6 bg-white rounded-lg" data-testid="qr-preview">
                    <QRCodeSVG value={qrValue} size={220} level="H" includeMargin />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Conteúdo codificado:</p>
                    <p className="text-sm font-mono break-all">{qrValue.length > 200 ? qrValue.slice(0, 200) + "..." : qrValue}</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    {getContentTypeIcon()}
                    {contentType === "texto" ? "Texto" : contentType === "mensagem" ? "Mensagem" :
                     contentType === "instrucao" ? "Instrução" : contentType === "link" ? "Link" : "Imagem"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {contentType === "link" ? "Ao escanear, o link será aberto no navegador." :
                     contentType === "imagem" ? "Ao escanear, a imagem será exibida." :
                     "Ao escanear, o texto/mensagem será exibido na tela."}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={handleCopy} className="gap-1" data-testid="btn-copiar">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
                    </Button>
                    <Button onClick={handleDownload} className="gap-1" data-testid="btn-baixar">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Baixar</span>
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-1" data-testid="btn-imprimir">
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Imprimir</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                  <QrCode className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-1">Nenhum QR Code gerado</p>
                  <p className="text-sm text-center">Escolha o tipo de conteúdo e clique em "Gerar QR Code"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Educational Section: Como Funciona */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowEducacional(!showEducacional)}
          data-testid="toggle-como-funciona"
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Como Funciona o QR Code
            </CardTitle>
            {showEducacional ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </CardHeader>
        {showEducacional && (
          <CardContent className="space-y-6">
            {/* Flow visual */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-4 bg-muted/30 rounded-lg">
              {[
                { icon: <Type className="w-5 h-5" />, label: "Informação", color: "text-blue-500" },
                { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "" },
                { icon: <QrCode className="w-5 h-5" />, label: "Codificação", color: "text-violet-500" },
                { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "" },
                { icon: <QrCode className="w-5 h-5" />, label: "QR Code", color: "text-green-500" },
                { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "" },
                { icon: <Scan className="w-5 h-5" />, label: "Leitura", color: "text-orange-500" },
                { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "" },
                { icon: <Eye className="w-5 h-5" />, label: "Interpretação", color: "text-red-500" },
              ].map((step, i) =>
                step.label ? (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full bg-card border-2 flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                ) : (
                  <div key={i} className="hidden sm:block">{step.icon}</div>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { num: "1", title: "Informação", desc: "Um produto ou mensagem possui dados.", example: "Produto: Parafuso M8\nCódigo: 789456123\nSetor: Expedição", color: "bg-blue-500/10 border-blue-500/30" },
                { num: "2", title: "Codificação", desc: "Esses dados são transformados em informação digital.", color: "bg-violet-500/10 border-violet-500/30" },
                { num: "3", title: "QR Code", desc: "O sistema converte essa informação em um código visual.", color: "bg-green-500/10 border-green-500/30" },
                { num: "4", title: "Leitura", desc: "Um celular ou scanner lê o QR Code.", color: "bg-orange-500/10 border-orange-500/30" },
                { num: "5", title: "Decodificação", desc: "O sistema interpreta os dados e mostra a informação original.", color: "bg-red-500/10 border-red-500/30" },
              ].map((step) => (
                <div key={step.num} className={`p-4 rounded-lg border ${step.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{step.num}</span>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                  {step.example && (
                    <pre className="text-xs font-mono mt-2 p-2 bg-card rounded">{step.example}</pre>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <Scan className="w-4 h-4 text-primary" />
                Quando o QR Code é lido:
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Type className="w-3 h-3" /> <strong>Texto</strong> → mostra a mensagem na tela</li>
                <li className="flex items-center gap-2"><BookOpen className="w-3 h-3" /> <strong>Instrução</strong> → mostra a atividade</li>
                <li className="flex items-center gap-2"><Link2 className="w-3 h-3" /> <strong>Link</strong> → abre o conteúdo no navegador</li>
                <li className="flex items-center gap-2"><ImageIcon className="w-3 h-3" /> <strong>Imagem</strong> → mostra a imagem associada</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Educational Section: O que o Aluno Aprende */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowAprendizado(!showAprendizado)}
          data-testid="toggle-aprendizado"
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              O que você aprende com esta atividade
            </CardTitle>
            {showAprendizado ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </CardHeader>
        {showAprendizado && (
          <CardContent className="space-y-6">
            {/* Knowledge */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Conhecimentos adquiridos:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Como informações podem ser transformadas em QR Code",
                  "Como sistemas digitais codificam dados",
                  "Como funciona a leitura de QR Code",
                  "Como QR Codes armazenam ou apontam para informações",
                  "Como mensagens, imagens ou dados logísticos podem ser codificados",
                  "Como scanners e celulares interpretam códigos",
                  "Como empresas usam QR Code para rastreabilidade",
                  "Como QR Code é usado em logística, estoque e transporte",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Habilidades desenvolvidas:</h4>
              <div className="flex flex-wrap gap-2">
                {["Interpretação de dados", "Raciocínio lógico", "Leitura digital",
                  "Organização de informações", "Compreensão de sistemas automatizados"
                ].map((skill, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    <Lightbulb className="w-3 h-3" /> {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interaction steps */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Interação passo a passo:</h4>
              <div className="space-y-2">
                {[
                  "O aluno digita um texto ou mensagem",
                  "O sistema transforma essa informação em QR Code",
                  "O QR Code aparece na tela",
                  "O aluno pode escanear com o celular",
                  "O conteúdo aparece na tela",
                  "O aluno entende que o QR Code representa aquela informação",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical example */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-2 text-sm">Exemplo prático:</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Aluno escreve: <strong>"Bem-vindo à atividade de logística reversa"</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">O sistema gera um QR Code.</p>
              <p className="text-sm text-muted-foreground">
                Quando outro aluno escaneia, aparece: <strong>"Bem-vindo à atividade de logística reversa"</strong>
              </p>
            </div>

            {/* Classroom applications */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Aplicação em sala de aula:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Instruções escondidas em QR Code",
                  "Desafios logísticos",
                  "Mensagens educativas",
                  "Identificação de produtos",
                  "Imagens de embalagens ou materiais",
                  "Atividades de interpretação",
                  "Simulação de rastreabilidade",
                ].map((app, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-sm">{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational objective */}
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-500" />
                Objetivo educacional
              </h4>
              <p className="text-sm text-muted-foreground">
                Mostrar ao aluno que QR Code é uma forma de transformar informações em códigos visuais
                que podem ser lidos por sistemas digitais. Isso ajuda o aluno a entender:
                <strong> codificação de dados, leitura óptica, automação, rastreabilidade e
                digitalização de processos logísticos.</strong>
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
