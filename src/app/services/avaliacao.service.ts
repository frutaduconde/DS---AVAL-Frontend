import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avaliacao } from '../models/avaliacao';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  
  private readonly apiUrl = 'http://localhost:8080/avaliacoes';

  constructor(private http: HttpClient) { }

  listar(): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(this.apiUrl);
  }

  listarPorJogo(idJogo: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.apiUrl}?idJogo=${idJogo}`);
  }

  buscarPorId(id: string): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.apiUrl}/${id}`);
  }

  salvar(avaliacao: Avaliacao, idJogo: number): Observable<Avaliacao> {
    if (avaliacao.id) {
      return this.http.put<Avaliacao>(`${this.apiUrl}/${avaliacao.id}`, avaliacao);
    }
    return this.http.post<Avaliacao>(`${this.apiUrl}/jogo/${idJogo}`, avaliacao);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}