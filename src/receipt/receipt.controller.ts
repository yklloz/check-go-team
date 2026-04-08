import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 프론트에서 'file'이라는 이름으로 보내야 해요!
  async upload(@UploadedFile() file: any) {
    if (!file) throw new Error('파일이 도착하지 않았어요!');
    return this.receiptService.processReceipt(file.buffer);
  }
}