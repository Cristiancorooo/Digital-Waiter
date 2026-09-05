import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm'; import { Mesa,Restaurante } from '../database/entities'; import { MesasController } from './mesas.controller'; import { MesasService } from './mesas.service';
@Module({imports:[TypeOrmModule.forFeature([Mesa,Restaurante])],controllers:[MesasController],providers:[MesasService]}) export class MesasModule {}
