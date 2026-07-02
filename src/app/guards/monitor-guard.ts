import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../services/autenticacao.service';

export const monitorGuard: CanActivateFn = () => {
  const autenticacaoService = inject(AutenticacaoService);
  const router = inject(Router);

  if (autenticacaoService.isMonitor()) {
    return true;
  }

  router.navigate(['/usuario']);
  return false;
};