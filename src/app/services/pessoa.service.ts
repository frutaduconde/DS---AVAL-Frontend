import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pessoa } from '../models/pessoa';

@Injectable({ 
  providedIn: 'root' 
})
export class PessoaService {
  private readonly apiUrl = 'https://ds-aval.onrender.com/pessoas';
  constructor(private http: HttpClient) { }

  listar(): Observable<Pessoa[]> {
    return this.http.get<Pessoa[]>(this.apiUrl);
  }
  buscarPorId(id: string): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`);
  }
  salvar(pessoa: Pessoa): Observable<Pessoa> {
    if (pessoa.id) return this.http.put<Pessoa>(`${this.apiUrl}/${pessoa.id}`, pessoa);
    return this.http.post<Pessoa>(this.apiUrl, pessoa);
  }
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}