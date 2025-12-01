import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN')?.split(',') || ['*'];
  app.enableCors({
    origin: corsOrigins,
    credentials: configService.get<boolean>('CORS_CREDENTIALS') || true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Cookie parser middleware (needed for JWT auth)
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Get port from environment or default to 3001
  const port = configService.get<number>('PORT') || 3001;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  await app.listen(port);

  console.log('\n🚀 ========================================');
  console.log(`🚀 HR System API Server Started!`);
  console.log(`🚀 ========================================`);
  console.log(`📡 Environment: ${nodeEnv}`);
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`🔗 API Base: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Department API: http://localhost:${port}/${apiPrefix}/organization-structure/departments`);
  console.log(`🚀 ========================================\n`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

