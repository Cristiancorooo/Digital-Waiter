import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppUser, Role } from '../../models/app.models';

@Component({selector:'app-usuarios',standalone:true,imports:[ReactiveFormsModule],template:`
<div class="page-title"><div><h2>Usuarios y roles</h2><p>Crea accesos para el personal del restaurante</p></div><button class="primary" (click)="open.set(true)">+ Nuevo usuario</button></div>
@if(error()){<div class="system-alert"><span>⚠ {{error()}}</span><button (click)="load()">Reintentar</button></div>}
<section class="panel inventory"><div class="table-head-row users-head"><b>Nombre</b><b>Usuario</b><b>Rol</b><b>Estado</b><b>Acciones</b></div>@for(user of users();track user.id){<div class="table-data-row users-head"><b>{{user.nombre}}</b><span>{{user.usuario}}</span><span>{{user.rol}}</span><em>{{user.activo?'Activo':'Inactivo'}}</em><div><button class="small-button" (click)="toggle(user)">{{user.activo?'Desactivar':'Activar'}}</button><button class="small-button" (click)="reset(user)">Nueva clave</button></div></div>}</section>
@if(open()){<div class="dialog"><form [formGroup]="form" (ngSubmit)="save()"><button type="button" class="dialog-close" (click)="open.set(false)">×</button><small>PERSONAL</small><h2>Crear usuario</h2><label>Nombre completo<input formControlName="nombre"></label><label>Usuario<input formControlName="usuario" autocomplete="off"></label><label>Rol<select formControlName="rol">@for(role of roles;track role){<option [value]="role">{{role}}</option>}</select></label><label>Contraseña temporal<input type="password" formControlName="password" autocomplete="new-password"></label><button class="primary" type="submit" [disabled]="form.invalid||saving()">{{saving()?'Guardando…':'Crear usuario'}}</button></form></div>}`})
export class UsuariosComponent implements OnInit {
  private api=inject(ApiService);private fb=inject(FormBuilder);
  users=signal<AppUser[]>([]);open=signal(false);saving=signal(false);error=signal('');roles:Role[]=['Administrador','Mesero','Cajero','Cocina'];
  form=this.fb.nonNullable.group({nombre:['',Validators.required],usuario:['',[Validators.required,Validators.minLength(3)]],rol:['Mesero' as Role,Validators.required],password:['',[Validators.required,Validators.minLength(4)]]});
  ngOnInit(){this.load()}
  async load(){this.error.set('');try{this.users.set(await this.api.usuarios())}catch(e:any){this.error.set(e?.error?.message||'No fue posible cargar los usuarios.')}}
  async save(){if(this.form.invalid)return;this.saving.set(true);this.error.set('');try{await this.api.crearUsuario(this.form.getRawValue());this.form.reset({nombre:'',usuario:'',rol:'Mesero',password:''});this.open.set(false);await this.load()}catch(e:any){this.error.set(e?.error?.message||'No fue posible crear el usuario.')}finally{this.saving.set(false)}}
  async toggle(user:AppUser){try{await this.api.activarUsuario(user.id,!user.activo);await this.load()}catch(e:any){this.error.set(e?.error?.message||'No fue posible cambiar el estado.')}}
  async reset(user:AppUser){const password=window.prompt(`Nueva contraseña temporal para ${user.nombre}:`);if(!password||password.length<4)return;try{await this.api.cambiarPassword(user.id,password);this.error.set('')}catch(e:any){this.error.set(e?.error?.message||'No fue posible actualizar la contraseña.')}}
}
