import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../database/entities';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@InjectRepository(Usuario) private readonly users: Repository<Usuario>, private readonly jwt: JwtService) {}
  async onModuleInit() {
    if (await this.users.count()) return;
    const passwordHash = await hash('1234', 10);
    await this.users.save([
      this.users.create({ usuario: 'admin', nombre: 'Administrador', rol: 'Administrador', passwordHash }),
      this.users.create({ usuario: 'mesero', nombre: 'Mesero demo', rol: 'Mesero', passwordHash }),
      this.users.create({ usuario: 'cocina', nombre: 'Cocina demo', rol: 'Cocina', passwordHash }),
      this.users.create({ usuario: 'cajero', nombre: 'Cajero demo', rol: 'Cajero', passwordHash }),
    ]);
  }
  async login(dto: { usuario: string; password: string; rol: string }) {
    const user = await this.users.findOneBy({ usuario: dto.usuario, activo: true });
    if (!user || user.rol !== dto.rol || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Credenciales o rol incorrectos');
    return { accessToken: await this.jwt.signAsync({ sub: user.id, name: user.nombre, role: user.rol }), user: { id: user.id, name: user.nombre, role: user.rol } };
  }
}
