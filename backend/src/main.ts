import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 生产环境强制校验关键配置
  if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
    const insecureDefaults = [
      'change-in-production',
      'dev-jwt-secret',
      'dev-refresh-secret',
    ];

    for (const varName of requiredEnvVars) {
      const value = process.env[varName];
      if (!value) {
        logger.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
      }
      if (insecureDefaults.some((d) => value.includes(d))) {
        logger.error(
          `Environment variable ${varName} contains insecure default value. Please change it in production.`,
        );
        process.exit(1);
      }
    }
  }

  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 启用 CORS - 生产环境请配置具体允许的域名
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) =>
    o.trim(),
  ) || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      // 允许无origin的请求 (如移动App)
      if (!origin) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        logger.warn(`Origin not allowed: ${origin}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enablePrimitiveConversion: true },
    }),
  );

  // API 前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  // Swagger 文档（仅开发环境启用）
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('工单管理系统 API')
      .setDescription('工单管理系统后端接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger Docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`Server running on: http://0.0.0.0:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`API Docs: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
