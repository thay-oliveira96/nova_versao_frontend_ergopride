export interface SegmentoDTO {
  id?: number; // Opcional para criação, presente para atualização e leitura
  descricao: string;
  observacao: string; // Campo 'observacao' adicionado, 'nome', 'responsavel' e 'dataCriacao' removidos
}
