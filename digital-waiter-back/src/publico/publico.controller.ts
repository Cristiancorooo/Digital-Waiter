import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Public } from '../auth/access-control';
import { PedidosService } from '../pedidos/pedidos.service';
import { ProductosService } from '../productos/productos.service';

class LineaPublicaDto{@IsInt() productoId:number;@IsInt() @Min(1) cantidad:number}
class PedidoPublicoDto{
 @IsString() @MinLength(2) cliente:string;
 @IsString() @MinLength(7) telefono:string;
 @IsIn(['dinein','pickup']) modalidad:'dinein'|'pickup';
 @IsOptional() @IsInt() mesaNumero?:number;
 @IsOptional() @IsString() horaRetiro?:string;
 @IsOptional() @IsString() notas?:string;
 @IsArray() @ValidateNested({each:true}) @Type(()=>LineaPublicaDto) detalles:LineaPublicaDto[];
}
@Public() @Controller('publico')
export class PublicoController{
 constructor(private products:ProductosService,private orders:PedidosService){}
 @Get('restaurante') async restaurant(){return{id:'dw-demo',nombre:'Sazón de Casa',descripcion:'Cocina ecuatoriana preparada al momento',direccion:'Centro Histórico · Quito',tiempo:'15–20 min',abierto:true,menu:await this.products.all('','')}}
 @Post('pedidos') create(@Body() dto:PedidoPublicoDto){return this.orders.createPublic(dto)}
 @Get('pedidos/:code') track(@Param('code') code:string){return this.orders.track(code)}
}
