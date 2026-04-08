import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

import { ReceiptController } from './receipt/receipt.controller';
import { ReceiptService } from './receipt/receipt.service';

@Module({
  imports: [PrismaModule, AuthModule],

  controllers: [AppController, ReceiptController],

  providers: [AppService, ReceiptService],
})
export class AppModule {}
