import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EmpresaDTO } from '../models/empresa.model';

interface PaginatedResponse {
  content: EmpresaDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/empresas`;

  constructor() {}

  getAllEmpresas(page: number = 0, size: number = 10, sort: string[] = ['id,asc']): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort.join(','));

    return this.http.get<PaginatedResponse>(this.apiUrl, { params });
  }

  getEmpresaById(id: number): Observable<EmpresaDTO> {
    return this.http.get<EmpresaDTO>(`${this.apiUrl}/${id}`);
  }

  createEmpresa(empresa: EmpresaDTO): Observable<EmpresaDTO> {
    const { id, ...empresaToCreate } = empresa;
    return this.http.post<EmpresaDTO>(this.apiUrl, empresaToCreate);
  }

  updateEmpresa(id: number, empresa: EmpresaDTO): Observable<EmpresaDTO> {
    return this.http.put<EmpresaDTO>(`${this.apiUrl}/${id}`, empresa);
  }

  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}