import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { OrderLine } from '../../models/app.models';

type VoiceAction={kind:'order'|'prepare'|'ready'|'payment'|'pay';description:string;table:number;items?:OrderLine[];method?:string};

@Component({selector:'app-asistente-voz',standalone:true,imports:[FormsModule],template:`
@if(available()){
 <button class="voice-fab" (click)="open.set(true)" aria-label="Abrir asistente por voz">🎙 <span>Asistente</span></button>
 @if(open()){<div class="voice-backdrop" (click)="close()"><section class="voice-dialog" (click)="$event.stopPropagation()">
  <button class="dialog-close" (click)="close()">×</button><small>ASISTENTE PARA {{role().toUpperCase()}}</small><h2>¿Qué deseas realizar?</h2><p class="voice-example">Ejemplo: “{{example()}}”</p>
  <button class="voice-listen" [class.listening]="listening()" (click)="listen()">{{listening()?'◉ Escuchando…':'🎙 Dar una orden'}}</button>
  <label>También puedes escribirla<input [(ngModel)]="command" (keyup.enter)="interpret()" placeholder="Escribe la instrucción"></label>
  <button class="small-button wide" (click)="interpret()">Interpretar instrucción</button>
  @if(message()){<p class="voice-message" [class.error]="!plan()">{{message()}}</p>}
  @if(plan()){<article class="voice-confirm"><small>CONFIRMA ANTES DE CONTINUAR</small><b>{{plan()!.description}}</b><div><button class="small-button" (click)="plan.set(null)">Cancelar</button><button class="primary" [disabled]="working()" (click)="execute()">{{working()?'Procesando…':'Confirmar acción'}}</button></div></article>}
 </section></div>}
}`})
export class AsistenteVozComponent{
 private store=inject(StoreService);open=signal(false);listening=signal(false);working=signal(false);message=signal('');plan=signal<VoiceAction|null>(null);command='';
 role=computed(()=>this.store.session()?.role||'');available=computed(()=>['Mesero','Cocina','Cajero'].includes(this.role()));
 example=computed(()=>this.role()==='Mesero'?'Mesa 3, dos hamburguesas y una limonada':this.role()==='Cocina'?'Mesa 3 lista':'Cobrar mesa 3 en efectivo');
 close(){this.open.set(false);this.plan.set(null);this.message.set('');this.command=''}
 listen(){const Recognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!Recognition){this.message.set('El reconocimiento de voz no está disponible. Escribe la orden.');return}const recognition=new Recognition();recognition.lang='es-EC';recognition.interimResults=false;recognition.maxAlternatives=1;this.listening.set(true);recognition.onresult=(event:any)=>{this.command=event.results[0][0].transcript;this.listening.set(false);this.interpret()};recognition.onerror=()=>{this.listening.set(false);this.message.set('No pude escuchar con claridad. Intenta nuevamente o escribe la instrucción.')};recognition.onend=()=>this.listening.set(false);recognition.start()}
 private normalized(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
 private quantity(value:string){return ({un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10} as Record<string,number>)[value]||Number(value)||1}
 interpret(){this.plan.set(null);const text=this.normalized(this.command);const table=Number(text.match(/mesa\s+(\d+)/)?.[1]);if(!text||!table){this.message.set('Indica el número de mesa. Por ejemplo: “Mesa 3 lista”.');return}const order=this.store.orders().find(o=>o.table===table&&o.status!=='paid');
  if(this.role()==='Mesero'&&(text.includes('cobro')||text.includes('cobrar')||text.includes('entregado'))){if(!order||order.status!=='ready'){this.message.set('La mesa debe tener un pedido marcado como listo por Cocina.');return}this.setPlan({kind:'payment',table,description:`Confirmar entrega y solicitar el cobro de la mesa ${table}.`});return}
  if(this.role()==='Mesero'){const target=this.store.tables().find(t=>t.number===table);if(!target||target.status!=='available'){this.message.set('La mesa indicada no está disponible para un pedido nuevo.');return}const items:OrderLine[]=[];for(const item of this.store.menu().filter(m=>m.active)){const words=this.normalized(item.name).split(' ').filter(w=>w.length>=4);const key=words.find(w=>text.includes(w));if(!key)continue;const before=text.slice(0,text.indexOf(key)).trim().split(' ').slice(-2);const raw=[...before].reverse().find(w=>/^(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)$/.test(w));items.push({menuId:item.id,qty:this.quantity(raw||'1'),note:''})}if(!items.length){this.message.set('No reconocí productos disponibles del menú. Prueba usando el nombre mostrado en Menú.');return}const detail=items.map(line=>`${line.qty} × ${this.store.menu().find(m=>m.id===line.menuId)?.name}`).join(', ');this.setPlan({kind:'order',table,items,description:`Crear pedido para mesa ${table}: ${detail}.`});return}
  if(this.role()==='Cocina'){if(!order){this.message.set('No existe un pedido activo para esa mesa.');return}if(text.includes('lista')||text.includes('listo')||text.includes('termin')){if(order.status!=='preparing'){this.message.set('El pedido debe estar en preparación antes de marcarlo listo.');return}this.setPlan({kind:'ready',table,description:`Marcar el pedido de la mesa ${table} como listo para retirar.`});return}if(text.includes('prepar')){if(order.status!=='new'){this.message.set('Ese pedido ya fue iniciado o completado.');return}this.setPlan({kind:'prepare',table,description:`Empezar la preparación del pedido de la mesa ${table}.`});return}this.message.set('Indica “preparar” o “mesa lista”.');return}
  if(this.role()==='Cajero'){if(!order||order.status!=='payment'){this.message.set('La mesa todavía no tiene un pedido autorizado para cobro.');return}const method=text.includes('tarjeta')?'Tarjeta':text.includes('transfer')?'Transferencia':'Efectivo';this.setPlan({kind:'pay',table,method,description:`Cobrar la mesa ${table} por ${method}. Total: $${this.store.total(order).toFixed(2)}.`});return}
 }
 private setPlan(plan:VoiceAction){this.plan.set(plan);this.message.set('Revisa la instrucción interpretada antes de confirmarla.')}
 async execute(){const plan=this.plan();if(!plan||this.working())return;this.working.set(true);try{const order=this.store.orders().find(o=>o.table===plan.table&&o.status!=='paid');if(plan.kind==='order'){const table=this.store.tables().find(t=>t.number===plan.table)!;await this.store.createOrder(table.id,plan.items||[])}else if(plan.kind==='prepare'&&order)await this.store.setStatus(order.id,'preparing');else if(plan.kind==='ready'&&order)await this.store.setStatus(order.id,'ready');else if(plan.kind==='payment'&&order)await this.store.setStatus(order.id,'payment');else if(plan.kind==='pay'&&order)await this.store.pay(order.id,plan.method||'Efectivo');this.message.set('Acción realizada correctamente.');this.plan.set(null);this.command=''}catch{this.message.set(this.store.error()||'No se pudo realizar la acción.')}finally{this.working.set(false)}}
}
