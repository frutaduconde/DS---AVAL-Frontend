import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Avaliacao } from '../../models/avaliacao';
import { Jogo } from '../../models/jogo';
import { Pessoa } from '../../models/pessoa';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { JogoService } from '../../services/jogo.service';
import { PessoaService } from '../../services/pessoa.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
    selector: 'app-avaliacao-form',
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    templateUrl: './avaliacao-form.html',
    styleUrl: './avaliacao-form.css',
})
export class AvaliacaoForm implements OnInit {

    mensagemErro = '';
    id?: string;
    formAvaliacao: FormGroup;
    jogos: Jogo[] = [];
    pessoas: Pessoa[] = [];
    isMonitor: boolean;
    origemJogoId?: string;

    constructor(
        private fb: FormBuilder,
        private avaliacaoService: AvaliacaoService,
        private jogoService: JogoService,
        private pessoaService: PessoaService,
        private autenticacaoService: AutenticacaoService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.isMonitor = this.autenticacaoService.isMonitor();

        this.formAvaliacao = this.fb.group({
            nota: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
            estado: ['INCOMPLETO', Validators.required],
            idJogo: ['', Validators.required],
            userId: ['', Validators.required]
        });

        // Usuário comum sempre avalia como ele mesmo, o campo não é uma escolha.
        if (!this.isMonitor) {
            const usuarioLogado = this.autenticacaoService.getUsuarioLogado();
            this.formAvaliacao.patchValue({ userId: usuarioLogado?.id });
            this.formAvaliacao.get('userId')?.disable();
        }
    }

    ngOnInit(): void {
        this.carregarJogos();
        this.carregarPessoas();

        this.id = this.activatedRoute.snapshot.paramMap.get('id') ?? undefined;
        this.origemJogoId = this.activatedRoute.snapshot.queryParamMap.get('idJogo') ?? undefined;

        if (this.origemJogoId && !this.id) {
            this.formAvaliacao.patchValue({ idJogo: this.origemJogoId });
            this.formAvaliacao.get('idJogo')?.disable();
        }

        if (this.id) {
            this.formAvaliacao.get('idJogo')?.clearValidators();
            this.formAvaliacao.get('idJogo')?.updateValueAndValidity();
            this.formAvaliacao.get('idJogo')?.disable();
            this.avaliacaoService.buscarPorId(this.id).subscribe({
                next: (avaliacao: Avaliacao) => {
                    this.formAvaliacao.patchValue({
                        nota: avaliacao.nota,
                        estado: avaliacao.estado,
                        userId: avaliacao.userId
                    });
                },
                error: () => {
                    this.mensagemErro = 'Erro ao carregar os dados da avaliação.';
                }
            });
        }
    }
    carregarJogos(): void {
        this.jogoService.listar().subscribe({
            next: (dados: Jogo[]) => { 
                this.jogos = dados; 
            },
            error: () => { 
                this.mensagemErro = 'Erro ao carregar jogos.'; 
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

    salvar(): void {
        if (this.formAvaliacao.invalid) {
            this.formAvaliacao.markAllAsTouched();
            return;
        }

        const avaliacao: Avaliacao = this.formAvaliacao.getRawValue();
        avaliacao.id = this.id ? Number(this.id) : undefined;
        const idJogo = Number(this.formAvaliacao.get('idJogo')?.value);

        this.avaliacaoService.salvar(avaliacao, idJogo).subscribe({
            next: () => {
                if (this.origemJogoId) {
                    this.router.navigate(['/biblioteca', this.origemJogoId]);
                } else {
                    this.router.navigate([this.isMonitor ? '/avaliacoes' : '/usuario']);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.mensagemErro = err.error?.message ?? 'Erro ao salvar avaliação.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formAvaliacao.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }
}