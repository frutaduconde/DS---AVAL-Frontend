import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jogo } from '../models/jogo';

@Injectable({
  providedIn: 'root',
})
export class JogoService {
  
  private readonly apiUrl = 'http://localhost:8080/jogos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.apiUrl}/${id}`);
  }

  salvar(jogo: Jogo): Observable<Jogo> {
    if (jogo.id) {
      return this.http.put<Jogo>(`${this.apiUrl}/${jogo.id}`, jogo);
    }
    return this.http.post<Jogo>(this.apiUrl, jogo);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}