import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser middleware (REQUIRED for reading cookies)
  app.use(cookieParser());
  
  // Enable CORS to accept requests from any origin (any port)
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
