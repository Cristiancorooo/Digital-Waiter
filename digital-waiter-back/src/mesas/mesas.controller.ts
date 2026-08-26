import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'; import { IsIn, IsInt, IsOptional, Min } from 'class-validator'; import { MesasService } from './mesas.service';
class MesaDto { @IsInt() @Min(1) numero:number; @IsInt() @Min(1) capacidad:number }
class EstadoMesaDto { @IsIn(['available','occupied','preparing','ready','payment']) estado:string }
@Controller('mesas') export class MesasController { constructor(private readonly service:MesasService){} @Get() all(){return this.service.all()} @Post() create(@Body() dto:MesaDto){return this.service.create(dto)} @Patch(':id/estado') status(@Param('id',ParseIntPipe) id:number,@Body() dto:EstadoMesaDto){return this.service.status(id,dto.estado)} }
