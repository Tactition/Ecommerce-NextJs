"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Product, ProductCategory } from "@/lib/actions/products";
import { addToCart } from "@/lib/cart";
import { addToWishlist, toggleWishlist } from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";

const ProductImageGallery = dynamic(() => import("@/components/shop/ProductImageGallery"), { ssr: false });
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  RotateCcw,
  Check,
  Star,
  Eye,
  Heart,
  ShoppingBag,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Package,
} from "lucide-react";

interface ShopClientProps {
  initialProducts: Product[];
  categories: ProductCategory[];
}

export default function ShopClient({ initialProducts, categories }: ShopClientProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") || null;
  const urlQuery = searchParams?.get("q") || searchParams?.get("search") || null;
  const urlSort = searchParams?.get("sort") || null;

  // Calculate dynamic price boundaries from catalog
  const { minAvailablePrice, maxAvailablePrice } = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) {
      return { minAvailablePrice: 0, maxAvailablePrice: 100000 };
    }
    const prices = initialProducts.map((p) => Number(p.price) || 0);
    const minP = Math.floor(Math.min(...prices));
    const maxP = Math.ceil(Math.max(...prices));
    return {
      minAvailablePrice: minP > 0 ? minP : 0,
      maxAvailablePrice: maxP > 0 ? maxP : 100000,
    };
  }, [initialProducts]);

  // Extract unique brands from active products
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.brand && p.brand.trim().length > 0) {
        set.add(p.brand.trim());
      }
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>(urlQuery || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || "all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(maxAvailablePrice);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>(urlSort || "default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Pagination State
  const { requireAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Quick view modal & notification states
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "cart" | "wishlist" } | null>(null);

  // Sync state if URL params change externally
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
      setCurrentPage(1);
    }
  }, [urlCategory]);

  useEffect(() => {
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearchTerm(urlQuery);
      setCurrentPage(1);
    }
  }, [urlQuery]);

  // Initialize maxPrice correctly when initialProducts loads
  useEffect(() => {
    if (maxAvailablePrice > 0) {
      setMaxPrice(maxAvailablePrice);
    }
  }, [maxAvailablePrice]);

  const showToast = (message: string, type: "cart" | "wishlist" = "cart") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3200);
  };

  const handleAddToCart = (p: Product) => {
    if (!requireAuth("cart")) return;
    addToCart({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.original_price,
      quantity: 1,
      image: p.image,
      maxStock: p.stock,
    });
    showToast(`Added "${p.name}" to your shopping cart!`, "cart");
  };

  const handleAddToWishlist = (p: Product) => {
    if (!requireAuth("wishlist")) return;
    const { added } = toggleWishlist({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.original_price,
      image: p.image,
      categoryName: p.category_name,
      stock: p.stock,
      rating: p.rating,
      badge: p.badge,
    });
    showToast(
      added
        ? `Added "${p.name}" to your wishlist!`
        : `Removed "${p.name}" from your wishlist.`,
      "wishlist"
    );
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setMinPrice(0);
    setMaxPrice(maxAvailablePrice);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setFeaturedOnly(false);
    setMinRating(0);
    setSortBy("default");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return (
      searchTerm.trim().length > 0 ||
      selectedCategory !== "all" ||
      selectedBrand !== "all" ||
      minPrice > 0 ||
      maxPrice < maxAvailablePrice ||
      inStockOnly ||
      onSaleOnly ||
      featuredOnly ||
      minRating > 0 ||
      sortBy !== "default"
    );
  }, [
    searchTerm,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    maxAvailablePrice,
    inStockOnly,
    onSaleOnly,
    featuredOnly,
    minRating,
    sortBy,
  ]);

  // Dynamic category product count calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      if (p.category_slug) {
        counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
      }
      if (p.subcategory_slug) {
        counts[p.subcategory_slug] = (counts[p.subcategory_slug] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Brand product counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        counts[p.brand.trim()] = (counts[p.brand.trim()] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Text Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category_name?.toLowerCase().includes(q);
        const subcatMatch = p.subcategory_name?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const shortDescMatch = p.short_description?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        return nameMatch || catMatch || subcatMatch || brandMatch || shortDescMatch || descMatch;
      });
    }

    // 2. Category Filter (supports parent category or subcategory slug)
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category_slug === selectedCategory || p.subcategory_slug === selectedCategory
      );
    }

    // 3. Brand Filter
    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // 4. Price Boundaries Filter
    result = result.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // 5. In-Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0 && p.status !== "inactive");
    }

    // 6. On-Sale Filter
    if (onSaleOnly) {
      result = result.filter(
        (p) =>
          p.is_on_sale ||
          (p.discount_percent && p.discount_percent > 0) ||
          (p.original_price && Number(p.original_price) > Number(p.price))
      );
    }

    // 7. Featured & Best Seller Filter
    if (featuredOnly) {
      result = result.filter((p) => p.is_featured || p.is_best_seller);
    }

    // 8. Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => Number(p.rating || 0) >= minRating);
    }

    // 9. Sorting
    result.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const ratingA = Number(a.rating) || 0;
      const ratingB = Number(b.rating) || 0;
      const discA = Number(a.discount_percent) || 0;
      const discB = Number(b.discount_percent) || 0;

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "rating":
          return ratingB !== ratingA ? ratingB - ratingA : (b.reviews_count || 0) - (a.reviews_count || 0);
        case "newest":
          return b.id - a.id;
        case "discount":
          return discB - discA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "default":
        default:
          // Featured / Best Sellers first, then ID descending
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_best_seller && !b.is_best_seller) return -1;
          if (!a.is_best_seller && b.is_best_seller) return 1;
          return b.id - a.id;
      }
    });

    return result;
  }, [
    initialProducts,
    searchTerm,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    inStockOnly,
    onSaleOnly,
    featuredOnly,
    minRating,
    sortBy,
  ]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            padding: "16px 24px",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            animation: "fadeIn 0.25s ease-out",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Check size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
              {notification.type === "cart" ? "Cart Updated" : "Wishlist Updated"}
            </div>
            <div style={{ fontSize: "0.84rem", color: "#CBD5E1", marginTop: "2px" }}>
              {notification.message}
            </div>
          </div>
          <Link
            href="/cart"
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "#FF4035",
              color: "#FFFFFF",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Breadcrumb Section */}
      <div className="breadcumb-section">
        <div
          className="breadcumb-container-wrapper"
          style={{
            backgroundImage: "url('/assets/images/breadcumb/breadcumb-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="shape1">
            <img src="/assets/images/shape/breadcumb-shape1_1.png" alt="shape" loading="lazy" decoding="async" />
          </div>
          <div className="shape2">
            <img src="/assets/images/shape/breadcumb-shape1_2.png" alt="shape" loading="lazy" decoding="async" />
          </div>
          <div className="shape3">
            <img src="/assets/images/shape/breadcumb-shape1_3.png" alt="shape" loading="lazy" decoding="async" />
          </div>
          <div className="shape4">
            <img src="/assets/images/shape/breadcumb-shape1_4.png" alt="shape" loading="lazy" decoding="async" />
          </div>
          <div className="container">
            <ul className="breadcumb-wrapper">
              <li>
                <Link href="/">
                  <i className="fa-sharp fa-light fa-house"></i>
                </Link>
              </li>
              <li>
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li>
                <Link href="/shop">Products</Link>
              </li>
              <li>
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li style={{ color: "var(--theme)", fontWeight: 600 }}>Shop Catalog</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <section className="shop-section section-padding2 fix bg-white" style={{ minHeight: "800px" }}>
        <div className="container">
          <div className="row gx-40 gy-40">
            {/* Left Filter Sidebar */}
            <div className={`col-lg-3 ${showMobileFilters ? "d-block" : "d-none d-lg-block"}`}>
              <aside className="main-sidebar-1">
                {/* Mobile Done Bar */}
                <div className="d-lg-none d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>Filters</span>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="btn btn-sm btn-dark"
                    style={{ borderRadius: "8px", padding: "4px 14px", fontSize: "0.85rem" }}
                  >
                    Done
                  </button>
                </div>
                {/* Search Widget */}
                <div className="single-sidebar-widget mb-4">
                  <div className="single-sidebar-widget__wid-title mb-3">
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                      Search Products
                    </h3>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search items, brands, finishes..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "11px 40px 11px 16px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                      }}
                    />
                    {searchTerm ? (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#94A3B8",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    ) : (
                      <Search
                        size={17}
                        color="#94A3B8"
                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    )}
                  </div>
                </div>

                {/* Filter by Price */}
                <div className="single-sidebar-widget mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                      Filter by Price
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>
                      Max: ₹{maxAvailablePrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="range-slider">
                    <input
                      type="range"
                      min={minAvailablePrice}
                      max={maxAvailablePrice}
                      step={maxAvailablePrice > 20000 ? 500 : 50}
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: "100%", accentColor: "var(--theme, #FF4035)", cursor: "pointer" }}
                    />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
                        ₹{minAvailablePrice.toLocaleString("en-IN")}
                      </span>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          color: "var(--theme, #FF4035)",
                          backgroundColor: "rgba(255, 64, 53, 0.08)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        Up to ₹{maxPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Quick Price Preset Chips */}
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {[
                        { label: "All", max: maxAvailablePrice },
                        { label: "< ₹5k", max: 5000 },
                        { label: "< ₹15k", max: 15000 },
                        { label: "< ₹35k", max: 35000 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setMaxPrice(preset.max);
                            setCurrentPage(1);
                          }}
                          style={{
                            padding: "4px 10px",
                            fontSize: "0.78rem",
                            borderRadius: "9999px",
                            border: maxPrice === preset.max ? "1px solid #FF4035" : "1px solid #E2E8F0",
                            backgroundColor: maxPrice === preset.max ? "#FF4035" : "#F8FAFC",
                            color: maxPrice === preset.max ? "#FFFFFF" : "#475569",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="single-sidebar-widget mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                      Categories
                    </h3>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: selectedCategory === "all" ? "rgba(255, 64, 53, 0.08)" : "none",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: selectedCategory === "all" ? 700 : 500,
                          color: selectedCategory === "all" ? "#FF4035" : "#334155",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.92rem",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <ChevronRight size={14} color={selectedCategory === "all" ? "#FF4035" : "#94A3B8"} />
                          <span>All Categories</span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 7px",
                            borderRadius: "10px",
                            backgroundColor: selectedCategory === "all" ? "#FF4035" : "#F1F5F9",
                            color: selectedCategory === "all" ? "#FFFFFF" : "#64748B",
                            fontWeight: 600,
                          }}
                        >
                          {initialProducts.length}
                        </span>
                      </button>
                    </li>

                    {categories.map((cat) => {
                      const count = categoryCounts[cat.slug] || 0;
                      const isSelected = selectedCategory === cat.slug;

                      return (
                        <li key={cat.id} style={{ marginBottom: "4px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(isSelected ? "all" : cat.slug);
                              setCurrentPage(1);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              background: isSelected ? "rgba(255, 64, 53, 0.08)" : "none",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? "#FF4035" : "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.92rem",
                              transition: "background 0.15s ease",
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <ChevronRight size={14} color={isSelected ? "#FF4035" : "#94A3B8"} />
                              <span>{cat.name}</span>
                            </div>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "2px 7px",
                                borderRadius: "10px",
                                backgroundColor: isSelected ? "#FF4035" : "#F1F5F9",
                                color: isSelected ? "#FFFFFF" : "#64748B",
                                fontWeight: 600,
                              }}
                            >
                              {count}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Brands Filter (if available) */}
                {availableBrands.length > 0 && (
                  <div className="single-sidebar-widget mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                        Partner Brands
                      </h3>
                      {selectedBrand !== "all" && (
                        <button
                          type="button"
                          onClick={() => setSelectedBrand("all")}
                          style={{ background: "none", border: "none", color: "#FF4035", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBrand("all")}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          border: selectedBrand === "all" ? "1px solid #FF4035" : "1px solid #E2E8F0",
                          backgroundColor: selectedBrand === "all" ? "#FF4035" : "#F8FAFC",
                          color: selectedBrand === "all" ? "#FFFFFF" : "#475569",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        All Brands
                      </button>
                      {availableBrands.map((b) => {
                        const isSelected = selectedBrand === b;
                        const count = brandCounts[b] || 0;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setSelectedBrand(isSelected ? "all" : b);
                              setCurrentPage(1);
                            }}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "8px",
                              border: isSelected ? "1px solid #FF4035" : "1px solid #E2E8F0",
                              backgroundColor: isSelected ? "#FF4035" : "#FFFFFF",
                              color: isSelected ? "#FFFFFF" : "#334155",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>{b}</span>
                            <span style={{ opacity: 0.7, fontSize: "0.72rem" }}>({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Status & Badges */}
                <div className="single-sidebar-widget mb-4">
                  <div className="single-sidebar-widget__wid-title mb-3">
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                      Product Availability
                    </h3>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer", color: "#334155", fontSize: "0.92rem" }}>
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => {
                          setInStockOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        style={{ width: "16px", height: "16px", accentColor: "#FF4035" }}
                      />
                      <span>In Stock Only</span>
                    </label>

                    <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer", color: "#334155", fontSize: "0.92rem" }}>
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={(e) => {
                          setOnSaleOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        style={{ width: "16px", height: "16px", accentColor: "#FF4035" }}
                      />
                      <span>Special Offers &amp; Sale</span>
                    </label>

                    <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer", color: "#334155", fontSize: "0.92rem" }}>
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => {
                          setFeaturedOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        style={{ width: "16px", height: "16px", accentColor: "#FF4035" }}
                      />
                      <span>Featured &amp; Best Sellers</span>
                    </label>
                  </div>
                </div>

                {/* Customer Rating Filter */}
                <div className="single-sidebar-widget mb-4">
                  <div className="single-sidebar-widget__wid-title mb-3">
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                      Customer Rating
                    </h3>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {[5, 4, 3].map((r) => (
                      <label
                        key={r}
                        className="d-flex align-items-center gap-2"
                        style={{
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          backgroundColor: minRating === r ? "rgba(245, 158, 11, 0.1)" : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name="ratingFilter"
                          checked={minRating === r}
                          onChange={() => {
                            setMinRating(minRating === r ? 0 : r);
                            setCurrentPage(1);
                          }}
                          onClick={() => {
                            if (minRating === r) setMinRating(0);
                          }}
                          style={{ accentColor: "#F59E0B" }}
                        />
                        <div className="d-flex align-items-center" style={{ color: "#F59E0B" }}>
                          {[...Array(r)].map((_, i) => (
                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" style={{ marginRight: "2px" }} />
                          ))}
                        </div>
                        <span style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600 }}>&amp; Up</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="theme-btn w-100 text-center d-flex align-items-center justify-content-center gap-2"
                    style={{
                      cursor: "pointer",
                      padding: "11px",
                      fontSize: "0.88rem",
                      backgroundColor: "#F1F5F9",
                      color: "#0F172A",
                      border: "1px solid #CBD5E1",
                      borderRadius: "10px",
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </aside>
            </div>

            {/* Right Products Main Area */}
            <div className="col-lg-9">
              {/* Mobile Filter Toggle Button */}
              <div className="d-lg-none w-100 mb-3">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="theme-btn w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    padding: "10px 16px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    backgroundColor: showMobileFilters ? "#0F172A" : "var(--theme, #FF4035)",
                    color: "#FFFFFF",
                  }}
                >
                  <SlidersHorizontal size={16} />
                  <span>{showMobileFilters ? "Close Filters" : "Filter & Refine Products"}</span>
                  {isFilterActive && (
                    <span className="badge bg-white text-danger ms-1" style={{ fontSize: "0.72rem" }}>
                      Active
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Top Controls Bar */}
              <div
                className="d-flex justify-content-between align-items-center mb-4 pb-3 flex-wrap gap-3"
                style={{ borderBottom: "1px solid #E2E8F0" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span style={{ color: "#64748B", fontSize: "0.92rem", fontWeight: 500 }}>
                    Showing <strong style={{ color: "#0F172A" }}>{filteredProducts.length}</strong> of{" "}
                    <strong>{initialProducts.length}</strong> products
                  </span>

                  {/* Grid / List View Toggles */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      padding: "2px",
                      marginLeft: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: viewMode === "grid" ? "#FFFFFF" : "transparent",
                        color: viewMode === "grid" ? "#0F172A" : "#64748B",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        boxShadow: viewMode === "grid" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                      }}
                      title="Grid View"
                    >
                      <Grid3X3 size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: viewMode === "list" ? "#FFFFFF" : "transparent",
                        color: viewMode === "list" ? "#0F172A" : "#64748B",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        boxShadow: viewMode === "list" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                      }}
                      title="List View"
                    >
                      <List size={17} />
                    </button>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  {/* Items Per Page */}
                  <div className="d-none d-md-flex align-items-center gap-2">
                    <span style={{ color: "#64748B", fontSize: "0.86rem" }}>Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1E293B",
                        background: "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                      <option value={36}>36</option>
                    </select>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="sortBySelect" style={{ color: "#64748B", fontSize: "0.88rem", fontWeight: 600 }}>
                      Sort by:
                    </label>
                    <select
                      id="sortBySelect"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        background: "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      <option value="default">Featured &amp; Recommended</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest Additions</option>
                      <option value="discount">Highest Discount</option>
                      <option value="name-asc">Alphabetical: A to Z</option>
                      <option value="name-desc">Alphabetical: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Summary */}
              {isFilterActive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "20px",
                    padding: "10px 14px",
                    backgroundColor: "#F8FAFC",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748B" }}>Active Filters:</span>

                  {searchTerm && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      Search: &ldquo;{searchTerm}&rdquo;
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== "all" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {selectedBrand !== "all" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      Brand: {selectedBrand}
                      <button
                        type="button"
                        onClick={() => setSelectedBrand("all")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {maxPrice < maxAvailablePrice && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      Price ≤ ₹{maxPrice.toLocaleString("en-IN")}
                      <button
                        type="button"
                        onClick={() => setMaxPrice(maxAvailablePrice)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {inStockOnly && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      In Stock
                      <button
                        type="button"
                        onClick={() => setInStockOnly(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {onSaleOnly && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      On Sale
                      <button
                        type="button"
                        onClick={() => setOnSaleOnly(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {minRating > 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.8rem",
                        color: "#0F172A",
                      }}
                    >
                      Rating: {minRating}★+
                      <button
                        type="button"
                        onClick={() => setMinRating(0)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetAllFilters}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FF4035",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Empty Results State */}
              {filteredProducts.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: "16px",
                    border: "1px dashed #CBD5E1",
                    padding: "60px 20px",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      backgroundColor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      color: "#94A3B8",
                    }}
                  >
                    <Search size={32} />
                  </div>
                  <h4 style={{ fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>
                    No products found
                  </h4>
                  <p style={{ color: "#64748B", maxWidth: "420px", margin: "0 auto 24px", fontSize: "0.95rem" }}>
                    We could not find any products matching your current filters. Try relaxing your price limit or clearing active filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="theme-btn"
                    style={{ cursor: "pointer", padding: "12px 28px", borderRadius: "10px" }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                /* GRID VIEW (3 Columns with Full-Bleed Image Presentation) */
                <div className="row g-3 g-md-4">
                  {paginatedProducts.map((p) => {
                    const hasDiscount = Boolean(p.discount_percent && p.discount_percent > 0);
                    const originalPrice = p.original_price ? Number(p.original_price) : null;
                    const price = Number(p.price) || 0;

                    return (
                      <div key={p.id} className="col-xl-4 col-md-6 col-6">
                        <div className="wsi-shop-card">
                          {/* Top Full-Bleed Image Container */}
                          <div className="wsi-shop-card__thumb">
                            <Link href={`/product/${p.slug}`}>
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="wsi-shop-card__img"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div style={{ width: "100%", height: "220px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                                  <Package size={32} />
                                </div>
                              )}
                            </Link>

                            {/* Badges Overlay */}
                            <div className="wsi-shop-card__badges">
                              {hasDiscount && (
                                <span className="wsi-shop-badge wsi-shop-badge--sale">
                                  -{p.discount_percent}%
                                </span>
                              )}
                              {p.badge && (
                                <span className="wsi-shop-badge wsi-shop-badge--custom">
                                  {p.badge}
                                </span>
                              )}
                              {p.is_best_seller && (
                                <span className="wsi-shop-badge wsi-shop-badge--featured">
                                  Best Seller
                                </span>
                              )}
                            </div>

                            {/* Floating Action Icons */}
                            <div className="wsi-shop-card__actions">
                              <button
                                type="button"
                                className="wsi-shop-action-btn"
                                onClick={() => setQuickViewProduct(p)}
                                title="Quick View"
                                aria-label="Quick View"
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                type="button"
                                className="wsi-shop-action-btn"
                                onClick={() => handleAddToWishlist(p)}
                                title="Add to Wishlist"
                                aria-label="Add to Wishlist"
                              >
                                <Heart size={17} />
                              </button>
                            </div>
                          </div>

                          {/* Product Card Details */}
                          <div className="wsi-shop-card__body">
                            <div className="wsi-shop-card__meta">
                              <span className="wsi-shop-card__cat">
                                {p.category_name || "General"}
                              </span>
                              {p.brand && (
                                <span className="wsi-shop-card__brand">
                                  {p.brand}
                                </span>
                              )}
                            </div>

                            <h4 className="wsi-shop-card__title">
                              <Link href={`/product/${p.slug}`} title={p.name}>
                                {p.name}
                              </Link>
                            </h4>

                            {/* Rating Stars */}
                            <div className="wsi-shop-card__rating">
                              <div className="wsi-shop-card__stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={13}
                                    fill={i < Math.round(p.rating || 5) ? "#F59E0B" : "none"}
                                    color={i < Math.round(p.rating || 5) ? "#F59E0B" : "#CBD5E1"}
                                  />
                                ))}
                              </div>
                              <span className="wsi-shop-card__reviews">
                                ({p.reviews_count || 0})
                              </span>
                              {p.stock > 0 ? (
                                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#059669", fontWeight: 700 }}>
                                  In Stock
                                </span>
                              ) : (
                                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#DC2626", fontWeight: 700 }}>
                                  Backorder
                                </span>
                              )}
                            </div>

                            {/* Price & Action Button */}
                            <div className="wsi-shop-card__bottom">
                              <div className="wsi-shop-card__price-wrap">
                                <span className="wsi-shop-card__price">
                                  ₹{price.toLocaleString("en-IN")}
                                </span>
                                {originalPrice && originalPrice > price && (
                                  <span className="wsi-shop-card__price-orig">
                                    ₹{originalPrice.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                className="wsi-shop-card__add-btn"
                                onClick={() => handleAddToCart(p)}
                              >
                                <ShoppingBag size={16} />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW (Full-Bleed Horizontal Card) */
                <div className="d-flex flex-column gap-4">
                  {paginatedProducts.map((p) => {
                    const hasDiscount = Boolean(p.discount_percent && p.discount_percent > 0);
                    const originalPrice = p.original_price ? Number(p.original_price) : null;
                    const price = Number(p.price) || 0;

                    return (
                      <div key={p.id} className="wsi-shop-list-card">
                        {/* Image Left */}
                        <div className="wsi-shop-list-card__thumb">
                          <Link href={`/product/${p.slug}`}>
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="wsi-shop-list-card__img"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div style={{ width: "180px", height: "180px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                                <Package size={32} />
                              </div>
                            )}
                          </Link>
                          {hasDiscount && (
                            <div className="wsi-shop-card__badges">
                              <span className="wsi-shop-badge wsi-shop-badge--sale">
                                -{p.discount_percent}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content Right */}
                        <div className="wsi-shop-list-card__body">
                          <div className="wsi-shop-card__meta">
                            <span className="wsi-shop-card__cat">{p.category_name}</span>
                            {p.brand && <span className="wsi-shop-card__brand">{p.brand}</span>}
                          </div>

                          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>
                            <Link href={`/product/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {p.name}
                            </Link>
                          </h3>

                          <div className="wsi-shop-card__rating">
                            <div className="wsi-shop-card__stars">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < Math.round(p.rating || 5) ? "#F59E0B" : "none"}
                                  color={i < Math.round(p.rating || 5) ? "#F59E0B" : "#CBD5E1"}
                                />
                              ))}
                            </div>
                            <span className="wsi-shop-card__reviews">({p.reviews_count || 0} reviews)</span>
                          </div>

                          <p
                            style={{
                              color: "#64748B",
                              fontSize: "0.92rem",
                              lineHeight: 1.6,
                              marginBottom: "16px",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.short_description || p.description || "Luxury interior fixture crafted with precision engineering and bespoke materials."}
                          </p>

                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-auto">
                            <div className="wsi-shop-card__price-wrap">
                              <span className="wsi-shop-card__price">
                                ₹{price.toLocaleString("en-IN")}
                              </span>
                              {originalPrice && originalPrice > price && (
                                <span className="wsi-shop-card__price-orig">
                                  ₹{originalPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                className="wsi-shop-action-btn"
                                onClick={() => setQuickViewProduct(p)}
                                title="Quick View"
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                type="button"
                                className="wsi-shop-action-btn"
                                onClick={() => handleAddToWishlist(p)}
                                title="Wishlist"
                              >
                                <Heart size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(p)}
                                className="theme-btn"
                                style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "0.9rem" }}
                              >
                                <ShoppingBag size={16} className="me-2" />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-3">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      backgroundColor: currentPage === 1 ? "#F1F5F9" : "#FFFFFF",
                      color: currentPage === 1 ? "#94A3B8" : "#0F172A",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                    }}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          border: isActive ? "1px solid #FF4035" : "1px solid #E2E8F0",
                          backgroundColor: isActive ? "#FF4035" : "#FFFFFF",
                          color: isActive ? "#FFFFFF" : "#0F172A",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      backgroundColor: currentPage === totalPages ? "#F1F5F9" : "#FFFFFF",
                      color: currentPage === totalPages ? "#94A3B8" : "#0F172A",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-End Quick View Modal */}
      {quickViewProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 17, 30, 0.72)",
            backdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              maxWidth: "960px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
                transition: "all 0.2s",
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>

            <div className="row g-0">
              {/* Product Gallery Left: full width & height */}
              <div
                className="col-lg-6 d-flex align-items-center justify-content-center p-4"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <ProductImageGallery
                  images={
                    Array.from(
                      new Set(
                        [quickViewProduct.image, ...(quickViewProduct.gallery_images || [])].filter(
                          (x): x is string => Boolean(x && typeof x === "string" && x.trim() !== "")
                        )
                      )
                    )
                  }
                  activeImage={quickViewProduct.image || ""}
                  productName={quickViewProduct.name}
                  badge={quickViewProduct.badge}
                  discountPercent={quickViewProduct.discount_percent}
                  height={420}
                  compact={true}
                />
              </div>

              {/* Product Info Right */}
              <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#FF4035",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {quickViewProduct.category_name}
                  </span>
                  {quickViewProduct.brand && (
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        color: "#0284C7",
                        backgroundColor: "rgba(2, 132, 199, 0.08)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {quickViewProduct.brand}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0F172A", marginBottom: "12px", lineHeight: 1.25 }}>
                  {quickViewProduct.name}
                </h2>

                {/* Rating */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center" style={{ color: "#F59E0B" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        fill={i < Math.round(quickViewProduct.rating || 5) ? "#F59E0B" : "none"}
                        color={i < Math.round(quickViewProduct.rating || 5) ? "#F59E0B" : "#CBD5E1"}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
                    ({quickViewProduct.reviews_count || 0} verified customer reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="d-flex align-items-baseline gap-3 mb-4">
                  <span style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--theme, #FF4035)" }}>
                    ₹{Number(quickViewProduct.price).toLocaleString("en-IN")}
                  </span>
                  {quickViewProduct.original_price && Number(quickViewProduct.original_price) > Number(quickViewProduct.price) && (
                    <span style={{ textDecoration: "line-through", color: "#94A3B8", fontSize: "1.15rem", fontWeight: 500 }}>
                      ₹{Number(quickViewProduct.original_price).toLocaleString("en-IN")}
                    </span>
                  )}
                  {quickViewProduct.discount_percent > 0 && (
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        backgroundColor: "#FF4035",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                      }}
                    >
                      Save {quickViewProduct.discount_percent}%
                    </span>
                  )}
                </div>

                <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "28px" }}>
                  {quickViewProduct.short_description || quickViewProduct.description || "Bespoke architectural fixture and custom furniture designed to elevate contemporary residential and luxury commercial spaces."}
                </p>

                {/* Stock info */}
                <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: quickViewProduct.stock > 0 ? "#10B981" : "#EF4444",
                    }}
                  />
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: quickViewProduct.stock > 0 ? "#059669" : "#DC2626" }}>
                    {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock} available)` : "Currently on Backorder"}
                  </span>
                </div>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="theme-btn flex-1"
                    style={{ padding: "13px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </button>
                  <Link
                    href={`/product/${quickViewProduct.slug}`}
                    className="theme-btn style6"
                    style={{ padding: "13px 22px", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
