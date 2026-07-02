import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Jogo } from '../../models/jogo';
import { JogoService } from '../../services/jogo.service';

const CAPA_PADRAO = 'https://placehold.co/300x400/1a1a1a/e0e0e0?text=Sem+Capa';

@Component({
    selector: 'app-biblioteca',
    imports: [RouterLink, FormsModule],
    templateUrl: './biblioteca.html',
    styleUrl: './biblioteca.css',
})
export class Biblioteca implements OnInit {

    jogos: Jogo[] = [];
    jogosFiltrados: Jogo[] = [];
    mensagemErro = '';
    termoBusca = '';
    capaPadrao = CAPA_PADRAO;

    constructor(private jogoService: JogoService) { }

    ngOnInit(): void {
        this.jogoService.listar().subscribe({
            next: (dados) => {
                this.jogos = dados;
                this.jogosFiltrados = dados;
            },
            error: () => {
                this.mensagemErro = 'Erro ao carregar o catálogo de jogos.';
            }
        });
    }

    filtrar(): void {
        const termo = this.termoBusca.trim().toLowerCase();
        this.jogosFiltrados = !termo
            ? this.jogos
            : this.jogos.filter(j => (j.nome ?? '').toLowerCase().includes(termo));
    }
}