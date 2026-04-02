import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prisma 7에서 DB 연결 풀을 안전하게 닫기 위해 반드시 필요합니다!
  app.enableShutdownHooks();

  // 다른 설정들(예: CORS, ValidationPipe 등)이 있다면 여기에 유지해 주세요.

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
