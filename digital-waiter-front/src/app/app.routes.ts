import {Routes} from '@angular/router';import {authGuard,roleGuard} from './core/guards/auth.guard';import {APP_EDITION} from './app-edition';
const clientRoute:Routes=[{path:'cliente',loadComponent:()=>import('./features/cliente/cliente.component').then(m=>m.ClienteComponent)}];
const businessRoutes:Routes=[
 {path:'establecimiento',loadComponent:()=>import('./features/autenticacion/inicio-sesion.component').then(m=>m.InicioSesionComponent)},
 {path:'login',pathMatch:'full',redirectTo:'establecimiento'},
 {path:'',canActivate:[authGuard],loadComponent:()=>import('./layout/shell/shell.component').then(m=>m.ShellComponent),children:[
  {path:'inicio',canActivate:[roleGuard(['Administrador','Mesero','Cajero'])],loadComponent:()=>import('./features/dashboard/dashboard.component').then(m=>m.DashboardComponent)},
  {path:'mesas',canActivate:[roleGuard(['Administrador','Mesero','Cajero'])],loadComponent:()=>import('./features/mesas/mesas.component').then(m=>m.MesasComponent)},
  {path:'pedidos',loadComponent:()=>import('./features/pedidos/pedidos.component').then(m=>m.PedidosComponent)},
  {path:'cocina',canActivate:[roleGuard(['Administrador','Cocina'])],loadComponent:()=>import('./features/cocina/cocina.component').then(m=>m.CocinaComponent)},
  {path:'menu',canActivate:[roleGuard(['Administrador','Mesero','Cocina'])],loadComponent:()=>import('./features/menu/menu.component').then(m=>m.MenuComponent)},
  {path:'inventario',canActivate:[roleGuard(['Administrador'])],loadComponent:()=>import('./features/inventario/inventario.component').then(m=>m.InventarioComponent)},
  {path:'usuarios',canActivate:[roleGuard(['Administrador'])],loadComponent:()=>import('./features/usuarios/usuarios.component').then(m=>m.UsuariosComponent)},
  {path:'asistente',canActivate:[roleGuard(['Administrador'])],loadComponent:()=>import('./features/asistente/asistente.component').then(m=>m.AsistenteComponent)},
  {path:'reportes',canActivate:[roleGuard(['Administrador','Cajero'])],loadComponent:()=>import('./features/reportes/reportes.component').then(m=>m.ReportesComponent)},
  {path:'',pathMatch:'full',redirectTo:'inicio'}]}
];
export const routes:Routes=[
 ...(APP_EDITION==='business'?[]:clientRoute),
 ...(APP_EDITION==='client'?[]:businessRoutes),
 {path:'',pathMatch:'full',redirectTo:APP_EDITION==='business'?'establecimiento':'cliente'},
 {path:'**',redirectTo:APP_EDITION==='business'?'establecimiento':'cliente'}
];
