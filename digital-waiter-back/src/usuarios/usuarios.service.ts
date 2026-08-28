import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../database/entities';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(Usuario) private readonly repo: Repository<Usuario>) {}
  async all() { return (await this.repo.find({ order: { nombre: 'ASC' } })).map(({ passwordHash, ...user }) => user); }
  async create(dto: { usuario: string; nombre: string; password: string; rol: string }) {
    const usuario=dto.usuario.trim().toLowerCase();
    if (await this.repo.existsBy({ usuario })) throw new ConflictException('El nombre de usuario ya existe');
    const user = await this.repo.save(this.repo.create({ usuario, nombre: dto.nombre.trim(), rol: dto.rol, passwordHash: await hash(dto.password, 10) }));
    const { passwordHash, ...safe } = user; return safe;
  }
  async active(id: number, activo: boolean) { const user=await this.repo.findOneBy({id});if(!user)throw new NotFoundException('Usuario no encontrado');user.activo=activo;await this.repo.save(user);const {passwordHash,...safe}=user;return safe; }
  async password(id: number, password: string) { const user=await this.repo.findOneBy({id});if(!user)throw new NotFoundException('Usuario no encontrado');user.passwordHash=await hash(password,10);await this.repo.save(user);return {message:'Contraseña actualizada'}; }
}
