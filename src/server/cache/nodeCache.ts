import NodeCache from "node-cache";

declare global {
  var _nodeCache: NodeCache | undefined;
}

// Global cache instance (Default 1 hour TTL)
export const cache = globalThis._nodeCache || new NodeCache({ stdTTL: 3600, checkperiod: 120 });

if (process.env.NODE_ENV !== "production") {
  globalThis._nodeCache = cache;
}

/**
 * Fetch data from cache if present, otherwise call fetcher and store in cache
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  try {
    const cached = cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`Cache read error for key ${key}:`, err);
  }

  const freshData = await fetcher();

  try {
    if (freshData !== undefined && freshData !== null) {
      cache.set(key, freshData, ttlSeconds);
    }
  } catch (err) {
    console.warn(`Cache write error for key ${key}:`, err);
  }

  return freshData;
}

/**
 * Invalidate specific cache keys or keys matching prefix
 */
export function invalidateCache(keyOrPrefix: string) {
  try {
    const keys = cache.keys();
    const matching = keys.filter((k) => k === keyOrPrefix || k.startsWith(keyOrPrefix));
    if (matching.length > 0) {
      cache.del(matching);
    }
  } catch (err) {
    console.warn(`Cache invalidation error for prefix ${keyOrPrefix}:`, err);
  }
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
  try {
    cache.flushAll();
  } catch (err) {
    console.warn("Cache flush error:", err);
  }
}

