import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardList,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  ESTADOS_PRODUTO,
  SETORES_DESTINO,
  getEstadoProdutoClass,
  getEstadoProdutoLabel,
} from "../lib/products";
import { formatDateTime } from "../lib/utils";

const SETORES = ["Expedição", "Estoque A", "Estoque B", "Recebimento", "Identificação", "Almoxarifado"];
const OPERACOES = ["Recebimento", "Expedição", "Estoque", "Logística Reversa", "Identificação"];

const emptyMaterial = {
  nome: "",
  codigo: "",
  setor: "",
  quantidade: 1,
  tipo_operacao: "",
  descricao: "",
  localizacao: "",
  origem: "",
  estado_produto: "bom_estado",
  setor_destino: "estoque",
  observacoes: "",
};

export default function Materiais() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    materiais,
    fetchMateriais,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    loading,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [setorFilter, setSetorFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState(emptyMaterial);

  useEffect(() => {
    fetchMateriais();
  }, [fetchMateriais]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codigo = params.get("codigo");
    const quickCreate = params.get("quickCreate");

    if (codigo) {
      setSearchTerm(codigo);
    }

    if (quickCreate === "1") {
      setEditingMaterial(null);
      setFormData({
        ...emptyMaterial,
        codigo: params.get("codigo") || "",
        nome: params.get("nome") || "",
        quantidade: Number(params.get("quantidade")) || 1,
        setor: params.get("setor") || "",
        tipo_operacao: params.get("tipo_operacao") || "",
      });
      setIsDialogOpen(true);
      navigate("/produtos", { replace: true });
    }
  }, [location.search, navigate]);

  const filteredMateriais = useMemo(
    () =>
      materiais.filter((material) => {
        const normalizedSearch = searchTerm.toLowerCase();
        const matchesSearch =
          normalizedSearch === "" ||
          material.nome?.toLowerCase().includes(normalizedSearch) ||
          material.codigo?.toLowerCase().includes(normalizedSearch) ||
          material.origem?.toLowerCase().includes(normalizedSearch);

        const matchesEstado =
          estadoFilter === "all" || material.estado_produto === estadoFilter;
        const matchesSetor =
          setorFilter === "all" || material.setor_destino === setorFilter;

        return matchesSearch && matchesEstado && matchesSetor;
      }),
    [estadoFilter, materiais, searchTerm, setorFilter]
  );

  const handleOpenDialog = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        ...emptyMaterial,
        ...material,
      });
    } else {
      setEditingMaterial(null);
      setFormData(emptyMaterial);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMaterial(null);
    setFormData(emptyMaterial);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.codigo || !formData.setor || !formData.tipo_operacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, formData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createMaterial(formData);
        toast.success("Produto cadastrado com sucesso!");
      }

      handleCloseDialog();
      navigate(`/produtos?codigo=${encodeURIComponent(formData.codigo)}`, { replace: true });
    } catch (error) {
      toast.error("Erro ao salvar produto");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir produto");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="produtos-page">
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
                <CardTitle className="font-heading text-xl">Controle de Produtos</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {materiais.length} produtos cadastrados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMateriais()}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="gap-2"
                    data-testid="add-product-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading">
                      {editingMaterial ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados de entrada e rastreio do produto.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="nome">Nome do Produto *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Ex: Parafuso M8"
                          data-testid="input-produto-nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          placeholder="Ex: 789456123"
                          data-testid="input-produto-codigo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          value={formData.quantidade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantidade: Number.parseInt(e.target.value, 10) || 1,
                            })
                          }
                          data-testid="input-produto-quantidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="origem">Origem</Label>
                        <Input
                          id="origem"
                          value={formData.origem}
                          onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                          placeholder="Ex: Porto de Santos"
                          data-testid="input-produto-origem"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado_produto">Estado do Produto</Label>
                        <Select
                          value={formData.estado_produto}
                          onValueChange={(value) =>
                            setFormData({ ...formData, estado_produto: value })
                          }
                        >
                          <SelectTrigger data-testid="select-estado-produto">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_PRODUTO.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="setor">Setor Atual *</Label>
                        <Select
                          value={formData.setor}
                          onValueChange={(value) => setFormData({ ...formData, setor: value })}
                        >
                          <SelectTrigger data-testid="select-setor-atual">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {SETORES.map((setor) => (
                              <SelectItem key={setor} value={setor}>
                                {setor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipo_operacao">Operação *</Label>
                        <Select
                          value={formData.tipo_operacao}
                          onValueChange={(value) =>
                            setFormData({ ...formData, tipo_operacao: value })
                          }
                        >
                          <SelectTrigger data-testid="select-operacao">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERACOES.map((op) => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="setor_destino">Setor de Destino</Label>
                        <Select
                          value={formData.setor_destino}
                          onValueChange={(value) =>
                            setFormData({ ...formData, setor_destino: value })
                          }
                        >
                          <SelectTrigger data-testid="select-setor-destino">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {SETORES_DESTINO.map((setor) => (
                              <SelectItem key={setor} value={setor}>
                                {setor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="localizacao">Localização</Label>
                        <Input
                          id="localizacao"
                          value={formData.localizacao}
                          onChange={(e) =>
                            setFormData({ ...formData, localizacao: e.target.value })
                          }
                          placeholder="Ex: Prateleira A3"
                          data-testid="input-produto-localizacao"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          placeholder="Descrição detalhada do produto"
                          rows={2}
                          data-testid="input-produto-descricao"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) =>
                            setFormData({ ...formData, observacoes: e.target.value })
                          }
                          placeholder="Observações sobre estado físico, triagem ou manutenção"
                          rows={2}
                          data-testid="input-produto-observacoes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit" data-testid="save-product-btn">
                        {editingMaterial ? "Salvar" : "Cadastrar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-[1.4fr,1fr,1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou origem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-produtos"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger data-testid="filter-estado-produto">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {ESTADOS_PRODUTO.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={setorFilter} onValueChange={setorFilter}>
              <SelectTrigger data-testid="filter-setor-destino">
                <SelectValue placeholder="Filtrar por destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os destinos</SelectItem>
                {SETORES_DESTINO.map((setor) => (
                  <SelectItem key={setor} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMateriais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ClipboardList className="w-8 h-8" />
                        <p>Nenhum produto encontrado</p>
                        <Button variant="link" onClick={() => handleOpenDialog()}>
                          Cadastrar novo produto
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMateriais.map((material) => (
                    <TableRow
                      key={material.id}
                      className={`table-row-hover ${
                        searchTerm && material.codigo === searchTerm ? "bg-primary/5" : ""
                      }`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{material.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {material.localizacao || material.setor || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{material.codigo}</TableCell>
                      <TableCell className="text-center font-mono">{material.quantidade}</TableCell>
                      <TableCell>{material.origem || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoProdutoClass(material.estado_produto)}>
                          {getEstadoProdutoLabel(material.estado_produto)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.setor_destino || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(material.data_entrada)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(material)}
                            data-testid={`edit-${material.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-${material.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{material.nome}"? Esta ação não
                                  pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(material.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
