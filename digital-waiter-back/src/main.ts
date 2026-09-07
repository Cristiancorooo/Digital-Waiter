import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? ['http://localhost:4200'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // En Render, NestJS también entrega la compilación Angular. Esto mantiene
  // frontend y API bajo el mismo dominio y permite recargar rutas de la SPA.
  const publicPath = join(process.cwd(), 'public');
  app.useStaticAssets(publicPath, { index: false });
  const server = app.getHttpAdapter().getInstance();
  server.get('{*path}', (request: { path: string }, response: { sendFile: (path: string) => void }, next: () => void) => {
    if (request.path.startsWith('/api')) return next();
    response.sendFile(join(publicPath, 'index.html'));
  });

  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
