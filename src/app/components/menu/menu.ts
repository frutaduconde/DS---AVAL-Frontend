import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

  constructor(
    private autenticacaoService: AutenticacaoService,
    private router: Router
  ) { }

  get usuario() {
    return this.autenticacaoService.getUsuarioLogado();
  }

  get isMonitor(): boolean {
    return this.autenticacaoService.isMonitor();
  }

  sair(): void {
    this.autenticacaoService.logout();
    this.router.navigate(['/login']);
  }
}