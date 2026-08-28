import { Component, inject } from '@angular/core';
import { InsightsService } from '../../core/services/insights.service';
import { StoreService } from '../../core/services/store.service';

@Component({selector:'app-asistente',standalone:true,template:`
<div class="page-title"><div><small>ANÁLISIS OPERATIVO</small><h2>Asistente inteligente</h2><p>Recomendaciones calculadas con la actividad real del restaurante</p></div><button class="small-button" (click)="store.loadAll(true)">↻ Analizar ahora</button></div>
<section class="assistant-hero"><div><span>✦</span><h3>¿Qué necesita atención?</h3><p>El asistente revisa pedidos, tiempos, ocupación, ventas e inventario para ayudarte a tomar decisiones rápidas.</p></div></section>
<div class="insight-grid">@for(item of insights.insights();track item.title){<article class="insight {{item.level}}"><span>{{item.icon}}</span><div><h3>{{item.title}}</h3><p>{{item.detail}}</p></div></article>}</div>
<section class="panel"><h3>Secuencia operativa conectada</h3><div class="assistant-flow"><article><b>1. Mesero</b><span>Registra la mesa y envía la orden desde el celular.</span></article><article><b>2. Cocina</b><span>Recibe el aviso, prepara y marca el pedido como listo.</span></article><article><b>3. Mesero</b><span>Recibe la confirmación y entrega el pedido.</span></article><article><b>4. Caja</b><span>Recibe la solicitud, cobra y libera la mesa.</span></article></div></section>`})
export class AsistenteComponent{insights=inject(InsightsService);store=inject(StoreService)}
