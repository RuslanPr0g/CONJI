import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const productionGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (environment.production) {
    router.navigate(['/conjugation']);
    return false;
  }

  return true;
};
