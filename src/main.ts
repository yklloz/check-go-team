import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prisma 7에서 DB 연결 풀을 안전하게 닫기 위해 반드시 필요합니다!
  app.enableShutdownHooks();

  app.enableCors({
    origin: 'http://localhost:5173', // React(Vite) 기본 포트
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
