import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { InventoryItem, MenuItem, Order, OrderLine, OrderStatus, Payment, RestaurantTable, Session } from '../../models/app.models';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private initialized = false;
  readonly session = signal<Session | null>(this.readSession());
  readonly tables = signal<RestaurantTable[]>([]);
  readonly menu = signal<MenuItem[]>([]);
  readonly inventory = signal<InventoryItem[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly ready = computed(() => !this.loading() && !this.error());
  constructor(private readonly api: ApiService, private readonly notifications: NotificationService) {}
  private readSession(): Session | null { try { return JSON.parse(localStorage.getItem('digitalWaiterSession') || 'null'); } catch { return null; } }
  setSession(session: Session | null) { this.session.set(session); session ? localStorage.setItem('digitalWaiterSession', JSON.stringify(session)) : localStorage.removeItem('digitalWaiterSession'); }
  private message(error: any) { const value = error?.error?.message || error?.message; return Array.isArray(value) ? value.join('. ') : value || 'No fue posible conectar con el servidor.'; }
  private async run<T>(action: () => Promise<T>, refresh = true) { this.error.set(''); try { const result = await action(); if (refresh) await this.loadAll(true); return result; } catch (error) { this.error.set(this.message(error)); throw error; } }
  async loadAll(force = false) {
    if (this.loading() && !force) return;
    const showInitialLoading = !this.initialized;
    if (showInitialLoading) this.loading.set(true);
    this.error.set('');
    try {
      const role = this.session()?.role;
      const requests: Promise<any>[] = [this.api.mesas(), this.api.productos(), this.api.pedidos()];
      if (role === 'Administrador') requests.push(this.api.inventario(), this.api.pagos());
      else if (role === 'Cajero') requests.push(this.api.pagos());
      const [tables, products, orders, extra1, extra2] = await Promise.all(requests);
      const previous = this.orders();
      const nextOrders = orders.map((o: any) => this.mapOrder(o));
      if (this.initialized) this.notifyOrderChanges(previous, nextOrders, role || '');
      this.orders.set(nextOrders);
      this.tables.set(tables.map((t: any) => ({ id: t.id, number: t.numero, seats: t.capacidad, status: t.estado, orderId: this.orders().find(o => o.tableId === t.id && o.status !== 'paid')?.id ?? null })));
      this.menu.set(products.map((p: any) => ({ id: p.id, name: p.nombre, category: p.categoria?.nombre || '', price: Number(p.precio), emoji: '🍽️', description: p.descripcion, active: p.disponible, ingredient: '', use: 0 })));
      this.inventory.set(role === 'Administrador' ? (extra1 || []).map((i: any) => ({ id: i.id, name: i.nombre, category: i.categoria, unit: i.unidad, stock: Number(i.stockActual), min: Number(i.stockMinimo) })) : []);
      const payments = role === 'Administrador' ? extra2 : role === 'Cajero' ? extra1 : [];
      this.payments.set((payments || []).map((p: any) => ({ id: p.id, orderId: p.pedido?.id, total: Number(p.monto), items: [], method: p.metodo, customer: p.pedido?.cliente || 'Consumidor final', date: p.pagadoEn })));
      this.initialized = true;
    } catch (error) { this.error.set(this.message(error)); }
    finally { if (showInitialLoading) this.loading.set(false); }
  }
  private notifyOrderChanges(previous: Order[], current: Order[], role: string) {
    for (const order of current) {
      const old = previous.find(item => item.id === order.id);
      if (!old && ['Administrador', 'Cocina'].includes(role)) {
        this.notifications.push('Nuevo pedido', `Mesa ${order.table}: el pedido ya llegó a cocina.`, 'info', 'cocina');
        continue;
      }
      if (!old || old.status === order.status) continue;
      if (order.status === 'ready' && ['Administrador', 'Mesero'].includes(role))
        this.notifications.push('Pedido listo', `Mesa ${order.table}: cocina terminó la orden.`, 'success', 'mesero');
      if (order.status === 'payment' && ['Administrador', 'Cajero'].includes(role))
        this.notifications.push('Pendiente de cobro', `Mesa ${order.table}: caja puede registrar el pago.`, 'warning', 'cajero');
      if (order.status === 'paid' && ['Administrador', 'Cajero', 'Mesero'].includes(role))
        this.notifications.push('Pago confirmado', `Mesa ${order.table}: pago registrado y mesa liberada.`, 'success', 'mesero');
    }
  }
  private mapOrder(o: any): Order { return { id: o.id, table: o.mesa?.numero, tableId: o.mesa?.id, status: o.estado, items: (o.detalles || []).map((d: any) => ({ menuId: d.producto.id, qty: d.cantidad, note: '' })), createdAt: o.creadoEn, waiter: o.mesero, customer: o.cliente, notes: o.notas }; }
  total(order: Order | null) { return order?.items.reduce((sum, line) => sum + (this.menu().find(m => m.id === line.menuId)?.price || 0) * line.qty, 0) || 0; }
  orderForTable(id: number) { return this.orders().find(o => o.tableId === id && o.status !== 'paid'); }
  async createOrder(tableId: number, items: OrderLine[], notes = '') { return this.run(() => this.api.crearPedido(tableId, items.map(x => ({ productoId: x.menuId, cantidad: x.qty })), notes)); }
  async setStatus(orderId: number, status: OrderStatus) { return this.run(() => this.api.estadoPedido(orderId, status)); }
  async pay(orderId: number, method: string) { return this.run(() => this.api.pagar(orderId, method)); }
  async saveMenu(item: Partial<MenuItem>) { const body = { nombre: item.name, categoria: item.category, precio: Number(item.price), descripcion: item.description || '' }; return this.run(() => this.api.guardarProducto(item.id || 0, body)); }
  async toggleMenu(id: number) { const item = this.menu().find(x => x.id === id)!; return this.run(() => this.api.disponibilidadProducto(id, !item.active)); }
  async deleteMenu(id: number) { return this.run(() => this.api.eliminarProducto(id)); }
  async saveInventory(item: Partial<InventoryItem>) { const body = { nombre: item.name, categoria: item.category, unidad: item.unit, stockActual: Number(item.stock), stockMinimo: Number(item.min) }; return this.run(() => this.api.guardarInventario(item.id || 0, body)); }
  async moveStock(id: number, delta: number) { return this.run(() => this.api.moverStock(id, delta)); }
  async addTable() { const number = Math.max(0, ...this.tables().map(t => t.number || t.id)) + 1; return this.run(() => this.api.crearMesa(number)); }
  clear() { this.initialized = false; this.tables.set([]); this.menu.set([]); this.inventory.set([]); this.orders.set([]); this.payments.set([]); this.error.set(''); }
}
