import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ReceiptService } from './receipt/receipt.service'; // 👈 /receipt/를 추가하세요!

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
