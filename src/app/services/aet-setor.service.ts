// src/app/services/aet-setor.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AetSetorDTO } from '../models/aet-setor.model';

@Injectable({
  providedIn: 'root'
})
export class AetSetorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/aet-setores`;

  getAllAetSetores(aetEmpresaId: number): Observable<AetSetorDTO[]> {
    const params = new HttpParams().set('aetEmpresaId', aetEmpresaId.toString());
    return this.http.get<AetSetorDTO[]>(this.apiUrl, { params });
  }

  getAetSetorById(id: number, aetEmpresaId: number): Observable<AetSetorDTO> {
    const params = new HttpParams().set('aetEmpresaId', aetEmpresaId.toString());
    return this.http.get<AetSetorDTO>(`${this.apiUrl}/${id}`, { params });
  }

  createAetSetor(setor: AetSetorDTO): Observable<AetSetorDTO> {
    const { id, ...toCreate } = setor;
    return this.http.post<AetSetorDTO>(this.apiUrl, toCreate);
  }

  updateAetSetor(id: number, setor: AetSetorDTO): Observable<AetSetorDTO> {
    const params = new HttpParams().set('aetEmpresaId', setor.aetempresaId.toString());
    return this.http.put<AetSetorDTO>(`${this.apiUrl}/${id}`, setor, { params });
  }

  deleteAetSetor(id: number, aetEmpresaId: number): Observable<void> {
    const params = new HttpParams().set('aetEmpresaId', aetEmpresaId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}