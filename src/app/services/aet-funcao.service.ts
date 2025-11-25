// src/app/services/aet-funcao.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AetFuncaoDTO } from '../models/aet-funcao.model';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AetFuncaoService {
  private apiUrl = `${environment.apiUrl}/api/v1/aet-funcoes`;

  constructor(private http: HttpClient) { }

  getAllAetFuncoes(aetEmpresaId: number, aetSetorId: number): Observable<AetFuncaoDTO[]> {
    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());
    return this.http.get<AetFuncaoDTO[]>(this.apiUrl, { params });
  }

  getAetFuncaoById(id: number, aetEmpresaId: number, aetSetorId: number): Observable<AetFuncaoDTO> {
    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());
    return this.http.get<AetFuncaoDTO>(`${this.apiUrl}/${id}`, { params });
  }

  createAetFuncao(aetFuncao: AetFuncaoDTO, imagens: { [key: string]: File }): Observable<AetFuncaoDTO> {
    const formData = new FormData();
    formData.append('aetFuncao', new Blob([JSON.stringify(aetFuncao)], { type: 'application/json' }));
    
    if (imagens['imagem1']) formData.append('imagem1', imagens['imagem1']);
    if (imagens['imagem2']) formData.append('imagem2', imagens['imagem2']);
    if (imagens['imagem3']) formData.append('imagem3', imagens['imagem3']);
    if (imagens['imagem4']) formData.append('imagem4', imagens['imagem4']);

    return this.http.post<AetFuncaoDTO>(this.apiUrl, formData);
  }

  updateAetFuncao(id: number, aetEmpresaId: number, aetSetorId: number, aetFuncao: AetFuncaoDTO, imagens: { [key: string]: File }): Observable<AetFuncaoDTO> {
    const formData = new FormData();
    formData.append('aetFuncao', new Blob([JSON.stringify(aetFuncao)], { type: 'application/json' }));

    if (imagens['imagem1']) formData.append('imagem1', imagens['imagem1']);
    if (imagens['imagem2']) formData.append('imagem2', imagens['imagem2']);
    if (imagens['imagem3']) formData.append('imagem3', imagens['imagem3']);
    if (imagens['imagem4']) formData.append('imagem4', imagens['imagem4']);

    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());

    return this.http.put<AetFuncaoDTO>(`${this.apiUrl}/${id}`, formData, { params });
  }

  deleteAetFuncao(id: number, aetEmpresaId: number, aetSetorId: number): Observable<void> {
    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  removerImagem(id: number, numeroImagem: number, aetEmpresaId: number, aetSetorId: number): Observable<AetFuncaoDTO> {
    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());
    return this.http.delete<AetFuncaoDTO>(`${this.apiUrl}/${id}/imagem/${numeroImagem}`, { params });
  }

  atualizarImagem(id: number, numeroImagem: number, aetEmpresaId: number, aetSetorId: number, imagem: File): Observable<AetFuncaoDTO> {
    const formData = new FormData();
    formData.append('imagem', imagem);

    const params = new HttpParams()
      .set('aetEmpresaId', aetEmpresaId.toString())
      .set('aetSetorId', aetSetorId.toString());

    return this.http.patch<AetFuncaoDTO>(`${this.apiUrl}/${id}/imagem/${numeroImagem}`, formData, { params });
  }
}
