import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { IsBoolean, IsIn, IsString, MinLength } from 'class-validator';
import { Roles } from '../auth/access-control';
import { UsuariosService } from './usuarios.service';

class UsuarioDto { @IsString() @MinLength(3) usuario:string; @IsString() @MinLength(3) nombre:string; @IsString() @MinLength(4) password:string; @IsIn(['Administrador','Mesero','Cajero','Cocina']) rol:string }
class ActivoDto { @IsBoolean() activo:boolean }
class PasswordDto { @IsString() @MinLength(4) password:string }

@Roles('Administrador')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service:UsuariosService){}
  @Get() all(){return this.service.all()}
  @Post() create(@Body() dto:UsuarioDto){return this.service.create(dto)}
  @Patch(':id/activo') active(@Param('id',ParseIntPipe) id:number,@Body() dto:ActivoDto){return this.service.active(id,dto.activo)}
  @Patch(':id/password') password(@Param('id',ParseIntPipe) id:number,@Body() dto:PasswordDto){return this.service.password(id,dto.password)}
}
