import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role } from '../../models/app.models';
import { Capacitor } from '@capacitor/core';

const defaultApiUrl = Capacitor.isNativePlatform() ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}
  private get apiUrl() { return localStorage.getItem('digitalWaiterApiUrl') ?? defaultApiUrl; }
  login(usuario: string, password: string, rol: Role) {
    return firstValueFrom(this.http.post<{ accessToken: string; user: { name: string; role: Role } }>(`${this.apiUrl}/auth/login`, { usuario, password, rol }));
  }
  mesas() { return firstValueFrom(this.http.get(`${this.apiUrl}/mesas`)); }
  productos(buscar = '', categoria = '') { return firstValueFrom(this.http.get(`${this.apiUrl}/productos`, { params: { buscar, categoria } })); }
  inventario(soloBajo = false) { return firstValueFrom(this.http.get(`${this.apiUrl}/inventario`, { params: { soloBajo } })); }
  pedidos() { return firstValueFrom(this.http.get(`${this.apiUrl}/pedidos`)); }
}
