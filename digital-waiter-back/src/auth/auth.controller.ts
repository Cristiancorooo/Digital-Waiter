import { Body, Controller, Post } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './access-control';

class LoginDto {
  @IsString() @IsNotEmpty() usuario: string;
  @IsString() @IsNotEmpty() password: string;
  @IsIn(['Administrador', 'Mesero', 'Cajero', 'Cocina']) rol: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
