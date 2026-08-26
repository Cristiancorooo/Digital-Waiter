import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), JwtModule.registerAsync({ global: true, inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.get('JWT_SECRET', 'development-only-secret'), signOptions: { expiresIn: '8h' } }) })],
  controllers: [AuthController], providers: [AuthService], exports: [AuthService, JwtModule],
})
export class AuthModule {}
