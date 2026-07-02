import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { ComentarioService } from '../../services/comentario.service';
import { JogoService } from '../../services/jogo.service';
import { Pessoa } from '../../models/pessoa';
import { Avaliacao } from '../../models/avaliacao';
import { Comentario } from '../../models/comentario';
import { Jogo } from '../../models/jogo';

@Component({
    selector: 'app-usuario',
    imports: [RouterLink],
    templateUrl: './usuario.html',
    styleUrl: './usuario.css',
})
export class Usuario implements OnInit {

    usuario: Pessoa | null = null;
    minhasAvaliacoes: Avaliacao[] = [];
    meusComentarios: Comentario[] = [];
    jogos: Jogo[] = [];
    mensagemErro = '';

    constructor(
        private autenticacaoService: AutenticacaoService,
        private avaliacaoService: AvaliacaoService,
        private comentarioService: ComentarioService,
        private jogoService: JogoService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.usuario = this.autenticacaoService.getUsuarioLogado();
        this.jogoService.listar().subscribe({ next: (dados) => { this.jogos = dados; } });
        this.carregarAvaliacoes();
        this.carregarComentarios();
    }

    carregarAvaliacoes(): void {
        this.avaliacaoService.listar().subscribe({
            next: (dados) => {
                this.minhasAvaliacoes = dados.filter(av => av.userId === this.usuario?.id);
            },
            error: () => { this.mensagemErro = 'Erro ao carregar suas avaliações.'; }
        });
    }

    carregarComentarios(): void {
        this.comentarioService.listar().subscribe({
            next: (dados) => {
                this.meusComentarios = dados.filter(c => c.userId === this.usuario?.id);
            },
            error: () => { this.mensagemErro = 'Erro ao carregar seus comentários.'; }
        });
    }

    nomeJogo(jogoId?: number): string {
        return this.jogos.find(j => j.id === jogoId)?.nome ?? `Jogo #${jogoId}`;
    }

    excluirAvaliacao(id: number): void {
        if (!confirm('Deseja realmente excluir esta avaliação?')) return;
        this.avaliacaoService.excluir(id.toString()).subscribe({
            next: () => this.carregarAvaliacoes(),
            error: () => { this.mensagemErro = 'Erro ao excluir avaliação.'; }
        });
    }

    excluirComentario(id: number): void {
        if (!confirm('Deseja realmente excluir este comentário?')) return;
        this.comentarioService.excluir(id.toString()).subscribe({
            next: () => this.carregarComentarios(),
            error: () => { this.mensagemErro = 'Erro ao excluir comentário.'; }
        });
    }

    sair(): void {
        this.autenticacaoService.logout();
        this.router.navigate(['/login']);
    }
}