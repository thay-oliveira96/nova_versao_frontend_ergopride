// src/app/models/aet-funcao.model.ts

export interface AetFuncaoDTO {
    id?: number;
    aetEmpresaId: number;
    aetSetorId: number;
    funcaoId: number;
    descricaoTarefa?: string;
    servicoDesenvolvido?: string;
    postoTrabalho?: string;
    objeto1Id?: number;
    objeto2Id?: number;
    objeto3Id?: number;
    descricaoObjeto1?: string;
    descricaoObjeto2?: string;
    descricaoObjeto3?: string;
    imagem1Posto?: string;
    imagem2Posto?: string;
    imagem3Posto?: string;
    imagem4Posto?: string;
    analisePopulacaoTrabalhadora?: string;
    manifestacoesTrabalhadores?: string;
    cicloTrabalho?: string;
    descricaoDaAtividade?: string;
    preDiagnostico?: string;
    analiseSistematica?: string;
  }
  