import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
    modoEdicao = false;
    avaliacaoFixa = false;
    pessoaFixa = false;
    nomeAvaliacaoContexto = '';
    nomePessoaContexto = '';

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
    }

    ngOnInit(): void {
        this.id = this.activatedRoute.snapshot.paramMap.get('id') ?? undefined;
        this.modoEdicao = !!this.id;
        this.pessoaFixa = this.modoEdicao || !this.isMonitor;

        if (this.pessoaFixa) {
            const usuarioLogado = this.autenticacaoService.getUsuarioLogado();
            this.formComentario.patchValue({ userId: usuarioLogado?.id });
            this.nomePessoaContexto = usuarioLogado?.nome ?? '';
        } else {
            this.carregarPessoas();
        }
        this.avaliacaoFixa = this.modoEdicao;

        if (!this.avaliacaoFixa) {
            this.carregarAvaliacoes();
        }

        if (this.modoEdicao) {
            this.formComentario.get('avaliacaoId')?.clearValidators();
            this.formComentario.get('avaliacaoId')?.updateValueAndValidity();

            this.comentarioService.buscarPorId(this.id!).subscribe({
                next: (comentario: Comentario) => {
                    this.formComentario.patchValue({
                        texto: comentario.texto,
                        avaliacaoId: comentario.avaliacaoId
                    });
                    if (comentario.avaliacaoId) {
                        this.avaliacaoService.buscarPorId(String(comentario.avaliacaoId)).subscribe({
                            next: (av) => { this.nomeAvaliacaoContexto = `Avaliação #${av.id} (nota ${av.nota})`; }
                        });
                    }
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

        const comentario: Comentario = this.formComentario.value;
        comentario.id = this.id ? Number(this.id) : undefined;
        const avaliacaoId = Number(this.formComentario.get('avaliacaoId')?.value);

        this.comentarioService.salvar(comentario, avaliacaoId).subscribe({
            next: () => {
                this.router.navigate([this.isMonitor ? '/comentarios' : '/usuario']);
            },
            error: (err: HttpErrorResponse) => {
                this.mensagemErro = err.error?.message ?? 'Erro ao salvar comentário.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formComentario.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }
}