// src/app/services/Segmento.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments'; // Importe seu arquivo de ambiente
import { FuncaoDTO } from '../models/funcao.model';

@Injectable({
  providedIn: 'root'
})
export class FuncaoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/funcoes`; 

  constructor() { }

  getAllFuncoes(): Observable<FuncaoDTO[]> {
    return this.http.get<FuncaoDTO[]>(this.apiUrl);
  }

  getFuncaoById(id: number): Observable<FuncaoDTO> {
    return this.http.get<FuncaoDTO>(`${this.apiUrl}/${id}`);
  }

  createFuncao(Funcao: FuncaoDTO): Observable<FuncaoDTO> {
    const { id, ...SegmentoToCreate } = Funcao; // Não envia o ID para criação
    return this.http.post<FuncaoDTO>(this.apiUrl, SegmentoToCreate);
  }

  updateFuncao(id: number, Funcao: FuncaoDTO): Observable<FuncaoDTO> {
    return this.http.put<FuncaoDTO>(`${this.apiUrl}/${id}`, Funcao);
  }

  deleteFuncao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}