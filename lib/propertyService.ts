/**
 * Ultra-Fast Property Service with Stale-While-Revalidate (SWR) Caching
 * Ensures properties load instantly (0ms from cache) across all page navigations.
 */

export interface Property {
  id: string | number;
  seller_id?: string;
  title: string;
  location: string;
  area?: string;
  price: number;
  advancePayment?: number;
  bedrooms: number;
  bathrooms?: number;
  size?: number | string;
  type: string;
  images: string[];
  imageCount?: number;
  amenities: string[];
  description: string;
  seller: {
    id?: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string | null;
    verified: boolean;
  };
  available: boolean;
  createdAt?: string;
}

// In-Memory Fast Cache Map
const clientCache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();

// Cache configuration
const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh window
const SESSION_CACHE_PREFIX = "bl_prop_cache_";

const getSessionCache = (key: string): any | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS * 5) {
      return parsed.data;
    }
  } catch {
    // Ignore storage issues
  }
  return null;
};

const setSessionCache = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_CACHE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // SessionStorage might be full
  }
};

export const clearClientPropertyCache = () => {
  clientCache.clear();
  pendingRequests.clear();
  if (typeof window !== "undefined") {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(SESSION_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore
    }
  }
};

/**
 * Fetch properties with instant cached response & background revalidation
 */
export async function getProperties(
  params: { type?: string; area?: string; search?: string; limit?: number } = {},
  onRevalidate?: (freshData: Property[]) => void
): Promise<{ data: Property[]; isFromCache: boolean }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
  
  const queryParts: string[] = [];
  if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
  if (params.area) queryParts.push(`area=${encodeURIComponent(params.area)}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.limit) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const cacheKey = `properties_${queryString}`;

  // 1. Check in-memory cache
  const memoryItem = clientCache.get(cacheKey);
  const sessionItem = !memoryItem ? getSessionCache(cacheKey) : null;
  const cachedData = memoryItem?.data || sessionItem;

  // Background fetcher function
  const executeFetch = async (): Promise<Property[]> => {
    try {
      const res = await fetch(`${apiUrl}/api/properties${queryString}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch properties");
      const freshData: Property[] = await res.json();
      
      // Update cache
      clientCache.set(cacheKey, { data: freshData, timestamp: Date.now() });
      setSessionCache(cacheKey, freshData);

      if (onRevalidate && typeof onRevalidate === "function") {
        onRevalidate(freshData);
      }
      return freshData;
    } catch (err) {
      console.warn("Property fetch error:", err);
      if (cachedData) return cachedData;
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  };

  // If cached data exists, return it instantly (0ms) and trigger background revalidation
  if (cachedData) {
    // Populate memory cache if loaded from session
    if (!memoryItem) {
      clientCache.set(cacheKey, { data: cachedData, timestamp: Date.now() });
    }

    // Revalidate in background if not already in-flight
    if (!pendingRequests.has(cacheKey)) {
      const fetchPromise = executeFetch();
      pendingRequests.set(cacheKey, fetchPromise);
    }

    return { data: cachedData, isFromCache: true };
  }

  // If no cache, dedup and await fetch
  if (pendingRequests.has(cacheKey)) {
    const data = await pendingRequests.get(cacheKey);
    return { data, isFromCache: false };
  }

  const fetchPromise = executeFetch();
  pendingRequests.set(cacheKey, fetchPromise);
  const freshData = await fetchPromise;

  return { data: freshData, isFromCache: false };
}

/**
 * Fetch a single property with caching
 */
export async function getPropertyById(id: string | number): Promise<Property> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
  const cacheKey = `property_detail_${id}`;

  const cached = clientCache.get(cacheKey)?.data || getSessionCache(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${apiUrl}/api/properties/${id}`);
  if (!res.ok) throw new Error("Failed to fetch property details");
  const data: Property = await res.json();

  clientCache.set(cacheKey, { data, timestamp: Date.now() });
  setSessionCache(cacheKey, data);
  return data;
}

/**
 * Fetch seller's own listings efficiently
 */
export async function getSellerProperties(token: string): Promise<Property[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
  const cacheKey = `seller_listings_${token.slice(-10)}`;

  const cached = clientCache.get(cacheKey)?.data;
  if (cached) return cached;

  const res = await fetch(`${apiUrl}/api/properties/my-listings`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch seller listings");
  const data: Property[] = await res.json();

  clientCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
