import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/access-control';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  status() { return { status: 'ok', service: 'digital-waiter-api', timestamp: new Date().toISOString() }; }
}
