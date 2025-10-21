import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { ObjetosDTO } from '../models/objeto.model';

@Injectable({
  providedIn: 'root'
})
export class ObjetoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/objetos`;

  constructor() {}

  getObjetoById(id: number): Observable<ObjetosDTO> {
    return this.http.get<ObjetosDTO>(`${this.apiUrl}/${id}`);
  }

  listObjetos(page: number, size: number, sort: string[] = ['id']): Observable<{ content: ObjetosDTO[], totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort.join(','));

    return this.http.get<{ content: ObjetosDTO[], totalElements: number }>(this.apiUrl, { params });
  }

  createObjeto(objeto: ObjetosDTO): Observable<ObjetosDTO> {
    const { id, ...objetoToCreate } = objeto; // Remove id for POST
    return this.http.post<ObjetosDTO>(this.apiUrl, objetoToCreate);
  }

  updateObjeto(id: number, objeto: ObjetosDTO): Observable<ObjetosDTO> {
    return this.http.put<ObjetosDTO>(`${this.apiUrl}/${id}`, objeto);
  }

  deleteObjeto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}