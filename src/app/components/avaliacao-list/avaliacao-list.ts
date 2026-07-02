import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avaliacao } from '../../models/avaliacao';
import { Pessoa } from '../../models/pessoa';
import { Jogo } from '../../models/jogo';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { PessoaService } from '../../services/pessoa.service';
import { JogoService } from '../../services/jogo.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
  selector: 'app-avaliacao-list',
  imports: [RouterLink],
  templateUrl: './avaliacao-list.html',
  styleUrl: './avaliacao-list.css',
})
export class AvaliacaoList implements OnInit {

  avaliacoes: Avaliacao[] = [];
  pessoas: Pessoa[] = [];
  jogos: Jogo[] = [];
  mensagemErro = '';

  constructor(
    private avaliacaoService: AvaliacaoService,
    private pessoaService: PessoaService,
    private jogoService: JogoService,
    private autenticacaoService: AutenticacaoService
  ) { }

  get meuId(): number | undefined {
    return this.autenticacaoService.getUsuarioLogado()?.id;
  }

  ngOnInit(): void { 
    this.pessoaService.listar().subscribe({ next: (dados) => { this.pessoas = dados; } });
    this.jogoService.listar().subscribe({ next: (dados) => { this.jogos = dados; } });
    this.listar(); 
  }

  nomePessoa(userId?: number): string {
    return this.pessoas.find(p => p.id === userId)?.nome ?? `Usuário #${userId}`;
  }

  nomeJogo(jogoId?: number): string {
    return this.jogos.find(j => j.id === jogoId)?.nome ?? `Jogo #${jogoId}`;
  }

  listar(): void {
    this.avaliacaoService.listar().subscribe({
      next: (dados) => { 
        this.avaliacoes = dados; 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao carregar avaliações.'; 
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta avaliação?')) {
      return;
    }
    this.avaliacaoService.excluir(id.toString()).subscribe({
      next: () => { 
        this.listar(); 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao excluir avaliação.'; 
      }
    });
  }
}