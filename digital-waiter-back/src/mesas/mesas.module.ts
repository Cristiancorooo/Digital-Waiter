import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm'; import { Mesa } from '../database/entities'; import { MesasController } from './mesas.controller'; import { MesasService } from './mesas.service';
@Module({imports:[TypeOrmModule.forFeature([Mesa])],controllers:[MesasController],providers:[MesasService]}) export class MesasModule {}
