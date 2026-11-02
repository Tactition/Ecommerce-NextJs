"use client";

import React, { useState, useEffect } from "react";
import {
  HomepageSettings,
  SiteSettings,
  ContactNumberItem,
  ContactEmailItem,
  FeatureItem,
} from "@/types";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/dashboard/ImageUploader";

const PromosWeeklySettings = dynamic(() => import("@/components/dashboard/PromosWeeklySettings"), {
  loading: () => <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading promotional & deals manager...</div>,
});
import {
  getHomepageSettings,
  getSiteSettings,
  updateHomepageSettingsAction,
  updateSiteSettingsAction,
} from "@/lib/actions/settings";
import {
  parsePhoneNumbers,
  parseEmailAddresses,
} from "@/lib/settingsUtils";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Home,
  Building2,
  Globe,
  Phone,
  Mail,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  Play,
  Palette,
  IndianRupee,
  Tag,
  ExternalLink,
  Sparkles,
  Eye,
} from "lucide-react";

const POPULAR_FA_ICONS = [
  { class: "fa-solid fa-warehouse", label: "Importer Direct / Godown" },
  { class: "fa-solid fa-snowflake", label: "Built for Kashmir Winter" },
  { class: "fa-solid fa-store", label: "Showroom & Stock" },
  { class: "fa-brands fa-whatsapp", label: "WhatsApp Desk" },
  { class: "fa-solid fa-award", label: "Award / Premium Quality" },
  { class: "fa-solid fa-shield-halved", label: "Warranty / Protection" },
  { class: "fa-solid fa-truck-fast", label: "Express Shipping" },
  { class: "fa-solid fa-headset", label: "24/7 Dedicated Support" },
  { class: "fa-solid fa-gem", label: "Luxury / Premium Finish" },
  { class: "fa-solid fa-certificate", label: "Certified Authentic" },
  { class: "fa-solid fa-couch", label: "Furniture & Living" },
  { class: "fa-solid fa-arrows-rotate", label: "Hassle-Free Returns" },
  { class: "fa-solid fa-lock", label: "100% Secure Checkout" },
  { class: "fa-solid fa-hand-holding-heart", label: "Handcrafted Care" },
  { class: "fa-solid fa-clock", label: "Timely Delivery" },
  { class: "fa-solid fa-star", label: "Top 5-Star Rated" },
];

function renderAdminFeatureIcon(iconVal?: string) {
  if (!iconVal) {
    return <Sparkles size={20} color="#D4AF37" />;
  }
  const trimmed = iconVal.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".webp")
  ) {
    return <img src={trimmed} alt="icon" style={{ width: "22px", height: "22px", objectFit: "contain" }} />;
  }

  let fullClass = trimmed;
  if (
    !fullClass.includes("fa-solid") &&
    !fullClass.includes("fa-regular") &&
    !fullClass.includes("fa-brands") &&
    !fullClass.includes("fa-light")
  ) {
    if (fullClass.startsWith("fa-")) {
      fullClass = `fa-solid ${fullClass}`;
    } else {
      fullClass = `fa-solid fa-${fullClass}`;
    }
  }

  return <i className={fullClass} style={{ fontSize: "20px", color: "#D4AF37", lineHeight: 1 }} />;
}

export default function SettingsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"brand_seo" | "contact_channels" | "homepage" | "promos_weekly">("brand_seo");
  const [homeSettings, setHomeSettings] = useState<HomepageSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Brand images
  const [siteLogo, setSiteLogo] = useState("");
  const [siteLogoWhite, setSiteLogoWhite] = useState("");
  const [siteFavicon, setSiteFavicon] = useState("");

  // Homepage images
  const [heroImage, setHeroImage] = useState("");
  const [heroImage2, setHeroImage2] = useState("");
  const [heroImage3, setHeroImage3] = useState("");
  const [heroVideoThumb, setHeroVideoThumb] = useState("");
  const [aboutImage, setAboutImage] = useState("");

  // Value Proposition Features state
  const [featuresEnabled, setFeaturesEnabled] = useState(true);
  const [featureList, setFeatureList] = useState<FeatureItem[]>([]);

  // Dynamic Contact Lists
  const [phoneList, setPhoneList] = useState<ContactNumberItem[]>([]);
  const [emailList, setEmailList] = useState<ContactEmailItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    async function load() {
      const [h, s] = await Promise.all([getHomepageSettings(), getSiteSettings()]);
      setHomeSettings(h);
      setSiteSettings(s);

      setSiteLogo(s.site_logo || "");
      setSiteLogoWhite(s.site_logo_white || "");
      setSiteFavicon(s.site_favicon || "");

      setHeroImage(h.hero_image || "/assets/images/intro/introThumb1_1.png");
      setHeroImage2(h.hero_image_2 || "/assets/images/intro/introThumb1_2.png");
      setHeroImage3(h.hero_image_3 || "/assets/images/intro/introThumb1_3.png");
      setHeroVideoThumb(h.hero_video_thumb || "/assets/images/video/drone.png?v=2");
      setAboutImage(h.about_image || "");

      setFeaturesEnabled(h.features_enabled !== undefined ? Boolean(h.features_enabled) : true);
      try {
        const parsed = typeof h.features_json === "string" ? JSON.parse(h.features_json) : h.features_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeatureList(parsed);
        } else {
          setFeatureList([
            { id: "f1", icon: "fa-solid fa-award", title: "High Quality", description: "Crafted from top materials" },
            { id: "f2", icon: "fa-solid fa-shield-halved", title: "Warranty Protection", description: "Over 2 years guaranteed" },
            { id: "f3", icon: "fa-solid fa-truck-fast", title: "Free Shipping", description: "On qualifying orders" },
            { id: "f4", icon: "fa-solid fa-headset", title: "24 / 7 Support", description: "Dedicated concierge desk" },
          ]);
        }
      } catch {
        setFeatureList([
          { id: "f1", icon: "fa-solid fa-award", title: "High Quality", description: "Crafted from top materials" },
          { id: "f2", icon: "fa-solid fa-shield-halved", title: "Warranty Protection", description: "Over 2 years guaranteed" },
          { id: "f3", icon: "fa-solid fa-truck-fast", title: "Free Shipping", description: "On qualifying orders" },
          { id: "f4", icon: "fa-solid fa-headset", title: "24 / 7 Support", description: "Dedicated concierge desk" },
        ]);
      }

      setPhoneList(parsePhoneNumbers(s));
      setEmailList(parseEmailAddresses(s));
    }
    load();
  }, []);

  // Phone Numbers Handlers
  const handleAddPhone = () => {
    const newItem: ContactNumberItem = {
      id: `phone-${Date.now()}`,
      number: "",
      label: "Support Line",
      is_primary: phoneList.length === 0,
    };
    setPhoneList([...phoneList, newItem]);
  };

  const handleUpdatePhone = (id: string, field: "number" | "label", value: string) => {
    setPhoneList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSetPrimaryPhone = (id: string) => {
    setPhoneList((prev) =>
      prev.map((item) => ({ ...item, is_primary: item.id === id }))
    );
  };

  const handleRemovePhone = (id: string) => {
    if (phoneList.length <= 1) {
      alert("At least one phone number should be maintained.");
      return;
    }
    const filtered = phoneList.filter((item) => item.id !== id);
    if (!filtered.some((p) => p.is_primary) && filtered.length > 0) {
      filtered[0].is_primary = true;
    }
    setPhoneList(filtered);
  };

  // Emails Handlers
  const handleAddEmail = () => {
    const newItem: ContactEmailItem = {
      id: `email-${Date.now()}`,
      email: "",
      label: "Customer Support",
      is_primary: emailList.length === 0,
    };
    setEmailList([...emailList, newItem]);
  };

  const handleUpdateEmail = (id: string, field: "email" | "label", value: string) => {
    setEmailList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSetPrimaryEmail = (id: string) => {
    setEmailList((prev) =>
      prev.map((item) => ({ ...item, is_primary: item.id === id }))
    );
  };

  const handleRemoveEmail = (id: string) => {
    if (emailList.length <= 1) {
      alert("At least one email address should be maintained.");
      return;
    }
    const filtered = emailList.filter((item) => item.id !== id);
    if (!filtered.some((e) => e.is_primary) && filtered.length > 0) {
      filtered[0].is_primary = true;
    }
    setEmailList(filtered);
  };

  // Feature Items Handlers
  const handleUpdateFeature = (id: string, field: keyof FeatureItem, value: string) => {
    setFeatureList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddFeature = () => {
    const preset = POPULAR_FA_ICONS[featureList.length % POPULAR_FA_ICONS.length];
    const newItem: FeatureItem = {
      id: `feature-${Date.now()}`,
      icon: preset.class,
      title: "New Feature",
      description: "Description of this value proposition",
    };
    setFeatureList([...featureList, newItem]);
  };

  const handleRemoveFeature = (id: string) => {
    if (featureList.length <= 1) {
      alert("At least one feature card should be maintained.");
      return;
    }
    setFeatureList((prev) => prev.filter((item) => item.id !== id));
  };

  // Save Site & Brand Settings
  const handleSaveBrandAndContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("site_logo", siteLogo);
    formData.set("site_logo_white", siteLogoWhite);
    formData.set("site_favicon", siteFavicon);
    formData.set("phone_numbers", JSON.stringify(phoneList));
    formData.set("email_addresses", JSON.stringify(emailList));

    const res = await updateSiteSettingsAction(formData);
    setIsSaving(false);

    if (res.success) {
      setFeedback({ success: true, message: "Brand identity, logos, SEO, and contact channels saved successfully!" });
    } else {
      setFeedback({ success: false, message: res.error || "Failed to update settings" });
    }
  };

  // Save Homepage Settings
  const handleSaveHomepage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("hero_image", heroImage);
    formData.set("hero_image_2", heroImage2);
    formData.set("hero_image_3", heroImage3);
    formData.set("hero_video_thumb", heroVideoThumb);
    formData.set("about_image", aboutImage);
    formData.set("features_enabled", featuresEnabled ? "1" : "0");
    formData.set("features_json", JSON.stringify(featureList));

    const res = await updateHomepageSettingsAction(formData);
    setIsSaving(false);

    if (res.success) {
      setFeedback({ success: true, message: "Homepage hero and story content updated successfully!" });
    } else {
      setFeedback({ success: false, message: res.error || "Failed to update homepage settings" });
    }
  };

  if (!homeSettings || !siteSettings) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
        Loading website configuration...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.85rem", color: "#0F172A", fontWeight: 800, marginBottom: "6px" }}>
          Website &amp; Business Configuration
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.92rem" }}>
          Manage dynamic logos, browser favicon, SEO meta tags, multiple phone numbers &amp; emails, address branches, and homepage content.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "12px",
            backgroundColor: feedback.success ? "#ECFDF5" : "#FEF2F2",
            color: feedback.success ? "#059669" : "#DC2626",
            fontSize: "0.92rem",
            fontWeight: 600,
            marginBottom: "24px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab("brand_seo"); setFeedback(null); }}
          className={`abid-btn ${activeTab === "brand_seo" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          <Globe size={17} />
          <span>Brand Identity &amp; SEO</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("contact_channels"); setFeedback(null); }}
          className={`abid-btn ${activeTab === "contact_channels" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          <Building2 size={17} />
          <span>Address, Phones &amp; Emails</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("homepage"); setFeedback(null); }}
          className={`abid-btn ${activeTab === "homepage" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          <Home size={17} />
          <span>Homepage Hero &amp; Story</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("promos_weekly"); setFeedback(null); }}
          className={`abid-btn ${activeTab === "promos_weekly" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          <Tag size={17} />
          <span>Promos, Deals &amp; CTA Offer</span>
        </button>
      </div>

      {/* TAB 1: Brand Identity & SEO */}
      {activeTab === "brand_seo" && (
        <div className="abid-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSaveBrandAndContact}>
            {/* Hidden fields for other tab preservation */}
            <input type="hidden" name="company_address" value={siteSettings.company_address || ""} />
            <input type="hidden" name="company_address_secondary" value={siteSettings.company_address_secondary || ""} />
            <input type="hidden" name="working_hours" value={siteSettings.working_hours || ""} />
            <input type="hidden" name="footer_about" value={siteSettings.footer_about || ""} />
            <input type="hidden" name="facebook_url" value={siteSettings.facebook_url || ""} />
            <input type="hidden" name="twitter_url" value={siteSettings.twitter_url || ""} />
            <input type="hidden" name="youtube_url" value={siteSettings.youtube_url || ""} />
            <input type="hidden" name="linkedin_url" value={siteSettings.linkedin_url || ""} />
            <input type="hidden" name="whatsapp_number" value={siteSettings.whatsapp_number || ""} />
            <input type="hidden" name="emergency_contact" value={siteSettings.emergency_contact || ""} />

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Globe size={22} color="var(--dash-accent)" />
              <h3 style={{ fontSize: "1.3rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                Brand Identity &amp; Title Configuration
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="site_name" style={{ color: "#334155", fontWeight: 600 }}>
                  Website / Brand Name *
                </label>
                <input
                  type="text"
                  id="site_name"
                  name="site_name"
                  required
                  defaultValue={siteSettings.site_name || "Wall Street Interiors"}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Displayed across header, footer &amp; copyright text</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tagline" style={{ color: "#334155", fontWeight: 600 }}>
                  Company Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  defaultValue={siteSettings.tagline || "Bespoke Living, Crafted Spaces & B2B Wholesale Interiors"}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>
            </div>

            {/* Visual Assets (Logos & Favicon) */}
            <div style={{ margin: "32px 0 20px 0", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <ImageIcon size={20} color="var(--dash-accent-cyan)" />
                <h4 style={{ fontSize: "1.15rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                  Dynamic Brand Logos &amp; Browser Favicon
                </h4>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "20px" }}>
                Upload or specify the image URLs for your header logo, footer light logo, and browser tab icon.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <div>
                  <ImageUploader
                    value={siteLogo}
                    onChange={setSiteLogo}
                    label="Main Header Logo (SVG / PNG)"
                    name="site_logo"
                  />
                  <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#64748B" }}>
                    Recommended: Transparent PNG or SVG (height ~40-50px)
                  </div>
                </div>

                <div>
                  <ImageUploader
                    value={siteLogoWhite}
                    onChange={setSiteLogoWhite}
                    label="Footer / White Logo (SVG / PNG)"
                    name="site_logo_white"
                  />
                  <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#64748B" }}>
                    Recommended: Inverted / White SVG or PNG for dark background
                  </div>
                </div>

                <div>
                  <ImageUploader
                    value={siteFavicon}
                    onChange={setSiteFavicon}
                    label="Browser Tab Favicon (PNG / ICO)"
                    name="site_favicon"
                  />
                  <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#64748B" }}>
                    Recommended: Square 32x32 or 64x64 PNG / ICO
                  </div>
                </div>
              </div>
            </div>

            {/* Search Engine Optimization (SEO) */}
            <div style={{ margin: "32px 0 20px 0", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Star size={20} color="var(--dash-accent-purple)" />
                <h4 style={{ fontSize: "1.15rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                  Search Engine Optimization (SEO Meta Tags)
                </h4>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="meta_title" style={{ color: "#334155", fontWeight: 600 }}>
                  Global Page Title / SEO Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  defaultValue={siteSettings.meta_title || "Wall Street Interiors | Luxury Interior Architecture, Custom Furniture & B2B Wholesale"}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="meta_description" style={{ color: "#334155", fontWeight: 600 }}>
                  Search Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  rows={3}
                  defaultValue={
                    siteSettings.meta_description ||
                    "Wall Street Interiors is Srinagar's premier studio for bespoke interior architecture, handcrafted luxury furniture, 3D architectural wall panels, and B2B wholesale trade supplies."
                  }
                  className="form-textarea"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="meta_keywords" style={{ color: "#334155", fontWeight: 600 }}>
                  SEO Meta Keywords (comma separated)
                </label>
                <input
                  type="text"
                  id="meta_keywords"
                  name="meta_keywords"
                  defaultValue={
                    siteSettings.meta_keywords ||
                    "Wall Street Interiors, Interior Design Srinagar, Custom Furniture, Wall Paneling, Modular Kitchens, Luxury Home Decor, B2B Interior Wholesale, Architecture Kashmir"
                  }
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button type="submit" disabled={isSaving} className="abid-btn abid-btn-primary" style={{ padding: "12px 28px" }}>
                <Save size={18} />
                <span>{isSaving ? "Saving Configuration..." : "Save Brand & SEO Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Address, Multiple Phones & Multiple Emails */}
      {activeTab === "contact_channels" && (
        <div className="abid-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSaveBrandAndContact}>
            {/* Hidden fields for brand preservation */}
            <input type="hidden" name="site_name" value={siteSettings.site_name || ""} />
            <input type="hidden" name="tagline" value={siteSettings.tagline || ""} />
            <input type="hidden" name="meta_title" value={siteSettings.meta_title || ""} />
            <input type="hidden" name="meta_description" value={siteSettings.meta_description || ""} />
            <input type="hidden" name="meta_keywords" value={siteSettings.meta_keywords || ""} />

            {/* Section: Multiple Phone Numbers */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Phone size={22} color="var(--dash-accent)" />
                    <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                      Dynamic Phone Numbers
                    </h3>
                  </div>
                  <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                    Add multiple hotline numbers, direct workshop lines, or WhatsApp numbers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="abid-btn"
                  style={{
                    background: "rgba(255, 64, 53, 0.12)",
                    border: "1px solid rgba(255, 64, 53, 0.3)",
                    color: "#FF4035",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={16} />
                  <span>Add Another Phone Number</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {phoneList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: item.is_primary ? "#FFF5F5" : "#F8FAFC",
                      border: item.is_primary ? "1px solid #FECACA" : "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: item.is_primary ? "0 4px 15px rgba(255, 64, 53, 0.08)" : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Phone number"
                        value={item.number}
                        onChange={(e) => handleUpdatePhone(item.id, "number", e.target.value)}
                        className="form-input"
                        style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                      />
                    </div>

                    <div style={{ minWidth: "180px", flex: 1 }}>
                      <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                        Department / Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 24/7 Hotline, WhatsApp, Support"
                        value={item.label}
                        onChange={(e) => handleUpdatePhone(item.id, "label", e.target.value)}
                        className="form-input"
                        style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px" }}>
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryPhone(item.id)}
                        className={`abid-btn ${item.is_primary ? "abid-btn-primary" : "abid-btn-secondary"}`}
                        style={{ padding: "7px 14px", fontSize: "0.8rem" }}
                        title="Set as primary phone shown in header bar"
                      >
                        {item.is_primary ? "★ Primary Number" : "Set Primary"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePhone(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                        title="Delete phone number"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Multiple Email Addresses */}
            <div style={{ marginBottom: "36px", borderTop: "1px solid #E2E8F0", paddingTop: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Mail size={22} color="var(--dash-accent-cyan)" />
                    <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                      Dynamic Email Addresses
                    </h3>
                  </div>
                  <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                    Add support mailboxes, sales inquiries, or priority repair communications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="abid-btn"
                  style={{
                    background: "rgba(2, 132, 199, 0.12)",
                    border: "1px solid rgba(2, 132, 199, 0.3)",
                    color: "var(--dash-accent-cyan)",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={16} />
                  <span>Add Another Email Address</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {emailList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: item.is_primary ? "#F0FDF4" : "#F8FAFC",
                      border: item.is_primary ? "1px solid #BBF7D0" : "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: item.is_primary ? "0 4px 15px rgba(16, 185, 129, 0.08)" : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={item.email}
                        onChange={(e) => handleUpdateEmail(item.id, "email", e.target.value)}
                        className="form-input"
                        style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                      />
                    </div>

                    <div style={{ minWidth: "180px", flex: 1 }}>
                      <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                        Department / Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Client Inquiries, B2B Wholesale, Projects"
                        value={item.label}
                        onChange={(e) => handleUpdateEmail(item.id, "label", e.target.value)}
                        className="form-input"
                        style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px" }}>
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryEmail(item.id)}
                        className={`abid-btn ${item.is_primary ? "abid-btn-primary" : "abid-btn-secondary"}`}
                        style={{ padding: "7px 14px", fontSize: "0.8rem" }}
                        title="Set as primary email address"
                      >
                        {item.is_primary ? "★ Primary Email" : "Set Primary"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                        title="Delete email"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Physical Addresses & Operating Hours */}
            <div style={{ marginBottom: "36px", borderTop: "1px solid #E2E8F0", paddingTop: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Building2 size={22} color="var(--dash-accent-purple)" />
                <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                  Business Address &amp; Operating Hours
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="company_address" style={{ color: "#334155", fontWeight: 600 }}>
                    Primary Workshop &amp; Office Address *
                  </label>
                  <input
                    type="text"
                    id="company_address"
                    name="company_address"
                    required
                    defaultValue={siteSettings.company_address || ""}
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="company_address_secondary" style={{ color: "#334155", fontWeight: 600 }}>
                    Secondary Branch / Lab Address
                  </label>
                  <input
                    type="text"
                    id="company_address_secondary"
                    name="company_address_secondary"
                    defaultValue={siteSettings.company_address_secondary || ""}
                    placeholder="Secondary branch or studio address"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="working_hours" style={{ color: "#334155", fontWeight: 600 }}>
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    id="working_hours"
                    name="working_hours"
                    defaultValue={siteSettings.working_hours || ""}
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="whatsapp_number" style={{ color: "#334155", fontWeight: 600 }}>
                    WhatsApp Official Contact
                  </label>
                  <input
                    type="text"
                    id="whatsapp_number"
                    name="whatsapp_number"
                    defaultValue={siteSettings.whatsapp_number || ""}
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="footer_about" style={{ color: "#334155", fontWeight: 600 }}>
                  Footer Brand Description
                </label>
                <textarea
                  id="footer_about"
                  name="footer_about"
                  rows={3}
                  defaultValue={siteSettings.footer_about || ""}
                  className="form-textarea"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div style={{ marginBottom: "36px", borderTop: "1px solid #E2E8F0", paddingTop: "28px" }}>
              <h4 style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 700, marginBottom: "16px" }}>
                Social Profiles &amp; External Channels
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="facebook_url" style={{ color: "#334155" }}>Facebook Profile URL</label>
                  <input type="text" id="facebook_url" name="facebook_url" defaultValue={siteSettings.facebook_url || ""} className="form-input" style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="twitter_url" style={{ color: "#334155" }}>X / Twitter URL</label>
                  <input type="text" id="twitter_url" name="twitter_url" defaultValue={siteSettings.twitter_url || ""} className="form-input" style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="linkedin_url" style={{ color: "#334155" }}>LinkedIn URL</label>
                  <input type="text" id="linkedin_url" name="linkedin_url" defaultValue={siteSettings.linkedin_url || ""} className="form-input" style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="youtube_url" style={{ color: "#334155" }}>YouTube Channel</label>
                  <input type="text" id="youtube_url" name="youtube_url" defaultValue={siteSettings.youtube_url || ""} className="form-input" style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button type="submit" disabled={isSaving} className="abid-btn abid-btn-primary" style={{ padding: "12px 28px" }}>
                <Save size={18} />
                <span>{isSaving ? "Saving Configuration..." : "Save Contact Channels & Details"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Homepage Hero & Story */}
      {activeTab === "homepage" && (
        <div className="abid-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSaveHomepage}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Home size={22} color="var(--dash-accent)" />
                <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#0F172A", fontWeight: 700 }}>
                  Hero Showcase Section Configuration
                </h3>
              </div>
              <span style={{ fontSize: "0.82rem", background: "#EFF6FF", color: "#2563EB", padding: "6px 14px", borderRadius: "20px", fontWeight: 600 }}>
                Homepage Master Controls
              </span>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div
              style={{
                marginBottom: "32px",
                padding: "24px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)",
                border: "1px solid #FFE4E6",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#E11D48", fontWeight: 700, fontSize: "0.88rem" }}>
                <Eye size={18} />
                <span>Showcase Card Layout Preview</span>
              </div>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxWidth: "520px",
                }}
              >
                {homeSettings.hero_badge ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                    <Tag size={14} color="#EF4444" />
                    <span>{homeSettings.hero_badge}</span>
                  </div>
                ) : null}
                <h4 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>
                  {homeSettings.hero_title || "Bespoke Luxury Interiors & Custom Furniture"}
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", lineHeight: 1.5 }}>
                  {homeSettings.hero_subtitle || "Curating refined living spaces and bespoke architectural furnishings with timeless craftsmanship."}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    marginTop: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Price</span>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A" }}>
                      {homeSettings.hero_price || "₹45,500"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Colors</span>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      {(homeSettings.hero_colors || "#770215,#E9CF10,#35424B").split(",").map((c, i) => (
                        <span key={i} style={{ width: "14px", height: "14px", borderRadius: "50%", background: c.trim(), display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E2E8F0", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                    <Play size={12} fill="#0F172A" color="#0F172A" />
                    <span>Video Popup</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button type="button" className="abid-btn abid-btn-primary" style={{ padding: "8px 18px", fontSize: "0.82rem" }}>
                    {homeSettings.hero_button_text || "Add To Cart"}
                  </button>
                  <button type="button" className="abid-btn abid-btn-secondary" style={{ padding: "8px 18px", fontSize: "0.82rem" }}>
                    {homeSettings.hero_secondary_button_text || "view now"}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: BADGE, HEADINGS & DESCRIPTION */}
            <div style={{ marginBottom: "28px" }}>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="hero_badge" style={{ color: "#334155", fontWeight: 600 }}>
                  <Tag size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  Hero Top Discount Badge Text
                </label>
                <input
                  type="text"
                  id="hero_badge"
                  name="hero_badge"
                  defaultValue={homeSettings.hero_badge}
                  placeholder="Badge text (optional)"
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="hero_title" style={{ color: "#334155", fontWeight: 600 }}>
                  Hero Main Heading / Product Title *
                </label>
                <input
                  type="text"
                  id="hero_title"
                  name="hero_title"
                  required
                  defaultValue={homeSettings.hero_title}
                  placeholder="Main hero headline or featured product title"
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="hero_subtitle" style={{ color: "#334155", fontWeight: 600 }}>
                  Hero Subtitle Paragraph *
                </label>
                <textarea
                  id="hero_subtitle"
                  name="hero_subtitle"
                  required
                  rows={3}
                  defaultValue={homeSettings.hero_subtitle}
                  placeholder="Detailed introductory description paragraph"
                  className="form-textarea"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>
            </div>

            {/* SECTION 2: PRICE, COLOR SWATCHES & VIDEO */}
            <div style={{ marginBottom: "32px", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              <h4 style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <IndianRupee size={18} color="#10B981" />
                Pricing, Color Swatches &amp; Video Media
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hero_price" style={{ color: "#334155", fontWeight: 600 }}>
                    Showcase Product Price
                  </label>
                  <input
                    type="text"
                    id="hero_price"
                    name="hero_price"
                    defaultValue={homeSettings.hero_price || ""}
                    placeholder="Display price (e.g. ₹45,500)"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hero_colors" style={{ color: "#334155", fontWeight: 600 }}>
                    <Palette size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                    Color Dots (Comma-separated Hex)
                  </label>
                  <input
                    type="text"
                    id="hero_colors"
                    name="hero_colors"
                    defaultValue={homeSettings.hero_colors || ""}
                    placeholder="Comma-separated hex codes (e.g. #8B5A2B, #D4AF37)"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                  <small style={{ color: "#64748B", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                    Enter hex color codes separated by comma. Example: <code>#770215,#E9CF10,#35424B</code>
                  </small>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hero_video_url" style={{ color: "#334155", fontWeight: 600 }}>
                    <Play size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                    Video Popup URL (YouTube / Embed)
                  </label>
                  <input
                    type="text"
                    id="hero_video_url"
                    name="hero_video_url"
                    defaultValue={homeSettings.hero_video_url || "https://www.youtube.com/watch?v=Cn4G2lZ_g2I"}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div>
                  <ImageUploader
                    value={heroVideoThumb}
                    onChange={setHeroVideoThumb}
                    label="Video Showcase Banner Image (Replaces Drone Photo)"
                    name="hero_video_thumb"
                  />
                  <small style={{ color: "#64748B", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                    Image displayed on the right side of the video showcase section banner on the homepage.
                  </small>
                </div>
              </div>
            </div>

            {/* SECTION 3: CALL TO ACTION BUTTONS */}
            <div style={{ marginBottom: "32px", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              <h4 style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ExternalLink size={18} color="#6366F1" />
                Call-To-Action Buttons
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hero_button_text" style={{ color: "#334155", fontWeight: 600 }}>
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    id="hero_button_text"
                    name="hero_button_text"
                    defaultValue={homeSettings.hero_button_text || ""}
                    placeholder="Button label (e.g. Explore Collection)"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hero_button_link" style={{ color: "#334155", fontWeight: 600 }}>
                    Primary Button Target URL / Anchor
                  </label>
                  <input
                    type="text"
                    id="hero_button_link"
                    name="hero_button_link"
                    defaultValue={homeSettings.hero_button_link || ""}
                    placeholder="Button target URL (e.g. /shop)"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hero_secondary_button_text" style={{ color: "#334155", fontWeight: 600 }}>
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    id="hero_secondary_button_text"
                    name="hero_secondary_button_text"
                    defaultValue={homeSettings.hero_secondary_button_text || ""}
                    placeholder="Secondary button label"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hero_secondary_button_link" style={{ color: "#334155", fontWeight: 600 }}>
                    Secondary Button Target URL / Anchor
                  </label>
                  <input
                    type="text"
                    id="hero_secondary_button_link"
                    name="hero_secondary_button_link"
                    defaultValue={homeSettings.hero_secondary_button_link || ""}
                    placeholder="Secondary target URL (e.g. /contact)"
                    className="form-input"
                    style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SHOWCASE SLIDER GRAPHICS (3 SLIDES) */}
            <div style={{ marginBottom: "32px", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              <h4 style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ImageIcon size={18} color="#EC4899" />
                Hero Slider Showcase Imagery (3 Slides)
              </h4>
              <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "20px" }}>
                Upload or select high-resolution transparent or studio photos for each slide in the auto-cycling hero carousel.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                <ImageUploader
                  value={heroImage}
                  onChange={setHeroImage}
                  label="Slide 1 Showcase Graphic *"
                  name="hero_image"
                />

                <ImageUploader
                  value={heroImage2}
                  onChange={setHeroImage2}
                  label="Slide 2 Showcase Graphic"
                  name="hero_image_2"
                />

                <ImageUploader
                  value={heroImage3}
                  onChange={setHeroImage3}
                  label="Slide 3 Showcase Graphic"
                  name="hero_image_3"
                />
              </div>
            </div>

            <h3 style={{ fontSize: "1.25rem", margin: "32px 0 20px 0", color: "#0F172A", fontWeight: 700, borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              Credibility Counters &amp; Experience
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="years_experience" style={{ color: "#334155" }}>Years in Industry</label>
                <input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  defaultValue={homeSettings.years_experience}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="repairs_completed" style={{ color: "#334155" }}>Repairs Metric</label>
                <input
                  type="text"
                  id="repairs_completed"
                  name="repairs_completed"
                  defaultValue={homeSettings.repairs_completed}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="satisfaction_rate" style={{ color: "#334155" }}>Satisfaction Metric</label>
                <input
                  type="text"
                  id="satisfaction_rate"
                  name="satisfaction_rate"
                  defaultValue={homeSettings.satisfaction_rate}
                  className="form-input"
                  style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: "1.25rem", margin: "32px 0 20px 0", color: "#0F172A", fontWeight: 700, borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
              About Us Story Content
            </h3>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="about_heading" style={{ color: "#334155", fontWeight: 600 }}>About Heading *</label>
              <input
                type="text"
                id="about_heading"
                name="about_heading"
                required
                defaultValue={homeSettings.about_heading}
                className="form-input"
                style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="about_text" style={{ color: "#334155", fontWeight: 600 }}>About Story Text *</label>
              <textarea
                id="about_text"
                name="about_text"
                required
                rows={5}
                defaultValue={homeSettings.about_text}
                className="form-textarea"
                style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
              />
            </div>

            <ImageUploader
              value={aboutImage}
              onChange={setAboutImage}
              label="About Us Photograph"
              name="about_image"
            />

            {/* VALUE PROPOSITION FEATURES SECTION (BELOW CATEGORIES) */}
            <div style={{ margin: "40px 0 20px 0", borderTop: "1px solid #E2E8F0", paddingTop: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#0F172A", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                    <Sparkles size={22} color="#D4AF37" />
                    Value Proposition Features Bar (Below Categories Carousel)
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "0.85rem" }}>
                    Manage the 4-column trust badges that display directly below the categories carousel on your homepage.
                  </p>
                </div>

                {/* Section Toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: featuresEnabled ? "#ECFDF5" : "#F1F5F9", padding: "8px 16px", borderRadius: "24px", border: featuresEnabled ? "1.5px solid #10B981" : "1.5px solid #CBD5E1", transition: "all 0.2s ease" }}>
                  <input
                    type="checkbox"
                    checked={featuresEnabled}
                    onChange={(e) => setFeaturesEnabled(e.target.checked)}
                    style={{ accentColor: "#10B981", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: featuresEnabled ? "#047857" : "#64748B" }}>
                    {featuresEnabled ? "Section Active on Homepage" : "Section Hidden on Homepage"}
                  </span>
                </label>
              </div>

              {/* LIVE PREVIEW OF THE FEATURE CARDS */}
              <div
                style={{
                  marginBottom: "28px",
                  padding: "24px",
                  borderRadius: "16px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.05em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={15} />
                  Live Visual Preview
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
                  {featureList.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          minWidth: "48px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(255, 64, 53, 0.06) 100%)",
                          border: "1.5px solid rgba(212, 175, 55, 0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {renderAdminFeatureIcon(f.icon)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.title || "Feature Title"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.description || "Feature Description"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD EDITORS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                {featureList.map((f, index) => (
                  <div
                    key={f.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1E293B", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem" }}>
                          {index + 1}
                        </span>
                        Feature Card #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(f.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>
                          Heading Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={f.title}
                          onChange={(e) => handleUpdateFeature(f.id, "title", e.target.value)}
                          className="form-input"
                          style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                          placeholder="e.g. High Quality"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>
                          Subtitle Text *
                        </label>
                        <input
                          type="text"
                          required
                          value={f.description}
                          onChange={(e) => handleUpdateFeature(f.id, "description", e.target.value)}
                          className="form-input"
                          style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" }}
                          placeholder="e.g. Crafted from top materials"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>
                        Font Awesome Icon Class / Name (or Image URL) *
                      </label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                        {/* Live icon preview badge */}
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            minWidth: "42px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)",
                            border: "1.5px solid rgba(212, 175, 55, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {renderAdminFeatureIcon(f.icon)}
                        </div>
                        <input
                          type="text"
                          required
                          value={f.icon}
                          onChange={(e) => handleUpdateFeature(f.id, "icon", e.target.value)}
                          className="form-input"
                          style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1", flex: 1 }}
                          placeholder="e.g. fa-solid fa-award or truck-fast"
                        />
                      </div>

                      {/* Quick Font Awesome presets */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#64748B" }}>
                          Quick Select Popular Font Awesome Icons:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {POPULAR_FA_ICONS.map((preset) => {
                            const isSelected =
                              f.icon?.trim() === preset.class ||
                              f.icon?.trim() === preset.class.replace("fa-solid fa-", "");
                            return (
                              <button
                                key={preset.class}
                                type="button"
                                onClick={() => handleUpdateFeature(f.id, "icon", preset.class)}
                                title={preset.label}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  border: isSelected ? "2px solid #D4AF37" : "1px solid #E2E8F0",
                                  backgroundColor: isSelected ? "#FEF9C3" : "#F8FAFC",
                                  color: isSelected ? "#854D0E" : "#334155",
                                  cursor: "pointer",
                                  fontSize: "0.78rem",
                                  fontWeight: isSelected ? 700 : 500,
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <i className={preset.class} style={{ fontSize: "14px", color: isSelected ? "#B45309" : "#D4AF37" }}></i>
                                <span>{preset.label.split(" / ")[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="abid-btn abid-btn-secondary"
                    style={{ fontSize: "0.85rem", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Plus size={16} />
                    <span>Add New Feature Card</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button type="submit" disabled={isSaving} className="abid-btn abid-btn-primary" style={{ padding: "12px 28px" }}>
                <Save size={18} />
                <span>{isSaving ? "Saving Settings..." : "Save Homepage Content"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Promos & Weekly Deals */}
      {activeTab === "promos_weekly" && (
        <PromosWeeklySettings />
      )}
    </div>
  );
}
