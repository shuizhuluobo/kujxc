import { SetMetadata } from '@nestjs/common';

export const CSRF_TOKEN_KEY = 'csrf';

/**
 * CSRF保护装饰器 - 用于标记需要CSRF保护的接口
 * 适用于POST、PUT、PATCH、DELETE等修改性请求
 */
export const CsrfProtected = () => SetMetadata(CSRF_TOKEN_KEY, true);
