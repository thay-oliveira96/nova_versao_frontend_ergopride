export interface EmpresaDTO {
    id?: number;
    nome: string;
    cnpj: string;
    cnae?: string;
    endereco?: string;
    numero?: number;
    bairro?: string;
    cep: string;
    municipio: string;
    estado: string;
    trabalhadores?: number;
    atividade?: string;
    datainfo?: string;
    dataAtualizacao?: string;
    usuario?: string;
    logo?: string;
  }