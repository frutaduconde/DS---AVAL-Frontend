import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {

    mensagemErro = '';
    formLogin: FormGroup;

    constructor(
        private fb: FormBuilder,
        private autenticacaoService: AutenticacaoService,
        private router: Router
    ) {
        this.formLogin = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            senha: ['', Validators.required]
        });
    }

    entrar(): void {
        if (this.formLogin.invalid) {
            this.formLogin.markAllAsTouched();
            return;
        }

        this.autenticacaoService.login(this.formLogin.value).subscribe({
            next: () => {
                this.router.navigate(['/biblioteca']);
            },
            error: (err: HttpErrorResponse) => {
                this.mensagemErro = err.error?.message ?? 'Dados incorretos. Verifique e-mail e senha.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formLogin.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }
}