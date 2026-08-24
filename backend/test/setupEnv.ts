/**
 * E2E 全局环境预置
 *
 * - 必须在 AppModule（CsrfService/JwtService）初始化之前设置 JWT_SECRET，
 *   否则 e2e 辅助生成的 CSRF token 与运行时签名密钥不一致，写请求会被 403。
 * - 若仓库根存在 .env.e2e，则加载其中的 E2E_DATABASE_URL / JWT_SECRET 等变量
 *   （不依赖 dotenv-cli，使用内置 fs 解析，避免引入额外依赖）。
 */
import * as fs from 'fs';
import * as path from 'path';

function loadEnvE2e(): void {
  const envPath = path.resolve(process.cwd(), '.env.e2e');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // 去掉首尾引号
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvE2e();

// 强制固定 JWT_SECRET，保证 e2e helper 生成的 CSRF token 可通过校验
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'e2e-test-secret-do-not-use-in-prod';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

// e2e 测试使用独立数据库（避免污染开发/生产库）
if (process.env.E2E_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  // 给出明确提示，避免启动后才因连不上库而失败

  console.warn(
    '[E2E] 未设置 DATABASE_URL / E2E_DATABASE_URL，测试将尝试连接默认库，可能失败。' +
      '请复制 backend/.env.e2e.example 为 backend/.env.e2e 并设置测试库连接串。',
  );
}
