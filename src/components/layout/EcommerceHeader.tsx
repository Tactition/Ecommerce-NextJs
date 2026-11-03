"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NavMenuItem } from "@/lib/actions/menus";
import { ProductCategory, validateWishlistItemsAction } from "@/lib/actions/products";
import { ContactNumberItem, ContactEmailItem } from "@/types";
import { getCart, removeFromCart, CartItem } from "@/lib/cart";
import { getWishlist, saveWishlist, WishlistItem } from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";
import LanguageTranslator from "@/components/common/LanguageTranslator";

interface EcommerceHeaderProps {
  siteLogo?: string;
  siteLogoWhite?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  phoneNumbers?: ContactNumberItem[];
  emailAddresses?: ContactEmailItem[];
  headerMenus?: NavMenuItem[];
  categoryMenus?: NavMenuItem[];
  productCategories?: ProductCategory[];
  workingHours?: string;
}

interface SidebarCategoryItem {
  id: number;
  name: string;
  slug: string;
  url: string;
  image?: string | null;
  icon_type?: string;
  itemCount?: number;
  children: {
    id: number;
    name: string;
    slug: string;
    url: string;
    itemCount?: number;
  }[];
}

function phoneListOrFallback(phones: ContactNumberItem[] | undefined, defaultPhone: string): ContactNumberItem[] {
  if (phones && phones.length > 0) return phones;
  if (defaultPhone && defaultPhone.trim()) {
    return [{ id: "p-primary", number: defaultPhone.trim(), label: "Main Phone", is_primary: true }];
  }
  return [];
}

function emailListOrFallback(emails: ContactEmailItem[] | undefined, defaultEmail: string): ContactEmailItem[] {
  if (emails && emails.length > 0) return emails;
  if (defaultEmail && defaultEmail.trim()) {
    return [{ id: "e-primary", email: defaultEmail.trim(), label: "General Inquiries", is_primary: true }];
  }
  return [];
}

function isExternalUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:");
}

function getSafeLink(url?: string): string {
  if (!url || url.trim() === "" || url === "#" || url === "/#" || url === "#!") {
    return "/shop";
  }
  return url;
}

export default function EcommerceHeader({
  siteLogo = "",
  siteLogoWhite = "",
  companyPhone = "",
  companyEmail = "",
  companyAddress = "",
  phoneNumbers = [],
  emailAddresses = [],
  headerMenus = [],
  categoryMenus = [],
  productCategories = [],
  workingHours = "",
}: EcommerceHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<{
    products: Array<{ id: number; name: string; slug: string; price: number; sale_price?: number | null; image?: string; category_name?: string }>;
    categories: Array<{ id: number; name: string; slug: string; image?: string | null }>;
  }>({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [isSticky, setIsSticky] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [isWishlistBumping, setIsWishlistBumping] = useState(false);
  const [adminErrorNotice, setAdminErrorNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("error=admin_required")) {
      setAdminErrorNotice(true);
    }
  }, []);

  // Unified category list for the Left-Side Category Sidebar
  const sidebarCategories = useMemo<SidebarCategoryItem[]>(() => {
    // 1. If productCategories exist from the database, use them
    if (productCategories && productCategories.length > 0) {
      const topLevel = productCategories.filter((c) => !c.parent_id);
      return topLevel.map((c) => {
        const children = productCategories.filter((sub) => sub.parent_id === c.id);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          url: `/shop?category=${c.slug}`,
          image: c.image,
          icon_type: c.icon_type,
          itemCount: c.item_count,
          children: children.map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            url: `/shop?category=${sub.slug}`,
            itemCount: sub.item_count,
          })),
        };
      });
    }

    // 2. Otherwise if categoryMenus exist from Nav Menu manager
    if (categoryMenus && categoryMenus.length > 0) {
      const topLevel = categoryMenus.filter((c) => !c.parent_id);
      return topLevel.map((c) => {
        const children = categoryMenus.filter((sub) => sub.parent_id === c.id);
        return {
          id: c.id,
          name: c.label,
          slug: c.url.replace(/^.*category=/, "").replace(/^\//, ""),
          url: getSafeLink(c.url),
          image: null,
          icon_type: "icon",
          itemCount: undefined,
          children: children.map((sub) => ({
            id: sub.id,
            name: sub.label,
            slug: sub.url.replace(/^.*category=/, "").replace(/^\//, ""),
            url: getSafeLink(sub.url),
            itemCount: undefined,
          })),
        };
      });
    }

    return [];
  }, [productCategories, categoryMenus]);

  const filteredCategories = useMemo<SidebarCategoryItem[]>(() => {
    if (!categorySearchQuery.trim()) return sidebarCategories;
    const q = categorySearchQuery.toLowerCase().trim();
    return sidebarCategories
      .map((cat) => {
        const matchesParent = cat.name.toLowerCase().includes(q);
        const matchingChildren = (cat.children || []).filter((ch) =>
          ch.name.toLowerCase().includes(q)
        );
        if (matchesParent || matchingChildren.length > 0) {
          return {
            ...cat,
            children: matchesParent ? cat.children : matchingChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as SidebarCategoryItem[];
  }, [sidebarCategories, categorySearchQuery]);

  // Lock body scroll and listen for Escape key when either drawer or search modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCategorySidebarOpen(false);
        setIsOffcanvasOpen(false);
        setIsSearchOpen(false);
      }
    };
    if (isCategorySidebarOpen || isOffcanvasOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategorySidebarOpen, isOffcanvasOpen, isSearchOpen]);

  // Live product search debounced API caller
  useEffect(() => {
    if (!isSearchOpen || searchQuery.trim().length < 2) {
      setLiveSearchResults({ products: [], categories: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLiveSearchResults(data);
        }
      } catch (err) {
        console.error("Live search fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const topLevelHeaderMenus = useMemo(
    () => (headerMenus || []).filter((item) => !item.parent_id),
    [headerMenus]
  );
  const getHeaderChildren = (parentId: number) =>
    (headerMenus || []).filter((item) => item.parent_id === parentId);

  const topLevelCategoryMenus = useMemo(
    () => (categoryMenus || []).filter((item) => !item.parent_id),
    [categoryMenus]
  );
  const getCategoryChildren = (parentId: number) =>
    (categoryMenus || []).filter((item) => item.parent_id === parentId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  useEffect(() => {
    // Initial loads
    const currentCart = getCart();
    setCartItems(currentCart);

    const currentWishlist = getWishlist();
    setWishlistItems(currentWishlist);

    // Auto-prune any stale/orphan wishlist products that no longer exist in the database
    if (currentWishlist.length > 0) {
      validateWishlistItemsAction(currentWishlist)
        .then((activeIds) => {
          const validWishlist = currentWishlist.filter((item) =>
            activeIds.includes(item.productId)
          );
          if (validWishlist.length !== currentWishlist.length) {
            saveWishlist(validWishlist);
            setWishlistItems(validWishlist);
          }
        })
        .catch((err) => {
          console.error("Wishlist validation error:", err);
        });
    }

    const handleCartUpdate = (e: any) => {
      const updated = e.detail || getCart();
      setCartItems(updated);
      setIsCartBumping(true);
      setTimeout(() => setIsCartBumping(false), 350);
    };

    const handleWishlistUpdate = (e: any) => {
      const updated = e.detail || getWishlist();
      setWishlistItems(updated);
      setIsWishlistBumping(true);
      setTimeout(() => setIsWishlistBumping(false), 350);
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "wallstreet_cart_v1") handleCartUpdate({});
      if (e.key === "wallstreet_wishlist_v1") handleWishlistUpdate({});
    });

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, []);

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const item of cartItems) {
      count += item.quantity;
      total += item.price * item.quantity;
    }
    return { cartCount: count, cartTotal: total };
  }, [cartItems]);
  const wishlistCount = wishlistItems.length;

  const handleRemoveFromCart = (key: string) => {
    const updated = removeFromCart(key);
    setCartItems(updated);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldBeSticky = window.scrollY > 120;
          setIsSticky((prev) => (prev !== shouldBeSticky ? shouldBeSticky : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ================================================================
          LEFT-SIDE CATEGORY SIDEBAR (SLIDES FROM LEFT)
      ================================================================ */}
      <div
        className={`wsi-category-sidebar ${isCategorySidebarOpen ? "sidebar-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Category Navigation Sidebar"
      >
        <div className="wsi-cat-sidebar__inner">
          {/* Top Bar with Brand Badge & Close Button */}
          <div className="wsi-cat-sidebar__top">
            <div className="d-flex align-items-center gap-2">
              <span className="wsi-cat-sidebar__top-icon">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <div>
                <h3 className="wsi-cat-sidebar__title">All Categories</h3>
                <span className="wsi-cat-sidebar__subtitle">Explore our interior collections</span>
              </div>
            </div>
            <button
              type="button"
              className="wsi-cat-sidebar__close"
              onClick={() => setIsCategorySidebarOpen(false)}
              aria-label="Close categories sidebar"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Real-time Category Search Bar */}
          <div className="wsi-cat-sidebar__search">
            <div className="wsi-cat-sidebar__search-wrap">
              <i className="fa-regular fa-magnifying-glass wsi-cat-sidebar__search-icon"></i>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="wsi-cat-sidebar__search-input"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery("")}
                  className="wsi-cat-sidebar__search-clear"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
            {categorySearchQuery && (
              <div className="wsi-cat-sidebar__search-meta">
                <span>
                  {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"} found
                </span>
              </div>
            )}
          </div>

          {/* Category Items List with Accordion Subcategories */}
          <div className="wsi-cat-sidebar__list">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                const isExpanded = Boolean(expandedCategories[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className={`wsi-cat-item ${isExpanded ? "wsi-cat-item--expanded" : ""}`}
                  >
                    <div className="wsi-cat-item__head">
                      <Link
                        href={cat.url}
                        className="wsi-cat-item__link"
                        onClick={() => setIsCategorySidebarOpen(false)}
                      >
                        <span className="wsi-cat-item__icon">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="wsi-cat-item__img"
                            />
                          ) : (
                            <i className="fa-solid fa-shapes"></i>
                          )}
                        </span>
                        <div className="wsi-cat-item__info">
                          <span className="wsi-cat-item__name">{cat.name}</span>
                          {hasChildren && (
                            <span className="wsi-cat-item__subtext">
                              {cat.children.length} {cat.children.length === 1 ? "collection" : "collections"}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="wsi-cat-item__actions">
                        {cat.itemCount !== undefined && cat.itemCount > 0 && (
                          <span className="wsi-cat-item__count" title={`${cat.itemCount} products`}>
                            {cat.itemCount}
                          </span>
                        )}

                        {hasChildren ? (
                          <button
                            type="button"
                            className={`wsi-cat-item__toggle ${isExpanded ? "expanded" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedCategories((prev) => ({
                                ...prev,
                                [cat.id]: !prev[cat.id],
                              }));
                            }}
                            aria-label={`Toggle ${cat.name} subcategories`}
                            title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                          >
                            <i className="fa-solid fa-chevron-down"></i>
                          </button>
                        ) : (
                          <Link
                            href={cat.url}
                            className="wsi-cat-item__arrow"
                            onClick={() => setIsCategorySidebarOpen(false)}
                            aria-hidden="true"
                            tabIndex={-1}
                          >
                            <i className="fa-regular fa-chevron-right"></i>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Subcategories Accordion */}
                    {hasChildren && isExpanded && (
                      <div className="wsi-cat-sublist-wrapper">
                        <ul className="wsi-cat-sublist">
                          {cat.children.map((sub) => (
                            <li key={sub.id} className="wsi-cat-subitem">
                              <Link
                                href={sub.url}
                                className="wsi-cat-sublink"
                                onClick={() => setIsCategorySidebarOpen(false)}
                              >
                                <span className="wsi-cat-sublink__bullet"></span>
                                <span className="wsi-cat-sublink__name">{sub.name}</span>
                                {sub.itemCount !== undefined && sub.itemCount > 0 && (
                                  <span className="wsi-cat-sublink__count">{sub.itemCount}</span>
                                )}
                                <i className="fa-regular fa-chevron-right wsi-cat-sublink__arrow"></i>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="wsi-cat-sidebar__empty">
                <div className="wsi-cat-sidebar__empty-icon">
                  <i className="fa-regular fa-magnifying-glass"></i>
                </div>
                <h5>No categories found</h5>
                <p>
                  {categorySearchQuery
                    ? `No collections match "${categorySearchQuery}". Try another keyword or clear the search.`
                    : "No categories are currently published."}
                </p>
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery("")}
                    className="theme-btn btn-sm"
                    style={{ padding: "8px 18px", fontSize: "0.85rem", borderRadius: "8px" }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="wsi-cat-sidebar__footer">
            <Link
              href="/shop"
              className="wsi-cat-sidebar__explore-btn"
              onClick={() => setIsCategorySidebarOpen(false)}
            >
              <span>Explore All Products</span>
              <i className="fa-solid fa-arrow-right-long"></i>
            </Link>
            <div className="wsi-cat-sidebar__dealer-note">
              <span>Wholesale Buyer or Architect?</span>
              <Link href="/dealer/login" onClick={() => setIsCategorySidebarOpen(false)}>
                Dealer Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sidebar Overlay */}
      <div
        className={`wsi-category-sidebar-overlay ${isCategorySidebarOpen ? "overlay-open" : ""}`}
        onClick={() => setIsCategorySidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Offcanvas Area Start */}
      <div className={`fix-area ${isOffcanvasOpen ? "info-open" : ""}`}>
        <div className={`offcanvas__info ${isOffcanvasOpen ? "info-open active" : ""}`}>
          <div className="offcanvas__wrapper">
            <div className="offcanvas__content">
              <div className="offcanvas__top">
                <div className="offcanvas__logo">
                  <Link href="/" onClick={() => setIsOffcanvasOpen(false)}>
                    {siteLogoWhite ? (
                      <img
                        src={siteLogoWhite}
                        alt="Wall Street Interiors"
                        style={{ maxHeight: "38px", width: "auto" }}
                      />
                    ) : (
                      <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "1px" }}>
                        WALL STREET <span style={{ color: "#FF4035" }}>INTERIORS</span>
                      </span>
                    )}
                  </Link>
                </div>
                <div className="offcanvas__close">
                  <button onClick={() => setIsOffcanvasOpen(false)} aria-label="Close navigation drawer" title="Close Menu">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              {/* Mobile Auth Status Card */}
              <div className="wsi-drawer-user-card">
                {isAuthenticated ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#FF4035",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "14px",
                            boxShadow: "0 2px 8px rgba(255, 64, 53, 0.35)",
                          }}
                        >
                          {user?.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", lineHeight: "1.2" }}>
                            {user?.name}
                          </div>
                          <div style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "2px" }}>
                            {isStaff ? "Administrator / Staff" : "Customer Account"}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOffcanvasOpen(false);
                          logout("/");
                        }}
                        style={{
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#EF4444",
                          cursor: "pointer",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "6px",
                        }}
                        title="Sign Out"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign Out
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                      <Link
                        href="/profile"
                        onClick={() => setIsOffcanvasOpen(false)}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "7px 10px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="fa-solid fa-user"></i> My Profile & Orders
                      </Link>
                      {isStaff && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOffcanvasOpen(false)}
                          style={{
                            padding: "7px 14px",
                            backgroundColor: "rgba(255, 64, 53, 0.2)",
                            border: "1px solid rgba(255, 64, 53, 0.4)",
                            color: "#FF4035",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i className="fa-solid fa-gauge"></i> Admin
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ color: "#FFFFFF", fontSize: "0.88rem", fontWeight: 700 }}>
                        Welcome, Guest
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: "0.74rem", marginTop: "2px" }}>
                        Sign in for orders & wishlist
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        href="/login"
                        onClick={() => setIsOffcanvasOpen(false)}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#FF4035",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOffcanvasOpen(false)}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Navigation Menu */}
              <div className="wsi-drawer-nav-section">
                <div className="wsi-drawer-nav-title">Menu Navigation</div>
                {topLevelHeaderMenus.length > 0 ? (
                  topLevelHeaderMenus.map((item) => {
                    const children = getHeaderChildren(item.id);
                    return (
                      <div key={item.id} className="wsi-drawer-nav-item">
                        {isExternalUrl(item.url) ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOffcanvasOpen(false)}
                            className="wsi-drawer-nav-link"
                          >
                            <span>{item.label}</span>
                            <i className="fa-solid fa-arrow-up-right-from-square wsi-drawer-nav-chevron"></i>
                          </a>
                        ) : (
                          <Link
                            href={getSafeLink(item.url)}
                            target={item.target === "_blank" ? "_blank" : undefined}
                            onClick={() => setIsOffcanvasOpen(false)}
                            className="wsi-drawer-nav-link"
                          >
                            <span>{item.label}</span>
                            {children.length > 0 ? (
                              <i className="fa-solid fa-chevron-down wsi-drawer-nav-chevron"></i>
                            ) : (
                              <i className="fa-solid fa-chevron-right wsi-drawer-nav-chevron"></i>
                            )}
                          </Link>
                        )}
                        {children.length > 0 && (
                          <div className="wsi-drawer-submenu">
                            {children.map((child) => (
                              isExternalUrl(child.url) ? (
                                <a
                                  key={child.id}
                                  href={child.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setIsOffcanvasOpen(false)}
                                  className="wsi-drawer-sublink"
                                >
                                  <i className="fa-regular fa-angle-right me-1" style={{ fontSize: "11px" }}></i>
                                  {child.label}
                                </a>
                              ) : (
                                <Link
                                  key={child.id}
                                  href={getSafeLink(child.url)}
                                  target={child.target === "_blank" ? "_blank" : undefined}
                                  onClick={() => setIsOffcanvasOpen(false)}
                                  className="wsi-drawer-sublink"
                                >
                                  <i className="fa-regular fa-angle-right me-1" style={{ fontSize: "11px" }}></i>
                                  {child.label}
                                </Link>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <Link href="/" onClick={() => setIsOffcanvasOpen(false)} className="wsi-drawer-nav-link">
                    <span>Home</span>
                    <i className="fa-solid fa-chevron-right wsi-drawer-nav-chevron"></i>
                  </Link>
                )}
              </div>

              {/* Drawer Contact & Inquiries Section */}
              <div className="wsi-drawer-contact-section">
                <div className="wsi-drawer-nav-title">Contact & Support</div>

                {companyAddress ? (
                  <div className="wsi-drawer-contact-card">
                    <div className="wsi-drawer-contact-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="wsi-drawer-contact-info">
                      <span className="wsi-drawer-contact-label">Showroom Location</span>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`}
                        className="wsi-drawer-contact-val"
                      >
                        {companyAddress}
                      </a>
                    </div>
                  </div>
                ) : null}

                {/* Phone Numbers in Offcanvas */}
                {phoneListOrFallback(phoneNumbers, companyPhone).map((p) => (
                  <div key={p.id} className="wsi-drawer-contact-card">
                    <div className="wsi-drawer-contact-icon">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="wsi-drawer-contact-info">
                      <span className="wsi-drawer-contact-label">{p.label}</span>
                      <a href={`tel:${p.number.replace(/\s+/g, "")}`} className="wsi-drawer-contact-val">
                        {p.number}
                      </a>
                    </div>
                  </div>
                ))}

                {/* Emails in Offcanvas */}
                {emailListOrFallback(emailAddresses, companyEmail).map((e) => (
                  <div key={e.id} className="wsi-drawer-contact-card">
                    <div className="wsi-drawer-contact-icon">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="wsi-drawer-contact-info">
                      <span className="wsi-drawer-contact-label">{e.label}</span>
                      <a href={`mailto:${e.email}`} className="wsi-drawer-contact-val">
                        {e.email}
                      </a>
                    </div>
                  </div>
                ))}

                {workingHours ? (
                  <div className="wsi-drawer-contact-card">
                    <div className="wsi-drawer-contact-icon">
                      <i className="fa-solid fa-clock"></i>
                    </div>
                    <div className="wsi-drawer-contact-info">
                      <span className="wsi-drawer-contact-label">Operating Hours</span>
                      <span className="wsi-drawer-contact-val">{workingHours}</span>
                    </div>
                  </div>
                ) : null}

                <Link
                  href="/contact"
                  className="wsi-drawer-cta-btn"
                  onClick={() => setIsOffcanvasOpen(false)}
                >
                  <span>Request A Quote</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>

                <div className="wsi-drawer-social-row">
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wsi-drawer-social-btn"
                    style={{ backgroundColor: "#1877F2" }}
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wsi-drawer-social-btn"
                    style={{ backgroundColor: "#000000", border: "1px solid rgba(255,255,255,0.2)" }}
                    aria-label="X (Twitter)"
                    title="X"
                  >
                    <i className="fa-brands fa-x-twitter"></i>
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wsi-drawer-social-btn"
                    style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wsi-drawer-social-btn"
                    style={{ backgroundColor: "#FF0000" }}
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wsi-drawer-social-btn"
                    style={{ backgroundColor: "#0A66C2" }}
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`offcanvas__overlay ${isOffcanvasOpen ? "overlay-open active" : ""}`}
        onClick={() => setIsOffcanvasOpen(false)}
      ></div>

      {/* Admin Authorization Notice */}
      {adminErrorNotice && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            borderBottom: "1px solid #FECACA",
            color: "#991B1B",
            padding: "10px 24px",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            position: "relative",
            zIndex: 99999,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fa-solid fa-shield-halved" style={{ color: "#DC2626", fontSize: "16px" }}></i>
            <span>
              <strong>Staff Access Required:</strong> You are currently signed in with a customer account ({user?.name || "Customer"}). To view the admin console, please sign in with an administrator account.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <Link
              href="/admin?error=admin_required"
              style={{
                padding: "6px 14px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In as Admin
            </Link>
            <button
              type="button"
              onClick={() => setAdminErrorNotice(false)}
              aria-label="Dismiss alert"
              style={{
                background: "none",
                border: "none",
                color: "#991B1B",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="header-section-1">
        {isSticky && (
          <div
            className="header-placeholder d-none d-xl-block"
            style={{ height: "140px" }}
            aria-hidden="true"
          />
        )}
        {isSticky && (
          <div
            className="header-placeholder d-block d-xl-none"
            style={{ height: "70px" }}
            aria-hidden="true"
          />
        )}
        <div id="header-sticky" className={`header-1 ${isSticky ? "sticky" : ""}`}>
          <div className="header-top-one">
            {companyPhone ? (
              <div className="phone-icon d-flex align-items-center gap-2">
                <i className="icon-telephone"></i>
                <a href={`tel:${companyPhone.replace(/\s+/g, "")}`}>{companyPhone}</a>
                {phoneNumbers && phoneNumbers.length > 1 && (
                  <span
                    title={phoneNumbers.map((p) => `${p.label}: ${p.number}`).join("\n")}
                    style={{
                      background: "rgba(255, 64, 53, 0.12)",
                      color: "var(--theme)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    +{phoneNumbers.length - 1} more
                  </span>
                )}
              </div>
            ) : <div />}
            <div className="offer">
              <div className="subtitle style1" style={{ color: "#FFFFFF" }}>
                <i className="icon-tag" style={{ color: "#FF4035", marginRight: "6px" }}></i>
                59% <span className="color-text" style={{ color: "#FF4035", fontWeight: 700 }}> discount </span> for all architectural items
              </div>
            </div>
            <div className="lang" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                href="/dealer/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FBBF24",
                  textDecoration: "none",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(251, 191, 36, 0.12)",
                  border: "1px solid rgba(251, 191, 36, 0.28)",
                  transition: "all 0.2s ease",
                }}
                title="B2B Wholesale Trade Portal for Interior Contractors & Retailers"
              >
                <i className="fa-solid fa-briefcase"></i>
                <span>Dealer Desk</span>
              </Link>
              <LanguageTranslator />
              <div className="user">
                {isAuthenticated ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
                    <Link
                      href="/profile"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                        color: "inherit",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      title="View Profile and Order History"
                    >
                      <i className="fa-solid fa-user-circle"></i>
                      <span>Hi, {user?.name ? user.name.split(" ")[0] : "My Account"}</span>
                    </Link>

                    {isStaff && (
                      <Link
                        href="/dashboard"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "var(--theme, #FF4035)",
                          textDecoration: "none",
                        }}
                      >
                        <i className="fa-solid fa-gauge-high"></i>
                        <span>Admin</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => logout("/")}
                      title="Sign Out"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94A3B8",
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 6px",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4035")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login?redirectTo=/profile"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                    }}
                  >
                    <i className="fa-solid fa-user"></i>
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="mega-menu-wrapper">
              <div className="header-main wsi-header-main-unified">
                {/* 1. Left: Brand & Categories Trigger */}
                <div className="header-left wsi-header-brand-block">
                  <div className="logo">
                    <Link href="/" className="header-logo">
                      {siteLogo ? (
                        <img
                          src={siteLogo}
                          alt="Wall Street Interiors"
                          style={{ maxHeight: "42px", width: "auto", objectFit: "contain" }}
                        />
                      ) : null}
                    </Link>
                  </div>
                  {/* Separate Categories Trigger Button (Opens Left-Sliding Category Sidebar) */}
                  <button
                    type="button"
                    className="wsi-header-cat-btn"
                    onClick={() => setIsCategorySidebarOpen(true)}
                    aria-label="Browse All Categories"
                    title="All Product Categories"
                  >
                    <span className="wsi-header-cat-btn__icon">
                      <i className="fa-solid fa-layer-group"></i>
                    </span>
                    <span className="wsi-header-cat-btn__text">Categories</span>
                    <i className="fa-regular fa-chevron-down wsi-header-cat-btn__chevron"></i>
                  </button>
                </div>

                {/* 2. Center: Navigation Menu (Logo > Menu > Right Icons) */}
                <div className="wsi-header-center-nav d-none d-xl-flex">
                  <div className="main-menu">
                    <nav id="mobile-menu">
                      <ul>
                        {topLevelHeaderMenus.length > 0 ? (
                          topLevelHeaderMenus.map((item) => {
                            const children = getHeaderChildren(item.id);
                            if (children.length > 0) {
                              return (
                                <li key={item.id} className="has-dropdown">
                                  {isExternalUrl(item.url) ? (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                      {item.label}
                                      <i className="fa-regular fa-plus"></i>
                                    </a>
                                  ) : (
                                    <Link href={getSafeLink(item.url)} target={item.target === "_blank" ? "_blank" : undefined}>
                                      {item.label}
                                      <i className="fa-regular fa-plus"></i>
                                    </Link>
                                  )}
                                  <ul className="submenu">
                                    {children.map((child) => (
                                      <li key={child.id}>
                                        {isExternalUrl(child.url) ? (
                                          <a href={child.url} target="_blank" rel="noopener noreferrer">
                                            {child.label}
                                          </a>
                                        ) : (
                                          <Link href={getSafeLink(child.url)} target={child.target === "_blank" ? "_blank" : undefined}>
                                            {child.label}
                                          </Link>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              );
                            }
                            return (
                              <li key={item.id}>
                                {isExternalUrl(item.url) ? (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    {item.label}
                                  </a>
                                ) : (
                                  <Link href={getSafeLink(item.url)} target={item.target === "_blank" ? "_blank" : undefined}>
                                    {item.label}
                                  </Link>
                                )}
                              </li>
                            );
                          })
                        ) : (
                          <li>
                            <Link href="/">Home</Link>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                </div>

                {/* 3. Right: Action Icons Grouped Together (Tight, Less Gaping, Proper Spacing) */}
                <div className="wsi-header-actions-group">
                  {/* Search Icon */}
                  <button
                    type="button"
                    className="wsi-action-icon-btn search-trigger"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Search Catalog"
                    title="Search Products"
                  >
                    <i className="fal fa-search"></i>
                  </button>

                  {/* Cart Icon & Dropdown */}
                  <div className="wsi-cart-action-wrapper menu-cart">
                    <Link
                      href="/cart"
                      className="wsi-action-icon-btn cart-icon"
                      aria-label="Shopping Cart"
                      title="View Shopping Cart"
                    >
                      <i className="fa-regular fa-bag-shopping"></i>
                      {cartCount > 0 && (
                        <span
                          className="wsi-action-badge"
                          style={{
                            transform: isCartBumping ? "scale(1.3)" : "scale(1)",
                          }}
                        >
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    {/* Cart Dropdown Box */}
                    <div className="cart-box">
                      {cartItems.length > 0 ? (
                        <>
                          <ul style={{ maxHeight: "240px", overflowY: "auto", margin: 0, padding: 0 }}>
                            {cartItems.map((cItem) => (
                              <li key={cItem.id} className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                {cItem.image ? (
                                  <img
                                    src={cItem.image}
                                    alt={cItem.name}
                                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      backgroundColor: "#F1F5F9",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#94A3B8",
                                    }}
                                  >
                                    <i className="fa-solid fa-box"></i>
                                  </div>
                                )}
                                <div className="cart-product flex-grow-1 ms-2 me-2" style={{ textAlign: "left" }}>
                                  <Link href={`/product/${cItem.slug}`} style={{ fontWeight: 600, fontSize: "0.88rem", display: "block", lineHeight: "1.2" }}>
                                    {cItem.name}
                                  </Link>
                                  {cItem.attributes && Object.keys(cItem.attributes).length > 0 && (
                                    <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>
                                      {Object.entries(cItem.attributes).map(([k, v]) => `${k.split(" ")[0]}: ${v}`).join(", ")}
                                    </span>
                                  )}
                                  <span style={{ fontSize: "0.82rem", color: "var(--theme)", fontWeight: 600 }}>
                                    {cItem.quantity} × ₹{Number(cItem.price).toLocaleString()}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveFromCart(cItem.id);
                                  }}
                                  style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}
                                  title="Remove from cart"
                                >
                                  <i className="fa-regular fa-trash-can" style={{ fontSize: "13px" }}></i>
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="shopping-items d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                            <span style={{ fontSize: "0.85rem", color: "#64748B" }}>Delivery: Free</span>
                            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Total: ₹{cartTotal.toLocaleString()}</span>
                          </div>
                          <div className="cart-button d-flex justify-content-between mt-3">
                            <Link href="/cart" className="theme-btn" style={{ padding: "10px 18px", fontSize: "13px" }}>
                              View Cart
                            </Link>
                            <Link href="/checkout" className="theme-btn bg-red-2" style={{ padding: "10px 18px", fontSize: "13px" }}>
                              Checkout
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <i className="fa-regular fa-bag-shopping" style={{ fontSize: "2rem", color: "#CBD5E1" }}></i>
                          <p style={{ margin: "10px 0 16px 0", fontSize: "0.88rem", color: "#64748B" }}>Your cart is empty</p>
                          <Link href="/shop" className="theme-btn" style={{ padding: "8px 18px", fontSize: "12px" }}>
                            Explore Products
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wishlist Icon */}
                  <Link
                    className="wsi-action-icon-btn wishlist-btn"
                    href="/wishlist"
                    aria-label="Wishlist"
                    title="View Wishlist"
                  >
                    <i className="fa-regular fa-heart"></i>
                    {wishlistCount > 0 && (
                      <span
                        className="wsi-action-badge"
                        style={{
                          transform: isWishlistBumping ? "scale(1.3)" : "scale(1)",
                        }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Customer Profile Icon */}
                  <Link
                    className={`wsi-action-icon-btn profile-btn ${isAuthenticated ? "is-auth" : ""}`}
                    href={isAuthenticated ? "/profile" : "/login?redirectTo=/profile"}
                    title={
                      isAuthenticated
                        ? `My Profile & Orders (${user?.name || "Customer"})`
                        : "Sign In / View Profile"
                    }
                    aria-label="User Profile"
                  >
                    <i className={isAuthenticated ? "fa-solid fa-user" : "fa-regular fa-user"}></i>
                  </Link>

                  {/* Mobile Hamburger */}
                  <button
                    type="button"
                    className="wsi-mobile-hamburger-btn d-inline-flex d-xl-none"
                    onClick={() => setIsOffcanvasOpen(true)}
                    aria-label="Open mobile navigation menu"
                    title="Open Menu"
                  >
                    <i className="fa-solid fa-bars"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Interactive Search Modal */}
      <div
        className={`wsi-search-modal-backdrop ${isSearchOpen ? "active" : ""}`}
        style={{
          display: isSearchOpen ? "flex" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          backgroundColor: "rgba(10, 17, 30, 0.82)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "70px 20px 40px",
          overflowY: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsSearchOpen(false);
        }}
      >
        <div
          className="wsi-search-modal-container"
          style={{
            width: "100%",
            maxWidth: "760px",
            background: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
            padding: "28px 30px 32px",
            position: "relative",
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              transition: "all 0.2s",
            }}
          >
            <i className="fas fa-times" style={{ fontSize: "16px" }}></i>
          </button>

          {/* Search Header */}
          <div style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#FF4035" }}>
              Explore Studio Catalog
            </span>
            <h4 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", margin: "4px 0 0" }}>
              What architectural pieces are you looking for?
            </h4>
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "6px 14px 6px 18px",
                border: "2px solid #E2E8F0",
                borderRadius: "14px",
                backgroundColor: "#F8FAFC",
                transition: "border-color 0.2s",
              }}
            >
              <i className="fal fa-search" style={{ fontSize: "20px", color: "#FF4035" }}></i>
              <input
                type="text"
                placeholder="Search sofas, acoustic slat panels, chandeliers, kitchens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "1.05rem",
                  color: "#0F172A",
                  padding: "10px 0",
                  fontFamily: "var(--font-primary, sans-serif)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Clear search query"
                >
                  <i className="fas fa-times-circle" style={{ fontSize: "16px" }}></i>
                </button>
              )}
              <button
                type="submit"
                className="theme-btn"
                style={{
                  padding: "10px 22px",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#FF4035",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Tags / Trending searches */}
          {!searchQuery.trim() && (
            <div style={{ marginTop: "24px" }}>
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "#94A3B8" }}>
                Popular Searches
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {[
                  "Luxury Furniture",
                  "Wall Treatments & Panels",
                  "Architectural Lighting",
                  "Modular Kitchen",
                  "Acoustic Slat Wood",
                  "Curtains & Drapes",
                  "Dining Sets",
                  "Charcoal Louvers",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsSearchOpen(false);
                      router.push(`/shop?q=${encodeURIComponent(tag)}`);
                    }}
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      fontSize: "0.84rem",
                      fontWeight: 500,
                      color: "#334155",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {searchQuery.trim().length >= 2 && (
            <div style={{ marginTop: "24px" }}>
              {isSearching ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#64748B", fontSize: "0.92rem" }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px", color: "#FF4035" }}></i>
                  Searching catalog...
                </div>
              ) : liveSearchResults.products.length === 0 && liveSearchResults.categories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#64748B" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem" }}>
                    No instant matches for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="theme-btn btn-sm"
                    style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  >
                    Search Full Catalog &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  {/* Matching Categories */}
                  {liveSearchResults.categories.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, color: "#94A3B8" }}>
                        Matching Collections
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {liveSearchResults.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "#FFF5F4",
                              border: "1px solid #FFEBEA",
                              color: "#FF4035",
                              borderRadius: "18px",
                              padding: "6px 14px",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <i className="fa-regular fa-folder-open"></i>
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {liveSearchResults.products.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, color: "#94A3B8" }}>
                          Products ({liveSearchResults.products.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FF4035",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          View all in shop &rarr;
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "10px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
                        {liveSearchResults.products.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/shop/${prod.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px",
                              borderRadius: "12px",
                              background: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              textDecoration: "none",
                              color: "inherit",
                              transition: "all 0.15s",
                            }}
                          >
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#94A3B8" }}>
                                <i className="fa-solid fa-box"></i>
                              </div>
                            )}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h5 style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {prod.name}
                              </h5>
                              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                                {prod.category_name || "Architecture Item"}
                              </span>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FF4035" }}>
                                ₹{Number(prod.sale_price ?? prod.price).toLocaleString()}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
