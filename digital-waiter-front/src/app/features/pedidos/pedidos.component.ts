import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { StoreService } from '../../core/services/store.service';
import { Order } from '../../models/app.models';

@Component({selector:'app-pedidos',standalone:true,imports:[CurrencyPipe,DatePipe],template:`
<div class="page-title"><div><h2>Pedidos</h2><p>Seguimiento centralizado de órdenes activas y completadas</p></div><button class="small-button" (click)="store.loadAll(true)">↻ Actualizar</button></div>
<section class="panel order-table"><div class="table-head-row"><b>Pedido</b><b>Mesa</b><b>Responsable</b><b>Hora</b><b>Total</b><b>Estado</b><b>Acción</b></div>@for(o of store.orders();track o.id){<div class="table-data-row"><b>#{{o.id.toString().padStart(3,'0')}}</b><span>Mesa {{o.table}}</span><span class="waiter-name">♙ {{o.waiter||'Sin asignar'}}</span><span>{{o.createdAt|date:'shortTime'}}</span><strong>{{store.total(o)|currency:'USD'}}</strong><em>{{label(o.status)}}</em>@if(canAdvance(o)){<button class="small-button" (click)="advance(o)">{{action(o.status)}}</button>}@else{<span>—</span>}</div>}@empty{<p class="empty">No existen pedidos.</p>}</section>
@if(paying()){<div class="dialog"><div class="payment-dialog"><button class="dialog-close" (click)="paying.set(null)">×</button><small>REGISTRAR PAGO</small><h2>Pedido #{{paying()!.id}}</h2><p>Atendido por: <b>{{paying()!.waiter||'Sin asignar'}}</b></p><p>Total: <b>{{store.total(paying())|currency:'USD'}}</b></p><div class="roles"><button (click)="confirmPay('Efectivo')">Efectivo</button><button (click)="confirmPay('Tarjeta')">Tarjeta</button><button (click)="confirmPay('Transferencia')">Transferencia</button></div></div></div>}`})
export class PedidosComponent {
  public store=inject(StoreService); paying=signal<Order|null>(null);
  label(s:string){return({new:'Nuevo',preparing:'En preparación',ready:'Listo',payment:'Por cobrar',paid:'Pagado'} as Record<string,string>)[s]}
  action(s:string){return({new:'Preparar',preparing:'Marcar listo',ready:'Entregado · solicitar cobro',payment:'Cobrar'} as Record<string,string>)[s]}
  canAdvance(o:Order){const role=this.store.session()?.role;return (role==='Administrador'&&o.status!=='paid')||(role==='Cocina'&&['new','preparing'].includes(o.status))||(role==='Mesero'&&o.status==='ready')||(role==='Cajero'&&o.status==='payment')}
  async advance(o:Order){if(o.status==='payment'){this.paying.set(o);return}const next=({new:'preparing',preparing:'ready',ready:'payment'} as const)[o.status as 'new'|'preparing'|'ready'];if(next)try{await this.store.setStatus(o.id,next)}catch{}}
  async confirmPay(method:string){const order=this.paying();if(!order)return;try{await this.store.pay(order.id,method);this.paying.set(null)}catch{}}
}
