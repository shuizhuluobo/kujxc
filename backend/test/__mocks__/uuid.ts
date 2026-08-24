// uuid 模块的 jest manual mock（CJS 友好）。
// 真实 uuid 为纯 ESM 包，在 jest CJS 运行时下无法直接 require，
// 这里直接基于 Node crypto 提供等价实现，避免 ESM/CJS 互操作错误。
import { randomUUID } from 'crypto';

export const v4 = (): string => randomUUID();
export const v5 = (): string => randomUUID();
export const NIL = '00000000-0000-0000-0000-000000000000';
export const version = (): number => 4;
export default v4;
