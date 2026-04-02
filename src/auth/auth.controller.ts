import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  async login(@Body() body: any) {
    // 프론트에서 보낸 Supabase 유저 객체를 받아서 서비스로 넘깁니다.
    return await this.authService.validateKakaoUser(body.user);
  }
}