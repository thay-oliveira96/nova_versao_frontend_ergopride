import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { FuncaoDTO } from '../models/funcao.model';

@Injectable({
  providedIn: 'root'
})
export class FuncaoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/funcoes`; 

  constructor() { }

  // Option 1: Paginated response (if API supports it)
  getAllFuncoes(page: number = 0, size: number = 10): Observable<{ content: FuncaoDTO[], totalElements: number }> {
    return this.http.get<{ content: FuncaoDTO[], totalElements: number }>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  // Option 2: Plain array (if API returns FuncaoDTO[])
  // getAllFuncoes(): Observable<FuncaoDTO[]> {
  //   return this.http.get<FuncaoDTO[]>(this.apiUrl);
  // }

  getFuncaoById(id: number): Observable<FuncaoDTO> {
    return this.http.get<FuncaoDTO>(`${this.apiUrl}/${id}`);
  }

  createFuncao(funcao: FuncaoDTO): Observable<FuncaoDTO> {
    const { id, ...funcaoToCreate } = funcao;
    return this.http.post<FuncaoDTO>(this.apiUrl, funcaoToCreate);
  }

  updateFuncao(id: number, funcao: FuncaoDTO): Observable<FuncaoDTO> {
    return this.http.put<FuncaoDTO>(`${this.apiUrl}/${id}`, funcao);
  }

  deleteFuncao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}