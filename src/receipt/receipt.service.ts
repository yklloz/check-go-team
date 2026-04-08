import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async processReceipt(imageBuffer: Buffer) {
    // 1. Tesseract로 글자 읽기 (한국어 + 영어)
    const worker = await createWorker('kor+eng');
    const { data: { text: fullText } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    if (!fullText) throw new Error('글자를 읽지 못했어요!');

    // 2. 날짜 추출
    const dateMatch = fullText.match(/\d{4}[\.\-\/]\d{2}[\.\-\/]\d{2}/);
    const date = dateMatch ? dateMatch[0] : new Date().toISOString();

    // 3. 날짜 파싱
    const purchasedAt = dateMatch ? new Date(date) : new Date();

    // 4. 기본 장소 없으면 자동 생성 (upsert)
    const defaultPlace = await this.prisma.places.upsert({
      where: { id: 1 },
      update: {},
      create: { name: '기본 장소', place_type: 'home' },
    });

    // 5. Prisma로 구매 이력 저장
    return this.prisma.purchase_orders.create({
      data: {
        place_id: defaultPlace.id,
        purchased_at: purchasedAt,
        note: fullText.substring(0, 100),
      },
    });
  }
}