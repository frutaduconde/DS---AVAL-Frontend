import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Desenvolvedor } from '../models/desenvolvedor';

@Injectable({ 
  providedIn: 'root' 
})
export class DesenvolvedorService {
  private readonly apiUrl = 'https://ds-aval.onrender.com/desenvolvedoras';
  constructor(private http: HttpClient) { }

  listar(): Observable<Desenvolvedor[]> {
    return this.http.get<Desenvolvedor[]>(this.apiUrl);
  }
  buscarPorId(id: string): Observable<Desenvolvedor> {
    return this.http.get<Desenvolvedor>(`${this.apiUrl}/${id}`);
  }
  salvar(dev: Desenvolvedor): Observable<Desenvolvedor> {
    if (dev.id) return this.http.put<Desenvolvedor>(`${this.apiUrl}/${dev.id}`, dev);
    return this.http.post<Desenvolvedor>(this.apiUrl, dev);
  }
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}