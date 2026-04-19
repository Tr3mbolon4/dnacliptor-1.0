export const ESTADOS_PRODUTO = [
  { value: "bom_estado", label: "Bom estado" },
  { value: "avaria_parcial", label: "Avaria parcial" },
  { value: "avariado", label: "Avariado" },
];

export const SETORES_DESTINO = [
  "estoque",
  "triagem",
  "manutenção",
  "expedição",
];

export function getEstadoProdutoLabel(estado) {
  return ESTADOS_PRODUTO.find((item) => item.value === estado)?.label || "Não informado";
}

export function getEstadoProdutoClass(estado) {
  if (estado === "bom_estado") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (estado === "avaria_parcial") return "bg-amber-50 text-amber-700 border-amber-200";
  if (estado === "avariado") return "bg-red-50 text-red-700 border-red-200";
  return "bg-muted text-muted-foreground border-border";
}

export function normalizeMaterial(material = {}) {
  return {
    ...material,
    origem: material.origem || "",
    estado_produto: material.estado_produto || "bom_estado",
    setor_destino: material.setor_destino || material.setor || "estoque",
    observacoes: material.observacoes || "",
    data_entrada: material.data_entrada || material.created_at || new Date().toISOString(),
  };
}
