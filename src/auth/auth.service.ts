import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateKakaoUser(user: any) {
    const { id, email, user_metadata } = user;

    // 1. 이미 프로필이 있는지 확인
    const profile = await this.prisma.profiles.findFirst({
      where: { account_id: id },
    });

    if (!profile) {
      // 2. 없으면 새로 생성 (회원가입)
      return await this.prisma.profiles.create({
        data: {
          account_id: id,
          name: user_metadata.full_name || '이름없음',
          avatar: user_metadata.avatar_url || '',
        },
      });
    }

    // 3. 있으면 정보 업데이트
    return await this.prisma.profiles.update({
      where: { id: profile.id },
      data: {
        name: user_metadata.full_name,
        avatar: user_metadata.avatar_url,
      },
    });
  }
}