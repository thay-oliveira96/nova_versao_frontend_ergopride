// src/app/services/Segmento.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments'; // Importe seu arquivo de ambiente
import { SegmentoDTO } from '../models/segmento.model'; // Importe a interface

@Injectable({
  providedIn: 'root'
})
export class SegmentoService {
  private http = inject(HttpClient);
  // Garanta que esta URL final esteja correta para sua API de Segmentos
  // Ex: se environment.apiUrl = 'http://localhost:8080', então apiUrl = 'http://localhost:8080/v1/Segmentos'
  private apiUrl = `${environment.apiUrl}/api/v1/segmentos`; 

  constructor() { }

  getAllSegmentos(): Observable<SegmentoDTO[]> {
    return this.http.get<SegmentoDTO[]>(this.apiUrl);
  }

  getSegmentoById(id: number): Observable<SegmentoDTO> {
    return this.http.get<SegmentoDTO>(`${this.apiUrl}/${id}`);
  }

  createSegmento(Segmento: SegmentoDTO): Observable<SegmentoDTO> {
    const { id, ...SegmentoToCreate } = Segmento; // Não envia o ID para criação
    return this.http.post<SegmentoDTO>(this.apiUrl, SegmentoToCreate);
  }

  updateSegmento(id: number, Segmento: SegmentoDTO): Observable<SegmentoDTO> {
    return this.http.put<SegmentoDTO>(`${this.apiUrl}/${id}`, Segmento);
  }

  deleteSegmento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}