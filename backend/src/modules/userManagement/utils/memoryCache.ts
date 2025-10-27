/**
 * @description Cache en memoria para usuarios autenticados
 * @module utils/memoryCache
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {
  UserCacheEntry,
  CacheManager,
  AuthenticatedUser
} from '../types/authTypes'

/**
 * Implementación simple de cache en memoria
 * En producción se recomienda usar Redis para aplicaciones distribuidas
 */
class MemoryCache implements CacheManager {
  private cache: Map<string, UserCacheEntry>
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.cache = new Map()

    // Limpieza automática cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Obtener usuario del cache
   */
  async get(key: string): Promise<UserCacheEntry | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Verificar si el entry ha expirado
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  /**
   * Guardar usuario en cache
   */
  async set(key: string, value: UserCacheEntry): Promise<void> {
    this.cache.set(key, value)
  }

  /**
   * Eliminar usuario del cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Limpiar todo el cache
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Verificar si existe una clave
   */
  async has(key: string): Promise<boolean> {
    const entry = await this.get(key)
    return entry !== null
  }

  /**
   * Verificar si un entry ha expirado
   */
  private isExpired(entry: UserCacheEntry): boolean {
    const now = Date.now()
    return entry.timestamp + entry.ttl * 1000 < now
  }

  /**
   * Limpiar entries expirados
   */
  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Destruir el cache y limpiar intervalos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Cache singleton
let cacheInstance: MemoryCache | null = null

/**
 * Obtener instancia singleton del cache
 */
export const getUserCache = (): CacheManager => {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache()
  }
  return cacheInstance
}

/**
 * Crear entrada de cache para usuario
 */
export const createCacheEntry = (
  user: AuthenticatedUser,
  ttl: number = 300 // 5 minutos por defecto
): UserCacheEntry => {
  return {
    user,
    timestamp: Date.now(),
    ttl
  }
}

/**
 * Generar clave de cache para usuario
 */
export const generateCacheKey = (userId: string): string => {
  return `user:${userId}`
}
