import {Component,inject,signal} from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {AuthService} from '../../core/services/auth.service';
import {Role} from '../../models/app.models';
import {RouterLink} from '@angular/router';

@Component({
 selector:'app-inicio-sesion',standalone:true,imports:[ReactiveFormsModule,RouterLink],
 template:`
 <main class="login-experience" [class.form-visible]="showForm()">
  <section class="login-presentation">
   <a class="login-brand-image" routerLink="/cliente"><img src="/digital-waiter-logo-v1.png" alt="Digital Waiter"></a>
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
     <span class="launch-label">Acceso del personal</span><span class="launch-arrow">→</span>
     <span class="particle p1"></span><span class="particle p2"></span><span class="particle p3"></span><span class="particle p4"></span><span class="particle p5"></span><span class="particle p6"></span>
    </button>
   }
  </section>

  <aside class="login-panel" [attr.aria-hidden]="!showForm()">
   <button type="button" class="login-back" (click)="closeLogin()">← Volver</button>
   <form [formGroup]="form" (ngSubmit)="submit()">
    <small>ESTABLECIMIENTO</small><h2>Acceso del personal</h2><p>Selecciona tu rol e ingresa para gestionar la operación.</p><a class="customer-return" routerLink="/cliente">← Volver a la aplicación del cliente</a>
    <div class="roles">@for(role of roles;track role){<button type="button" [class.active]="form.value.role===role" (click)="form.patchValue({role})">{{role}}</button>}</div>
    <label>Usuario<input formControlName="name" autocomplete="username"></label>
    <label>Contraseña<input formControlName="password" type="password" autocomplete="current-password"></label>
    @if(error()){<div class="form-error">Revisa el usuario, contraseña, rol o conexión con el servidor.</div>}
    <button class="primary" type="submit" [disabled]="loading()">{{loading()?'Conectando…':'Ingresar al sistema →'}}</button>
   </form>
  </aside>
 </main>`
})
export class InicioSesionComponent{
 private fb=inject(FormBuilder);private auth=inject(AuthService);
 roles:Role[]=['Administrador','Mesero','Cajero','Cocina'];error=signal(false);loading=signal(false);
 showForm=signal(false);disintegrating=signal(false);regenerating=signal(true);
 form=this.fb.nonNullable.group({name:['admin',Validators.required],password:['1234',Validators.required],role:['Administrador' as Role,Validators.required]});
 constructor(){setTimeout(()=>this.regenerating.set(false),850)}
 openLogin(){if(this.disintegrating())return;this.disintegrating.set(true);setTimeout(()=>{this.showForm.set(true);this.disintegrating.set(false)},620)}
 closeLogin(){this.showForm.set(false);this.regenerating.set(true);setTimeout(()=>this.regenerating.set(false),850)}
 async submit(){if(this.form.invalid||this.loading())return;this.loading.set(true);this.error.set(false);const v=this.form.getRawValue();this.error.set(!(await this.auth.login(v.name,v.password,v.role)));this.loading.set(false)}
}
