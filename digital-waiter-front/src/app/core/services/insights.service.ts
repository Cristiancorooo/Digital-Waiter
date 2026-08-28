import { Injectable, computed } from '@angular/core';
import { StoreService } from './store.service';

export interface Insight { icon:string; title:string; detail:string; level:'normal'|'attention'|'critical' }

@Injectable({providedIn:'root'})
export class InsightsService {
  constructor(private store:StoreService){}
  readonly insights=computed<Insight[]>(()=>{
    const now=Date.now(),orders=this.store.orders(),tables=this.store.tables(),inventory=this.store.inventory(),menu=this.store.menu();
    const result:Insight[]=[];
    const delayed=orders.filter(o=>o.status!=='paid'&&now-new Date(o.createdAt).getTime()>15*60_000);
    if(delayed.length)result.push({icon:'⏱',title:`${delayed.length} pedido(s) requieren atención`,detail:'Llevan más de 15 minutos abiertos. Revisa cocina y prioriza su entrega.',level:'critical'});
    const low=inventory.filter(i=>i.stock<=i.min);
    if(low.length)result.push({icon:'📦',title:`${low.length} insumo(s) con stock crítico`,detail:`Prioriza la reposición de ${low.slice(0,3).map(i=>i.name).join(', ')}.`,level:'attention'});
    const occupied=tables.filter(t=>t.status!=='available').length,capacity=tables.length?occupied/tables.length:0;
    if(capacity>=.75)result.push({icon:'🪑',title:'Alta ocupación del restaurante',detail:'Más del 75% de las mesas está en servicio. Coordina cocina y caja para evitar esperas.',level:'attention'});
    const counts=new Map<number,number>();orders.forEach(o=>o.items.forEach(i=>counts.set(i.menuId,(counts.get(i.menuId)||0)+i.qty)));
    const top=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0],dish=top?menu.find(m=>m.id===top[0]):null;
    if(dish)result.push({icon:'★',title:`Producto más solicitado: ${dish.name}`,detail:`Registra ${top[1]} unidad(es) en los pedidos almacenados. Verifica su disponibilidad.`,level:'normal'});
    if(!result.length)result.push({icon:'✓',title:'Operación bajo control',detail:'No se detectan retrasos, saturación ni alertas críticas en este momento.',level:'normal'});
    return result;
  });
}
