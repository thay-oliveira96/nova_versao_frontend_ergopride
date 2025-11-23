// src/app/models/aet-setor.model.ts

export interface AetSetorDTO {
    id?: number;
    aetempresaId: number;
    jornadaTrabalho: string;
    ritmoTrabalho: string;
    rotatividadeAtividades: string;
    necessidadesFisiologicas: string;
    fatoresPsicossociais: string;
    micropausas: string;
    ruido: string;
    temperatura: string;
    artificial: string;
    tiposLuminarias: string;
    direcionalidade: string;
    cintilacao: string;
    ofuscamento: string;
    natural: string;
    lampadas: string;
    aparenciaCorContraste: string;
    efeitoEstroboscopio: string;
    sombrasExcessivas: string;
    departamentosId: number;
  }