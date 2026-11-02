"use client";

import React, { useState, useEffect, useTransition } from "react";
import { HomepagePromo, getAllHomepagePromosAdmin, saveHomepagePromoAction } from "@/lib/actions/promos";
import {
  updateWeeklyDealsSettingsAction,
  updateBundleOfferSettingsAction,
  updateNewsletterModalSettingsAction,
  getHomepageSettings,
} from "@/lib/actions/settings";
import { getAllProductsAdmin, Product } from "@/lib/actions/products";
import ImageUploader from "@/components/dashboard/ImageUploader";
import {
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShoppingBag,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  Eye,
  Package,
  Mail,
} from "lucide-react";

function parseDateTimeForInput(val: unknown): string {
  if (!val) return "2026-12-31T23:59:59";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "2026-12-31T23:59:59";
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = val.getFullYear();
    const m = pad(val.getMonth() + 1);
    const d = pad(val.getDate());
    const h = pad(val.getHours());
    const min = pad(val.getMinutes());
    const s = pad(val.getSeconds());
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }
  const str = String(val).trim();
  if (!str) return "2026-12-31T23:59:59";
  if (str.includes("T")) return str;
  return str.replace(" ", "T");
}

export default function PromosWeeklySettings() {
  const [promos, setPromos] = useState<HomepagePromo[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Weekly deal form state
  const [weeklyDealEnabled, setWeeklyDealEnabled] = useState(true);
  const [weeklyDealTitle, setWeeklyDealTitle] = useState("Products Of The Week");
  const [weeklyDealSubtitle, setWeeklyDealSubtitle] = useState("Hot Sell");
  const [weeklyDealEndDate, setWeeklyDealEndDate] = useState("2026-12-31T23:59:59");
  const [weeklyDealTimezone, setWeeklyDealTimezone] = useState("Asia/Kolkata");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Promo cards state
  const [promo1, setPromo1] = useState<HomepagePromo | null>(null);
  const [promo2, setPromo2] = useState<HomepagePromo | null>(null);

  // Bundle Offer form state
  const [bundleOfferEnabled, setBundleOfferEnabled] = useState(true);
  const [bundleOfferTitle, setBundleOfferTitle] = useState("Get Bundle Products Offer");
  const [bundleOfferSubtitle, setBundleOfferSubtitle] = useState("Curated package selections and bespoke furniture combinations at preferential rates.");
  const [bundleOfferBadge, setBundleOfferBadge] = useState("25% OFF");
  const [bundleOfferButtonText, setBundleOfferButtonText] = useState("View All");
  const [bundleOfferButtonLink, setBundleOfferButtonLink] = useState("/shop");
  const [bundleOfferImage, setBundleOfferImage] = useState("/assets/images/cta/ctaThumb1_1.png");
  const [bundleOfferBgImage, setBundleOfferBgImage] = useState("/assets/images/cta/ctaBg1_1.jpg");

  // Newsletter Offer Modal form state
  const [modalEnabled, setModalEnabled] = useState(true);
  const [modalTitle, setModalTitle] = useState("Subcribe to Our Newsletter");
  const [modalSubtitle, setModalSubtitle] = useState("Subscribe to our newsletter and Save your 20% money with discount code today.");
  const [modalCode, setModalCode] = useState("WALLSTREET20");
  const [modalImage, setModalImage] = useState("/assets/images/modal/common-modal.jpg");

  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [promosData, homeSettings, products] = await Promise.all([
        getAllHomepagePromosAdmin(),
        getHomepageSettings(),
        getAllProductsAdmin(),
      ]);

      setPromos(promosData);
      setAllProducts(products);

      if (promosData.length > 0) {
        setPromo1(promosData[0]);
        if (promosData.length > 1) {
          setPromo2(promosData[1]);
        }
      }

      if (homeSettings) {
        setWeeklyDealEnabled(homeSettings.weekly_deal_enabled !== 0 && homeSettings.weekly_deal_enabled !== false);
        setWeeklyDealTitle(homeSettings.weekly_deal_title || "Products Of The Week");
        setWeeklyDealSubtitle(homeSettings.weekly_deal_subtitle || "Hot Sell");

        if (homeSettings.weekly_deal_end_date) {
          const rawDate = parseDateTimeForInput(homeSettings.weekly_deal_end_date);
          setWeeklyDealEndDate(rawDate);
        }
        setWeeklyDealTimezone(homeSettings.weekly_deal_timezone || "Asia/Kolkata");

        if (homeSettings.weekly_deal_product_ids) {
          try {
            const parsed = typeof homeSettings.weekly_deal_product_ids === "string"
              ? JSON.parse(homeSettings.weekly_deal_product_ids)
              : homeSettings.weekly_deal_product_ids;
            if (Array.isArray(parsed)) setSelectedProductIds(parsed.map(Number));
          } catch (e) {
            setSelectedProductIds([]);
          }
        }

        setBundleOfferEnabled(homeSettings.bundle_offer_enabled !== 0 && homeSettings.bundle_offer_enabled !== false);
        setBundleOfferTitle(homeSettings.bundle_offer_title || "Get Bundle Products Offer");
        setBundleOfferSubtitle(homeSettings.bundle_offer_subtitle || "Curated package selections and bespoke furniture combinations at preferential rates.");
        setBundleOfferBadge(homeSettings.bundle_offer_badge || "25% OFF");
        setBundleOfferButtonText(homeSettings.bundle_offer_button_text || "View All");
        setBundleOfferButtonLink(homeSettings.bundle_offer_button_link || "/shop");
        setBundleOfferImage(homeSettings.bundle_offer_image || "/assets/images/cta/ctaThumb1_1.png");
        setBundleOfferBgImage(homeSettings.bundle_offer_bg_image || "/assets/images/cta/ctaBg1_1.jpg");

        setModalEnabled(homeSettings.newsletter_modal_enabled !== 0 && homeSettings.newsletter_modal_enabled !== false);
        setModalTitle(homeSettings.newsletter_modal_title || "Subcribe to Our Newsletter");
        setModalSubtitle(homeSettings.newsletter_modal_subtitle || "Subscribe to our newsletter and Save your 20% money with discount code today.");
        setModalCode(homeSettings.newsletter_modal_code || "WALLSTREET20");
        setModalImage(homeSettings.newsletter_modal_image || "/assets/images/modal/common-modal.jpg");
      }
    } catch (err) {
      console.error("Error loading promo settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePromo = (promo: HomepagePromo | null, slot: 1 | 2) => {
    if (!promo) return;
    setFeedback(null);

    const formData = new FormData();
    formData.append("id", promo.id.toString());
    formData.append("card_key", promo.card_key);
    formData.append("badge", promo.badge);
    formData.append("title", promo.title);
    formData.append("description", promo.description || "");
    formData.append("image", promo.image);
    formData.append("button_text", promo.button_text);
    formData.append("button_link", promo.button_link);
    formData.append("is_active", promo.is_active ? "1" : "0");
    formData.append("sort_order", promo.sort_order.toString());

    startTransition(async () => {
      const res = await saveHomepagePromoAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: `Promo Banner ${slot} updated successfully!` });
        await loadData();
      } else {
        setFeedback({ success: false, message: res.error || `Failed to update banner ${slot}` });
      }
    });
  };

  const handleSaveWeeklyDeals = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("weekly_deal_enabled", weeklyDealEnabled ? "1" : "0");
    formData.append("weekly_deal_title", weeklyDealTitle);
    formData.append("weekly_deal_subtitle", weeklyDealSubtitle);
    const formattedEndDate = typeof weeklyDealEndDate === "string"
      ? weeklyDealEndDate.replace("T", " ")
      : String(weeklyDealEndDate || "").replace("T", " ");
    formData.append("weekly_deal_end_date", formattedEndDate);
    formData.append("weekly_deal_timezone", weeklyDealTimezone);
    formData.append("weekly_deal_product_ids", JSON.stringify(selectedProductIds));

    startTransition(async () => {
      const res = await updateWeeklyDealsSettingsAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: "Products of the Week & Countdown Timer updated successfully!" });
        await loadData();
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update weekly deals" });
      }
    });
  };

  const toggleProductSelect = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSaveBundleOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("bundle_offer_enabled", bundleOfferEnabled ? "1" : "0");
    formData.append("bundle_offer_title", bundleOfferTitle);
    formData.append("bundle_offer_subtitle", bundleOfferSubtitle);
    formData.append("bundle_offer_badge", bundleOfferBadge);
    formData.append("bundle_offer_button_text", bundleOfferButtonText);
    formData.append("bundle_offer_button_link", bundleOfferButtonLink);
    formData.append("bundle_offer_image", bundleOfferImage);
    formData.append("bundle_offer_bg_image", bundleOfferBgImage);

    startTransition(async () => {
      const res = await updateBundleOfferSettingsAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: "Bundle Products Offer banner updated successfully!" });
        await loadData();
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update bundle offer banner" });
      }
    });
  };

  const handleSaveNewsletterModal = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("newsletter_modal_enabled", modalEnabled ? "1" : "0");
    formData.append("newsletter_modal_title", modalTitle);
    formData.append("newsletter_modal_subtitle", modalSubtitle);
    formData.append("newsletter_modal_code", modalCode);
    formData.append("newsletter_modal_image", modalImage);

    startTransition(async () => {
      const res = await updateNewsletterModalSettingsAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: "Newsletter Offer Popup Modal settings updated successfully!" });
        await loadData();
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update newsletter offer popup" });
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>
        Loading promotional campaign settings...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            borderRadius: "8px",
            backgroundColor: feedback.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${feedback.success ? "#BBF7D0" : "#FECACA"}`,
            color: feedback.success ? "#166534" : "#991B1B",
            fontSize: "0.92rem",
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ========================================================
          SECTION 1: HOMEPAGE PROMOTIONAL BANNERS (SCREENSHOT 1)
      ======================================================== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          padding: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tag size={22} color="var(--theme)" />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                Promo Banners Section (Screenshot 1)
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.86rem", color: "#64748B" }}>
                Manage the dual promotional offer cards shown below the category tabs on the homepage
              </p>
            </div>
          </div>
          <span style={{ fontSize: "0.82rem", background: "#FEF2F2", color: "#EF4444", padding: "4px 12px", borderRadius: "16px", fontWeight: 700 }}>
            Dynamic Homepage Banners
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Banner 1 Form */}
          {promo1 && (
            <div
              style={{
                border: "1px solid #FED7AA",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#FFFBF7",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#C2410C" }}>
                  Promo Banner 1 (Left Card)
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.82rem" }}>
                  <input
                    type="checkbox"
                    checked={promo1.is_active}
                    onChange={(e) => setPromo1({ ...promo1, is_active: e.target.checked })}
                    style={{ accentColor: "#C2410C" }}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Badge Tag</label>
                <input
                  type="text"
                  value={promo1.badge}
                  onChange={(e) => setPromo1({ ...promo1, badge: e.target.value })}
                  placeholder="e.g. GET 30% OFF"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Banner Title</label>
                <input
                  type="text"
                  value={promo1.title}
                  onChange={(e) => setPromo1({ ...promo1, title: e.target.value })}
                  placeholder="e.g. Bespoke Luxury Seating"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Destination URL</label>
                <input
                  type="text"
                  value={promo1.button_link}
                  onChange={(e) => setPromo1({ ...promo1, button_link: e.target.value })}
                  placeholder="e.g. /shop or /product/luxury-sofa"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Button Text</label>
                <input
                  type="text"
                  value={promo1.button_text}
                  onChange={(e) => setPromo1({ ...promo1, button_text: e.target.value })}
                  placeholder="View All"
                  className="form-input"
                />
              </div>

              <ImageUploader
                value={promo1.image}
                onChange={(img) => setPromo1({ ...promo1, image: img })}
                label="Banner Photograph"
                name="promo1_image"
              />

              <button
                type="button"
                onClick={() => handleSavePromo(promo1, 1)}
                disabled={isPending}
                className="abid-btn abid-btn-primary"
                style={{ width: "100%", marginTop: "16px", padding: "8px", fontSize: "0.88rem", justifyContent: "center" }}
              >
                <Save size={16} />
                <span>Save Banner 1</span>
              </button>
            </div>
          )}

          {/* Banner 2 Form */}
          {promo2 && (
            <div
              style={{
                border: "1px solid #BFDBFE",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#F8FAFC",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1D4ED8" }}>
                  Promo Banner 2 (Right Card)
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.82rem" }}>
                  <input
                    type="checkbox"
                    checked={promo2.is_active}
                    onChange={(e) => setPromo2({ ...promo2, is_active: e.target.checked })}
                    style={{ accentColor: "#1D4ED8" }}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Badge Tag</label>
                <input
                  type="text"
                  value={promo2.badge}
                  onChange={(e) => setPromo2({ ...promo2, badge: e.target.value })}
                  placeholder="e.g. LIMITED OFFER"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Banner Title</label>
                <input
                  type="text"
                  value={promo2.title}
                  onChange={(e) => setPromo2({ ...promo2, title: e.target.value })}
                  placeholder="e.g. Don't Miss 25% Off On Architectural Panels"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Destination URL</label>
                <input
                  type="text"
                  value={promo2.button_link}
                  onChange={(e) => setPromo2({ ...promo2, button_link: e.target.value })}
                  placeholder="e.g. /shop or /category/wall-paneling"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Button Text</label>
                <input
                  type="text"
                  value={promo2.button_text}
                  onChange={(e) => setPromo2({ ...promo2, button_text: e.target.value })}
                  placeholder="View All"
                  className="form-input"
                />
              </div>

              <ImageUploader
                value={promo2.image}
                onChange={(img) => setPromo2({ ...promo2, image: img })}
                label="Banner Photograph"
                name="promo2_image"
              />

              <button
                type="button"
                onClick={() => handleSavePromo(promo2, 2)}
                disabled={isPending}
                className="abid-btn abid-btn-primary"
                style={{ width: "100%", marginTop: "16px", padding: "8px", fontSize: "0.88rem", justifyContent: "center" }}
              >
                <Save size={16} />
                <span>Save Banner 2</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          SECTION 2: PRODUCTS OF THE WEEK & TIMER (SCREENSHOT 2)
      ======================================================== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          padding: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={22} color="var(--theme)" />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                Products Of The Week &amp; Countdown Timer (Screenshot 2)
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.86rem", color: "#64748B" }}>
                Configure the promotional countdown timer and choose the catalog products featured in this campaign
              </p>
            </div>
          </div>
          <span style={{ fontSize: "0.82rem", background: "#EFF6FF", color: "#2563EB", padding: "4px 12px", borderRadius: "16px", fontWeight: 700 }}>
            Promotional Deal Campaign
          </span>
        </div>

        <form onSubmit={handleSaveWeeklyDeals}>
          {/* Campaign Controls */}
          <div
            style={{
              padding: "20px",
              backgroundColor: "#F8FAFC",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 700, color: "var(--color-secondary)" }}>
                <input
                  type="checkbox"
                  checked={weeklyDealEnabled}
                  onChange={(e) => setWeeklyDealEnabled(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--theme)" }}
                />
                <span>Enable &quot;Products of the Week&quot; Campaign &amp; Countdown Timer</span>
              </label>
              <span style={{ fontSize: "0.8rem", color: weeklyDealEnabled ? "#166534" : "#991B1B", fontWeight: 600 }}>
                {weeklyDealEnabled ? "Campaign Active on Homepage" : "Campaign Disabled"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Section Heading
                </label>
                <input
                  type="text"
                  value={weeklyDealTitle}
                  onChange={(e) => setWeeklyDealTitle(e.target.value)}
                  placeholder="Products Of The Week"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Badge / Subtitle
                </label>
                <input
                  type="text"
                  value={weeklyDealSubtitle}
                  onChange={(e) => setWeeklyDealSubtitle(e.target.value)}
                  placeholder="Hot Sell"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  <Calendar size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  Campaign Expiry Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={weeklyDealEndDate.substring(0, 16)}
                  onChange={(e) => setWeeklyDealEndDate(e.target.value + ":00")}
                  className="form-input"
                  required
                />
                <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px" }}>
                  Countdown runs in real time and automatically stops at zero upon reaching this timestamp.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Campaign Timezone
                </label>
                <select
                  value={weeklyDealTimezone}
                  onChange={(e) => setWeeklyDealTimezone(e.target.value)}
                  className="form-select"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30) — Srinagar Local Time</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Multi-Select Catalog */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Select Catalog Products to Feature
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748B" }}>
                  Selected items appear under the countdown timer card on the storefront ({selectedProductIds.length} selected)
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds(allProducts.slice(0, 4).map((p) => p.id))}
                  className="abid-btn abid-btn-outline"
                  style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                >
                  Select First 4
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="abid-btn abid-btn-outline"
                  style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "12px",
                maxHeight: "360px",
                overflowY: "auto",
                padding: "12px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
              }}
            >
              {allProducts.map((p) => {
                const isChecked = selectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: isChecked ? "2px solid var(--theme)" : "1px solid #E2E8F0",
                      backgroundColor: isChecked ? "#FFF5F5" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleProductSelect(p.id)}
                      style={{ accentColor: "var(--theme)", width: "16px", height: "16px" }}
                    />
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          backgroundColor: "#F1F5F9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package size={18} color="#94A3B8" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#1E293B",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748B" }}>
                        ₹{p.price.toFixed(2)} | Stock: {p.stock}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isPending}
              className="abid-btn abid-btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.9rem" }}
            >
              <Save size={18} />
              <span>{isPending ? "Saving..." : "Save Products of the Week & Timer"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================
          SECTION 3: BUNDLE PRODUCTS OFFER (CTA BANNER)
      ======================================================== */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          padding: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={22} color="var(--theme)" />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                Bundle Products Offer (CTA Banner)
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.86rem", color: "#64748B" }}>
                Customize the full-width promotional CTA banner on the homepage, including title, subtitle, discount badge, button destination, showcase product image, and background artwork
              </p>
            </div>
          </div>
          <span style={{ fontSize: "0.82rem", background: "#FEF3C7", color: "#B45309", padding: "4px 12px", borderRadius: "16px", fontWeight: 700 }}>
            Homepage CTA Banner
          </span>
        </div>

        <form onSubmit={handleSaveBundleOffer}>
          {/* Banner Controls & Visibility */}
          <div
            style={{
              padding: "20px",
              backgroundColor: "#F8FAFC",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 700, color: "var(--color-secondary)" }}>
                <input
                  type="checkbox"
                  checked={bundleOfferEnabled}
                  onChange={(e) => setBundleOfferEnabled(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--theme)" }}
                />
                <span>Enable &quot;Get Bundle Products Offer&quot; Banner on Homepage</span>
              </label>
              <span style={{ fontSize: "0.8rem", color: bundleOfferEnabled ? "#166534" : "#991B1B", fontWeight: 600 }}>
                {bundleOfferEnabled ? "Banner Active on Homepage" : "Banner Hidden from Homepage"}
              </span>
            </div>

            {/* Title & Badge */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Offer Title / Heading
                </label>
                <input
                  type="text"
                  value={bundleOfferTitle}
                  onChange={(e) => setBundleOfferTitle(e.target.value)}
                  placeholder="Get Bundle Products Offer"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Floating Badge / Discount Tag
                </label>
                <input
                  type="text"
                  value={bundleOfferBadge}
                  onChange={(e) => setBundleOfferBadge(e.target.value)}
                  placeholder="25% OFF"
                  className="form-input"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                Offer Subtitle / Description Text
              </label>
              <textarea
                value={bundleOfferSubtitle}
                onChange={(e) => setBundleOfferSubtitle(e.target.value)}
                placeholder="Curated package selections and bespoke furniture combinations at preferential rates."
                className="form-input"
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Button text & link */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={bundleOfferButtonText}
                  onChange={(e) => setBundleOfferButtonText(e.target.value)}
                  placeholder="View All"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Button Destination Link (URL)
                </label>
                <input
                  type="text"
                  value={bundleOfferButtonLink}
                  onChange={(e) => setBundleOfferButtonLink(e.target.value)}
                  placeholder="/shop"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Image Uploaders */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
            <div
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                padding: "20px",
              }}
            >
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px", color: "var(--color-secondary)" }}>
                Showcase Product / Bundle Image
              </h4>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "0 0 16px" }}>
                The right-hand featured image (transparent PNG or cutout of furniture/bundle works best).
              </p>
              <ImageUploader
                value={bundleOfferImage}
                onChange={setBundleOfferImage}
                label="Product Showcase Image"
              />
            </div>

            <div
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                padding: "20px",
              }}
            >
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px", color: "var(--color-secondary)" }}>
                Banner Background Cover Artwork
              </h4>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "0 0 16px" }}>
                Full-bleed background artwork, texture, or interior photograph (~1400x400).
              </p>
              <ImageUploader
                value={bundleOfferBgImage}
                onChange={setBundleOfferBgImage}
                label="Banner Background Artwork"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Eye size={16} color="#64748B" />
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Live Banner Preview
              </span>
            </div>

            <div
              style={{
                backgroundImage: `url(${bundleOfferBgImage || "/assets/images/cta/ctaBg1_1.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "18px",
                padding: "36px 36px",
                position: "relative",
                overflow: "hidden",
                minHeight: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ maxWidth: "440px", zIndex: 2 }}>
                {bundleOfferBadge && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: "50px",
                      padding: "4px 14px",
                      border: "1px solid rgba(255,255,255,0.35)",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      letterSpacing: "0.5px",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                    }}
                  >
                    {bundleOfferBadge}
                  </div>
                )}
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.25 }}>
                  {bundleOfferTitle || "Get Bundle Products Offer"}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.88rem", margin: "0 0 18px", lineHeight: 1.5 }}>
                  {bundleOfferSubtitle || "Curated package selections and bespoke furniture combinations at preferential rates."}
                </p>
                <div style={{ display: "inline-block", background: "var(--color-primary, #FF4035)", color: "#FFFFFF", padding: "8px 22px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 700 }}>
                  {bundleOfferButtonText || "View All"} &rarr;
                </div>
              </div>

              {bundleOfferImage && (
                <div style={{ maxHeight: "200px", maxWidth: "260px", zIndex: 1, marginLeft: "20px" }}>
                  <img
                    src={bundleOfferImage}
                    alt="Preview"
                    style={{
                      maxHeight: "190px",
                      maxWidth: "250px",
                      borderRadius: "14px",
                      border: "2px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isPending}
              className="abid-btn abid-btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.9rem" }}
            >
              <Save size={18} />
              <span>{isPending ? "Saving..." : "Save Bundle Products Offer Banner"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: NEWSLETTER OFFER POPUP MODAL */}
      <div className="abid-card">
        <div className="abid-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h2 className="abid-card-title" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Section 4: Newsletter Offer Popup Modal (Dynamic Image & Text)
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748B", margin: 0 }}>
                Configure the visitor offer popup modal, upload custom promotional photography, and customize discount messaging.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveNewsletterModal} style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "16px" }}>
          {/* Active status toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              backgroundColor: modalEnabled ? "#F0FDF4" : "#F8FAFC",
              borderRadius: "10px",
              border: `1px solid ${modalEnabled ? "#BBF7D0" : "#E2E8F0"}`,
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem" }}>
              <input
                type="checkbox"
                checked={modalEnabled}
                onChange={(e) => setModalEnabled(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#16A34A", cursor: "pointer" }}
              />
              <span>Enable Newsletter Offer Popup Modal on Homepage</span>
            </label>
            <span style={{ fontSize: "0.8rem", color: modalEnabled ? "#166534" : "#991B1B", fontWeight: 600 }}>
              {modalEnabled ? "Modal Active on Homepage" : "Modal Disabled"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "24px" }}>
            {/* Left Column: Form controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Offer Title / Heading
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Subcribe to Our Newsletter"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Discount Promo Code
                </label>
                <input
                  type="text"
                  value={modalCode}
                  onChange={(e) => setModalCode(e.target.value)}
                  placeholder="WALLSTREET20"
                  className="form-input"
                />
                <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  Displayed to subscribers upon successful signup.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Modal Subtitle / Body Copy
                </label>
                <textarea
                  value={modalSubtitle}
                  onChange={(e) => setModalSubtitle(e.target.value)}
                  placeholder="Subscribe to our newsletter and Save your 20% money with discount code today."
                  className="form-input"
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "6px", display: "block" }}>
                  Modal Left Photograph
                </label>
                <ImageUploader
                  label="Upload Modal Image"
                  value={modalImage}
                  onChange={(url) => setModalImage(url)}
                />
                <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  Recommended: Portrait orientation (~500&times;600px or ~600&times;750px)
                </span>
              </div>
            </div>

            {/* Right Column: Live Popup Preview */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Eye size={16} color="#64748B" />
                <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Live Popup Modal Preview
                </span>
              </div>

              <div
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#FFFFFF",
                  display: "grid",
                  gridTemplateColumns: "42% 58%",
                  minHeight: "320px",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative", backgroundColor: "#F1F5F9" }}>
                  <img
                    src={modalImage || "/assets/images/modal/common-modal.jpg"}
                    alt="Modal Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      minHeight: "300px",
                    }}
                  />
                </div>

                <div style={{ padding: "28px 22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ position: "absolute", top: "14px", right: "16px", color: "#94A3B8", fontSize: "20px", fontWeight: "bold" }}>
                    &times;
                  </div>
                  <h4 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", margin: "0 0 10px", lineHeight: 1.25 }}>
                    {modalTitle || "Subcribe to Our Newsletter"}
                  </h4>
                  <p style={{ color: "#64748B", fontSize: "0.84rem", margin: "0 0 18px", lineHeight: 1.5 }}>
                    {modalSubtitle || "Subscribe to our newsletter and Save your 20% money with discount code today."}
                  </p>

                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                    <input
                      type="text"
                      disabled
                      placeholder="Enter your email"
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        fontSize: "0.8rem",
                        border: "1px solid #CBD5E1",
                        borderRadius: "50px",
                        backgroundColor: "#F8FAFC",
                      }}
                    />
                    <button
                      type="button"
                      disabled
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "var(--color-primary, #FF4035)",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "50px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      Subscribe
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "#64748B" }}>
                    <input type="checkbox" disabled checked={false} />
                    <span>Do not show this window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isPending}
              className="abid-btn abid-btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.9rem" }}
            >
              <Save size={18} />
              <span>{isPending ? "Saving..." : "Save Newsletter Offer Popup Modal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
