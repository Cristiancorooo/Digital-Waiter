import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Mesa, Restaurante, Usuario } from '../database/entities';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@InjectRepository(Usuario) private readonly users: Repository<Usuario>, @InjectRepository(Restaurante) private readonly restaurants: Repository<Restaurante>, @InjectRepository(Mesa) private readonly tables: Repository<Mesa>, private readonly jwt: JwtService) {}
  async onModuleInit() {
    let restaurant = await this.restaurants.findOneBy({ slug: 'sazon-de-casa' });
    restaurant ??= await this.restaurants.save(this.restaurants.create({ nombre: 'Sazón de Casa', slug: 'sazon-de-casa', ciudad: 'Quito', direccion: 'Centro Histórico' }));
    const existing = await this.users.find();
    if (existing.length) {
      await Promise.all(existing.filter(user => !user.restauranteId).map(user => this.users.update(user.id, { restauranteId: restaurant.id })));
      return;
    }
    const passwordHash = await hash('1234', 10);
    await this.users.save([
      this.users.create({ usuario: 'admin', nombre: 'Administrador', rol: 'Administrador', passwordHash, restauranteId: restaurant.id }),
      this.users.create({ usuario: 'mesero', nombre: 'Mesero demo', rol: 'Mesero', passwordHash, restauranteId: restaurant.id }),
      this.users.create({ usuario: 'cocina', nombre: 'Cocina demo', rol: 'Cocina', passwordHash, restauranteId: restaurant.id }),
      this.users.create({ usuario: 'cajero', nombre: 'Cajero demo', rol: 'Cajero', passwordHash, restauranteId: restaurant.id }),
    ]);
  }
  async login(dto: { usuario: string; password: string }) {
    const user = await this.users.findOneBy({ usuario: dto.usuario.trim().toLowerCase(), activo: true });
    if (!user || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Usuario o contraseña incorrectos');
    const restaurant = user.restauranteId ? await this.restaurants.findOneBy({ id: user.restauranteId, activo: true }) : null;
    if (!restaurant) throw new UnauthorizedException('El establecimiento no está disponible');
    const session = { id: user.id, name: user.nombre, role: user.rol, restaurantId: restaurant.id, restaurantName: restaurant.nombre };
    return { accessToken: await this.jwt.signAsync({ sub: user.id, name: user.nombre, role: user.rol, restaurantId: restaurant.id }), user: session };
  }
  async register(dto: { restaurante: string; propietario: string; usuario: string; password: string; ciudad?: string; telefono?: string }) {
    const usuario = dto.usuario.trim().toLowerCase();
    if (await this.users.existsBy({ usuario })) throw new ConflictException('El nombre de usuario ya existe');
    const base = dto.restaurante.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'restaurante';
    let slug = base; let suffix = 2;
    while (await this.restaurants.existsBy({ slug })) slug = `${base}-${suffix++}`;
    const restaurant = await this.restaurants.save(this.restaurants.create({ nombre: dto.restaurante.trim(), slug, ciudad: dto.ciudad?.trim() ?? '', telefono: dto.telefono?.trim() ?? '' }));
    const user = await this.users.save(this.users.create({ usuario, nombre: dto.propietario.trim(), rol: 'Administrador', passwordHash: await hash(dto.password, 10), restauranteId: restaurant.id }));
    await this.tables.save(Array.from({ length: 12 }, (_, index) => this.tables.create({ numero: index + 1, capacidad: index % 3 === 0 ? 6 : 4, restauranteId: restaurant.id })));
    const session = { id: user.id, name: user.nombre, role: user.rol, restaurantId: restaurant.id, restaurantName: restaurant.nombre };
    return { accessToken: await this.jwt.signAsync({ sub: user.id, name: user.nombre, role: user.rol, restaurantId: restaurant.id }), user: session, restaurant: { id: restaurant.id, nombre: restaurant.nombre, slug: restaurant.slug } };
  }
}
