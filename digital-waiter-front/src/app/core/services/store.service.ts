import {Injectable,computed,signal} from '@angular/core';
import {AppState,InventoryItem,MenuItem,Order,OrderStatus,Payment,RestaurantTable,Session} from '../../models/app.models';
import {SEED_STATE} from '../../data/seed.data';
@Injectable({providedIn:'root'})
export class StoreService{
 private readonly key='digitalWaiterAngularDB';
 readonly state=signal<AppState>(this.read());
 readonly session=computed(()=>this.state().session);readonly tables=computed(()=>this.state().tables);readonly menu=computed(()=>this.state().menu);readonly inventory=computed(()=>this.state().inventory);readonly orders=computed(()=>this.state().orders);readonly payments=computed(()=>this.state().payments);
 private clone<T>(v:T):T{return JSON.parse(JSON.stringify(v))}
 private read():AppState{try{return JSON.parse(localStorage.getItem(this.key)!)||this.clone(SEED_STATE)}catch{return this.clone(SEED_STATE)}}
 private commit(next:AppState){this.state.set(next);localStorage.setItem(this.key,JSON.stringify(next))}
 update(fn:(draft:AppState)=>void){const draft=this.clone(this.state());fn(draft);this.commit(draft)}
 setSession(session:Session|null){this.update(s=>s.session=session)}
 total(order:Order){return order.items.reduce((sum,line)=>sum+(this.menu().find(m=>m.id===line.menuId)?.price||0)*line.qty,0)}
 orderForTable(id:number){const table=this.tables().find(t=>t.id===id);return this.orders().find(o=>o.id===table?.orderId)}
 createOrder(tableId:number){let result!:Order;this.update(s=>{const table=s.tables.find(t=>t.id===tableId)!;result={id:s.nextOrder++,table:tableId,status:'new',items:[],createdAt:new Date().toISOString(),waiter:s.session?.name||'Mesero',customer:'',notes:''};s.orders.push(result);table.orderId=result.id;table.status='occupied'});return result}
 addLine(orderId:number,menuId:number){this.update(s=>{const o=s.orders.find(x=>x.id===orderId)!;const line=o.items.find(x=>x.menuId===menuId);line?line.qty++:o.items.push({menuId,qty:1,note:''})})}
 changeQty(orderId:number,menuId:number,delta:number){this.update(s=>{const o=s.orders.find(x=>x.id===orderId)!;const line=o.items.find(x=>x.menuId===menuId);if(!line)return;line.qty+=delta;if(line.qty<=0)o.items=o.items.filter(x=>x!==line)})}
 setStatus(orderId:number,status:OrderStatus){this.update(s=>{const o=s.orders.find(x=>x.id===orderId)!;o.status=status;const t=s.tables.find(x=>x.id===o.table)!;t.status=status==='paid'?'available':status==='new'?'occupied':status;t.orderId=status==='paid'?null:o.id})}
 pay(orderId:number,method:string,customer:string){this.update(s=>{const o=s.orders.find(x=>x.id===orderId)!;const total=o.items.reduce((sum,l)=>sum+(s.menu.find(m=>m.id===l.menuId)?.price||0)*l.qty,0);const p:Payment={id:Date.now(),orderId:o.id,total,items:this.clone(o.items),method,customer,date:new Date().toISOString()};s.payments.push(p);o.status='paid';o.customer=customer;const t=s.tables.find(x=>x.id===o.table)!;t.status='available';t.orderId=null;o.items.forEach(l=>{const m=s.menu.find(x=>x.id===l.menuId),inv=s.inventory.find(x=>x.name===m?.ingredient);if(inv&&m)inv.stock=Math.max(0,inv.stock-m.use*l.qty)})})}
 saveMenu(item:Partial<MenuItem>){this.update(s=>{if(item.id)Object.assign(s.menu.find(x=>x.id===item.id)!,item);else s.menu.push({id:s.nextMenu++,name:item.name!,category:item.category!,price:Number(item.price),emoji:item.emoji||'🍽️',description:item.description||'',active:true,ingredient:'',use:0})})}
 toggleMenu(id:number){this.update(s=>{const m=s.menu.find(x=>x.id===id)!;m.active=!m.active})}deleteMenu(id:number){this.update(s=>s.menu=s.menu.filter(x=>x.id!==id))}
 saveInventory(item:Partial<InventoryItem>){this.update(s=>{if(item.id)Object.assign(s.inventory.find(x=>x.id===item.id)!,item);else s.inventory.push({id:s.nextInventory++,name:item.name!,category:item.category!,unit:item.unit!,stock:Number(item.stock),min:Number(item.min)})})}
 moveStock(id:number,delta:number){this.update(s=>{const i=s.inventory.find(x=>x.id===id)!;i.stock=Math.max(0,i.stock+delta)})}
 addTable(){this.update(s=>s.tables.push({id:Math.max(...s.tables.map(t=>t.id))+1,seats:4,status:'available',orderId:null}))}
 reset(){this.commit(this.clone(SEED_STATE))}
}
