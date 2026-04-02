import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    // Pool 생성
    const pool = new Pool({ connectionString });
    
    // 에러 해결 포인트: pool을 'any'로 캐스팅해서 타입 충돌을 무시합니다.
    const adapter = new PrismaPg(pool as any);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('개발 시작!');
    } catch (e: any) {
      console.error('연결 에러:', e.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}