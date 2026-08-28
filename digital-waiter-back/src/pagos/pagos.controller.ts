import { Body,Controller,Get,Post } from '@nestjs/common'; import { IsIn,IsInt } from 'class-validator'; import { PagosService } from './pagos.service'; import { Roles } from '../auth/access-control';
class PagoDto { @IsInt() pedidoId:number; @IsIn(['Efectivo','Tarjeta','Transferencia']) metodo:string }
@Roles('Administrador','Cajero') @Controller('pagos') export class PagosController {constructor(private service:PagosService){} @Get() all(){return this.service.all()} @Post() pay(@Body() dto:PagoDto){return this.service.pay(dto.pedidoId,dto.metodo)} }
