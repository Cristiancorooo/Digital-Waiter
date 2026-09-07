import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENTITIES } from './database/entities';
import { AuthModule } from './auth/auth.module';
import { MesasModule } from './mesas/mesas.module';
import { ProductosModule } from './productos/productos.module';
import { InventarioModule } from './inventario/inventario.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PagosModule } from './pagos/pagos.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/access-control';
import { HealthController } from './health.controller';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicoModule } from './publico/publico.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const production = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl, ssl: production ? { rejectUnauthorized: false } : false }
            : {
                host: config.get('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get('DB_USER', 'digital_waiter'),
                password: config.get('DB_PASSWORD', 'digital_waiter_dev'),
                database: config.get('DB_NAME', 'digital_waiter'),
              }),
          entities: ENTITIES,
          synchronize: config.get('DB_SYNC', production ? 'false' : 'true') === 'true',
        } as TypeOrmModuleOptions;
      },
    }),
    AuthModule, UsuariosModule, MesasModule, ProductosModule, InventarioModule, PedidosModule, PagosModule, PublicoModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
