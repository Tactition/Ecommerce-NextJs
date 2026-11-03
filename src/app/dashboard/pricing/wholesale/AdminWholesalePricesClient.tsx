"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  saveProductWholesaleDefaultsAction, 
  addWholesalePriceOverrideAction, 
  deleteWholesalePriceOverrideAction 
} from "@/lib/actions/adminDealers";
import { 
  ArrowLeft, 
  Sliders, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Loader2,
  Save
} from "lucide-react";

export default function AdminWholesalePricesClient({
  products,
  tiers,
  overrides,
}: {
  products: any[];
  tiers: any[];
  overrides: any[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  // Modal for adding a tier override
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 1);
  const [selectedTierId, setSelectedTierId] = useState<number>(tiers[0]?.id || 1);
  const [overridePrice, setOverridePrice] = useState<number>(0);
  const [minQty, setMinQty] = useState<number>(1);
  const [overrideLoading, setOverrideLoading] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSaveDefaults(p: any, defaultWp: number, moq: number, retailPrice?: number) {
    setSavingId(p.id);
    await saveProductWholesaleDefaultsAction(p.id, defaultWp, moq, retailPrice);
    setSavingId(null);
    router.refresh();
  }

  async function handleAddOverride(e: React.FormEvent) {
    e.preventDefault();
    setOverrideLoading(true);

    await addWholesalePriceOverrideAction(
      selectedProductId,
      selectedTierId,
      null,
      overridePrice,
      minQty
    );

    setOverrideLoading(false);
    setShowOverrideModal(false);
    router.refresh();
  }

  async function handleDeleteOverride(id: number) {
    if (!confirm("Are you sure you want to remove this price override?")) return;
    await deleteWholesalePriceOverrideAction(id);
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <Link
            href="/dashboard/dealers"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#64748B",
              textDecoration: "none",
              marginBottom: "6px",
            }}
          >
            <ArrowLeft size={14} /> Back to Dealer Management
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px", fontFamily: "var(--font-heading)" }}>
            Wholesale Pricing & MOQ Matrix
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.85rem", margin: 0 }}>
            Define default wholesale rates, minimum order quantities (MOQ), and tier-specific overrides
          </p>
        </div>

        <button
          onClick={() => setShowOverrideModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #FF4035 0%, #D9251A 100%)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.82rem",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(255, 64, 53, 0.3)",
          }}
        >
          <Plus size={15} /> Add Tier Price Override
        </button>
      </div>

      {/* Overrides Table */}
      {overrides.length > 0 && (
        <div className="b2b-card" style={{ marginBottom: "24px" }}>
          <div className="b2b-card-header">
            <div>
              <h2 className="b2b-card-title">Tier-Specific & Volume Overrides</h2>
              <p className="b2b-card-sub">Active contract overrides and volume breaks</p>
            </div>
          </div>
          <div className="b2b-table-responsive">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Target Tier / Dealer</th>
                  <th style={{ textAlign: "right" }}>Wholesale Price</th>
                  <th style={{ textAlign: "center" }}>Min Quantity</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((ov) => (
                  <tr key={ov.id}>
                    <td>
                      <strong style={{ color: "#0F172A" }}>{ov.product_name}</strong>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#64748B" }}>
                      {ov.tier_name ? `${ov.tier_name}` : ov.dealer_name || "Custom Rule"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "#0F172A" }}>
                      ₹{Number(ov.wholesale_price).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center", color: "#64748B" }}>{ov.min_quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteOverride(ov.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#DC2626",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Catalog Default Wholesale Rates */}
      <div className="b2b-card">
        <div className="b2b-card-header">
          <div>
            <h2 className="b2b-card-title">Product Wholesale Rates & MOQs</h2>
            <p className="b2b-card-sub">Edit default trade rates and minimum order quantities directly</p>
          </div>
          <div style={{ position: "relative", width: "240px" }}>
            <Search size={14} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "8px",
                border: "1.5px solid #E2E8F0",
                fontSize: "0.82rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div className="b2b-table-responsive">
          <table className="b2b-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th style={{ textAlign: "right" }}>Retail MSRP (₹)</th>
                <th style={{ textAlign: "right" }}>Default Wholesale Rate (₹)</th>
                <th style={{ textAlign: "center" }}>Trade Margin</th>
                <th style={{ textAlign: "center" }}>Minimum Order Qty (MOQ)</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                return (
                  <ProductRow
                    key={p.id}
                    product={p}
                    isSaving={savingId === p.id}
                    onSave={handleSaveDefaults}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Override Modal */}
      {showOverrideModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              maxWidth: "460px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0" }}>
              Add Tier Price Override
            </h3>

            <form onSubmit={handleAddOverride} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "0.85rem", boxSizing: "border-box" }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Retail ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                  Select Dealer Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "0.85rem", boxSizing: "border-box" }}
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.discount_percent}% standard)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                    Special Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={overridePrice || ""}
                    onChange={(e) => setOverridePrice(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQty}
                    onChange={(e) => setMinQty(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#FF4035",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {overrideLoading && <Loader2 size={14} className="animate-spin" />}
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  isSaving,
  onSave,
}: {
  product: any;
  isSaving: boolean;
  onSave: (p: any, wp: number, moq: number, retailPrice?: number) => void;
}) {
  const [retailPrice, setRetailPrice] = useState<number>(Number(product.price || 0));
  const [wp, setWp] = useState<number>(Number(product.default_wholesale_price || 0));
  const [moq, setMoq] = useState<number>(Number(product.min_order_quantity || 1));
  const [hasChanged, setHasChanged] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Calculate discount percentage from Retail MSRP to Wholesale Price
  const discountPct =
    retailPrice > 0 && wp > 0 && retailPrice > wp
      ? Math.round(((retailPrice - wp) / retailPrice) * 100)
      : 0;

  const handleSave = () => {
    onSave(product, wp, moq, retailPrice);
    setHasChanged(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <tr style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.2s ease" }}>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                objectFit: "cover",
                border: "1px solid #E2E8F0",
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <strong style={{ color: "#0F172A", fontSize: "0.88rem", display: "block" }}>
              {product.name}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
              {product.category_name || product.category_slug || "Catalog Item"}
            </span>
          </div>
        </div>
      </td>

      {/* Retail MSRP Input */}
      <td style={{ padding: "14px 16px", textAlign: "right" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 600 }}>₹</span>
          <input
            type="number"
            value={retailPrice || ""}
            placeholder="e.g. 2400"
            onChange={(e) => {
              setRetailPrice(Number(e.target.value));
              setHasChanged(true);
            }}
            style={{
              width: "105px",
              padding: "7px 10px",
              textAlign: "right",
              background: "#FFFFFF",
              border: "1.5px solid #CBD5E1",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#334155",
              outline: "none",
            }}
          />
        </div>
      </td>

      {/* Default Wholesale Rate Input */}
      <td style={{ padding: "14px 16px", textAlign: "right" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#FF4035", fontSize: "0.85rem", fontWeight: 700 }}>₹</span>
          <input
            type="number"
            value={wp || ""}
            placeholder="e.g. 1800"
            onChange={(e) => {
              setWp(Number(e.target.value));
              setHasChanged(true);
            }}
            style={{
              width: "115px",
              padding: "7px 10px",
              textAlign: "right",
              background: hasChanged ? "#FEF2F2" : "#FFFFFF",
              border: hasChanged ? "1.5px solid #FF4035" : "1.5px solid #CBD5E1",
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: 800,
              color: "#0F172A",
              outline: "none",
            }}
          />
        </div>
      </td>

      {/* Trade Discount Badge */}
      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        {discountPct > 0 ? (
          <span
            style={{
              display: "inline-block",
              background: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
              borderRadius: "50px",
              padding: "3px 10px",
              fontSize: "0.76rem",
              fontWeight: 700,
            }}
          >
            {discountPct}% Margin
          </span>
        ) : (
          <span style={{ fontSize: "0.76rem", color: "#94A3B8" }}>No Margin</span>
        )}
      </td>

      {/* MOQ Input */}
      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        <input
          type="number"
          min="1"
          value={moq || 1}
          onChange={(e) => {
            setMoq(Number(e.target.value));
            setHasChanged(true);
          }}
          style={{
            width: "65px",
            padding: "7px 8px",
            textAlign: "center",
            background: "#FFFFFF",
            border: "1.5px solid #CBD5E1",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#0F172A",
            outline: "none",
          }}
        />
      </td>

      {/* Save Button */}
      <td style={{ padding: "14px 16px", textAlign: "right" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: justSaved
              ? "#10B981"
              : hasChanged
              ? "linear-gradient(135deg, #FF4035 0%, #D9251A 100%)"
              : "#0F172A",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: isSaving ? "not-allowed" : "pointer",
            boxShadow: hasChanged
              ? "0 4px 12px rgba(255, 64, 53, 0.35)"
              : "0 2px 6px rgba(15, 23, 42, 0.15)",
            transition: "all 0.2s ease",
            minWidth: "105px",
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : justSaved ? (
            <>
              <Check size={14} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save size={13} />
              <span>{hasChanged ? "Save Price" : "Save"}</span>
            </>
          )}
        </button>
      </td>
    </tr>
  );
}
