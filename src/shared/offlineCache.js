import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'

const CACHE_PREFIX = '@cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Cached Supabase query wrapper.
 * - Returns cached data immediately if available
 * - Fetches fresh data in background when online
 * - Falls back to cache when offline
 *
 * @param {string} key - Unique cache key
 * @param {Function} fetchFn - Async function that returns { data, error }
 * @param {object} options - { ttl, forceRefresh }
 * @returns {{ data, error, fromCache }}
 */
export const cachedQuery = async (key, fetchFn, options = {}) => {
  const { ttl = DEFAULT_TTL, forceRefresh = false } = options
  const cacheKey = CACHE_PREFIX + key

  // Check network state
  const netState = await NetInfo.fetch()
  const isOnline = netState.isConnected && netState.isInternetReachable !== false

  // Try to get cached data
  let cachedData = null
  let cacheTimestamp = 0
  try {
    const raw = await AsyncStorage.getItem(cacheKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedData = parsed.data
      cacheTimestamp = parsed.timestamp || 0
    }
  } catch (e) {
    // Cache read failed, continue without it
  }

  const cacheAge = Date.now() - cacheTimestamp
  const cacheValid = cachedData && cacheAge < ttl

  // If offline, return cache (even if stale)
  if (!isOnline) {
    if (cachedData) {
      return { data: cachedData, error: null, fromCache: true }
    }
    return { data: null, error: { message: 'offline_no_cache' }, fromCache: false }
  }

  // If cache is valid and not forcing refresh, return it
  if (cacheValid && !forceRefresh) {
    return { data: cachedData, error: null, fromCache: true }
  }

  // Fetch fresh data
  const result = await fetchFn()

  if (result.error) {
    // Fetch failed, fallback to cache
    if (cachedData) {
      return { data: cachedData, error: null, fromCache: true }
    }
    return { data: null, error: result.error, fromCache: false }
  }

  // Save to cache
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data: result.data,
      timestamp: Date.now(),
    }))
  } catch (e) {
    // Cache write failed silently
  }

  return { data: result.data, error: null, fromCache: false }
}

/**
 * Invalidate a specific cache entry
 */
export const invalidateCache = async (key) => {
  await AsyncStorage.removeItem(CACHE_PREFIX + key)
}

/**
 * Clear all cached data
 */
export const clearAllCache = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys)
  }
}
