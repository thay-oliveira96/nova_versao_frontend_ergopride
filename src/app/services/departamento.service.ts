// src/app/services/departamento.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments'; // Importe seu arquivo de ambiente
import { DepartamentoDTO } from '../models/departamento.model'; // Importe a interface

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private http = inject(HttpClient);
  // Garanta que esta URL final esteja correta para sua API de departamentos
  // Ex: se environment.apiUrl = 'http://localhost:8080', então apiUrl = 'http://localhost:8080/v1/departamentos'
  private apiUrl = `${environment.apiUrl}/api/v1/departamentos`; 

  constructor() { }

  getAllDepartamentos(): Observable<DepartamentoDTO[]> {
    return this.http.get<DepartamentoDTO[]>(this.apiUrl);
  }

  getDepartamentoById(id: number): Observable<DepartamentoDTO> {
    return this.http.get<DepartamentoDTO>(`${this.apiUrl}/${id}`);
  }

  createDepartamento(departamento: DepartamentoDTO): Observable<DepartamentoDTO> {
    const { id, ...departamentoToCreate } = departamento; // Não envia o ID para criação
    return this.http.post<DepartamentoDTO>(this.apiUrl, departamentoToCreate);
  }

  updateDepartamento(id: number, departamento: DepartamentoDTO): Observable<DepartamentoDTO> {
    return this.http.put<DepartamentoDTO>(`${this.apiUrl}/${id}`, departamento);
  }

  deleteDepartamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}