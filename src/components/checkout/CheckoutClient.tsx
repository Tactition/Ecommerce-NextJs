"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { useDealerAuth } from "@/components/auth/DealerAuthProvider";
import { createOrderAction, PlacedOrder, getOrderByNumberAction } from "@/lib/actions/orders";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
];

const VALID_COUPONS: Record<string, { percent: number; label: string }> = {
  WELCOME10: { percent: 10, label: "Welcome First Order Privilege (10% Off)" },
  LUXURY15: { percent: 15, label: "Architectural Project Special (15% Off)" },
  VIP20: { percent: 20, label: "VIP Designer Guild Privilege (20% Off)" },
};

export default function CheckoutClient() {
  const router = useRouter();
  const { dealer, isApproved: isDealerApproved } = useDealerAuth();

  // Cart state
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form Fields - Billing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Delhi NCR");
  const [postalCode, setPostalCode] = useState("");
  const [country] = useState("India");

  // Shipping
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [shippingFirstName, setShippingFirstName] = useState("");
  const [shippingLastName, setShippingLastName] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("Delhi NCR");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Notes
  const [orderNotes, setOrderNotes] = useState("");

  // Payment & Terms
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card" | "bank_transfer">("cod");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Validation & Processing
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confirmation view
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrder | null>(null);

  // Load cart and check for existing orderNumber in URL
  useEffect(() => {
    try {
      const stored = getCart();
      setItems(Array.isArray(stored) ? stored : []);

      // If URL has orderNumber param, load that confirmed order
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const orderNum = params.get("orderNumber");
        if (orderNum) {
          getOrderByNumberAction(orderNum).then((ord) => {
            if (ord) setConfirmedOrder(ord);
          });
        }
      }
    } catch (e) {
      console.error("Failed to load cart for checkout", e);
    } finally {
      setIsLoaded(true);
    }

    const handleCartSync = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setItems(e.detail);
      } else {
        const stored = getCart();
        setItems(Array.isArray(stored) ? stored : []);
      }
    };

    window.addEventListener("cart-updated", handleCartSync);
    return () => window.removeEventListener("cart-updated", handleCartSync);
  }, []);

  // Pre-fill dealer profile details when logged in as approved trade partner
  useEffect(() => {
    if (isDealerApproved && dealer) {
      if (dealer.companyName && !companyName) setCompanyName(dealer.companyName);
      if (dealer.gstNumber && !gstin) setGstin(dealer.gstNumber);
      if (dealer.email && !email) setEmail(dealer.email);
      if (dealer.contactName && !firstName) {
        const parts = dealer.contactName.trim().split(" ");
        setFirstName(parts[0] || dealer.companyName);
        if (parts.length > 1) {
          setLastName(parts.slice(1).join(" "));
        } else {
          setLastName("Trade Partner");
        }
      }
    }
  }, [isDealerApproved, dealer, companyName, gstin, email, firstName]);

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const shippingFee = 0; // Complimentary White-Glove
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg({ type: "error", text: "Please enter a coupon code." });
      return;
    }
    if (VALID_COUPONS[code]) {
      const c = VALID_COUPONS[code];
      setAppliedCoupon(code);
      setDiscountPercent(c.percent);
      setCouponMsg({
        type: "success",
        text: `Coupon "${code}" applied: ${c.label}`,
      });
    } else {
      setCouponMsg({
        type: "error",
        text: `Invalid promo code "${code}". Try WELCOME10, LUXURY15, or VIP20.`,
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    setCouponCode("");
    setCouponMsg(null);
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone number is required.";
    } else if (cleanPhone.length < 10) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (!addressLine1.trim()) errors.addressLine1 = "Street address is required.";
    if (!city.trim()) errors.city = "City / Town is required.";
    if (!state.trim()) errors.state = "State is required.";

    const cleanPin = postalCode.trim();
    if (!cleanPin) {
      errors.postalCode = "PIN / Postal code is required.";
    } else if (cleanPin.length < 5 || cleanPin.length > 7) {
      errors.postalCode = "Enter a valid 6-digit PIN code.";
    }

    if (gstin.trim() && gstin.trim().length !== 15) {
      errors.gstin = "GSTIN must be 15 alphanumeric characters.";
    }

    if (shipToDifferent) {
      if (!shippingFirstName.trim()) errors.shippingFirstName = "Recipient first name is required.";
      if (!shippingLastName.trim()) errors.shippingLastName = "Recipient last name is required.";
      if (!shippingAddressLine1.trim()) errors.shippingAddressLine1 = "Delivery street address is required.";
      if (!shippingCity.trim()) errors.shippingCity = "Delivery city is required.";
      if (!shippingState.trim()) errors.shippingState = "Delivery state is required.";
      if (!shippingPostalCode.trim() || shippingPostalCode.trim().length < 5) {
        errors.shippingPostalCode = "Valid delivery PIN code is required.";
      }
    }

    if (!agreedToTerms) {
      errors.terms = "You must agree to the Terms & Conditions and Privacy Policy to place your order.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Your cart is empty. Please add products before checking out.");
      return;
    }

    // Strict B2B Dealer MOQ verification
    if (isDealerApproved) {
      const violatedItem = items.find((i) => i.quantity < Math.max(1, Number(i.moq) || 1));
      if (violatedItem) {
        const requiredMoq = Math.max(1, Number(violatedItem.moq) || 1);
        setSubmitError(`Cannot place order: "${violatedItem.name}" requires a minimum B2B order of ${requiredMoq} units (currently ${violatedItem.quantity}). Please return to cart and update the quantity.`);
        window.scrollTo({ top: 300, behavior: "smooth" });
        return;
      }
    }

    if (!validateForm()) {
      setSubmitError("Please review and fill in all required fields marked in red.");
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        firstName,
        lastName,
        companyName: companyName.trim() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
        email,
        phone,
        addressLine1,
        addressLine2: addressLine2.trim() || undefined,
        city,
        state,
        postalCode,
        country,
        shipToDifferent,
        shippingFirstName: shipToDifferent ? shippingFirstName : undefined,
        shippingLastName: shipToDifferent ? shippingLastName : undefined,
        shippingAddressLine1: shipToDifferent ? shippingAddressLine1 : undefined,
        shippingAddressLine2: shipToDifferent ? shippingAddressLine2 : undefined,
        shippingCity: shipToDifferent ? shippingCity : undefined,
        shippingState: shipToDifferent ? shippingState : undefined,
        shippingPostalCode: shipToDifferent ? shippingPostalCode : undefined,
        shippingCountry: shipToDifferent ? "India" : undefined,
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variationId: i.variationId || null,
          name: i.name,
          slug: i.slug,
          image: i.image,
          sku: i.sku || null,
          price: i.price,
          quantity: i.quantity,
          attributes: i.attributes,
          customDetails: i.customDetails,
        })),
      };

      const res = await createOrderAction(orderPayload);

      if (!res.success || !res.orderNumber) {
        setSubmitError(res.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Fetch saved order details for confirmation receipt
      const placed = await getOrderByNumberAction(res.orderNumber);

      // Clear cart
      clearCart();

      if (placed) {
        setConfirmedOrder(placed);
      } else {
        // Fallback reconstructed order object
        setConfirmedOrder({
          id: res.orderId || 0,
          order_number: res.orderNumber,
          first_name: firstName,
          last_name: lastName,
          company_name: companyName || null,
          gstin: gstin || null,
          email,
          phone,
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
          city,
          state,
          postal_code: postalCode,
          country,
          ship_to_different: shipToDifferent,
          shipping_first_name: shippingFirstName || null,
          shipping_last_name: shippingLastName || null,
          shipping_address_line1: shippingAddressLine1 || null,
          shipping_address_line2: shippingAddressLine2 || null,
          shipping_city: shippingCity || null,
          shipping_state: shippingState || null,
          shipping_postal_code: shippingPostalCode || null,
          shipping_country: "India",
          order_notes: orderNotes || null,
          subtotal,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon,
          shipping_fee: shippingFee,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: "pending",
          order_status: "confirmed",
          created_at: new Date().toISOString(),
          items: items.map((i, idx) => ({
            id: idx + 1,
            product_id: i.productId,
            variation_id: i.variationId || null,
            product_name: i.name,
            product_slug: i.slug,
            product_image: i.image || null,
            sku: i.sku || null,
            price: i.price,
            quantity: i.quantity,
            total_price: i.price * i.quantity,
            attributes: i.attributes || null,
            custom_details: i.customDetails || null,
          })),
        });
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Order submit exception", err);
      setSubmitError(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "450px" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </div>
        <p className="mt-3 text-muted">Securing your checkout session...</p>
      </div>
    );
  }

  // 1. ORDER CONFIRMED VIEW
  if (confirmedOrder) {
    const isCOD = confirmedOrder.payment_method === "cod";
    const isBank = confirmedOrder.payment_method === "bank_transfer";
    const paymentLabel = isCOD
      ? "Cash / Pay on Delivery"
      : isBank
      ? "Direct Bank Transfer (NEFT/RTGS)"
      : "Card / UPI Gateway";

    const whatsappText = encodeURIComponent(
      `Hello Wall Street Interiors,\nI placed order #${confirmedOrder.order_number} for ₹${confirmedOrder.total_amount.toLocaleString(
        "en-IN"
      )}. Please share dispatch updates and architectural timeline.`
    );

    return (
      <section className="checkout-confirmed-section py-5" style={{ backgroundColor: "#F8FAFC", minHeight: "80vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9 col-md-11">
              {/* Luxury Success Banner */}
              <div
                className="bg-white rounded-4 p-4 p-md-5 shadow-sm text-center mb-4"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    fontSize: "2.5rem",
                  }}
                >
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h1 className="fw-bold mb-2" style={{ color: "#0F172A", fontSize: "2rem" }}>
                  Order Confirmed!
                </h1>
                <p className="text-muted mb-3" style={{ fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
                  Thank you, <strong>{confirmedOrder.first_name} {confirmedOrder.last_name}</strong>. Your bespoke architectural furnishing order has been received and registered with our concierge.
                </p>

                <div
                  className="d-inline-block px-4 py-2 rounded-3 mb-4"
                  style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}
                >
                  <span className="text-secondary me-2 text-uppercase" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
                    Order Number
                  </span>
                  <span className="fw-bold" style={{ color: "#F59E0B", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                    {confirmedOrder.order_number}
                  </span>
                </div>

                {/* Bank Transfer Instructions Callout */}
                {isBank && (
                  <div
                    className="alert text-start mb-4 p-4 rounded-3"
                    style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E" }}
                  >
                    <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
                      <i className="fa-solid fa-building-columns"></i>
                      Direct Bank Transfer Details
                    </h5>
                    <p className="small mb-3">
                      Please transfer the grand total of <strong>₹{confirmedOrder.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> directly into our corporate account using your Order Number as the transfer reference:
                    </p>
                    <div className="bg-white p-3 rounded-2 small text-dark fw-semibold" style={{ border: "1px solid #FDE68A" }}>
                      <div className="row g-2">
                        <div className="col-sm-6">Account Name: <strong>Wall Street Interiors Pvt Ltd</strong></div>
                        <div className="col-sm-6">Bank: <strong>HDFC Bank</strong></div>
                        <div className="col-sm-6">Account Number: <strong>50200084920194</strong></div>
                        <div className="col-sm-6">IFSC Code: <strong>HDFC0001234</strong></div>
                        <div className="col-sm-12">Branch: <strong>Connaught Place, New Delhi - 110001</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline-dark px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
                  >
                    <i className="fa-solid fa-print"></i>
                    Print / Save Receipt
                  </button>
                  <Link
                    href="/profile"
                    className="btn px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2 text-white"
                    style={{ backgroundColor: "#FF4035", borderColor: "#FF4035" }}
                  >
                    <i className="fa-solid fa-user-check"></i>
                    Track in My Account
                  </Link>
                  <Link
                    href="/shop"
                    className="btn px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2 text-white"
                    style={{ backgroundColor: "#0F172A" }}
                  >
                    <i className="fa-solid fa-bag-shopping"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Details Breakdown Card */}
              <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm" style={{ border: "1px solid #E2E8F0" }}>
                <h4 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: "#0F172A" }}>
                  Order Summary & Specification
                </h4>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <h6 className="text-uppercase text-muted fw-bold small" style={{ letterSpacing: "1px" }}>
                      Billing & Customer Information
                    </h6>
                    <p className="mb-1 fw-bold text-dark">{confirmedOrder.first_name} {confirmedOrder.last_name}</p>
                    {confirmedOrder.company_name && (
                      <p className="mb-1 text-muted small">Company: {confirmedOrder.company_name}</p>
                    )}
                    {confirmedOrder.gstin && (
                      <p className="mb-1 text-muted small">GSTIN: {confirmedOrder.gstin}</p>
                    )}
                    <p className="mb-1 text-muted small">{confirmedOrder.email}</p>
                    <p className="mb-1 text-muted small">{confirmedOrder.phone}</p>
                    <p className="mb-0 text-muted small">
                      {confirmedOrder.address_line1}
                      {confirmedOrder.address_line2 ? `, ${confirmedOrder.address_line2}` : ""},{" "}
                      {confirmedOrder.city}, {confirmedOrder.state} - {confirmedOrder.postal_code}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-uppercase text-muted fw-bold small" style={{ letterSpacing: "1px" }}>
                      Delivery & Logistics
                    </h6>
                    {confirmedOrder.ship_to_different ? (
                      <>
                        <p className="mb-1 fw-bold text-dark">
                          {confirmedOrder.shipping_first_name} {confirmedOrder.shipping_last_name}
                        </p>
                        <p className="mb-1 text-muted small">
                          {confirmedOrder.shipping_address_line1}
                          {confirmedOrder.shipping_address_line2 ? `, ${confirmedOrder.shipping_address_line2}` : ""},{" "}
                          {confirmedOrder.shipping_city}, {confirmedOrder.shipping_state} - {confirmedOrder.shipping_postal_code}
                        </p>
                      </>
                    ) : (
                      <p className="mb-1 text-muted small">Delivering to billing address</p>
                    )}
                    <div className="mt-2 pt-2 border-top">
                      <p className="mb-1 small">
                        <strong>Payment Method:</strong> {paymentLabel}
                      </p>
                      <p className="mb-1 small">
                        <strong>Logistics Service:</strong> Complimentary White-Glove Pan-India Architectural Delivery
                      </p>
                      {confirmedOrder.order_notes && (
                        <p className="mb-0 small text-muted">
                          <strong>Site Instructions:</strong> "{confirmedOrder.order_notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table align-middle">
                    <thead style={{ backgroundColor: "#F8FAFC" }}>
                      <tr>
                        <th style={{ width: "80px" }}>Item</th>
                        <th>Product & Specification</th>
                        <th className="text-center" style={{ width: "80px" }}>Qty</th>
                        <th className="text-end" style={{ width: "130px" }}>Rate</th>
                        <th className="text-end" style={{ width: "130px" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedOrder.items.map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td>
                              <div
                                className="rounded overflow-hidden"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  backgroundColor: "#F1F5F9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {item.product_image ? (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    loading="lazy"
                                    decoding="async"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <i className="fa-light fa-image text-muted"></i>
                                )}
                              </div>
                            </td>
                            <td>
                              <h6 className="mb-1 fw-bold" style={{ fontSize: "0.95rem" }}>
                                {item.product_name}
                              </h6>
                              {item.sku && (
                                <p className="mb-1 text-muted small" style={{ fontSize: "0.78rem" }}>
                                  SKU: {item.sku}
                                </p>
                              )}
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                  {Object.entries(item.attributes).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="badge bg-light text-dark border small fw-normal"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      <strong>{k}:</strong> {v}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="text-center fw-bold">{item.quantity}</td>
                            <td className="text-end text-muted small">
                              ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-end fw-bold text-dark">
                              ₹{item.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals */}
                <div className="row justify-content-end">
                  <div className="col-md-5">
                    <div className="p-3 rounded-3" style={{ backgroundColor: "#F8FAFC" }}>
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>Subtotal</span>
                        <span className="fw-semibold text-dark">
                          ₹{confirmedOrder.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {confirmedOrder.discount_amount > 0 && (
                        <div className="d-flex justify-content-between mb-2 small text-success">
                          <span>
                            Discount {confirmedOrder.coupon_code ? `(${confirmedOrder.coupon_code})` : ""}
                          </span>
                          <span className="fw-semibold">
                            - ₹{confirmedOrder.discount_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>White-Glove Delivery</span>
                        <span className="fw-semibold text-success">Complimentary (₹0.00)</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top mt-2">
                        <span className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                          Grand Total
                        </span>
                        <span className="fw-bold" style={{ color: "#0F172A", fontSize: "1.25rem" }}>
                          ₹{confirmedOrder.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. EMPTY CART VIEW
  if (items.length === 0) {
    return (
      <section className="checkout-empty-section py-5 text-center" style={{ minHeight: "65vh" }}>
        <div className="container py-5">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{
              width: "90px",
              height: "90px",
              backgroundColor: "#F1F5F9",
              color: "#64748B",
              fontSize: "2.5rem",
            }}
          >
            <i className="fa-light fa-bag-shopping"></i>
          </div>
          <h2 className="fw-bold mb-2" style={{ color: "#0F172A" }}>
            Your Cart is Empty
          </h2>
          <p className="text-muted mb-4" style={{ maxWidth: "480px", margin: "0 auto" }}>
            There are no furnishings or architectural items in your bag. Explore our bespoke catalog to select pieces for checkout.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link
              href="/shop"
              className="btn px-4 py-2 rounded-3 text-white fw-semibold"
              style={{ backgroundColor: "#0F172A" }}
            >
              Explore Shop
            </Link>
            <Link href="/" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 3. MAIN CHECKOUT FORM
  return (
    <section className="checkout-page-section py-5" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="container">
        {/* Step Indicator Header */}
        <div className="d-flex align-items-center justify-content-between pb-4 mb-4 border-bottom flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#0F172A" }}>
              Secure Checkout
            </h2>
            <p className="text-muted small mb-0">
              White-glove architectural delivery & bespoke interior furnishings
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 small text-muted">
            <span className="badge bg-secondary text-white rounded-pill px-3 py-2">
              <i className="fa-solid fa-lock me-1"></i> 256-Bit SSL Encrypted
            </span>
            <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
              <i className="fa-solid fa-truck-ramp-box me-1 text-success"></i> Pan-India Insured
            </span>
          </div>
        </div>

        {/* Global error banner if submission fails */}
        {submitError && (
          <div className="alert alert-danger d-flex align-items-center gap-3 mb-4 rounded-3 p-3">
            <i className="fa-solid fa-triangle-exclamation fs-4"></i>
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="row g-4">
            {/* Left Column: Customer & Address Information (7 Cols) */}
            <div className="col-lg-7">
              {/* Contact Information */}
              <div className="bg-white rounded-4 p-4 p-md-4 shadow-sm mb-4" style={{ border: "1px solid #E2E8F0" }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#0F172A" }}>
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                    style={{ width: "26px", height: "26px", fontSize: "0.8rem" }}
                  >
                    1
                  </span>
                  Contact Information
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      required
                    />
                    {validationErrors.email ? (
                      <div className="invalid-feedback">{validationErrors.email}</div>
                    ) : (
                      <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                        Order confirmation and tracking will be sent here.
                      </span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      Contact Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${validationErrors.phone ? "is-invalid" : ""}`}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      required
                    />
                    {validationErrors.phone ? (
                      <div className="invalid-feedback">{validationErrors.phone}</div>
                    ) : (
                      <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                        For dispatch logistics and delivery coordination.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-4 p-4 p-md-4 shadow-sm mb-4" style={{ border: "1px solid #E2E8F0" }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#0F172A" }}>
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                    style={{ width: "26px", height: "26px", fontSize: "0.8rem" }}
                  >
                    2
                  </span>
                  Billing Details
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.firstName ? "is-invalid" : ""}`}
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (validationErrors.firstName) setValidationErrors((prev) => ({ ...prev, firstName: "" }));
                      }}
                      required
                    />
                    {validationErrors.firstName && (
                      <div className="invalid-feedback">{validationErrors.firstName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.lastName ? "is-invalid" : ""}`}
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (validationErrors.lastName) setValidationErrors((prev) => ({ ...prev, lastName: "" }));
                      }}
                      required
                    />
                    {validationErrors.lastName && (
                      <div className="invalid-feedback">{validationErrors.lastName}</div>
                    )}
                  </div>

                  {/* B2B Firm / Studio (Optional) */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      Company / Studio Name <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Company name (optional)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  {/* GSTIN (Optional) */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      GSTIN / Tax ID <span className="text-muted fw-normal">(For B2B Tax Invoice)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      className={`form-control text-uppercase ${validationErrors.gstin ? "is-invalid" : ""}`}
                      placeholder="15-digit GSTIN"
                      value={gstin}
                      onChange={(e) => {
                        setGstin(e.target.value.toUpperCase());
                        if (validationErrors.gstin) setValidationErrors((prev) => ({ ...prev, gstin: "" }));
                      }}
                    />
                    {validationErrors.gstin && (
                      <div className="invalid-feedback">{validationErrors.gstin}</div>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">
                      Street Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.addressLine1 ? "is-invalid" : ""}`}
                      placeholder="House / Flat / Villa / Building number and street name"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        if (validationErrors.addressLine1) setValidationErrors((prev) => ({ ...prev, addressLine1: "" }));
                      }}
                      required
                    />
                    {validationErrors.addressLine1 && (
                      <div className="invalid-feedback">{validationErrors.addressLine1}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">
                      Apartment, Suite, Unit, Floor <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                  </div>

                  {/* City, State, PIN */}
                  <div className="col-md-5">
                    <label className="form-label small fw-semibold text-dark">
                      Town / City <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.city ? "is-invalid" : ""}`}
                      placeholder="City"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (validationErrors.city) setValidationErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      required
                    />
                    {validationErrors.city && (
                      <div className="invalid-feedback">{validationErrors.city}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">
                      State / Region <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${validationErrors.state ? "is-invalid" : ""}`}
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (validationErrors.state) setValidationErrors((prev) => ({ ...prev, state: "" }));
                      }}
                      required
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {validationErrors.state && (
                      <div className="invalid-feedback">{validationErrors.state}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-dark">
                      PIN Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className={`form-control ${validationErrors.postalCode ? "is-invalid" : ""}`}
                      placeholder="Postal code / PIN"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        if (validationErrors.postalCode) setValidationErrors((prev) => ({ ...prev, postalCode: "" }));
                      }}
                      required
                    />
                    {validationErrors.postalCode && (
                      <div className="invalid-feedback">{validationErrors.postalCode}</div>
                    )}
                  </div>
                </div>

                {/* Ship to different address toggle */}
                <div className="form-check mt-4 pt-3 border-top">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="shipToDifferentCheck"
                    checked={shipToDifferent}
                    onChange={(e) => setShipToDifferent(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold text-dark small" htmlFor="shipToDifferentCheck">
                    Ship to a different project site or recipient address
                  </label>
                </div>

                {/* Collapsible Shipping Address fields */}
                {shipToDifferent && (
                  <div className="mt-3 p-3 rounded-3 bg-light border">
                    <h6 className="fw-bold mb-3 small text-dark">Delivery Site / Recipient Details</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark">
                          Recipient First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${validationErrors.shippingFirstName ? "is-invalid" : ""}`}
                          value={shippingFirstName}
                          onChange={(e) => setShippingFirstName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark">
                          Recipient Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${validationErrors.shippingLastName ? "is-invalid" : ""}`}
                          value={shippingLastName}
                          onChange={(e) => setShippingLastName(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark">
                          Site Street Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${validationErrors.shippingAddressLine1 ? "is-invalid" : ""}`}
                          placeholder="Plot / Site / Flat / Street address"
                          value={shippingAddressLine1}
                          onChange={(e) => setShippingAddressLine1(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark">
                          Floor / Wing / Landmark <span className="text-muted fw-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddressLine2}
                          onChange={(e) => setShippingAddressLine2(e.target.value)}
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold text-dark">
                          City <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${validationErrors.shippingCity ? "is-invalid" : ""}`}
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-dark">
                          State <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold text-dark">
                          PIN Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          className={`form-control form-control-sm ${validationErrors.shippingPostalCode ? "is-invalid" : ""}`}
                          value={shippingPostalCode}
                          onChange={(e) => setShippingPostalCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes / Site Delivery Instructions */}
              <div className="bg-white rounded-4 p-4 shadow-sm mb-4" style={{ border: "1px solid #E2E8F0" }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#0F172A" }}>
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                    style={{ width: "26px", height: "26px", fontSize: "0.8rem" }}
                  >
                    3
                  </span>
                  Architectural Site & Delivery Instructions
                </h5>
                <label className="form-label small text-muted">
                  Specify details such as freight lift access, floor level, site engineer contact, or specific delivery time windows.
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Special instructions or delivery notes (optional)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Right Column: Order Summary & Payment (5 Cols) */}
            <div className="col-lg-5">
              <div
                className="bg-white rounded-4 p-4 shadow-sm sticky-top"
                style={{ top: "100px", border: "1px solid #E2E8F0" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
                    Order Summary
                  </h5>
                  <span className="badge bg-light text-dark border rounded-pill px-2 py-1">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Items List */}
                <div
                  className="checkout-items-list mb-3"
                  style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}
                >
                  {items.map((item) => (
                    <div key={item.id} className="d-flex gap-3 py-2 border-bottom align-items-start">
                      <div
                        className="rounded overflow-hidden flex-shrink-0"
                        style={{
                          width: "56px",
                          height: "56px",
                          backgroundColor: "#F1F5F9",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                            <i className="fa-light fa-image"></i>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1 min-w-0">
                        <h6 className="mb-0 text-truncate fw-semibold small" style={{ color: "#0F172A" }}>
                          {item.name}
                        </h6>
                        <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                          Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>

                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.attributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="badge bg-light text-secondary border px-1 py-0 small fw-normal"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-end fw-bold small text-dark flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      placeholder="Promo / Trade Coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn btn-sm btn-dark px-3"
                    >
                      Apply
                    </button>
                  </div>

                  {couponMsg && (
                    <div
                      className={`small mt-1 ${
                        couponMsg.type === "success" ? "text-success" : "text-danger"
                      }`}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {couponMsg.text}
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="d-flex align-items-center justify-content-between mt-2 p-2 rounded bg-light border small">
                      <span className="text-success fw-semibold">
                        <i className="fa-solid fa-tag me-1"></i> {appliedCoupon} applied ({discountPercent}% off)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="py-2 border-top border-bottom mb-3 small">
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Subtotal</span>
                    <span className="fw-semibold text-dark">
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Trade Discount ({discountPercent}%)</span>
                      <span className="fw-semibold">
                        - ₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Pan-India Logistics</span>
                    <span className="text-success fw-semibold">Complimentary (₹0.00)</span>
                  </div>

                  <div className="d-flex justify-content-between pt-2 border-top">
                    <span className="fw-bold text-dark fs-6">Grand Total</span>
                    <span className="fw-bold fs-5" style={{ color: "#0F172A" }}>
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-muted text-end" style={{ fontSize: "0.72rem" }}>
                    Inclusive of all applicable GST & white-glove packaging
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark text-uppercase mb-2" style={{ letterSpacing: "0.5px" }}>
                    Select Payment Method
                  </label>

                  <div className="d-flex flex-column gap-2">
                    {/* Cash on Delivery */}
                    <label
                      className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === "cod" ? "border-dark bg-light" : "border-light-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1"
                      />
                      <div>
                        <div className="fw-semibold small text-dark d-flex align-items-center gap-2">
                          <i className="fa-solid fa-hand-holding-dollar text-success"></i>
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          Inspect your luxury furnishings at doorstep before completing final payment.
                        </div>
                      </div>
                    </label>

                    {/* Cards & UPI */}
                    <label
                      className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === "upi" ? "border-dark bg-light" : "border-light-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                        className="mt-1"
                      />
                      <div>
                        <div className="fw-semibold small text-dark d-flex align-items-center gap-2">
                          <i className="fa-solid fa-credit-card text-primary"></i>
                          Online Payment (UPI, Cards & NetBanking)
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          Instant checkout via GPay, PhonePe, Cards, and NetBanking.
                        </div>
                      </div>
                    </label>

                    {/* Bank Wire */}
                    <label
                      className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === "bank_transfer" ? "border-dark bg-light" : "border-light-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={() => setPaymentMethod("bank_transfer")}
                        className="mt-1"
                      />
                      <div>
                        <div className="fw-semibold small text-dark d-flex align-items-center gap-2">
                          <i className="fa-solid fa-building-columns text-warning"></i>
                          Direct Bank Transfer (NEFT / RTGS)
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          Recommended for high-value architectural procurement & corporate invoicing.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="form-check mb-4">
                  <input
                    className={`form-check-input ${validationErrors.terms ? "is-invalid" : ""}`}
                    type="checkbox"
                    id="agreedToTermsCheck"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (validationErrors.terms) setValidationErrors((prev) => ({ ...prev, terms: "" }));
                    }}
                    required
                  />
                  <label className="form-check-label small text-muted" htmlFor="agreedToTermsCheck">
                    I have read and agree to the{" "}
                    <Link href="/about" target="_blank" className="text-dark fw-semibold text-decoration-underline">
                      Terms & Conditions
                    </Link>{" "}
                    and Bespoke Return Policy.
                  </label>
                  {validationErrors.terms && (
                    <div className="invalid-feedback d-block">{validationErrors.terms}</div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="theme-btn w-100 text-center py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 text-white"
                  style={{
                    backgroundColor: "#0F172A",
                    borderColor: "#0F172A",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
                    fontSize: "1rem",
                    cursor: isSubmitting ? "wait" : "pointer",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order • ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      <i className="fa-regular fa-arrow-right"></i>
                    </>
                  )}
                </button>

                <div className="mt-3 text-center text-muted" style={{ fontSize: "0.75rem" }}>
                  <i className="fa-solid fa-shield-check text-success me-1"></i>
                  Guaranteed safe checkout with 100% purchase protection
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
