import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PessoaService } from '../../services/pessoa.service';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha')?.value;
    const confirmar = control.get('confirmarSenha')?.value;
    return senha && confirmar && senha !== confirmar ? { senhasDiferentes: true } : null;
}

@Component({
    selector: 'app-cadastro',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './cadastro.html',
    styleUrl: './cadastro.css',
})
export class Cadastro {

    mensagemErro = '';
    mensagemSucesso = '';
    formCadastro: FormGroup;

    constructor(
        private fb: FormBuilder,
        private pessoaService: PessoaService,
        private router: Router
    ) {
        this.formCadastro = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            cpf: ['', [Validators.required, Validators.minLength(11)]],
            senha: ['', [Validators.required, Validators.minLength(4)]],
            confirmarSenha: ['', Validators.required]
        }, { validators: senhasIguaisValidator });
    }

    cadastrar(): void {
        this.mensagemErro = '';

        if (this.formCadastro.invalid) {
            this.formCadastro.markAllAsTouched();
            return;
        }

        const { confirmarSenha, ...dados } = this.formCadastro.value;

        this.pessoaService.salvar({ ...dados, ator: 'USUARIO' }).subscribe({
            next: () => {
                this.mensagemSucesso = 'Conta criada com sucesso! Redirecionando para o login...';
                setTimeout(() => this.router.navigate(['/login']), 1500);
            },
            error: (err: HttpErrorResponse) => {
                this.mensagemErro = err.error?.message ?? 'Erro ao criar a conta. Verifique os dados informados.';
            }
        });
    }

    validarCampo(campo: string, erro: string): boolean {
        const controle = this.formCadastro.get(campo);
        return !!(controle && controle.touched && controle.hasError(erro));
    }

    senhasDiferentes(): boolean {
        const confirmar = this.formCadastro.get('confirmarSenha');
        return !!(confirmar && confirmar.touched && this.formCadastro.hasError('senhasDiferentes'));
    }
}