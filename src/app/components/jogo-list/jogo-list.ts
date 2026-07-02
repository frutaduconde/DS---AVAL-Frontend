import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Jogo } from '../../models/jogo';
import { JogoService } from '../../services/jogo.service';

@Component({
  selector: 'app-jogo-list',
  imports: [RouterLink],
  templateUrl: './jogo-list.html',
  styleUrl: './jogo-list.css',
})
export class JogoList implements OnInit {

  jogos: Jogo[] = [];
  mensagemErro = '';
  mensagemSucesso = '';

  constructor(private jogoService: JogoService) { }

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.jogoService.listar().subscribe({
      next: (dados) => { 
        this.jogos = dados; 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao carregar a lista de jogos.'; 
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este jogo?')) {
      return;
    }

    this.jogoService.excluir(id.toString()).subscribe({
      next: () => { 
        this.listar(); 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao excluir jogo.'; 
      }
    });
  }
}