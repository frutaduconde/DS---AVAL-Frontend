import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Jogo } from '../../models/jogo';
import { Avaliacao } from '../../models/avaliacao';
import { Comentario } from '../../models/comentario';
import { Pessoa } from '../../models/pessoa';
import { Desenvolvedor } from '../../models/desenvolvedor';
import { JogoService } from '../../services/jogo.service';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { ComentarioService } from '../../services/comentario.service';
import { PessoaService } from '../../services/pessoa.service';
import { DesenvolvedorService } from '../../services/desenvolvedor.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

const CAPA_PADRAO = 'https://placehold.co/300x400/1a1a1a/e0e0e0?text=Sem+Capa';

interface AvaliacaoExibicao extends Avaliacao {
    nomeUsuario: string;
    comentarios: (Comentario & { nomeUsuario: string })[];
    novoComentario: string;
}

@Component({
    selector: 'app-jogo-detalhe',
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: './jogo-detalhe.html',
    styleUrl: './jogo-detalhe.css',
})
export class JogoDetalhe implements OnInit {

    jogo: Jogo | null = null;
    desenvolvedor: Desenvolvedor | null = null;
    avaliacoes: AvaliacaoExibicao[] = [];
    mensagemErro = '';
    carregando = true;
    capaPadrao = CAPA_PADRAO;

    constructor(
        private activatedRoute: ActivatedRoute,
        private jogoService: JogoService,
        private avaliacaoService: AvaliacaoService,
        private comentarioService: ComentarioService,
        private pessoaService: PessoaService,
        private desenvolvedorService: DesenvolvedorService,
        private autenticacaoService: AutenticacaoService
    ) { }

    get usuarioLogado(): Pessoa | null {
        return this.autenticacaoService.getUsuarioLogado();
    }

    get jaAvaliei(): boolean {
        const usuario = this.usuarioLogado;
        return !!usuario && this.avaliacoes.some(a => a.userId === usuario.id);
    }

    get minhaAvaliacao(): AvaliacaoExibicao | undefined {
        const usuario = this.usuarioLogado;
        return this.avaliacoes.find(a => a.userId === usuario?.id);
    }

    ngOnInit(): void {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        if (!id) {
            this.mensagemErro = 'Jogo não informado.';
            this.carregando = false;
            return;
        }

        this.jogoService.buscarPorId(id).subscribe({
            next: (jogo) => {
                this.jogo = jogo;
                if (jogo.devId) {
                    this.desenvolvedorService.buscarPorId(String(jogo.devId)).subscribe({
                        next: (dev) => { this.desenvolvedor = dev; }
                    });
                }
                this.carregarAvaliacoesEComentarios(Number(id));
            },
            error: () => {
                this.mensagemErro = 'Jogo não encontrado.';
                this.carregando = false;
            }
        });
    }

    private carregarAvaliacoesEComentarios(idJogo: number): void {
        forkJoin({
            avaliacoes: this.avaliacaoService.listar(),
            comentarios: this.comentarioService.listar(),
            pessoas: this.pessoaService.listar()
        }).subscribe({
            next: ({ avaliacoes, comentarios, pessoas }) => {
                const nomePessoa = (userId?: number) =>
                    pessoas.find(p => p.id === userId)?.nome ?? `Usuário #${userId}`;

                this.avaliacoes = avaliacoes
                    .filter(av => av.jogoId === idJogo)
                    .map(av => ({
                        ...av,
                        nomeUsuario: nomePessoa(av.userId),
                        novoComentario: '',
                        comentarios: comentarios
                            .filter(c => c.avaliacaoId === av.id)
                            .map(c => ({ ...c, nomeUsuario: nomePessoa(c.userId) }))
                    }));

                this.carregando = false;
            },
            error: () => {
                this.mensagemErro = 'Erro ao carregar as avaliações deste jogo.';
                this.carregando = false;
            }
        });
    }

    enviarComentario(avaliacao: AvaliacaoExibicao): void {
        const usuario = this.usuarioLogado;
        if (!usuario || !avaliacao.novoComentario?.trim()) {
            return;
        }

        const comentario: Comentario = {
            texto: avaliacao.novoComentario.trim(),
            userId: usuario.id,
            avaliacaoId: avaliacao.id
        };

        this.comentarioService.salvar(comentario, avaliacao.id!).subscribe({
            next: (novo) => {
                avaliacao.comentarios.push({ ...novo, nomeUsuario: usuario.nome });
                avaliacao.novoComentario = '';
            },
            error: () => {
                this.mensagemErro = 'Erro ao enviar comentário.';
            }
        });
    }

    excluirAvaliacao(id: number): void {
        if (!confirm('Deseja realmente excluir sua avaliação?')) return;
        this.avaliacaoService.excluir(id.toString()).subscribe({
            next: () => {
                this.avaliacoes = this.avaliacoes.filter(a => a.id !== id);
            },
            error: () => {
                this.mensagemErro = 'Erro ao excluir avaliação.';
            }
        });
    }
}