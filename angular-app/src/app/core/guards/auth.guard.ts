import {inject} from '@angular/core';import {CanActivateFn,Router} from '@angular/router';import {StoreService} from '../services/store.service';
export const authGuard:CanActivateFn=()=>inject(StoreService).session()?true:inject(Router).createUrlTree(['/login']);
