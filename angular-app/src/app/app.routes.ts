import {Routes} from '@angular/router';import {authGuard} from './core/guards/auth.guard';
export const routes:Routes=[
 {path:'login',loadComponent:()=>import('./features/autenticacion/inicio-sesion.component').then(m=>m.InicioSesionComponent)},
 {path:'',canActivate:[authGuard],loadComponent:()=>import('./layout/shell/shell.component').then(m=>m.ShellComponent),children:[
  {path:'inicio',loadComponent:()=>import('./features/dashboard/dashboard.component').then(m=>m.DashboardComponent)},
  {path:'mesas',loadComponent:()=>import('./features/mesas/mesas.component').then(m=>m.MesasComponent)},
  {path:'pedidos',loadComponent:()=>import('./features/pedidos/pedidos.component').then(m=>m.PedidosComponent)},
  {path:'cocina',loadComponent:()=>import('./features/cocina/cocina.component').then(m=>m.CocinaComponent)},
  {path:'menu',loadComponent:()=>import('./features/menu/menu.component').then(m=>m.MenuComponent)},
  {path:'inventario',loadComponent:()=>import('./features/inventario/inventario.component').then(m=>m.InventarioComponent)},
  {path:'reportes',loadComponent:()=>import('./features/reportes/reportes.component').then(m=>m.ReportesComponent)},
  {path:'',pathMatch:'full',redirectTo:'inicio'}]},
 {path:'**',redirectTo:'login'}];
