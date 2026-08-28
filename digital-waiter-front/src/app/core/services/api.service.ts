import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { Role } from '../../models/app.models';

const defaultApiUrl = Capacitor.isNativePlatform()
  ? 'http://10.0.2.2:3000/api'
  : location.port === '4200' ? 'http://localhost:3000/api' : `${location.origin}/api`;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}
  private get apiUrl() { return localStorage.getItem('digitalWaiterApiUrl') ?? defaultApiUrl; }
  login(usuario: string, password: string, rol: Role) { return firstValueFrom(this.http.post<any>(`${this.apiUrl}/auth/login`, { usuario, password, rol })); }
  usuarios() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/usuarios`)); }
  crearUsuario(body: unknown) { return firstValueFrom(this.http.post(`${this.apiUrl}/usuarios`, body)); }
  activarUsuario(id: number, activo: boolean) { return firstValueFrom(this.http.patch(`${this.apiUrl}/usuarios/${id}/activo`, { activo })); }
  cambiarPassword(id: number, password: string) { return firstValueFrom(this.http.patch(`${this.apiUrl}/usuarios/${id}/password`, { password })); }
  mesas() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/mesas`)); }
  crearMesa(numero: number, capacidad = 4) { return firstValueFrom(this.http.post(`${this.apiUrl}/mesas`, { numero, capacidad })); }
  productos() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/productos`)); }
  guardarProducto(id: number, body: unknown) { return firstValueFrom(id ? this.http.put(`${this.apiUrl}/productos/${id}`, body) : this.http.post(`${this.apiUrl}/productos`, body)); }
  disponibilidadProducto(id: number, disponible: boolean) { return firstValueFrom(this.http.patch(`${this.apiUrl}/productos/${id}/disponibilidad`, { disponible })); }
  eliminarProducto(id: number) { return firstValueFrom(this.http.delete(`${this.apiUrl}/productos/${id}`)); }
  inventario() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/inventario`)); }
  guardarInventario(id: number, body: unknown) { return firstValueFrom(id ? this.http.put(`${this.apiUrl}/inventario/${id}`, body) : this.http.post(`${this.apiUrl}/inventario`, body)); }
  moverStock(id: number, cantidad: number) { return firstValueFrom(this.http.patch(`${this.apiUrl}/inventario/${id}/stock`, { cantidad })); }
  pedidos() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/pedidos`)); }
  crearPedido(mesaId: number, detalles: { productoId: number; cantidad: number }[], notas = '') { return firstValueFrom(this.http.post(`${this.apiUrl}/pedidos`, { mesaId, detalles, notas })); }
  estadoPedido(id: number, estado: string) { return firstValueFrom(this.http.patch(`${this.apiUrl}/pedidos/${id}/estado`, { estado })); }
  pagos() { return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/pagos`)); }
  pagar(pedidoId: number, metodo: string) { return firstValueFrom(this.http.post(`${this.apiUrl}/pagos`, { pedidoId, metodo })); }
}
