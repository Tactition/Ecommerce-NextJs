"use client";

export interface CustomSizingDetails {
  isCustom: boolean;
  pricingMethod: "sq_ft" | "linear_ft" | string;
  linearMode?: "length_plus_width" | "single_length" | string;
  lengthFeet: number;
  lengthInches: number;
  widthFeet?: number;
  widthInches?: number;
  totalLengthFeet: number;
  totalWidthFeet?: number;
  billableMeasurement: number;
  unitLabel: string;
  rate: number;
  minPrice: number;
  minPriceApplied: boolean;
  calculatedPrice: number;
  formulaSummary: string;
}

export interface CartItem {
  id: string; // Unique cart item key
  productId: number;
  variationId?: number | null;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  image: string;
  attributes?: Record<string, string>;
  customDetails?: CustomSizingDetails;
  sku?: string | null;
  maxStock?: number;
}

const CART_STORAGE_KEY = "wallstreet_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse cart:", e);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const safe = Array.isArray(items) ? items : [];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: safe }));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

export function addToCart(
  item: Omit<CartItem, "id">
): { success: boolean; cart: CartItem[] } {
  const currentCart = getCart();
  const key = item.customDetails?.isCustom
    ? `${item.productId}_custom_${item.customDetails.pricingMethod}_${item.customDetails.totalLengthFeet}_${item.customDetails.totalWidthFeet || 0}`
    : item.attributes?.["Custom Sizing"]
    ? `${item.productId}_custom_${item.attributes["Custom Sizing"].replace(/[^a-zA-Z0-9]/g, "_")}`
    : `${item.productId}_${item.variationId || 0}`;

  const existingIdx = currentCart.findIndex((i) => i.id === key);
  let updated: CartItem[];

  if (existingIdx > -1) {
    const existing = currentCart[existingIdx];
    const newQty = existing.quantity + item.quantity;
    const finalQty = item.maxStock ? Math.min(newQty, item.maxStock) : newQty;
    updated = [...currentCart];
    updated[existingIdx] = { ...existing, quantity: finalQty };
  } else {
    updated = [
      ...currentCart,
      {
        ...item,
        id: key,
      },
    ];
  }

  saveCart(updated);
  return { success: true, cart: updated };
}

export function updateCartQuantity(key: string, delta: number): CartItem[] {
  const currentCart = getCart();
  const updated = currentCart
    .map((item) => {
      if (item.id === key) {
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) return null;
        const cappedQty = item.maxStock ? Math.min(nextQty, item.maxStock) : nextQty;
        return { ...item, quantity: cappedQty };
      }
      return item;
    })
    .filter(Boolean) as CartItem[];

  saveCart(updated);
  return updated;
}

export function setExactCartQuantity(key: string, qty: number): CartItem[] {
  const currentCart = getCart();
  if (qty <= 0) {
    return removeFromCart(key);
  }
  const updated = currentCart.map((item) => {
    if (item.id === key) {
      const cappedQty = item.maxStock ? Math.min(qty, item.maxStock) : qty;
      return { ...item, quantity: cappedQty };
    }
    return item;
  });

  saveCart(updated);
  return updated;
}

export function removeFromCart(key: string): CartItem[] {
  const currentCart = getCart();
  const updated = currentCart.filter((item) => item.id !== key);
  saveCart(updated);
  return updated;
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotals(
  items: CartItem[],
  discountPercent = 0
): {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const discount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const shipping = 0; // Doorstep delivery included
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total, itemCount };
}
