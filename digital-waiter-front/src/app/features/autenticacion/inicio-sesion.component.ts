import {Component,inject,signal} from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {AuthService} from '../../core/services/auth.service';

@Component({selector:'app-inicio-sesion',standalone:true,imports:[ReactiveFormsModule],template:`
<main class="login-experience" [class.form-visible]="showForm()">
 <section class="login-presentation">
  <div class="login-brand-image"><img src="/digital-waiter-logo-v1.png" alt="Digital Waiter"></div>
  <div class="presentation-copy">
   <div class="tables-art login-art" aria-label="Estados de las mesas"><i><small>Disponible</small>01</i><i><small>Ocupada</small>02</i><i><small>Preparando</small>03</i><i><small>Por cobrar</small>04</i></div>
   <div class="presentation-text"><small>OPERACIÓN EN TIEMPO REAL</small><h1 class="moving-title"><span>Todo</span> <span>tu</span> <span>restaurante,</span><br><span>en</span> <span>una</span> <span>sola</span> <span>pantalla.</span></h1><p>Mesas, pedidos, cocina, caja e inventario conectados en una experiencia rápida y fácil de utilizar.</p><div class="login-benefits moving-benefits"><span>✓ Rol automático</span><span>✓ Pedidos organizados</span><span>✓ Negocios independientes</span></div></div>
  </div>
  @if(!showForm()){<button class="login-launch" [class.disintegrating]="disintegrating()" [class.regenerating]="regenerating()" (click)="openLogin()" [disabled]="disintegrating()"><span class="launch-label">Acceso del personal</span><span class="launch-arrow">→</span><span class="particle p1"></span><span class="particle p2"></span><span class="particle p3"></span><span class="particle p4"></span><span class="particle p5"></span><span class="particle p6"></span></button>}
 </section>
 <aside class="login-panel" [attr.aria-hidden]="!showForm()">
  <button type="button" class="login-back" (click)="closeLogin()">← Volver</button>
  <div class="access-tabs"><button type="button" [class.active]="mode()==='login'" (click)="setMode('login')">Ingresar</button><button type="button" [class.active]="mode()==='register'" (click)="setMode('register')">Registrar negocio</button></div>
  @if(mode()==='login'){
   <form [formGroup]="loginForm" (ngSubmit)="login()"><small>ESTABLECIMIENTO</small><h2>Acceso del personal</h2><p>Tu cuenta identifica automáticamente el restaurante y tu función.</p><label>Usuario<input formControlName="usuario" autocomplete="username"></label><label>Contraseña<input formControlName="password" type="password" autocomplete="current-password"></label>@if(error()){<div class="form-error">Revisa el usuario, la contraseña o la conexión con el servidor.</div>}<button class="primary" type="submit" [disabled]="loading()">{{loading()?'Conectando…':'Ingresar al sistema →'}}</button></form>
  } @else {
   <form [formGroup]="registerForm" (ngSubmit)="register()"><small>NUEVO ESTABLECIMIENTO</small><h2>Registra tu restaurante</h2><p>El propietario será creado como administrador y podrá registrar al personal.</p><div class="register-grid"><label>Restaurante<input formControlName="restaurante"></label><label>Ciudad<input formControlName="ciudad"></label><label>Propietario<input formControlName="propietario"></label><label>Teléfono<input formControlName="telefono"></label><label>Usuario<input formControlName="usuario" autocomplete="username"></label><label>Contraseña<input formControlName="password" type="password" autocomplete="new-password"></label></div>@if(error()){<div class="form-error">No se pudo registrar. Revisa los campos o utiliza otro usuario.</div>}<button class="primary" type="submit" [disabled]="loading()">{{loading()?'Creando…':'Crear restaurante →'}}</button></form>
  }
 </aside>
</main>`})
export class InicioSesionComponent{
 private fb=inject(FormBuilder);private auth=inject(AuthService);mode=signal<'login'|'register'>('login');error=signal(false);loading=signal(false);showForm=signal(false);disintegrating=signal(false);regenerating=signal(true);
 loginForm=this.fb.nonNullable.group({usuario:['',Validators.required],password:['',Validators.required]});
 registerForm=this.fb.nonNullable.group({restaurante:['',Validators.required],ciudad:[''],propietario:['',Validators.required],telefono:[''],usuario:['',Validators.required],password:['',[Validators.required,Validators.minLength(4)]]});
 constructor(){setTimeout(()=>this.regenerating.set(false),850)}
 openLogin(){if(this.disintegrating())return;this.disintegrating.set(true);setTimeout(()=>{this.showForm.set(true);this.disintegrating.set(false)},620)}
 closeLogin(){this.showForm.set(false);this.mode.set('login');this.error.set(false);this.regenerating.set(true);setTimeout(()=>this.regenerating.set(false),850)}
 setMode(mode:'login'|'register'){this.mode.set(mode);this.error.set(false)}
 async login(){if(this.loginForm.invalid||this.loading())return;this.loading.set(true);this.error.set(false);const v=this.loginForm.getRawValue();this.error.set(!(await this.auth.login(v.usuario,v.password)));this.loading.set(false)}
 async register(){if(this.registerForm.invalid||this.loading())return;this.loading.set(true);this.error.set(false);this.error.set(!(await this.auth.register(this.registerForm.getRawValue())));this.loading.set(false)}
}
