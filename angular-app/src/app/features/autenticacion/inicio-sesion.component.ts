import {Component,inject,signal} from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {AuthService} from '../../core/services/auth.service';
import {Role} from '../../models/app.models';

@Component({
 selector:'app-inicio-sesion',standalone:true,imports:[ReactiveFormsModule],
 template:`
 <main class="login-experience" [class.form-visible]="showForm()">
  <section class="login-presentation">
   <div class="brand login-logo"><span>⌁</span><b>DIGITAL <i>WAITER</i></b></div>
   <div class="presentation-copy">
    <div class="tables-art login-art" aria-label="Estados de las mesas">
     <i><small>Disponible</small>01</i><i><small>Ocupada</small>02</i>
     <i><small>Preparando</small>03</i><i><small>Por cobrar</small>04</i>
    </div>
    <div class="presentation-text">
     <small>OPERACIÓN EN TIEMPO REAL</small>
     <h1 class="moving-title"><span>Todo</span> <span>tu</span> <span>restaurante,</span><br><span>en</span> <span>una</span> <span>sola</span> <span>pantalla.</span></h1>
     <p>Mesas, pedidos, cocina e inventario conectados en una experiencia rápida, clara y fácil de utilizar.</p>
     <div class="login-benefits moving-benefits"><span>✓ Control por roles</span><span>✓ Pedidos organizados</span><span>✓ Métricas actualizadas</span></div>
    </div>
   </div>
   @if(!showForm()){
    <button class="login-launch" [class.disintegrating]="disintegrating()" [class.regenerating]="regenerating()" (click)="openLogin()" [disabled]="disintegrating()">
     <span class="launch-label">Iniciar sesión</span><span class="launch-arrow">→</span>
     <span class="particle p1"></span><span class="particle p2"></span><span class="particle p3"></span><span class="particle p4"></span><span class="particle p5"></span><span class="particle p6"></span>
    </button>
   }
  </section>

  <aside class="login-panel" [attr.aria-hidden]="!showForm()">
   <button type="button" class="login-back" (click)="closeLogin()">← Volver</button>
   <form [formGroup]="form" (ngSubmit)="submit()">
    <small>BIENVENIDO</small><h2>Iniciar sesión</h2><p>Selecciona tu rol e ingresa para comenzar.</p>
    <div class="roles">@for(role of roles;track role){<button type="button" [class.active]="form.value.role===role" (click)="form.patchValue({role})">{{role}}</button>}</div>
    <label>Usuario<input formControlName="name" autocomplete="username"></label>
    <label>Contraseña<input formControlName="password" type="password" autocomplete="current-password"></label>
    @if(error()){<div class="form-error">Revisa el usuario o la contraseña.</div>}
    <button class="primary" type="submit">Ingresar al sistema →</button><em>Demo: 1234, 5678 o 9999</em>
   </form>
  </aside>
 </main>`
})
export class InicioSesionComponent{
 private fb=inject(FormBuilder);private auth=inject(AuthService);
 roles:Role[]=['Administrador','Mesero','Cajero','Cocina'];error=signal(false);
 showForm=signal(false);disintegrating=signal(false);regenerating=signal(true);
 form=this.fb.nonNullable.group({name:['Cristian Coro',Validators.required],password:['1234',Validators.required],role:['Administrador' as Role,Validators.required]});
 constructor(){setTimeout(()=>this.regenerating.set(false),850)}
 openLogin(){if(this.disintegrating())return;this.disintegrating.set(true);setTimeout(()=>{this.showForm.set(true);this.disintegrating.set(false)},620)}
 closeLogin(){this.showForm.set(false);this.regenerating.set(true);setTimeout(()=>this.regenerating.set(false),850)}
 submit(){const v=this.form.getRawValue();this.error.set(!this.auth.login(v.name,v.password,v.role))}
}
