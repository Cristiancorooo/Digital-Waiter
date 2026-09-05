import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './access-control';

class LoginDto {
  @IsString() @IsNotEmpty() usuario: string;
  @IsString() @IsNotEmpty() password: string;
}
class RegistroDto {
  @IsString() @MinLength(3) restaurante: string;
  @IsString() @MinLength(3) propietario: string;
  @IsString() @MinLength(3) usuario: string;
  @IsString() @MinLength(4) password: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() telefono?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Public() @Post('registrar-restaurante') register(@Body() dto: RegistroDto) { return this.auth.register(dto); }
}
