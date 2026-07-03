import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Credencial } from '../models/credencial';
import { Pessoa } from '../models/pessoa';

const CHAVE_STORAGE = 'aval_usuario_logado';

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {

  private readonly apiUrl = 'https://ds-aval.onrender.com/auth';
  private usuarioAtualSubject = new BehaviorSubject<Pessoa | null>(this.carregarUsuarioSalvo());
  usuarioAtual$ = this.usuarioAtualSubject.asObservable();

  constructor(private http: HttpClient) { }

  private carregarUsuarioSalvo(): Pessoa | null {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    return bruto ? JSON.parse(bruto) : null;
  }

  login(credencial: Credencial): Observable<Pessoa> {
    return this.http.post<Pessoa>(`${this.apiUrl}/login`, credencial).pipe(
      tap(pessoa => {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(pessoa));
        this.usuarioAtualSubject.next(pessoa);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(CHAVE_STORAGE);
    this.usuarioAtualSubject.next(null);
  }

  getUsuarioLogado(): Pessoa | null {
    return this.usuarioAtualSubject.value;
  }

  estaLogado(): boolean {
    return this.usuarioAtualSubject.value !== null;
  }

  isMonitor(): boolean {
    return this.usuarioAtualSubject.value?.ator === 'MONITOR';
  }
}