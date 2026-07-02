import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../models/comentario';
import { Avaliacao } from '../../models/avaliacao';
import { Pessoa } from '../../models/pessoa';
import { ComentarioService } from '../../services/comentario.service';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { PessoaService } from '../../services/pessoa.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
    selector: 'app-comentario-form',
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    templateUrl: './comentario-form.html',
    styleUrl: './comentario-form.css',
})
export class ComentarioForm implements OnInit {

    mensagemErro = '';
    id?: string;
    formComentario: FormGroup;
    avaliacoes: Avaliacao[] = [];
    pessoas: Pessoa[] = [];
    isMonitor: boolean;

    constructor(
        private fb: FormBuilder,
        private comentarioService: ComentarioService,
        private avaliacaoService: AvaliacaoService,
        private pessoaService: PessoaService,
        private autenticacaoService: AutenticacaoService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.isMonitor = this.autenticacaoService.isMonitor();

        this.formComentario = this.fb.group({
            texto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
            avaliacaoId: ['', Validators.required],
            userId: ['', Validators.required]
        });
        if (!this.isMonitor) {
            const usuarioLogado = this.autenticacaoService.getUsuarioLogado();
            this.formComentario.patchValue({ userId: usuarioLogado?.id });
            this.formComentario.get('userId')?.disable();
        }
    }

    ngOnInit(): void {
        this.carregarAvaliacoes();
        this.carregarPessoas();

        this.id = this.activatedRoute.snapshot.paramMap.get('id') ?? undefined;

        if (this.id) {
            this.comentarioService.buscarPorId(this.id).subscribe({
                next: (comentario: Comentario) => {
                    this.formComentario.patchValue({
                        texto: comentario.texto,
                        avaliacaoId: comentario.avaliacaoId,
                        userId: comentario.userId
                    });
                },
                error: () => {
                    this.mensagemErro = 'Erro ao carregar os dados do comentário.';
                }
            });
        }
    }

    carregarAvaliacoes(): void {
        this.avaliacaoService.listar().subscribe({
            next: (dados: Avaliacao[]) => { 
                this.avaliacoes = dados; 
            },
            error: () => { 
                this.mensagemErro = 'Erro ao carregar avaliações.'; 
            }
        });
    }

    carregarPessoas(): void {
        this.pessoaService.listar().subscribe({
            next: (dados: Pessoa[]) => { 
                this.pessoas = dados; 
            },
            error: () => { 
                this.mensagemErro = 'Erro ao carregar pessoas.'; 
            }
        });
    }

    nomePessoa(userId?: number): string {
        return this.pessoas.find(p => p.id === userId)?.nome ?? `Usuário #${userId}`;
    }

    salvar(): void {
        if (this.formComentario.invalid) {
            this.formComentario.markAllAsTouched();
            return;
        }

        const comentario: Comentario = this.formComentario.getRawValue();
        comentario.id = this.id ? Number(this.id) : undefined;
        const avaliacaoId = Number(this.formComentario.get('avaliacaoId')?.value);

        this.comentarioService.salvar(comentario, avaliacaoId).subscribe({
            next: () => {
                this.router.navigate([this.isMonitor ? '/comentarios' : '/usuario']);
            },
            error: () => {
                this.mensagemErro = 'Erro ao salvar comentário.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formComentario.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }
}