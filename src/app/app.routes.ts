import { Routes } from '@angular/router';
import { Principal } from './components/layout/principal/principal';
import { JogoList } from './components/jogo-list/jogo-list';
import { JogoForm } from './components/jogo-form/jogo-form';
import { AvaliacaoList } from './components/avaliacao-list/avaliacao-list';
import { AvaliacaoForm } from './components/avaliacao-form/avaliacao-form';
import { ComentarioList } from './components/comentario-list/comentario-list';
import { ComentarioForm } from './components/comentario-form/comentario-form';
import { Usuario } from './components/usuario/usuario';
import { Login } from './components/login/login';
import { Cadastro } from './components/cadastro/cadastro';
import { Biblioteca } from './components/biblioteca/biblioteca';
import { JogoDetalhe } from './components/jogo-detalhe/jogo-detalhe';
import { authGuard } from './guards/auth-guard';
import { monitorGuard } from './guards/monitor-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'cadastro',
    component: Cadastro
  },
  {
    path: '',
    component: Principal,
    canActivate: [authGuard],
    children: [
      {
        path: 'biblioteca',
        component: Biblioteca
      },
      {
        path: 'biblioteca/:id',
        component: JogoDetalhe
      },
      {
        path: 'jogos',
        component: JogoList,
        canActivate: [monitorGuard]
      },
      {
        path: 'jogos/cadastrar',
        component: JogoForm,
        canActivate: [monitorGuard]
      },
      {
        path: 'jogos/alterar/:id',
        component: JogoForm,
        canActivate: [monitorGuard]
      },
      {
        path: 'avaliacoes',
        component: AvaliacaoList,
        canActivate: [monitorGuard]
      },
      {
        path: 'avaliacoes/cadastrar',
        component: AvaliacaoForm
      },
      {
        path: 'avaliacoes/alterar/:id',
        component: AvaliacaoForm
      },
      {
        path: 'comentarios',
        component: ComentarioList,
        canActivate: [monitorGuard]
      },
      {
        path: 'comentarios/cadastrar',
        component: ComentarioForm
      },
      {
        path: 'comentarios/alterar/:id',
        component: ComentarioForm
      },
      {
        path: 'usuario',
        component: Usuario
      },
      {
        path: '',
        redirectTo: 'biblioteca',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];