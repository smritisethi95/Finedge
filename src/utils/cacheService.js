class CacheService {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, ttlMs) {
        const expires = Date.now() + ttlMs;
        this.cache.set(key, { value, expires });
        setTimeout(() => this.cache.delete(key), ttlMs);
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
}

module.exports = new CacheService();