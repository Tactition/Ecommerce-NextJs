"use client";

export interface WishlistItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  categoryName?: string;
  stock?: number;
  rating?: number;
  badge?: string | null;
  addedAt?: number;
}

const WISHLIST_STORAGE_KEY = "wallstreet_wishlist_v1";

/**
 * Retrieves the current wishlist from localStorage.
 */
export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WishlistItem =>
        Boolean(item && typeof item.productId === "number" && item.name)
    );
  } catch (e) {
    console.error("Failed to parse wishlist from localStorage:", e);
    return [];
  }
}

/**
 * Persists the wishlist array to localStorage and dispatches a 'wishlist-updated' CustomEvent.
 */
export function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const safe = Array.isArray(items) ? items : [];
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: safe }));
  } catch (e) {
    console.error("Failed to save wishlist to localStorage:", e);
  }
}

/**
 * Checks if a specific product ID is currently in the wishlist.
 */
export function isInWishlist(productId: number): boolean {
  const current = getWishlist();
  return current.some((item) => item.productId === productId);
}

/**
 * Adds an item to the wishlist if not already present.
 */
export function addToWishlist(
  item: WishlistItem
): { success: boolean; wishlist: WishlistItem[]; isNew: boolean } {
  const current = getWishlist();
  const exists = current.some((i) => i.productId === item.productId);

  if (exists) {
    return { success: true, wishlist: current, isNew: false };
  }

  const updated = [
    {
      ...item,
      addedAt: item.addedAt || Date.now(),
    },
    ...current,
  ];

  saveWishlist(updated);
  return { success: true, wishlist: updated, isNew: true };
}

/**
 * Toggles an item in the wishlist (adds if absent, removes if present).
 * Returns whether the item was added (true) or removed (false).
 */
export function toggleWishlist(
  item: WishlistItem
): { added: boolean; wishlist: WishlistItem[] } {
  const current = getWishlist();
  const exists = current.some((i) => i.productId === item.productId);

  let updated: WishlistItem[];
  if (exists) {
    updated = current.filter((i) => i.productId !== item.productId);
    saveWishlist(updated);
    return { added: false, wishlist: updated };
  } else {
    updated = [
      {
        ...item,
        addedAt: Date.now(),
      },
      ...current,
    ];
    saveWishlist(updated);
    return { added: true, wishlist: updated };
  }
}

/**
 * Removes an item from the wishlist by its product ID.
 */
export function removeFromWishlist(productId: number): WishlistItem[] {
  const current = getWishlist();
  const updated = current.filter((i) => i.productId !== productId);
  saveWishlist(updated);
  return updated;
}

/**
 * Clears all items from the wishlist.
 */
export function clearWishlist(): void {
  saveWishlist([]);
}
