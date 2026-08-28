import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { StoreService } from '../../core/services/store.service';
import { Order, OrderLine, RestaurantTable } from '../../models/app.models';

@Component({selector:'app-mesas',standalone:true,imports:[CurrencyPipe],template:`
<div class="page-title"><div><h2>Gestión de mesas</h2><p>Selecciona una mesa para abrir o consultar su pedido</p></div>@if(store.session()?.role==='Administrador'){<button class="primary" (click)="store.addTable()">+ Nueva mesa</button>}</div>
<div class="filters">@for(f of filters;track f.value){<button [class.active]="filter()===f.value" (click)="filter.set(f.value)">{{f.label}}</button>}</div>
<div class="table-grid">@for(t of filtered();track t.id){<button class="table-card {{t.status}}" (click)="open(t)"><small>{{status(t.status)}}</small><b>Mesa {{t.number.toString().padStart(2,'0')}}</b><span>{{description(t)}}</span></button>}</div>
@if(selected()){<div class="drawer-backdrop" (click)="close()"><aside class="order-drawer" (click)="$event.stopPropagation()"><button class="drawer-close" (click)="close()">×</button><small>{{isDraft()?'NUEVO PEDIDO':'PEDIDO #'+selected()!.id}}</small><h2>Mesa {{selected()!.table}}</h2><p class="order-owner">♙ Responsable: <b>{{selected()!.waiter||store.session()?.name||'Sin asignar'}}</b></p>@if(isDraft()){
<div class="picker">@for(m of activeMenu();track m.id){<button (click)="addLine(m.id)"><span>{{m.emoji}}</span><b>{{m.name}}</b><small>{{m.price|currency:'USD'}}</small></button>}</div>}
<h3>Detalle</h3>@for(line of selected()!.items;track line.menuId){<div class="cart-row"><span>{{menuName(line.menuId)}}</span><div>@if(isDraft()){<button (click)="changeQty(line.menuId,-1)">−</button>}<b>{{line.qty}}</b>@if(isDraft()){<button (click)="changeQty(line.menuId,1)">+</button>}</div></div>}@empty{<p class="empty">Agrega productos al pedido.</p>}
<div class="total"><span>Total</span><b>{{store.total(selected())|currency:'USD'}}</b></div>@if(isDraft()){<button class="primary wide" [disabled]="!selected()!.items.length||saving()" (click)="send()">{{saving()?'Enviando…':'Enviar a cocina →'}}</button>}</aside></div>}`})
export class MesasComponent {
  filter=signal('all'); selected=signal<Order|null>(null); saving=signal(false);
  filters=[{value:'all',label:'Todas'},{value:'available',label:'Disponibles'},{value:'occupied',label:'Ocupadas'},{value:'preparing',label:'Preparando'},{value:'payment',label:'Por cobrar'}];
  filtered=computed(()=>this.store.tables().filter(t=>this.filter()==='all'||t.status===this.filter()));
  activeMenu=computed(()=>this.store.menu().filter(m=>m.active));
  isDraft=computed(()=>this.selected()?.id===0);
  constructor(public store:StoreService){}
  open(t:RestaurantTable){const active=this.store.orderForTable(t.id);this.selected.set(active||{id:0,table:t.number,tableId:t.id,status:'new',items:[],createdAt:new Date().toISOString(),waiter:this.store.session()?.name||'',customer:'',notes:''})}
  close(){this.selected.set(null)}
  addLine(menuId:number){this.mutate(items=>{const line=items.find(x=>x.menuId===menuId);line?line.qty++:items.push({menuId,qty:1,note:''})})}
  changeQty(menuId:number,delta:number){this.mutate(items=>{const line=items.find(x=>x.menuId===menuId);if(!line)return;line.qty+=delta;if(line.qty<=0)items.splice(items.indexOf(line),1)})}
  private mutate(fn:(items:OrderLine[])=>void){const order=this.selected();if(!order||order.id!==0)return;const items=order.items.map(x=>({...x}));fn(items);this.selected.set({...order,items})}
  async send(){const order=this.selected();if(!order?.items.length||this.saving())return;this.saving.set(true);try{await this.store.createOrder(order.tableId,order.items);this.close()}finally{this.saving.set(false)}}
  menuName(id:number){return this.store.menu().find(m=>m.id===id)?.name}
  status(s:string){return({available:'Disponible',occupied:'Ocupada',preparing:'En preparación',ready:'Lista',payment:'Esperando pago'} as Record<string,string>)[s]}
  description(t:RestaurantTable){const o=this.store.orderForTable(t.id);return o?`${o.items.reduce((s,i)=>s+i.qty,0)} productos · ${o.waiter||'Sin asignar'}`:`${t.seats} puestos · Lista para clientes`}
}
