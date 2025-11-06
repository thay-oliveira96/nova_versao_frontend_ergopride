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

  /**
   * Cria empresa com logo (multipart/form-data)
   */
  createEmpresaComLogo(empresa: EmpresaDTO, logoFile: File): Observable<EmpresaDTO> {
    const formData = new FormData();
    
    // Remove o id antes de enviar
    const { id, ...empresaToCreate } = empresa;
    
    // Adiciona os dados da empresa como JSON Blob
    const empresaBlob = new Blob([JSON.stringify(empresaToCreate)], {
      type: 'application/json'
    });
    formData.append('empresa', empresaBlob);
    
    // Adiciona o arquivo de logo
    formData.append('logo', logoFile);

    return this.http.post<EmpresaDTO>(this.apiUrl, formData);
  }

  /**
   * Cria empresa sem logo (application/json)
   */
  createEmpresa(empresa: EmpresaDTO): Observable<EmpresaDTO> {
    const { id, ...empresaToCreate } = empresa;
    return this.http.post<EmpresaDTO>(this.apiUrl, empresaToCreate, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Atualiza empresa com logo (multipart/form-data)
   */
  updateEmpresaComLogo(id: number, empresa: EmpresaDTO, logoFile?: File): Observable<EmpresaDTO> {
    const formData = new FormData();
    
    // Adiciona os dados da empresa como JSON Blob
    const empresaBlob = new Blob([JSON.stringify(empresa)], {
      type: 'application/json'
    });
    formData.append('empresa', empresaBlob);
    
    // Adiciona o arquivo de logo se fornecido
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.http.put<EmpresaDTO>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Atualiza empresa sem logo (application/json)
   */
  updateEmpresa(id: number, empresa: EmpresaDTO): Observable<EmpresaDTO> {
    return this.http.put<EmpresaDTO>(`${this.apiUrl}/${id}`, empresa, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Atualiza apenas o logo da empresa
   */
  atualizarLogo(id: number, logoFile: File): Observable<EmpresaDTO> {
    const formData = new FormData();
    formData.append('logo', logoFile);

    return this.http.patch<EmpresaDTO>(`${this.apiUrl}/${id}/logo`, formData);
  }

  /**
   * Remove o logo da empresa
   */
  removerLogo(id: number): Observable<EmpresaDTO> {
    return this.http.delete<EmpresaDTO>(`${this.apiUrl}/${id}/logo`);
  }

  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}