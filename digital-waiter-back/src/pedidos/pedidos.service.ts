import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { DetallePedido, EstadoPedido, Mesa, Pedido, Producto } from '../database/entities';

type Linea={productoId:number;cantidad:number};
@Injectable()
export class PedidosService {
  constructor(@InjectRepository(Pedido) private orders:Repository<Pedido>,@InjectRepository(DetallePedido) private lines:Repository<DetallePedido>,@InjectRepository(Mesa) private tables:Repository<Mesa>,@InjectRepository(Producto) private products:Repository<Producto>){}
  all(){return this.orders.find({order:{creadoEn:'DESC'}})}
  async create(dto:{mesaId:number;mesero:string;notas?:string;detalles:Linea[]}){
    const mesa=await this.tables.findOneBy({id:dto.mesaId});
    if(!mesa)throw new NotFoundException('Mesa no encontrada');
    if(mesa.estado!=='available')throw new BadRequestException('La mesa no está disponible');
    const order=await this.build({mesa,mesero:dto.mesero,notas:dto.notas??'',detalles:dto.detalles,modalidad:'dinein'});
    mesa.estado='occupied';await this.tables.save(mesa);return this.orders.save(order);
  }
  async createPublic(dto:{cliente:string;telefono:string;modalidad:'dinein'|'pickup';mesaNumero?:number;horaRetiro?:string;notas?:string;detalles:Linea[]}){
    let mesa:Mesa|undefined;
    if(dto.modalidad==='dinein'){
      if(!dto.mesaNumero)throw new BadRequestException('Indica el número de mesa');
      mesa=await this.tables.findOneBy({numero:dto.mesaNumero})??undefined;
      if(!mesa)throw new NotFoundException('Mesa no encontrada');
      if(mesa.estado!=='available')throw new BadRequestException('La mesa no está disponible');
    }
    const codigo=`DW-${randomBytes(4).toString('hex').toUpperCase()}`;
    const order=await this.build({mesa,mesero:'Pedido móvil',cliente:dto.cliente.trim(),telefono:dto.telefono.trim(),modalidad:dto.modalidad,codigoRetiro:codigo,horaRetiro:dto.horaRetiro??'',notas:dto.notas??'',detalles:dto.detalles});
    if(mesa){mesa.estado='occupied';await this.tables.save(mesa)}
    return this.orders.save(order);
  }
  async track(code:string){const order=await this.orders.findOneBy({codigoRetiro:code});if(!order)throw new NotFoundException('Pedido no encontrado');return order}
  private async build(data:{mesa?:Mesa;mesero:string;cliente?:string;telefono?:string;modalidad:string;codigoRetiro?:string;horaRetiro?:string;notas:string;detalles:Linea[]}){
    if(!data.detalles.length)throw new BadRequestException('El pedido debe contener productos');
    const ids=[...new Set(data.detalles.map(x=>x.productoId))];
    const products=await this.products.findBy({id:In(ids),disponible:true});
    if(products.length!==ids.length)throw new BadRequestException('Uno o más productos no están disponibles');
    return this.orders.create({...data,detalles:data.detalles.map(line=>this.lines.create({producto:products.find(p=>p.id===line.productoId)!,cantidad:line.cantidad,precioUnitario:products.find(p=>p.id===line.productoId)!.precio}))});
  }
  async status(id:number,estado:string,role:string){
    const order=await this.orders.findOneBy({id});if(!order)throw new NotFoundException('Pedido no encontrado');
    const next:Record<EstadoPedido,EstadoPedido|undefined>={new:'preparing',preparing:'ready',ready:'payment',payment:'paid',paid:undefined};
    if(next[order.estado]!==estado)throw new BadRequestException(`No se puede cambiar de ${order.estado} a ${estado}`);
    const allowed=role==='Administrador'||(['new','preparing'].includes(order.estado)&&role==='Cocina')||(order.estado==='ready'&&role==='Mesero')||(order.estado==='ready'&&order.modalidad==='pickup'&&role==='Cajero')||(order.estado==='payment'&&role==='Cajero');
    if(!allowed)throw new ForbiddenException('Este cambio corresponde a otro rol del flujo operativo');
    order.estado=estado as EstadoPedido;
    if(order.mesa){order.mesa.estado=estado==='paid'?'available':estado as any;await this.tables.save(order.mesa)}
    return this.orders.save(order);
  }
}
