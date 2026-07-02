import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario } from '../models/comentario';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  
  private readonly apiUrl = 'http://localhost:8080/comentarios';

  constructor(private http: HttpClient) { }

  listar(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<Comentario> {
    return this.http.get<Comentario>(`${this.apiUrl}/${id}`);
  }

  salvar(comentario: Comentario, idAvaliacao: number): Observable<Comentario> {
    if (comentario.id) {
      return this.http.put<Comentario>(`${this.apiUrl}/${comentario.id}`, comentario);
    }
    const headers = new HttpHeaders({ 'X-User-Id': String(comentario.userId) });
    return this.http.post<Comentario>(`${this.apiUrl}/avaliacao/${idAvaliacao}`, comentario, {headers});
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}