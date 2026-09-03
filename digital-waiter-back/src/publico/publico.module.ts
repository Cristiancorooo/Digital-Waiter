import { Module } from '@nestjs/common';
import { PedidosModule } from '../pedidos/pedidos.module';
import { ProductosModule } from '../productos/productos.module';
import { PublicoController } from './publico.controller';
@Module({imports:[PedidosModule,ProductosModule],controllers:[PublicoController]}) export class PublicoModule{}
