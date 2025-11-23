// src/app/services/aet-empresa.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AetEmpresaDTO } from '../models/aet-empresa.model';

@Injectable({
  providedIn: 'root'
})
export class AetEmpresaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/aet-empresas`;

  constructor() {}

  getAllAetEmpresas(): Observable<AetEmpresaDTO[]> {
    return this.http.get<AetEmpresaDTO[]>(this.apiUrl);
  }

  getAetEmpresaById(id: number): Observable<AetEmpresaDTO> {
    return this.http.get<AetEmpresaDTO>(`${this.apiUrl}/${id}`);
  }

  createAetEmpresa(aetEmpresa: AetEmpresaDTO): Observable<AetEmpresaDTO> {
    const { id, ...toCreate } = aetEmpresa;
    return this.http.post<AetEmpresaDTO>(this.apiUrl, toCreate);
  }

  updateAetEmpresa(id: number, aetEmpresa: AetEmpresaDTO): Observable<AetEmpresaDTO> {
    return this.http.put<AetEmpresaDTO>(`${this.apiUrl}/${id}`, aetEmpresa);
  }

  deleteAetEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}