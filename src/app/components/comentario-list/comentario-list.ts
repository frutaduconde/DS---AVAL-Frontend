import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comentario } from '../../models/comentario';
import { Pessoa } from '../../models/pessoa';
import { ComentarioService } from '../../services/comentario.service';
import { PessoaService } from '../../services/pessoa.service';

@Component({
  selector: 'app-comentario-list',
  imports: [RouterLink],
  templateUrl: './comentario-list.html',
  styleUrl: './comentario-list.css',
})
export class ComentarioList implements OnInit {

  comentarios: Comentario[] = [];
  pessoas: Pessoa[] = [];
  mensagemErro = '';

  constructor(
    private comentarioService: ComentarioService,
    private pessoaService: PessoaService
  ) { }

  ngOnInit(): void { 
    this.pessoaService.listar().subscribe({ next: (dados) => { this.pessoas = dados; } });
    this.listar(); 
  }


  nomePessoa(userId?: number): string {
    return this.pessoas.find(p => p.id === userId)?.nome ?? `Usuário #${userId}`;
  }

  listar(): void {
    this.comentarioService.listar().subscribe({
      next: (dados) => { 
        this.comentarios = dados; 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao carregar comentários.'; 
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este comentário?')) {
      return;
    }
    this.comentarioService.excluir(id.toString()).subscribe({
      next: () => { 
        this.listar(); 
      },
      error: () => { 
        this.mensagemErro = 'Erro ao excluir comentário.'; 
      }
    });
  }
}