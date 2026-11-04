"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Product, ProductCategory } from "@/lib/actions/products";
import { Testimonial } from "@/lib/actions/testimonials";
import { BlogPost } from "@/lib/actions/blog";
import BlogNewsSection from "@/components/home/BlogNewsSection";
const HomeGallerySection = dynamic(() => import("@/components/home/HomeGallerySection"), { ssr: false });
import TextType from "@/components/common/TextType";
import { HomepageSettings, HomepagePromo, WorkGallery } from "@/types";
import { addToCart } from "@/lib/cart";
import { addToWishlist, toggleWishlist } from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";
import dynamic from "next/dynamic";
import FeatureSection from "@/components/home/FeatureSection";

const ProductImageGallery = dynamic(() => import("@/components/shop/ProductImageGallery"), { ssr: false });
const GsapScrollAnimation = dynamic(() => import("@/components/common/GsapScrollAnimation"), { ssr: false });
const NewsletterOfferModal = dynamic(() => import("@/components/home/NewsletterOfferModal"), { ssr: false });

function getEmbedUrl(url?: string): string {
  if (!url) return "https://www.youtube-nocookie.com/embed/Cn4G2lZ_g2I?autoplay=1";
  if (url.includes("embed/")) {
    return url.includes("autoplay=1") ? url : `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1`;
  }
  return url;
}

function renderCategoryIcon(iconType: string) {
  if (!iconType) {
    return <i className="fa-solid fa-shapes" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  const trimmed = iconType.trim();
  if (trimmed.includes("fa-") || trimmed.startsWith("fa")) {
    const fullClass =
      trimmed.startsWith("fa-") &&
        !trimmed.includes("fa-solid") &&
        !trimmed.includes("fa-regular") &&
        !trimmed.includes("fa-brands")
        ? `fa-solid ${trimmed}`
        : trimmed;
    return <i className={fullClass} style={{ fontSize: "32px", color: "#D4AF37", display: "inline-block" }} />;
  }

  const t = trimmed.toLowerCase();
  if (t.includes("sofa") || t.includes("furniture")) {
    return <i className="fa-solid fa-couch" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  if (t.includes("wall") || t.includes("panel") || t.includes("cladding")) {
    return <i className="fa-solid fa-border-all" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  if (t.includes("light") || t.includes("lamp") || t.includes("fixture")) {
    return <i className="fa-solid fa-lightbulb" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  if (t.includes("kitchen") || t.includes("wardrobe") || t.includes("modular")) {
    return <i className="fa-solid fa-kitchen-set" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  if (t.includes("decor") || t.includes("furnishing") || t.includes("art")) {
    return <i className="fa-solid fa-palette" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  if (t.includes("hardware") || t.includes("wholesale") || t.includes("fittings")) {
    return <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: "32px", color: "#D4AF37" }} />;
  }
  return <i className="fa-solid fa-shapes" style={{ fontSize: "32px", color: "#D4AF37" }} />;
}

const getCategoryCoverImage = (cat: ProductCategory): string => {
  if (cat.image && cat.image.trim() !== "") return cat.image.trim();
  return "";
};

const padZero = (n: number) => String(n).padStart(2, "0");

function useDealCountdown(targetDate: string | Date | undefined) {
  const targetDateStr = targetDate ? String(targetDate) : "2026-12-31T23:59:59";
  const calculateRemaining = () => {
    const now = new Date().getTime();
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;
    if (isNaN(diff) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return { timeLeft, isMounted };
}

function DealTimerInline({ targetDateStr }: { targetDateStr?: string | Date }) {
  const { timeLeft, isMounted } = useDealCountdown(targetDateStr);

  if (!isMounted) {
    return (
      <span suppressHydrationWarning>
        00d : 00h : 00m : <span className="sec" suppressHydrationWarning>00s</span>
      </span>
    );
  }

  if (timeLeft.expired) {
    return <span style={{ color: "#EF4444" }}>Expired</span>;
  }

  return (
    <span suppressHydrationWarning>
      {padZero(timeLeft.days)}d : {padZero(timeLeft.hours)}h : {padZero(timeLeft.minutes)}m :{" "}
      <span className="sec" suppressHydrationWarning>{padZero(timeLeft.seconds)}s</span>
    </span>
  );
}

function DealTimerBoxes({ targetDateStr }: { targetDateStr?: string | Date }) {
  const { timeLeft, isMounted } = useDealCountdown(targetDateStr);

  return (
    <div className="wsi-hot-deal-card__timer-box" suppressHydrationWarning>
      <div className="wsi-hot-deal-card__timer-unit">
        <div className="wsi-hot-deal-card__timer-num" suppressHydrationWarning>
          {!isMounted ? "00" : timeLeft.expired ? "00" : padZero(timeLeft.days)}
        </div>
        <div className="wsi-hot-deal-card__timer-label">Days</div>
      </div>
      <div className="wsi-hot-deal-card__timer-unit">
        <div className="wsi-hot-deal-card__timer-num" suppressHydrationWarning>
          {!isMounted ? "00" : timeLeft.expired ? "00" : padZero(timeLeft.hours)}
        </div>
        <div className="wsi-hot-deal-card__timer-label">Hrs</div>
      </div>
      <div className="wsi-hot-deal-card__timer-unit">
        <div className="wsi-hot-deal-card__timer-num" suppressHydrationWarning>
          {!isMounted ? "00" : timeLeft.expired ? "00" : padZero(timeLeft.minutes)}
        </div>
        <div className="wsi-hot-deal-card__timer-label">Min</div>
      </div>
      <div className="wsi-hot-deal-card__timer-unit">
        <div className="wsi-hot-deal-card__timer-num" suppressHydrationWarning>
          {!isMounted ? "00" : timeLeft.expired ? "00" : padZero(timeLeft.seconds)}
        </div>
        <div className="wsi-hot-deal-card__timer-label">Sec</div>
      </div>
    </div>
  );
}

function DealTimerPill({ targetDateStr }: { targetDateStr?: string | Date }) {
  const { timeLeft, isMounted } = useDealCountdown(targetDateStr);

  return (
    <div className="wsi-hot-deal-card__timer-pill" suppressHydrationWarning>
      <i className="fa-sharp fa-solid fa-alarm-clock"></i>
      <span suppressHydrationWarning>
        {!isMounted
          ? "00d : 00h : 00m"
          : timeLeft.expired
            ? "Ended"
            : `${padZero(timeLeft.days)}d : ${padZero(timeLeft.hours)}h : ${padZero(timeLeft.minutes)}m`}
      </span>
    </div>
  );
}

interface HomeClientProps {
  categories: ProductCategory[];
  bestSellerProducts: Product[];
  featuredProducts: Product[];
  popularProducts?: Product[];
  onSaleProducts?: Product[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  homepageSettings?: HomepageSettings;
  promos?: HomepagePromo[];
  weeklyDealProducts?: Product[];
  galleryItems?: WorkGallery[];
}

export default function HomeClient({
  categories = [],
  bestSellerProducts = [],
  featuredProducts = [],
  popularProducts = [],
  onSaleProducts = [],
  testimonials = [],
  blogPosts = [],
  homepageSettings,
  promos = [],
  weeklyDealProducts = [],
  galleryItems = [],
}: HomeClientProps) {
  // Tab States
  const [bestSellerCategory, setBestSellerCategory] = useState<string>("all");
  const [bestSellerBrand, setBestSellerBrand] = useState<string>("all");
  const [featuredTab, setFeaturedTab] = useState<string>("all");

  // Modals & Popups
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalQty, setModalQty] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { requireAuth } = useAuth();

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!requireAuth("cart")) return;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.original_price,
      quantity,
      image: product.image,
      maxStock: product.stock,
    });
    setNotification(`Added "${product.name}" to your cart!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToWishlist = (product: Product) => {
    if (!requireAuth("wishlist")) return;
    const { added } = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.original_price,
      image: product.image,
      categoryName: product.category_name,
      stock: product.stock,
      rating: product.rating,
      badge: product.badge,
    });
    setNotification(
      added
        ? `Added "${product.name}" to your wishlist!`
        : `Removed "${product.name}" from your wishlist.`
    );
    setTimeout(() => setNotification(null), 3000);
  };

  // Hero Slider State (cycling slides dynamically)
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSlideImages = [
    homepageSettings?.hero_image || "/assets/images/intro/introThumb1_1.png",
    homepageSettings?.hero_image_2 || "/assets/images/intro/introThumb1_2.png",
    homepageSettings?.hero_image_3 || "/assets/images/intro/introThumb1_3.png",
  ].filter(Boolean);

  const heroColors = (homepageSettings?.hero_colors || "#770215,#E9CF10,#35424B")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  useEffect(() => {
    if (heroSlideImages.length <= 1) return;
    const slideTimer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlideImages.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [heroSlideImages.length]);

  // Dynamic Live Countdown Timer State connected to admin campaign end date
  const targetDateStr = homepageSettings?.weekly_deal_end_date || "2026-12-31T23:59:59";
  const isTimerEnabled =
    homepageSettings?.weekly_deal_enabled !== undefined
      ? Boolean(homepageSettings.weekly_deal_enabled)
      : true;

  // Back to top scroll handler with RAF throttling & passive listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 300;
          setShowBackTop((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Open Quick View Modal
  const openQuickView = (prod?: Product) => {
    if (prod) {
      setQuickViewProduct(prod);
    } else if (featuredProducts.length > 0) {
      setQuickViewProduct(featuredProducts[0]);
    } else {
      return;
    }
    setModalQty(1);
  };

  // Scroll handler for professional Category Carousel
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 340;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Top-level main categories for collections showcase & featured tabs
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id);
  }, [categories]);

  // Dynamic Categories and Brands for Trendy Items / Best Deals section
  const bestSellerCategoryTabs = useMemo(() => {
    const catSlugsWithProducts = new Set(
      bestSellerProducts.map((p) => p.category_slug?.toLowerCase()).filter(Boolean)
    );
    const matching = categories.filter((c) => catSlugsWithProducts.has(c.slug.toLowerCase()));
    if (matching.length > 0) return matching.slice(0, 5);
    return categories.slice(0, 5);
  }, [categories, bestSellerProducts]);

  const bestSellerBrands = useMemo(() => {
    const brandSet = new Set<string>();
    bestSellerProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandSet.add(p.brand.trim());
      }
    });
    return Array.from(brandSet);
  }, [bestSellerProducts]);

  const filteredBestSellers = useMemo(() => {
    let list = bestSellerProducts;
    if (bestSellerCategory !== "all") {
      list = list.filter(
        (p) =>
          p.category_slug?.toLowerCase() === bestSellerCategory.toLowerCase() ||
          p.subcategory_slug?.toLowerCase() === bestSellerCategory.toLowerCase() ||
          p.category_name?.toLowerCase() === bestSellerCategory.toLowerCase()
      );
    }
    if (bestSellerBrand !== "all") {
      list = list.filter((p) => p.brand?.toLowerCase() === bestSellerBrand.toLowerCase());
    }
    return list;
  }, [bestSellerProducts, bestSellerCategory, bestSellerBrand]);

  // Filter Featured Products by Category Tab
  const filteredFeaturedProducts = useMemo(() => {
    if (featuredTab === "all") return featuredProducts;
    return featuredProducts.filter(
      (p) =>
        p.category_slug?.toLowerCase() === featuredTab.toLowerCase() ||
        p.subcategory_slug?.toLowerCase() === featuredTab.toLowerCase()
    );
  }, [featuredTab, featuredProducts]);

  return (
    <div className="homepage-exact-replica">
      {/* Back To Top Button */}
      <button
        id="back-top"
        className={`back-to-top ${showBackTop ? "active" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{ display: showBackTop ? "inline-flex" : "none" }}
      >
        <i className="fa-solid fa-chevron-up"></i>
      </button>

      {/* GSAP Bi-Directional Scroll Reveal Animations */}
      <GsapScrollAnimation />

      {/* ================================================================
          1. INTRO / HERO SECTION (lines 654-758 of index.html)
      ================================================================ */}
      <section className="intro-section gsap-scroll-section">
        <div className="intro-container-wrapper style1">
          <div className="container">
            <div className="intro-wrapper style1">
              {/* Dynamic Circular Hero Thumbnails (reflects updated sliding images & allows interactive switching) */}
              <div className="thumb-shape-wrapper d-none d-lg-block">
                {heroSlideImages.slice(0, 3).map((imgUrl, idx) => {
                  const isActive = heroSlide === idx;
                  return (
                    <div
                      key={idx}
                      className={`thumbShape thumbShape${idx + 1}`}
                      onClick={() => setHeroSlide(idx)}
                      role="button"
                      tabIndex={0}
                      title={`Switch to Slide ${idx + 1}`}
                      style={{
                        cursor: "pointer",
                        overflow: "hidden",
                        borderRadius: "50%",
                        width: "100px",
                        height: "100px",
                        minWidth: "100px",
                        minHeight: "100px",
                        padding: "3px",
                        backgroundColor: "#FFFFFF",
                        border: isActive ? "3px solid #D4AF37" : "3px solid #FFFFFF",
                        boxShadow: isActive
                          ? "0 0 0 3px rgba(212, 175, 55, 0.45), 0 12px 28px rgba(0, 0, 0, 0.22)"
                          : "0 6px 16px rgba(0, 0, 0, 0.12)",
                        transform: isActive ? "scale(1.12)" : "scale(1)",
                        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Hero Slide Thumbnail ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                          display: "block",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="row gy-5 d-flex align-items-center">
                <div className="col-xl-6">
                  <div className="intro-content">
                    <div className="subtitle style1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <g clipPath="url(#clip0_86_101)">
                          <path
                            d="M12.8333 6.10352e-05H7.98425C7.66347 6.10352e-05 7.21514 0.185895 6.9885 0.412368L0.34046 7.06037C-0.113477 7.51379 -0.113477 8.2572 0.34046 8.71008L5.29046 13.6599C5.74338 14.1133 6.48606 14.1133 6.93966 13.6594L13.5877 7.01242C13.8141 6.78598 14 6.33693 14 6.01684V1.16678C14 0.525228 13.4748 6.10352e-05 12.8333 6.10352e-05ZM10.4998 4.66675C9.85547 4.66675 9.33311 4.14384 9.33311 3.50004C9.33311 2.85517 9.85547 2.33332 10.4998 2.33332C11.1442 2.33332 11.6667 2.85517 11.6667 3.50004C11.6667 4.14384 11.1442 4.66675 10.4998 4.66675Z"
                            fill="#0A111E"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_86_101">
                            <rect width="14" height="14" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      {(() => {
                        const badgeText = homepageSettings?.hero_badge || "";
                        if (badgeText.toLowerCase().includes("discount")) {
                          const parts = badgeText.split(/(discount)/i);
                          return (
                            <>
                              {parts.map((p, i) =>
                                p.toLowerCase() === "discount" ? (
                                  <span key={i} className="color-text">
                                    {" "}
                                    {p}{" "}
                                  </span>
                                ) : (
                                  p
                                )
                              )}
                            </>
                          );
                        }
                        return badgeText;
                      })()}
                    </div>
                    <h1>{homepageSettings?.hero_title || "Bespoke Luxury Interiors & Custom Furniture"}</h1>
                    <p>
                      {homepageSettings?.hero_subtitle ||
                        "Curating refined living spaces and bespoke architectural furnishings with timeless craftsmanship."}
                    </p>
                    <div className="pricing-card">
                      <div className="price-box">
                        <div className="price"> price </div>
                        <h6>{homepageSettings?.hero_price || "₹12,500"}</h6>
                      </div>
                      <div className="color-box">
                        <div className="color">color</div>
                        <div className="color-plate">
                          {heroColors.map((col, idx) => (
                            <svg key={idx} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="8" fill={col} />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="video-wrap ripple-effect rounded-0">
                        <button
                          type="button"
                          className="play-btn popup-video border-0 bg-transparent"
                          onClick={() => setIsVideoModalOpen(true)}
                          aria-label="Play video"
                        >
                          <img className="playerImg" src="/assets/images/icon/playerIcon1_1.svg" alt="icon" />
                        </button>
                      </div>
                    </div>

                    <div className="btn-wrapper">
                      <Link
                        className="theme-btn style6"
                        href={homepageSettings?.hero_button_link || "#featured-products"}
                      >
                        {homepageSettings?.hero_button_text || "Add To Cart"}
                      </Link>
                      <Link
                        className="theme-btn style7"
                        href={homepageSettings?.hero_secondary_button_link || "#featured-products"}
                      >
                        {homepageSettings?.hero_secondary_button_text || "view now"}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="thumb-slider">
                    <div className="intro-thumb">
                      <div className="swiper gt-slider" id="introSliderOne">
                        <div className="swiper-wrapper">
                          <div className="swiper-slide">
                            <div className="thumb">
                              <img
                                src={heroSlideImages[heroSlide]}
                                alt="thumb"
                                fetchPriority="high"
                                loading="eager"
                                decoding="async"
                                style={{ borderRadius: "24px", maxWidth: "100%", objectFit: "cover" }}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Swiper Pagination matching template main.css */}
                        <div className="slider-pagination" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {heroSlideImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`swiper-pagination-bullet ${heroSlide === idx ? "swiper-pagination-bullet-active" : ""}`}
                              onClick={() => setHeroSlide(idx)}
                              style={{ cursor: "pointer" }}
                            ></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. MARQUEE SECTION (lines 761-807 of index.html)
      ================================================================ */}
      <div className="marquee-section1 pt-20">
        <div className="container">
          <div className="mycustom-marque">
            <div className="scrolling-wrap">
              <div className="comm">
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
              </div>
              <div className="comm">
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
                <div><img src="/assets/images/icon/starIcon1_1.svg" alt="img" /></div>
                <div className="cmn-textslide">Limited time offer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          3. CATEGORIES SECTION (Professional Horizontal Scrolling Carousel)
      ================================================================ */}
      {mainCategories && mainCategories.length > 0 && (
        <section className="product-section section-padding fix gsap-scroll-section" style={{ padding: "60px 0 40px", backgroundColor: "#FAFCFF" }}>
          <div className="product-contianer-wrapper style1">
            <div className="container">
              {/* Carousel Header with Title and Scroll Controls */}
              <div className="wsi-section-header-split">
                <div className="wsi-section-title-wrap">
                  <div className="wsi-section-subtitle">
                    <i className="fa-solid fa-gem"></i>
                    <span>Curated Spaces</span>
                  </div>
                  <TextType
                    as="h2"
                    className="wsi-section-title"
                    text={["Browse Handcrafted Collections", "Explore Architectural Living", "Discover Luxury Interiors"]}
                    typingSpeed={60}
                    pauseDuration={2400}
                    deletingSpeed={35}
                    deleteMode="backspace"
                    typeEffect="fade"
                    cursorStyle="bar"
                    cursorColor="var(--color-primary, #FF4035)"
                    cursorGlide
                    showCursor
                  />
                </div>

                {/* Navigation Buttons and View All */}
                <div className="wsi-section-header-right">
                  <Link
                    href="/shop"
                    className="theme-btn style7"
                    style={{
                      padding: "8px 20px",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      borderRadius: "24px",
                      textDecoration: "none",
                    }}
                  >
                    All Collections
                  </Link>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => scrollCategories("left")}
                      aria-label="Previous Categories"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        fontSize: "0.9rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#D4AF37";
                        e.currentTarget.style.backgroundColor = "#D4AF37";
                        e.currentTarget.style.color = "#FFFFFF";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                        e.currentTarget.style.color = "#0F172A";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <i className="fa-solid fa-arrow-left"></i>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollCategories("right")}
                      aria-label="Next Categories"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        fontSize: "0.9rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#D4AF37";
                        e.currentTarget.style.backgroundColor = "#D4AF37";
                        e.currentTarget.style.color = "#FFFFFF";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                        e.currentTarget.style.color = "#0F172A";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Smooth Scrolling Carousel Track - Image Based with Overlayed Title & Count */}
              <div
                ref={categoryScrollRef}
                style={{
                  display: "flex",
                  gap: "22px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  padding: "10px 4px 28px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {mainCategories.map((cat) => {
                  const coverImage = getCategoryCoverImage(cat);
                  return (
                    <div
                      key={cat.id}
                      style={{
                        flex: "0 0 230px",
                        maxWidth: "230px",
                        scrollSnapAlign: "start",
                      }}
                    >
                      <Link href={`/shop?category=${cat.slug}`} className="text-decoration-none d-block">
                        <div
                          className="wsi-category-image-card"
                          style={{
                            position: "relative",
                            height: "290px",
                            borderRadius: "22px",
                            overflow: "hidden",
                            cursor: "pointer",
                            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
                            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                            border: "1.5px solid rgba(226, 232, 240, 0.9)",
                            backgroundColor: "#0F172A",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-8px)";
                            e.currentTarget.style.boxShadow = "0 22px 40px rgba(0, 0, 0, 0.22), 0 0 0 1px #D4AF37";
                            e.currentTarget.style.borderColor = "#D4AF37";
                            const img = e.currentTarget.querySelector(".wsi-cat-bg") as HTMLElement;
                            if (img) img.style.transform = "scale(1.08)";
                            const btn = e.currentTarget.querySelector(".wsi-cat-pill") as HTMLElement;
                            if (btn) {
                              btn.style.backgroundColor = "rgba(212, 175, 55, 0.95)";
                              btn.style.borderColor = "#D4AF37";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 10px 25px rgba(15, 23, 42, 0.08)";
                            e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.9)";
                            const img = e.currentTarget.querySelector(".wsi-cat-bg") as HTMLElement;
                            if (img) img.style.transform = "scale(1)";
                            const btn = e.currentTarget.querySelector(".wsi-cat-pill") as HTMLElement;
                            if (btn) {
                              btn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                              btn.style.borderColor = "rgba(255, 255, 255, 0.35)";
                            }
                          }}
                        >
                          {/* Full-bleed Category Image or Luxury Icon Pattern */}
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={cat.name}
                              loading="lazy"
                              decoding="async"
                              className="wsi-cat-bg"
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                background: "radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 1) 75%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingBottom: "50px",
                              }}
                            >
                              {renderCategoryIcon(cat.icon_type)}
                            </div>
                          )}

                          {/* Gradient Vignette Overlay for Crisp Legibility */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.85) 82%, rgba(15, 23, 42, 0.96) 100%)",
                              pointerEvents: "none",
                            }}
                          />

                          {/* Top Subtle Explore Arrow Badge */}
                          <div
                            style={{
                              position: "absolute",
                              top: "14px",
                              right: "14px",
                              zIndex: 2,
                            }}
                          >
                            <span
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(15, 23, 42, 0.4)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
                            </span>
                          </div>

                          {/* Bottom Overlayed Title & Product Count */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: "20px 18px",
                              zIndex: 2,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "8px",
                            }}
                          >
                            <h5
                              style={{
                                fontSize: "1.08rem",
                                fontWeight: 800,
                                color: "#FFFFFF",
                                margin: 0,
                                lineHeight: 1.25,
                                textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {cat.name}
                            </h5>

                            <div
                              className="wsi-cat-pill"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.35)",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                color: "#FFFFFF",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "#D4AF37",
                                }}
                              ></span>
                              <span>
                                {cat.item_count ? `${cat.item_count} ${cat.item_count === 1 ? "Product" : "Products"}` : "0 Products"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          3. VALUE PROPOSITION FEATURES SECTION (Below Categories Section)
      ================================================================ */}
      <FeatureSection
        enabled={homepageSettings?.features_enabled}
        featuresJson={homepageSettings?.features_json}
      />

      {/* ================================================================
          4. BEST SELLER / TRENDY ITEMS SECTION (lines 1150-1920 of index.html)
      ================================================================ */}
      {bestSellerProducts && bestSellerProducts.length > 0 && (
        <section className="best-seller-product-items-section section-padding2 bg-color3 fix gsap-scroll-section" id="best-sellers">
          <div className="best-seller-product-items-container-wrapper style4">
            <div className="container">
              <div className="best-seller-product-items-wrapper style1 text-center mb-30">
                <div className="section-title">
                  <div className="subtitle style1">Trendy Items</div>
                  <h3 className="title">our trendy fasion products</h3>
                </div>
              </div>

              <div className="feature-flex-tab-wrapper">
                <div className="feature-tab-btn-wrapper">
                  <ul className="nav nav-pills" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${bestSellerCategory === "all" ? "active" : ""}`}
                        id="pills-one-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-one"
                        type="button"
                        role="tab"
                        aria-controls="pills-one"
                        aria-selected={bestSellerCategory === "all"}
                        onClick={() => setBestSellerCategory("all")}
                        style={{ width: "auto", minWidth: "110px", padding: "5px 18px" }}
                      >
                        All
                      </button>
                    </li>
                    {bestSellerCategoryTabs.map((cat, idx) => (
                      <li key={cat.id || cat.slug || idx} className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${bestSellerCategory === cat.slug ? "active" : ""}`}
                          type="button"
                          role="tab"
                          aria-selected={bestSellerCategory === cat.slug}
                          onClick={() => setBestSellerCategory(cat.slug)}
                          style={{ width: "auto", minWidth: "110px", padding: "5px 18px" }}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="feature-select">
                  <div className="nav-item">
                    <div className="form">
                      <select
                        className="single-select form-select w-100"
                        value={bestSellerBrand}
                        onChange={(e) => setBestSellerBrand(e.target.value)}
                        style={{
                          display: "block",
                          height: "40px",
                          width: "200px",
                          borderRadius: "100px",
                          padding: "0 20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          borderColor: "var(--border-6, #EAEAEA)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--title, #0F172A)",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">Select Brand Name</option>
                        {bestSellerBrands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-content" id="pills-tabContent">
                <div className="tab-pane fade show active" id="pills-one" role="tabpanel" aria-labelledby="pills-one-tab">
                  <div className="row g-4">
                    {filteredBestSellers.length === 0 ? (
                      <div className="col-12 text-center py-5" style={{ color: "#94A3B8" }}>
                        <i className="fa-solid fa-box-open mb-2" style={{ fontSize: "2rem" }}></i>
                        <p>No products found in this category.</p>
                      </div>
                    ) : (
                      filteredBestSellers.slice(0, 8).map((product, idx) => {
                        const badgeText =
                          product.discount_percent && product.discount_percent > 0
                            ? `${product.discount_percent}% off`
                            : product.is_popular
                            ? "TRANDING"
                            : product.is_featured
                            ? "NEW"
                            : product.is_on_sale
                            ? "25% off"
                            : null;

                        return (
                          <div key={product.id || idx} className="col-xl-3 col-md-6">
                            <div className="best-seller-product-items-two">
                              <div className="icon-box2">
                                <button
                                  type="button"
                                  onClick={() => openQuickView(product)}
                                  title="Quick View"
                                  aria-label="Quick View"
                                  style={{ border: "none", cursor: "pointer" }}
                                >
                                  <i className="fa-regular fa-eye"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddToWishlist(product)}
                                  title="Add to Wishlist"
                                  aria-label="Add to Wishlist"
                                  style={{ border: "none", cursor: "pointer" }}
                                >
                                  <i className="fa-regular fa-heart"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(product)}
                                  title="Add to Cart"
                                  aria-label="Add to Cart"
                                  style={{ border: "none", cursor: "pointer" }}
                                >
                                  <i className="fa-light fa-bag-shopping"></i>
                                </button>
                              </div>

                              {badgeText && (
                                <div className="best-seller-product-items-two__badge1">
                                  {badgeText}
                                </div>
                              )}

                              <div className="best-seller-product-items-two__thumb">
                                <Link href={`/product/${product.slug}`} className="d-block">
                                  <img
                                    src={product.image || "/assets/images/best-seller/bestSellerProductThumb2_1.png"}
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                    style={{
                                      maxHeight: "220px",
                                      height: "220px",
                                      width: "100%",
                                      objectFit: "contain",
                                      display: "block",
                                      margin: "0 auto",
                                    }}
                                  />
                                </Link>
                              </div>

                              <div className="best-seller-product-items-two__content">
                                <div className="best-seller-product-items-two__details">
                                  <p className="best-seller-product-items-two__details--subtitle">
                                    {product.category_name || "FASHION BAG"}
                                  </p>
                                  <h6 className="best-seller-product-items-two__details--title">
                                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                                  </h6>
                                  <div className="best-seller-product-items-two__details--price">
                                    <span className="offer-price">₹{Number(product.price).toFixed(2)}</span>
                                    {product.original_price && (
                                      <span className="original-price">
                                        ₹{Number(product.original_price).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

          {/* VIDEO SHOWCASE STUDIO SECTION */}
          <div
            className="wsi-video-showcase position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
              marginTop: "60px",
              borderRadius: "24px",
              padding: "50px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-6">
                <div style={{ textAlign: "left", maxWidth: "520px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(212, 175, 55, 0.15)",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: "50px",
                      padding: "6px 16px",
                      marginBottom: "18px",
                    }}
                  >
                    <i className="fa-solid fa-film" style={{ color: "#D4AF37", fontSize: "0.8rem" }}></i>
                    <span
                      style={{
                        color: "#F8FAFC",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                      }}
                    >
                      Studio Tour &amp; Showcase
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      lineHeight: 1.25,
                      marginBottom: "16px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Architectural Perspectives &amp; Elevated Living
                  </h3>

                  <p
                    style={{
                      color: "rgba(248, 250, 252, 0.86)",
                      fontSize: "1.05rem",
                      lineHeight: 1.65,
                      marginBottom: "28px",
                      maxWidth: "480px",
                    }}
                  >
                    Experience Kashmir&apos;s finest window blinds, motorized curtains, and architectural wall systems designed for refined residences and commercial spaces.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      aria-label="Play video showcase"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "13px 26px",
                        borderRadius: "50px",
                        background: "linear-gradient(135deg, #FF4035 0%, #D4AF37 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(255, 64, 53, 0.35)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <i className="fa-solid fa-play" style={{ fontSize: "0.85rem" }}></i>
                      <span>Watch Studio Video</span>
                    </button>

                    <Link
                      className="theme-btn style3"
                      href="/shop"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "13px 28px",
                        borderRadius: "50px",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        textDecoration: "none",
                      }}
                    >
                      <span>Explore Catalog</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }}></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div
                  style={{
                    position: "relative",
                    maxWidth: "480px",
                    width: "100%",
                    margin: "0 auto",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.4)",
                    border: "2px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(15, 23, 42, 0.8)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "290px" }}>
                    <img
                      src={homepageSettings?.hero_video_thumb || "/assets/images/video/drone.png?v=2"}
                      alt="Video Showcase"
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      aria-label="Play video showcase"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "2px solid rgba(255, 255, 255, 0.6)",
                        color: "#FFFFFF",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingLeft: "4px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-play"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      )}

      {/* ================================================================
          5. FEATURED PRODUCTS SECTION (lines 1923-3448 of index.html)
      ================================================================ */}
      {featuredProducts && featuredProducts.length > 0 && (
      <section className="featured-product-section section-padding fix gsap-scroll-section" id="featured-products">
        <div className="container">
          <div className="featured-product-wrapper style1">
            <div className="wsi-section-header text-center">
              <div className="wsi-section-title-wrap text-center">
                <div className="wsi-section-subtitle">
                  <i className="fa-solid fa-star"></i>
                  <span>Featured Products</span>
                </div>
                <TextType
                  as="h2"
                  className="wsi-section-title"
                  text={["Our Featured Products", "Curated For Your Home", "Exclusive Architectural Pieces"]}
                  typingSpeed={60}
                  pauseDuration={2400}
                  deletingSpeed={35}
                  deleteMode="backspace"
                  typeEffect="fade"
                  cursorStyle="bar"
                  cursorColor="var(--color-primary, #FF4035)"
                  cursorGlide
                  showCursor
                />
              </div>
            </div>
            <div className="feature-flex-tab-wrapper">
              <div className="feature-tab-btn-wrapper">
                <div className="d-flex align-items-center gap-2 wsi-scrollable-tabs">
                  <button
                    className={`wsi-nav-pill-btn ${featuredTab === "all" ? "active" : ""}`}
                    type="button"
                    onClick={() => setFeaturedTab("all")}
                  >
                    All
                  </button>
                  {mainCategories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      className={`wsi-nav-pill-btn ${featuredTab === cat.slug ? "active" : ""}`}
                      type="button"
                      onClick={() => setFeaturedTab(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="feature-select">
                <div className="nav-item">
                  <div className="form">
                    <select
                      className="single-select w-100"
                      value={featuredTab}
                      onChange={(e) => setFeaturedTab(e.target.value)}
                      style={{ padding: "8px 14px", borderRadius: "9999px", border: "1px solid #CBD5E1", fontSize: "0.88rem", fontWeight: 500 }}
                    >
                      <option value="all">All Categories</option>
                      {mainCategories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-content" id="pills-tabContent2">
              <div className="tab-pane fade show active">
                <div className="feature-tab-content">
                  <div className="row g-3 g-md-4">
                    {filteredFeaturedProducts.slice(0, 8).map((product, idx) => (
                      <div key={product.id || idx} className="col-xl-3 col-md-6 col-6">
                        <div className="wsi-featured-card">
                          <div className="wsi-featured-card__thumb-wrapper">
                            <Link href={`/product/${product.slug}`} className="d-block w-100 h-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="wsi-featured-card__img"
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%", minHeight: "180px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                                  <i className="fa-solid fa-shapes" style={{ fontSize: "2rem" }}></i>
                                </div>
                              )}
                            </Link>
                            {Boolean(product.discount_percent && product.discount_percent > 0) && (
                              <span className="wsi-featured-card__badge">
                                {product.discount_percent}% OFF
                              </span>
                            )}
                            <div className="wsi-featured-card__actions">
                              <button
                                type="button"
                                className="wsi-action-btn"
                                onClick={() => openQuickView(product)}
                                title="Quick View"
                              >
                                <i className="fa-regular fa-eye"></i>
                              </button>
                              <button
                                type="button"
                                className="wsi-action-btn"
                                onClick={() => handleAddToWishlist(product)}
                                title="Add to Wishlist"
                              >
                                <i className="fa-regular fa-heart"></i>
                              </button>
                              <button
                                type="button"
                                className="wsi-action-btn"
                                onClick={() => handleAddToCart(product)}
                                title="Add to Cart"
                              >
                                <i className="fa-light fa-bag-shopping"></i>
                              </button>
                            </div>
                          </div>
                          <div className="wsi-featured-card__body">
                            {product.category_name && (
                              <span className="wsi-featured-card__category">{product.category_name}</span>
                            )}
                            <h5 className="wsi-featured-card__title">
                              <Link href={`/product/${product.slug}`} title={product.name}>
                                {product.name}
                              </Link>
                            </h5>
                            <div className="wsi-featured-card__rating">
                              <div className="wsi-featured-card__stars">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={i < (product.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                                  ></i>
                                ))}
                              </div>
                              <span className="wsi-featured-card__review-count">
                                ({product.reviews_count || 0})
                              </span>
                            </div>
                            <div className="wsi-featured-card__footer">
                              <div className="wsi-featured-card__price-wrap">
                                <span className="wsi-featured-card__price">₹{Number(product.price).toFixed(2)}</span>
                                {product.original_price && (
                                  <span className="wsi-featured-card__price-orig">₹{Number(product.original_price).toFixed(2)}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                className="wsi-featured-card__cart-btn"
                                onClick={() => handleAddToCart(product)}
                              >
                                <i className="fa-light fa-bag-shopping"></i> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ================================================================
          6. PROMO SECTION (Database Driven from homepage_promos)
      ================================================================ */}
      {promos && promos.length > 0 && (
        <section className="promo-section section-padding fix pt-0 gsap-scroll-section">
          <div className="container">
            <div className="promo-wrapper style1">
              <div className="row g-4">
                {promos.slice(0, 2).map((promo, pIdx) => {
                  const colClass = pIdx === 0 && promos.length > 1 ? "col-lg-5" : promos.length === 1 ? "col-lg-12" : "col-lg-7";
                  const cardClass = pIdx === 0 ? "promo-card promo-card_1" : "promo-card promo-card_2";
                  return (
                    <div key={promo.id || pIdx} className={colClass}>
                      <div className={cardClass}>
                        {promo.image && (
                          <div className="thumb">
                            <img
                              src={promo.image}
                              alt={promo.title}
                              loading="lazy"
                              decoding="async"
                              style={{ maxWidth: "100%", height: "240px", objectFit: "contain" }}
                            />
                          </div>
                        )}
                        <div className="promo-content">
                          <div className="promo-info">
                            {promo.badge && <p className="offer-text">{promo.badge}</p>}
                            <h3 className="promo-title">{promo.title}</h3>
                            {promo.description && <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "6px 0 0" }}>{promo.description}</p>}
                          </div>
                          <div className="promo-btn-wrapper">
                            <Link className="theme-btn style5" href={promo.button_link || "/shop"}>
                              {promo.button_text || "View All"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          7. CTA BUNDLE SECTION (Controlled by Homepage Settings)
      ================================================================ */}
      {Boolean(homepageSettings?.bundle_offer_enabled !== 0 && homepageSettings?.bundle_offer_enabled !== false && homepageSettings?.bundle_offer_title) && (
        <section className="cta-section fix bg-color2" style={{ padding: "60px 0" }}>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div
                  className="wsi-bundle-banner position-relative overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.65) 100%), url(${homepageSettings?.bundle_offer_bg_image || "/assets/images/cta/ctaBg1_1.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "24px",
                    padding: "48px 50px",
                    minHeight: "360px",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="row align-items-center w-100 g-4" style={{ margin: 0, zIndex: 2 }}>
                    <div className="col-lg-7 col-md-6 col-12" style={{ padding: "8px" }}>
                      <div style={{ maxWidth: "520px", textAlign: "left" }}>
                        {Boolean(homepageSettings?.bundle_offer_badge) && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "linear-gradient(135deg, #FF4035 0%, #E02B20 100%)",
                              borderRadius: "50px",
                              padding: "6px 18px",
                              marginBottom: "16px",
                              boxShadow: "0 6px 16px rgba(255, 64, 53, 0.35)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                            }}
                          >
                            <i className="fa-solid fa-tags" style={{ color: "#FFFFFF", fontSize: "0.8rem" }}></i>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                color: "#FFFFFF",
                                letterSpacing: "0.8px",
                                textTransform: "uppercase",
                              }}
                            >
                              {homepageSettings?.bundle_offer_badge}
                            </span>
                          </div>
                        )}

                        <h2
                          style={{
                            fontSize: "clamp(2rem, 3.2vw, 2.7rem)",
                            fontWeight: 800,
                            color: "#FFFFFF",
                            lineHeight: 1.2,
                            marginBottom: "14px",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {homepageSettings?.bundle_offer_title}
                        </h2>

                        <p
                          style={{
                            color: "rgba(255, 255, 255, 0.92)",
                            fontSize: "1.05rem",
                            lineHeight: 1.6,
                            marginBottom: "26px",
                            maxWidth: "480px",
                          }}
                        >
                          {homepageSettings?.bundle_offer_subtitle || "Curated package selections and bespoke furniture combinations at preferential rates."}
                        </p>

                        <div>
                          <Link
                            className="theme-btn style6"
                            href={homepageSettings?.bundle_offer_button_link || "/shop"}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "13px 32px",
                              borderRadius: "50px",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                              textDecoration: "none",
                            }}
                          >
                            {homepageSettings?.bundle_offer_button_text || "View All"}
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }}></i>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {homepageSettings?.bundle_offer_image && (
                      <div className="col-lg-5 col-md-6 col-12 d-flex justify-content-center justify-content-md-end align-items-center" style={{ padding: "8px" }}>
                        <div
                          style={{
                            position: "relative",
                            maxWidth: "460px",
                            width: "100%",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                            border: "3px solid rgba(255, 255, 255, 0.22)",
                            background: "rgba(255, 255, 255, 0.08)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                          }}
                        >
                          <img
                            src={homepageSettings.bundle_offer_image}
                            alt={homepageSettings?.bundle_offer_title || "Bundle Offer"}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: "100%",
                              height: "280px",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          8. POPULAR PRODUCT SECTION (PRODUCTS OF THE WEEK) (lines 3528-3767 of index.html)
      ================================================================ */}
      {(weeklyDealProducts.length > 0 || (featuredProducts && featuredProducts.length > 0)) && (
      <div className="popular-product-section section-padding bg-color2 fix" id="hot-sell-section">
        <div className="container">
          <div className="wsi-section-header-split">
            <div className="wsi-section-title-wrap">
              <div className="wsi-section-subtitle">
                <i className="fa-solid fa-fire"></i>
                <span>Hot Sell</span>
              </div>
              <TextType
                as="h2"
                className="wsi-section-title"
                text={["Products Of The Week", "Weekly Deals & Highlights", "Timeless Interior Specials"]}
                typingSpeed={60}
                pauseDuration={2400}
                deletingSpeed={35}
                deleteMode="backspace"
                typeEffect="fade"
                cursorStyle="bar"
                cursorColor="var(--color-primary, #FF4035)"
                cursorGlide
                showCursor
              />
            </div>

            <div className="wsi-section-header-right">
              <Link className="theme-btn style7" href="/shop">
                View all
              </Link>
            </div>
          </div>

          <div className="wsi-hot-sell-grid">
            {/* Left Column: Horizontal Hero Deal Cards */}
            <div className="wsi-hot-sell-banners-col">
              {(() => {
                const prod1 = weeklyDealProducts[0] || featuredProducts[0];
                if (!prod1) return null;
                return (
                  <div className="wsi-hot-deal-banner">
                    <div className="wsi-hot-deal-banner__content">
                      <div className="wsi-hot-deal-banner__top">
                        <span className="wsi-hot-deal-banner__badge">
                          -{prod1.discount_percent || 25}% OFF
                        </span>
                        <span className="wsi-hot-deal-banner__cat">
                          {prod1.category_name || "Special Deal"}
                        </span>
                      </div>
                      <h3 className="wsi-hot-deal-banner__title">
                        <Link href={`/product/${prod1.slug}`}>{prod1.name}</Link>
                      </h3>
                      <div className="wsi-hot-deal-banner__controls">
                        <button
                          type="button"
                          className="wsi-hot-deal-banner__cart-btn"
                          onClick={() => handleAddToCart(prod1)}
                        >
                          <i className="fa-light fa-bag-shopping"></i> Add To Cart
                        </button>
                        {isTimerEnabled && (
                          <div className="wsi-hot-deal-banner__timer" suppressHydrationWarning>
                            <i className="fa-sharp fa-solid fa-alarm-clock"></i>
                            <DealTimerInline targetDateStr={targetDateStr} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="wsi-hot-deal-banner__thumb">
                      <Link href={`/product/${prod1.slug}`} className="d-block w-100 h-100">
                        {prod1.image ? (
                          <img
                            src={prod1.image}
                            alt={prod1.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", minHeight: "180px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                            <i className="fa-solid fa-fire" style={{ fontSize: "2rem" }}></i>
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const prod2 = weeklyDealProducts[1] || featuredProducts[1];
                if (!prod2) return null;
                return (
                  <div className="wsi-hot-deal-banner">
                    <div className="wsi-hot-deal-banner__content">
                      <div className="wsi-hot-deal-banner__top">
                        <span className="wsi-hot-deal-banner__badge">
                          -{prod2.discount_percent || 30}% OFF
                        </span>
                        <span className="wsi-hot-deal-banner__cat">
                          {prod2.category_name || "Limited Campaign"}
                        </span>
                      </div>
                      <h3 className="wsi-hot-deal-banner__title">
                        <Link href={`/product/${prod2.slug}`}>{prod2.name}</Link>
                      </h3>
                      <div className="wsi-hot-deal-banner__controls">
                        <button
                          type="button"
                          className="wsi-hot-deal-banner__cart-btn"
                          onClick={() => handleAddToCart(prod2)}
                        >
                          <i className="fa-light fa-bag-shopping"></i> Add To Cart
                        </button>
                        {isTimerEnabled && (
                          <div className="wsi-hot-deal-banner__timer" suppressHydrationWarning>
                            <i className="fa-sharp fa-solid fa-alarm-clock"></i>
                            <DealTimerInline targetDateStr={targetDateStr} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="wsi-hot-deal-banner__thumb">
                      <Link href={`/product/${prod2.slug}`} className="d-block w-100 h-100">
                        {prod2.image ? (
                          <img
                            src={prod2.image}
                            alt={prod2.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", minHeight: "180px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                            <i className="fa-solid fa-fire" style={{ fontSize: "2rem" }}></i>
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Modern Vertical Deal Cards Grid */}
            <div className="wsi-hot-deal-cards-grid">
              {[
                weeklyDealProducts[2] || featuredProducts[2],
                weeklyDealProducts[3] || featuredProducts[3],
                weeklyDealProducts[4] || featuredProducts[4],
                weeklyDealProducts[5] || featuredProducts[5],
              ]
                .filter(Boolean)
                .map((vProd, vIdx) => (
                  <div key={vProd.id || vIdx} className="wsi-hot-deal-card">
                    <div className="wsi-hot-deal-card__thumb-wrap">
                      <Link href={`/product/${vProd.slug}`} className="d-block w-100 h-100">
                        {vProd.image ? (
                          <img
                            src={vProd.image}
                            alt={vProd.name}
                            loading="lazy"
                            decoding="async"
                            className="wsi-hot-deal-card__img"
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", minHeight: "140px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                            <i className="fa-solid fa-fire" style={{ fontSize: "1.5rem" }}></i>
                          </div>
                        )}
                      </Link>
                      {Boolean(vProd.discount_percent && vProd.discount_percent > 0) && (
                        <span className="wsi-hot-deal-card__badge">
                          -{vProd.discount_percent}%
                        </span>
                      )}
                      <div className="wsi-hot-deal-card__actions">
                        <button
                          type="button"
                          className="wsi-mini-action-btn"
                          onClick={() => openQuickView(vProd)}
                          title="Quick View"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="wsi-mini-action-btn"
                          onClick={() => handleAddToWishlist(vProd)}
                          title="Add to Wishlist"
                        >
                          <i className="fa-regular fa-heart"></i>
                        </button>
                        <button
                          type="button"
                          className="wsi-mini-action-btn"
                          onClick={() => handleAddToCart(vProd)}
                          title="Add to Cart"
                        >
                          <i className="fa-light fa-bag-shopping"></i>
                        </button>
                      </div>
                    </div>

                    <div className="wsi-hot-deal-card__body">
                      <h5 className="wsi-hot-deal-card__title">
                        <Link href={`/product/${vProd.slug}`} title={vProd.name}>
                          {vProd.name}
                        </Link>
                      </h5>

                      <div className="wsi-hot-deal-card__rating">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={i < (vProd.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                          ></i>
                        ))}
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginLeft: "4px" }}>
                          ({vProd.reviews_count || 0})
                        </span>
                      </div>

                      {/* Card 0: 4-Box Countdown Timer */}
                      {vIdx === 0 && isTimerEnabled && (
                        <DealTimerBoxes targetDateStr={targetDateStr} />
                      )}

                      {/* Card 1: Pill Timer with "Hurry Up! offers ends in:" */}
                      {vIdx === 1 && isTimerEnabled && (
                        <DealTimerPill targetDateStr={targetDateStr} />
                      )}

                      <div className="wsi-hot-deal-card__footer">
                        <div className="wsi-hot-deal-card__price-wrap">
                          <span className="wsi-hot-deal-card__price">₹{Number(vProd.price).toFixed(2)}</span>
                          {vProd.original_price && (
                            <span className="wsi-hot-deal-card__price-orig">₹{Number(vProd.original_price).toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="wsi-mini-action-btn"
                          onClick={() => handleAddToCart(vProd)}
                          title="Add to Cart"
                        >
                          <i className="fa-light fa-bag-shopping"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ================================================================
          9. TESTIMONIAL SECTION (lines 3770-3919 of index.html)
      ================================================================ */}
      {testimonials && testimonials.length > 0 && (
      <section className="testimonial-section fix section-padding margin-bottom-40 gsap-scroll-section" id="testimonials">
        <div className="container">
          <div className="wsi-section-header text-center">
            <div className="wsi-section-title-wrap text-center">
              <div className="wsi-section-subtitle">
                <i className="fa-solid fa-comments"></i>
                <span>Testimonials</span>
              </div>
              <TextType
                as="h2"
                className="wsi-section-title"
                text={["What Our Clients Say", "Customer Testimonials", "Stories of Transformed Spaces"]}
                typingSpeed={60}
                pauseDuration={2400}
                deletingSpeed={35}
                deleteMode="backspace"
                typeEffect="fade"
                cursorStyle="bar"
                cursorColor="var(--color-primary, #FF4035)"
                cursorGlide
                showCursor
              />
            </div>
          </div>
          <div className="row g-4">
            {testimonials.map((t, idx) => (
              <div key={t.id || idx} className="col-lg-4 col-md-6">
                <div className="testimonial-card-items-one">
                  <p>{t.content}</p>
                  <div className="client-info-wrapper d-flex align-items-center justify-content-between">
                    <div className="client-info">
                      <div
                        className="client-img bg-cover"
                        style={{
                          backgroundImage: t.avatar ? `url('${t.avatar}')` : undefined,
                          backgroundColor: t.avatar ? undefined : "#0F172A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {!t.avatar ? (
                          <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: "1.2rem" }}>
                            {t.customer_name?.charAt(0) || "C"}
                          </span>
                        ) : (
                          <div className="icon">
                            <img className="shape" src="/assets/images/shape/shape.svg" alt="img" />
                          </div>
                        )}
                      </div>
                      <div className="content">
                        <h3>{t.customer_name}</h3>
                        <span>{t.customer_role || "Verified Customer"}</span>
                        <div className="star">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={i < (t.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ================================================================
          9.5. FEATURED GALLERY & SHOWCASE (FlexCarousel WebGL Liquid Lens)
      ================================================================ */}
      <HomeGallerySection galleryItems={galleryItems} />

      {/* ================================================================
          10. NEWS & BLOG SECTION (BlogVariant4 Editorial Layout)
      ================================================================ */}
      <BlogNewsSection posts={blogPosts} />

      {/* ================================================================
          11. NEWSLETTER MODAL AREA (lines 4503-4548 of index.html)
      ================================================================ */}
      <NewsletterOfferModal settings={homepageSettings} />

      {/* ================================================================
          12. QUICK VIEW MODAL (lines 572-651 of index.html)
      ================================================================ */}
      {quickViewProduct && (
        <div
          className="modal modal-common-wrap fade show d-block"
          id="exampleModal2"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setQuickViewProduct(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="shop-details">
                  <div className="row gx-60 align-items-center">
                    <div className="col-lg-6">
                      <ProductImageGallery
                        images={quickViewProduct.image ? [quickViewProduct.image] : []}
                        activeImage={quickViewProduct.image || ""}
                        productName={quickViewProduct.name}
                        badge={quickViewProduct.badge}
                        discountPercent={quickViewProduct.discount_percent}
                        height={420}
                        compact={true}
                      />
                    </div>
                    <div className="col-lg-6 mt-4 mt-md-0">
                      <div className="product-about">
                        <div className="rating">
                          <ul className="star">
                            <li><i className="fa-solid fa-star"></i></li>
                            <li><i className="fa-solid fa-star"></i></li>
                            <li><i className="fa-solid fa-star"></i></li>
                            <li><i className="fa-solid fa-star"></i></li>
                            <li><i className="fa-solid fa-star"></i></li>
                          </ul>
                          <h6>({quickViewProduct.reviews_count || 2} customer reviews)</h6>
                        </div>
                        <h6 className="product-price">₹{quickViewProduct.price.toFixed(2)}</h6>
                        <h2 className="product-title">{quickViewProduct.name}</h2>
                        <p className="text">
                          {quickViewProduct.short_description ||
                            "Aliquam hendrerit a augue insuscipit. Etiam aliquam massa quis des mauris commodo venenatis ligula commodo leez sed blandit convallis dignissim onec vel pellentesque neque."}
                        </p>
                        <div className="product-details">
                          <div className="size">
                            <span className="title">Size</span>
                            <span className="size-number">L</span>
                            <span className="size-number">M</span>
                            <span className="size-number">S</span>
                            <span className="size-number">Xl</span>
                            <span className="size-number">XXl</span>
                          </div>
                          <div className="color">
                            <h6>Color</h6>
                            <div className="color1"></div>
                            <div className="color2"></div>
                            <div className="color1"></div>
                            <div className="color3"></div>
                            <div className="color4"></div>
                            <div className="color5"></div>
                            <div className="color6"></div>
                          </div>
                        </div>
                        <div className="actions">
                          <div className="quantity">
                            <p>Quantity</p>
                            <div className="qty-wrapper">
                              <input
                                type="number"
                                className="qty-input"
                                value={modalQty}
                                readOnly
                              />
                              <div className="btn-wrapper">
                                <button
                                  className="quantity-plus qty-btn"
                                  type="button"
                                  onClick={() => setModalQty((q) => q + 1)}
                                >
                                  <i className="fa-solid fa-plus"></i>
                                </button>
                                <button
                                  className="quantity-minus qty-btn"
                                  type="button"
                                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                                >
                                  <i className="fa-solid fa-minus"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="product-details-footer">
                          <button
                            type="button"
                            className="theme-btn"
                            onClick={() => {
                              handleAddToCart(quickViewProduct, modalQty);
                            }}
                          >
                            Add to Cart{" "}
                            <i className="fa-light fa-bag-shopping bg-transparent text-white ms-1"></i>
                          </button>
                          <button
                            type="button"
                            className="theme-btn style7 border-0"
                            onClick={() => {
                              handleAddToWishlist(quickViewProduct);
                            }}
                          >
                            WISHLIST <i className="fa-sharp fa-solid fa-heart"></i>
                          </button>
                          <Link
                            className="theme-btn style8 border-0"
                            href={`/product/${quickViewProduct.slug}`}
                            onClick={() => setQuickViewProduct(null)}
                            style={{ padding: "10px 16px", fontSize: "13px" }}
                          >
                            Full Details <i className="fa-regular fa-arrow-right ms-1"></i>
                          </Link>

                          <div className="share">
                            <ul className="social-media">
                              <li>
                                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                                  <i className="fa-brands fa-facebook-f"></i>
                                </a>
                              </li>
                              <li>
                                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                                  <i className="fa-brands fa-youtube"></i>
                                </a>
                              </li>
                              <li>
                                <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
                                  <i className="fa-brands fa-twitter"></i>
                                </a>
                              </li>
                              <li>
                                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                  <i className="fa-brands fa-instagram"></i>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          13. VIDEO POPUP MODAL (YouTube Video for Drone)
      ================================================================ */}
      {isVideoModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1060 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  onClick={() => setIsVideoModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={getEmbedUrl(homepageSettings?.hero_video_url)}
                    title="Product Showcase Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0A111E",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 999999,
            fontSize: "0.92rem",
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ color: "#10B981", fontSize: "1.1rem" }}></i>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
