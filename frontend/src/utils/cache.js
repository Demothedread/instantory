const CACHE_PREFIX = 'instantory_';
const DEFAULT_TTL = 3600; // 1 hour in seconds

class Cache {
  constructor(namespace, options = {}) {
    this.namespace = `${CACHE_PREFIX}${namespace}`;
    this.ttl = options.ttl || DEFAULT_TTL;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} [ttl] - Optional TTL in seconds
   */
  set(key, value, ttl = this.ttl) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    };
    try {
      localStorage.setItem(
        `${this.namespace}_${key}`,
        JSON.stringify(item)
      );
      return true;
    } catch (e) {
      console.warn('Cache write failed:', e);
      this.cleanup(); // Try to free up space
      return false;
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    try {
      const item = JSON.parse(
        localStorage.getItem(`${this.namespace}_${key}`)
      );
      
      if (!item) return null;

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (e) {
      console.warn('Cache read failed:', e);
      return null;
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   */
  delete(key) {
    localStorage.removeItem(`${this.namespace}_${key}`);
  }

  /**
   * Clear all cached items for this namespace
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.namespace)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clean up expired items
   */
  cleanup() {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (!key.startsWith(this.namespace)) return;
      
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (now - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Remove invalid items
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get cache size in bytes
   */
  size() {
    let size = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.namespace)) {
        size += localStorage.getItem(key).length * 2; // UTF-16 characters
      }
    });
    
    return size;
  }
}

// Create instances for different data types
export const inventoryCache = new Cache('inventory', { ttl: 1800 }); // 30 minutes
export const documentCache = new Cache('documents', { ttl: 3600 }); // 1 hour
export const searchCache = new Cache('search', { ttl: 300 }); // 5 minutes

// Cleanup on load
[inventoryCache, documentCache, searchCache].forEach(cache => cache.cleanup());
