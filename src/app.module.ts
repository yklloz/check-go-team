import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // 추가
import { AuthModule } from './auth/auth.module'; // 곧 만들 거예요!

@Module({
  imports: [PrismaModule, AuthModule], // 여기에 추가
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
