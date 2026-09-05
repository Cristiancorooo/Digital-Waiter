import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { EstadoMesa, Mesa, Restaurante } from '../database/entities';
@Injectable()
export class MesasService implements OnModuleInit {
  constructor(@InjectRepository(Mesa) private repo: Repository<Mesa>, @InjectRepository(Restaurante) private restaurants: Repository<Restaurante>) {}
  async onModuleInit() { const demo=await this.restaurants.findOneBy({slug:'sazon-de-casa'});if(!demo)return;await this.repo.update({restauranteId:IsNull()},{restauranteId:demo.id});if(await this.repo.countBy({restauranteId:demo.id}))return;await this.repo.save(Array.from({length:12},(_,i)=>this.repo.create({numero:i+1,capacidad:i%3===0?6:4,restauranteId:demo.id}))); }
  all(restauranteId:number){return this.repo.find({where:{restauranteId},order:{numero:'ASC'}})}
  async create(restauranteId:number,dto:Partial<Mesa>){if(await this.repo.existsBy({restauranteId,numero:dto.numero}))throw new ConflictException('El número de mesa ya existe');return this.repo.save(this.repo.create({...dto,restauranteId}))}
  async status(restauranteId:number,id:number,estado:string){const mesa=await this.repo.findOneBy({id,restauranteId});if(!mesa)throw new NotFoundException('Mesa no encontrada');mesa.estado=estado as EstadoMesa;return this.repo.save(mesa)}
}
