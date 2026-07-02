import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Jogo } from '../../models/jogo';
import { Desenvolvedor } from '../../models/desenvolvedor';
import { JogoService } from '../../services/jogo.service';
import { DesenvolvedorService } from '../../services/desenvolvedor.service';

@Component({
    selector: 'app-jogo-form',
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    templateUrl: './jogo-form.html',
    styleUrl: './jogo-form.css',
})
export class JogoForm implements OnInit {

    mensagemErro = '';
    id?: string;
    formJogo: FormGroup;
    generos: string[] = ['RPG', 'FPS', 'PUZZLE', 'RTS', 'ESPORTES', 'CORRIDA', 'INDIE', 'SANDBOX', 'SOBREVIVENCIA', 'ACAO', 'AVENTURA', 'ESTRATEGIA', 'SIMULACAO', 'TERROR', 'PLATAFORMA', 'LUTA', 'MOBA', 'BATTLE_ROYALE', 'CASUAL', 'RITMO'];
    desenvolvedores: Desenvolvedor[] = [];
    notaGeralAtual = 0;

    constructor(
        private fb: FormBuilder,
        private jogoService: JogoService,
        private desenvolvedorService: DesenvolvedorService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.formJogo = this.fb.group({
            nmJogo: ['', [Validators.required, Validators.minLength(2)]],
            dtLancamento: ['', Validators.required],
            genero: ['', Validators.required],
            devId: ['', Validators.required],
            urlCapa: ['']
        });
    }

    ngOnInit(): void {
        this.carregarDesenvolvedores();

        this.id = this.activatedRoute.snapshot.paramMap.get('id') ?? undefined;

        if (this.id) {
            this.jogoService.buscarPorId(this.id).subscribe({
                next: (jogo) => {
                    this.notaGeralAtual = jogo.notaGeral ?? 0;
                    this.formJogo.patchValue({
                        nmJogo: jogo.nmJogo,
                        dtLancamento: jogo.dtLancamento ? jogo.dtLancamento.substring(0, 10) : '',
                        genero: jogo.genero,
                        devId: jogo.devId,
                        urlCapa: jogo.urlCapa
                    });
                },
                error: () => {
                    this.mensagemErro = 'Erro ao carregar os dados do jogo.';
                }
            });
        }
    }

    carregarDesenvolvedores(): void {
        this.desenvolvedorService.listar().subscribe({
            next: (dados: Desenvolvedor[]) => { 
                this.desenvolvedores = dados; 
            },
            error: () => { 
                this.mensagemErro = 'Erro ao carregar desenvolvedores.'; 
            }
        });
    }

    salvar(): void {
        if (this.formJogo.invalid) {
            this.formJogo.markAllAsTouched();
            return;
        }

        const jogo: Jogo = this.formJogo.value;
        jogo.id = this.id ? Number(this.id) : undefined;
        jogo.devId = Number(jogo.devId);
        if (jogo.dtLancamento && jogo.dtLancamento.length === 10) {
            jogo.dtLancamento = `${jogo.dtLancamento}T00:00:00`;
        }
        jogo.notaGeral = this.notaGeralAtual ?? 0;
        this.jogoService.salvar(jogo).subscribe({
            next: () => {
                this.router.navigate(['/jogos']);
            },
            error: () => {
                this.mensagemErro = 'Erro ao salvar jogo.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formJogo.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }
}