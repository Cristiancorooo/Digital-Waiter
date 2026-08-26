import { Body,Controller,Get,Param,ParseIntPipe,Patch,Post } from '@nestjs/common'; import { Type } from 'class-transformer'; import { IsArray,IsIn,IsInt,IsOptional,IsString,Min,ValidateNested } from 'class-validator'; import { PedidosService } from './pedidos.service';
class LineaDto { @IsInt() productoId:number; @IsInt() @Min(1) cantidad:number }
class PedidoDto { @IsInt() mesaId:number; @IsString() mesero:string; @IsOptional() @IsString() notas?:string; @IsArray() @ValidateNested({each:true}) @Type(()=>LineaDto) detalles:LineaDto[] }
class EstadoDto { @IsIn(['new','preparing','ready','payment','paid']) estado:string }
@Controller('pedidos') export class PedidosController {constructor(private service:PedidosService){} @Get() all(){return this.service.all()} @Post() create(@Body() dto:PedidoDto){return this.service.create(dto)} @Patch(':id/estado') status(@Param('id',ParseIntPipe) id:number,@Body() dto:EstadoDto){return this.service.status(id,dto.estado)} }
