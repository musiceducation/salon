import { prisma } from "@/lib/prisma";

async function dbReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function withIdempotencyByKey<T>(
  idempotencyKey: string | null | undefined,
  route: string,
  fn: () => Promise<{ status: number; body: T }>,
): Promise<{ status: number; body: T; fromCache: boolean }> {
  const key = idempotencyKey?.trim();
  if (!key) {
    const result = await fn();
    return { ...result, fromCache: false };
  }

  if (!(await dbReachable())) {
    const result = await fn();
    return { ...result, fromCache: false };
  }

  const composite = `${route}:${key}`;
  try {
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key: composite },
    });
    if (existing) {
      return {
        status: existing.status,
        body: JSON.parse(existing.body) as T,
        fromCache: true,
      };
    }
  } catch {
    const result = await fn();
    return { ...result, fromCache: false };
  }

  const result = await fn();
  if (result.status < 200 || result.status >= 300) {
    return { ...result, fromCache: false };
  }
  const bodyString = JSON.stringify(result.body);
  try {
    await prisma.idempotencyRecord.create({
      data: {
        key: composite,
        route,
        status: result.status,
        body: bodyString,
      },
    });
  } catch {
    try {
      const retry = await prisma.idempotencyRecord.findUnique({ where: { key: composite } });
      if (retry) {
        return {
          status: retry.status,
          body: JSON.parse(retry.body) as T,
          fromCache: true,
        };
      }
    } catch {
      /* DB unavailable after create — still return the fresh result */
    }
  }
  return { ...result, fromCache: false };
}
