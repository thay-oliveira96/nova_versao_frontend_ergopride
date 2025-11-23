// src/app/models/aet-empresa.model.ts

export interface AetEmpresaDTO {
    id?: number;
    empresaId: number;
    dataAbertura: string; // ISO date string
    status: string;
    dataFechamento?: string; // opcional
  }