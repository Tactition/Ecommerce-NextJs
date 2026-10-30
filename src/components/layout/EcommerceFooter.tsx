"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavMenuItem } from "@/lib/actions/menus";
import { ContactNumberItem, ContactEmailItem } from "@/types";

interface EcommerceFooterProps {
  siteLogoWhite?: string;
  siteName?: string;
  footerAbout?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyAddressSecondary?: string;
  phoneNumbers?: ContactNumberItem[];
  emailAddresses?: ContactEmailItem[];
  footerMenus?: NavMenuItem[];
  workingHours?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
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

export default function EcommerceFooter({
  siteLogoWhite = "",
  siteName = "",
  footerAbout = "",
  companyPhone = "",
  companyEmail = "",
  companyAddress = "",
  companyAddressSecondary = "",
  phoneNumbers = [],
  emailAddresses = [],
  footerMenus = [],
  workingHours = "",
  facebookUrl = "",
  twitterUrl = "",
  youtubeUrl = "",
  linkedinUrl = "",
}: EcommerceFooterProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const hasAnyContact = Boolean(companyPhone || companyEmail || workingHours || companyAddress);

  return (
    <footer className="footer-section bg-title" style={{ position: "relative", overflow: "hidden" }}>
      <div className="container" style={{ position: "relative", zIndex: 2, paddingTop: "50px" }}>
        {/* Contact Grid - only render if contact information exists */}
        {hasAnyContact && (
          <div className="wsi-footer-contact-grid">
            {/* Direct Hotlines Card */}
            {companyPhone ? (
              <div className="wsi-footer-contact-card wow fadeInUp" data-wow-delay=".1s">
                <div className="wsi-footer-contact-icon">
                  <i className="fa-solid fa-phone-volume"></i>
                </div>
                <div className="wsi-footer-contact-label">Direct Hotlines</div>
                <h3 className="wsi-footer-contact-title">
                  <a href={`tel:${companyPhone.replace(/\s+/g, "")}`}>{companyPhone}</a>
                </h3>
                {phoneNumbers && phoneNumbers.length > 1 && (
                  <div className="wsi-footer-contact-subs">
                    {phoneNumbers.slice(1, 3).map((p) => (
                      <a
                        key={p.id}
                        href={`tel:${p.number.replace(/\s+/g, "")}`}
                        className="wsi-footer-contact-sub-item"
                      >
                        <span>{p.number}</span>
                        <span className="wsi-footer-contact-pill">{p.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Official Inquiries Card */}
            {companyEmail ? (
              <div className="wsi-footer-contact-card wow fadeInUp" data-wow-delay=".2s">
                <div className="wsi-footer-contact-icon">
                  <i className="fa-regular fa-envelope"></i>
                </div>
                <div className="wsi-footer-contact-label">Official Inquiries</div>
                <h3 className="wsi-footer-contact-title">
                  <a href={`mailto:${companyEmail}`}>{companyEmail}</a>
                </h3>
                {emailAddresses && emailAddresses.length > 1 && (
                  <div className="wsi-footer-contact-subs">
                    {emailAddresses.slice(1, 3).map((e) => (
                      <a
                        key={e.id}
                        href={`mailto:${e.email}`}
                        className="wsi-footer-contact-sub-item"
                      >
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{e.email}</span>
                        <span className="wsi-footer-contact-pill">{e.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Operating Hours Card */}
            {workingHours ? (
              <div className="wsi-footer-contact-card wow fadeInUp" data-wow-delay=".3s">
                <div className="wsi-footer-contact-icon">
                  <i className="fa-regular fa-clock"></i>
                </div>
                <div className="wsi-footer-contact-label">Studio &amp; Workshop Hours</div>
                <h3 className="wsi-footer-contact-title">{workingHours}</h3>
              </div>
            ) : null}

            {/* Location Card */}
            {companyAddress ? (
              <div className="wsi-footer-contact-card wow fadeInUp" data-wow-delay=".4s">
                <div className="wsi-footer-contact-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="wsi-footer-contact-label">Workshop Atelier</div>
                <h3 className="wsi-footer-contact-title">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(companyAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {companyAddress}
                  </a>
                </h3>
                {companyAddressSecondary && (
                  <div className="wsi-footer-contact-subs">
                    <span className="wsi-footer-contact-sub-item" style={{ opacity: 0.85 }}>
                      {companyAddressSecondary}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Connect & Trust Verification Showcase (like screenshot) */}
        <div className="wsi-footer-connect-section">
          {/* Social Row */}
          <div className="wsi-footer-connect-row">
            <span className="wsi-footer-connect-title">CONNECT</span>
            <div className="d-flex align-items-center gap-2">
              <a
                href={facebookUrl || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="wsi-footer-social-circle wsi-footer-social--fb"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="wsi-footer-social-circle wsi-footer-social--ig"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href={youtubeUrl || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="wsi-footer-social-circle wsi-footer-social--yt"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href={linkedinUrl || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="wsi-footer-social-circle wsi-footer-social--li"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="wsi-footer-social-circle wsi-footer-social--pin"
                aria-label="Pinterest"
              >
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          {/* Badges Row (GST & Licence) */}
          <div className="wsi-footer-badges-row">
            <div className="wsi-footer-badge-card">
              <div className="wsi-footer-badge-icon">
                <i className="fa-solid fa-receipt"></i>
              </div>
              <div className="wsi-footer-badge-meta">
                <span className="wsi-footer-badge-type">GST</span>
                <span className="wsi-footer-badge-code">01BNAPB1058F1ZY</span>
              </div>
            </div>

            <div className="wsi-footer-badge-card">
              <div className="wsi-footer-badge-icon" style={{ color: "#10B981" }}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="wsi-footer-badge-meta">
                <span className="wsi-footer-badge-type">LICENCE</span>
                <span className="wsi-footer-badge-code">JKTA00005202</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-widgets-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
              <div className="single-footer-widget">
                <div className="widget-head mb-3">
                  <Link href="/">
                    {siteLogoWhite ? (
                      <img
                        src={siteLogoWhite}
                        alt={siteName || "logo"}
                        style={{ maxHeight: "45px", width: "auto", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem" }}>{siteName}</span>
                    )}
                  </Link>
                </div>
                <div className="footer-content">
                  {footerAbout ? <p>{footerAbout}</p> : null}
                  <div className="social-icon d-flex align-items-center">
                    {facebookUrl && (
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    )}
                    {twitterUrl && (
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {youtubeUrl && (
                      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-youtube"></i>
                      </a>
                    )}
                    {linkedinUrl && (
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".4s">
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h3 className="style1">Customer Support</h3>
                </div>
                <ul className="list-area">
                  <li>
                    <Link className="style1" href="/shop">
                      <i className="fa-solid fa-chevrons-right"></i>
                      Shop Catalog
                    </Link>
                  </li>
                  <li>
                    <Link className="style1" href="/contact">
                      <i className="fa-solid fa-chevrons-right"></i>
                      Opening Hours
                    </Link>
                  </li>
                  <li>
                    <Link className="style1" href="/contact">
                      <i className="fa-solid fa-chevrons-right"></i>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link className="style1" href="/wishlist">
                      <i className="fa-solid fa-chevrons-right"></i>
                      My Wishlist
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".6s">
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h3 className="style1">Quick Links</h3>
                </div>
                <ul className="list-area">
                  {footerMenus && footerMenus.length > 0 ? (
                    footerMenus.map((item) => (
                      <li key={item.id}>
                        {isExternalUrl(item.url) ? (
                          <a
                            className="style1"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa-solid fa-chevrons-right"></i>
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            className="style1"
                            href={getSafeLink(item.url)}
                            target={item.target === "_blank" ? "_blank" : undefined}
                          >
                            <i className="fa-solid fa-chevrons-right"></i>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>
                        <Link className="style1" href="/about">
                          <i className="fa-solid fa-chevrons-right"></i>
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link className="style1" href="/careers">
                          <i className="fa-solid fa-chevrons-right"></i>
                          Careers &amp; Jobs
                        </Link>
                      </li>
                      <li>
                        <Link className="style1" href="/shop">
                          <i className="fa-solid fa-chevrons-right"></i>
                          Shop Catalog
                        </Link>
                      </li>
                      <li>
                        <Link className="style1" href="/blog">
                          <i className="fa-solid fa-chevrons-right"></i>
                          Design Journal &amp; Trends
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".8s">
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h3 className="style1">Newsletter</h3>
                </div>
                <div className="footer-content">
                  <p>Sign up to our interior design journal for luxury spatial inspiration and catalog updates.</p>
                  <form onSubmit={handleSubmit} className="footer-input">
                    <input
                      type="email"
                      id="footer-email-input"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button className="newsletter-btn" type="submit" aria-label="Subscribe">
                      <i className="fa-regular fa-paper-plane"></i>
                    </button>
                  </form>
                  {isSubscribed && (
                    <p className="mt-2 text-success" style={{ fontSize: "0.85rem" }}>
                      Thank you for subscribing!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Pseudo-Selected Watermark & Bottom Bar (matching screenshot) */}
      <div className="wsi-footer-watermark-wrap">
        {/* Giant Watermark Website Title */}
        <div className="wsi-footer-watermark" aria-hidden="true">
          {siteName}
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Subline Row matching the screenshot */}
          <div className="wsi-footer-subline-row">
            <div className="wsi-footer-subline-item">
              <i className="fa-regular fa-building" style={{ color: "#FF4035" }}></i>
              <span>Registered Atelier &amp; Studio, Srinagar, Jammu &amp; Kashmir</span>
            </div>
            <div className="wsi-footer-subline-item">
              <a href={`tel:${companyPhone.replace(/\s+/g, "")}`}>
                <i className="fa-solid fa-phone" style={{ marginRight: "6px", color: "#FF4035" }}></i>
                {companyPhone}
              </a>
              <span style={{ margin: "0 8px", opacity: 0.4 }}>|</span>
              <a href={`mailto:${companyEmail}`}>
                <i className="fa-regular fa-envelope" style={{ marginRight: "6px", color: "#FF4035" }}></i>
                {companyEmail}
              </a>
            </div>
          </div>

          <div className="footer-wrapper d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2">
            <p className="m-0" style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
              © {new Date().getFullYear()} <Link href="/" style={{ color: "#FFFFFF", fontWeight: 600 }}>{siteName}</Link>. All Rights Reserved.
            </p>
            <ul className="credit-card-logo m-0 d-flex align-items-center gap-2">
              <li>
                <Link href="/contact">
                  <img src="/assets/images/logo/visa-logo.png" alt="Visa" style={{ maxHeight: "20px" }} />
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <img src="/assets/images/logo/mastercard-logo.png" alt="Mastercard" style={{ maxHeight: "20px" }} />
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <img src="/assets/images/logo/payoneer-logo.png" alt="Payoneer" style={{ maxHeight: "20px" }} />
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <img src="/assets/images/logo/affirm-logo.png" alt="Affirm" style={{ maxHeight: "20px" }} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
