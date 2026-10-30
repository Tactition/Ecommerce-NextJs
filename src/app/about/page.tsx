import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TextType from "@/components/common/TextType";
import { getHomepageSettings } from "@/lib/actions/settings";
import { getPublishedTestimonials } from "@/lib/actions/testimonials";

export const metadata: Metadata = {
  title: "About Us | Wall Street Interiors - Heritage & Architectural Craftsmanship",
  description:
    "Learn about Wall Street Interiors: premier studio for bespoke interior architecture, handcrafted luxury furniture, acoustic wall paneling, and B2B wholesale trade supplies.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const [homepageSettings, testimonials] = await Promise.all([
    getHomepageSettings(),
    getPublishedTestimonials(),
  ]);

  return (
    <main>
      {/* Breadcrumb Section */}
      <Breadcrumb title="About Us" category="Company" />

      {/* About Section - Our Journey & Innovation */}
      <section className="about-page-section pt-50 pb-50 fix">
        <div className="container">
          <div className="row gy-4 gx-64 d-flex align-items-center">
            <div className="col-xl-6">
              <div className="about-page-thumb1" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <img
                  src={homepageSettings.about_image || "/assets/images/about-us/aboutThumb1_1.jpg"}
                  alt="About Wall Street Interiors"
                  style={{ width: "100%", height: "460px", objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-xl-6">
              <div className="about-page-content">
                <span className="subtitle" style={{ color: "var(--theme)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.88rem", display: "inline-block", marginBottom: "8px" }}>
                  Timeless Craftsmanship Since 2012
                </span>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "20px", color: "var(--title)" }}>
                  {homepageSettings.about_heading || "Our Journey & Architectural Legacy"}
                </h1>
                <p className="mb-15" style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text)" }}>
                  {homepageSettings.about_text ||
                    "Wall Street Interiors is Srinagar's premier studio for high-end interior architecture, bespoke handcrafted furniture, architectural wall paneling, and B2B wholesale trade supplies. We collaborate closely with architects, developers, and discerning homeowners across Kashmir to curate refined, timeless spaces."}
                </p>
                <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text)", marginBottom: "25px" }}>
                  Every project entrusted to us undergoes meticulous design planning, premium material selection, and artisanal craftsmanship to transform residential and commercial properties into sanctuaries of luxury.
                </p>

                {/* Key Metrics / Highlights from Admin Settings */}
                <div className="d-flex flex-wrap gap-4 pt-2">
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "16px 24px", borderRadius: "12px", minWidth: "140px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--theme)", lineHeight: 1.1 }}>
                      {homepageSettings.years_experience}+
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>Years Experience</span>
                  </div>
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "16px 24px", borderRadius: "12px", minWidth: "140px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--theme)", lineHeight: 1.1 }}>
                      {homepageSettings.repairs_completed}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>Projects Executed</span>
                  </div>
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "16px 24px", borderRadius: "12px", minWidth: "140px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--theme)", lineHeight: 1.1 }}>
                      {homepageSettings.satisfaction_rate}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>Client Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row gx-80 mt-50 d-flex align-items-center">
            <div className="col-xl-7">
              <div className="about-page-content">
                <span className="subtitle" style={{ color: "var(--theme)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.88rem", display: "inline-block", marginBottom: "8px" }}>
                  Atelier &amp; Experience Studio
                </span>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "20px", color: "var(--title)" }}>
                  Where Architectural Vision Meets Luxury
                </h1>
                <p className="mb-15" style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text)" }}>
                  We believe in sustainable, heirloom-quality craftsmanship. Using seasoned natural hardwoods, acoustic felt-backed timber slats, precision German hardware, and Italian marble surfaces, our artisans and interior architects turn visions into enduring realities.
                </p>
                <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text)" }}>
                  Serving discerning homeowners, boutique hotels, corporate headquarters, and certified contractor trade partners across Kashmir, Wall Street Interiors bridges bespoke aesthetics with reliable wholesale delivery.
                </p>
              </div>
            </div>
            <div className="col-xl-5">
              <div className="about-page-thumb2" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <img
                  src="/assets/images/about-us/aboutThumb1_2.jpg"
                  alt="Innovation Lab"
                  style={{ width: "100%", height: "380px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="feature-section section-padding fix" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="container">
          <div className="row gy-5">
            <div className="col-xl-3 col-md-6">
              <div className="feature-box-item-two">
                <div className="feature-box-item-two__icon">
                  <img src="/assets/images/icon/featureIcon2_1.svg" alt="High Quality" />
                </div>
                <div className="feature-box-item-two__content">
                  <h6>High Quality</h6>
                  <p className="feature-box-item-two__content--text">Crafted from certified genuine materials</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="feature-box-item-two">
                <div className="feature-box-item-two__icon">
                  <img src="/assets/images/icon/featureIcon2_2.svg" alt="Warranty Protection" />
                </div>
                <div className="feature-box-item-two__content">
                  <h6>Warranty Protection</h6>
                  <p className="feature-box-item-two__content--text">Over 2 years guaranteed support</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="feature-box-item-two">
                <div className="feature-box-item-two__icon">
                  <img src="/assets/images/icon/featureIcon2_3.svg" alt="Free Shipping" />
                </div>
                <div className="feature-box-item-two__content">
                  <h6>Free Shipping</h6>
                  <p className="feature-box-item-two__content--text">Orders over ₹5,000 across India</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="feature-box-item-two">
                <div className="feature-box-item-two__icon">
                  <img src="/assets/images/icon/featureIcon2_4.svg" alt="24/7 Support" />
                </div>
                <div className="feature-box-item-two__content">
                  <h6>24 / 7 Support</h6>
                  <p className="feature-box-item-two__content--text">Dedicated master engineer desk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Section */}
      <section className="offer-section fix pt-50 pb-50">
        <div className="container">
          <div className="offer-card-items-fashon-two">
            <div className="row g-4">
              <div className="col-xl-6">
                <div className="offer-card-items-fashon-two1-info1">
                  <div className="offer-card-items-fashon-two1-info1__thumb">
                    <img src="/assets/images/offer/offerCardThumb2_1.png" alt="offer thumb" />
                  </div>
                  <div className="offer-card-items-fashon-two1-info1__content">
                    <p className="offer-card-items-fashon-two1-info1__content--subtitle">Sale Up to 50% Off</p>
                    <h6 className="offer-card-items-fashon-two1-info1__content--title">
                      The Latest Premium<br />
                      <span>Diagnostics This Season</span>
                    </h6>
                    <div className="offer-card-items-fashon-two1-info1__content--btn-wrapper">
                      <Link className="theme-btn style12" href="/shop">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="offer-card-items-fashon-two1-info1 mt-4 style2">
                  <div className="offer-card-items-fashon-two1-info1__thumb">
                    <img src="/assets/images/offer/offerCardThumb2_2.png" alt="offer thumb" />
                  </div>
                  <div className="offer-card-items-fashon-two1-info1__content">
                    <p className="offer-card-items-fashon-two1-info1__content--subtitle">Sale Up to 40% Off</p>
                    <h6 className="offer-card-items-fashon-two1-info1__content--title">
                      Genuine Modules<br />
                      <span>Back In Stock</span>
                    </h6>
                    <div className="offer-card-items-fashon-two1-info1__content--btn-wrapper">
                      <Link className="theme-btn style6" href="/shop">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6">
                <div className="offer-card-items-fashon-two2">
                  <div className="offer-card-items-fashon-two2__thumb">
                    <img src="/assets/images/offer/offerCardThumb2_3.jpg" alt="offer thumb" />
                  </div>
                  <div className="offer-card-items-fashon-two2__content">
                    <span className="offer-card-items-fashon-two2__content--subtitle">Certified Quality</span>
                    <h6 className="offer-card-items-fashon-two2__content--title">Get Up To 35% Off Component Kits</h6>
                    <p className="offer-card-items-fashon-two2__content--text">
                      High precision laboratory solder wires, flux gels, and micro-soldering precision tools.
                    </p>
                    <div className="offer-card-items-fashon-two2__content--btn-wrapper">
                      <Link className="theme-btn style6" href="/shop">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Team Section */}
      <section className="team-section-1 section-padding fix" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <div className="section-title text-center mb-50">
            <span className="subtitle style2" style={{ color: "var(--theme)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.88rem" }}>
              Our Expert Crew
            </span>
            <TextType
              as="h3"
              className="title style4"
              text={["The Best Team Available", "Master Craftsmen & Designers", "Decades of Architectural Experience"]}
              typingSpeed={60}
              pauseDuration={2400}
              deletingSpeed={35}
              deleteMode="backspace"
              typeEffect="fade"
              cursorStyle="bar"
              cursorColor="var(--color-primary, #FF4035)"
              cursorGlide
              showCursor
              style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "8px" }}
            />
          </div>
          <div className="row g-4">
            <div className="col-xl-3 col-md-6">
              <div className="team-section-1-card">
                <div className="team-section-1-card__thumb">
                  <img
                    className="team-section-1-card__thumb-img"
                    src="/assets/images/team/team-thumb1_1.jpg"
                    alt="Zahid Nazir"
                  />
                  <div className="team-section-1-card__thumb-social">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                  </div>
                </div>
                <div className="team-section-1-card__content">
                  <h4 className="team-section-1-card__content-name">Zahid Nazir</h4>
                  <p className="team-section-1-card__content-designation">Principal Architectural Consultant</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="team-section-1-card">
                <div className="team-section-1-card__thumb">
                  <img
                    className="team-section-1-card__thumb-img"
                    src="/assets/images/team/team-thumb1_2.jpg"
                    alt="Tariq Shah"
                  />
                  <div className="team-section-1-card__thumb-social">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                  </div>
                </div>
                <div className="team-section-1-card__content">
                  <h4 className="team-section-1-card__content-name">Tariq Shah</h4>
                  <p className="team-section-1-card__content-designation">Master Woodcraft & Joinery Lead</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="team-section-1-card">
                <div className="team-section-1-card__thumb">
                  <img
                    className="team-section-1-card__thumb-img"
                    src="/assets/images/team/team-thumb1_3.jpg"
                    alt="Fatema Khatun"
                  />
                  <div className="team-section-1-card__thumb-social">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                  </div>
                </div>
                <div className="team-section-1-card__content">
                  <h4 className="team-section-1-card__content-name">Fatema Khatun</h4>
                  <p className="team-section-1-card__content-designation">Turnkey Projects Manager</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="team-section-1-card">
                <div className="team-section-1-card__thumb">
                  <img
                    className="team-section-1-card__thumb-img"
                    src="/assets/images/team/team-thumb1_4.jpg"
                    alt="Sameer Ahmad"
                  />
                  <div className="team-section-1-card__thumb-social">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                  </div>
                </div>
                <div className="team-section-1-card__content">
                  <h4 className="team-section-1-card__content-name">Sameer Ahmad</h4>
                  <p className="team-section-1-card__content-designation">Acoustic Wall Systems Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Sourced Dynamically from Database */}
      <section className="testimonial-section fix bg-color3 section-padding" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="container">
          <div className="row gy-4 d-flex align-items-center mb-40">
            <div className="col-xl-8">
              <div className="section-title">
                <div className="subtitle style2" style={{ color: "var(--theme)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.88rem" }}>
                  Testimonial
                </div>
                <TextType
                  as="h2"
                  className="title"
                  text={["This Is What Our Customers Say", "Trusted By Discerning Clients", "Living Spaces Made Timeless"]}
                  typingSpeed={60}
                  pauseDuration={2400}
                  deletingSpeed={35}
                  deleteMode="backspace"
                  typeEffect="fade"
                  cursorStyle="bar"
                  cursorColor="var(--color-primary, #FF4035)"
                  cursorGlide
                  showCursor
                  style={{ fontSize: "2.2rem", fontWeight: 800 }}
                />
              </div>
            </div>
            <div className="col-xl-4 d-flex justify-content-xl-end">
              <div className="btn-wrapper">
                <Link className="theme-btn style9" href="/contact">
                  Book A Service Visit
                </Link>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {testimonials && testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((item) => (
                <div key={item.id} className="col-lg-4 col-md-6">
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "16px",
                      padding: "36px 30px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      border: "1px solid #EEF2F6",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {/* Star rating */}
                      <div className="d-flex gap-1 mb-3" style={{ color: "#FF9900" }}>
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <i key={i} className="fa-solid fa-star" style={{ fontSize: "0.95rem" }}></i>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.98rem", lineHeight: 1.7, color: "var(--text)", fontStyle: "italic", marginBottom: "24px" }}>
                        &ldquo;{item.content}&rdquo;
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-3 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                      <div style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#F1F5F9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.customer_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--theme, #FF4035)" }}>
                            {item.customer_name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h5 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--title)" }}>
                          {item.customer_name}
                        </h5>
                        <span style={{ fontSize: "0.85rem", color: "var(--theme)", fontWeight: 600 }}>
                          {item.customer_role || "Verified Customer"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">
                <p>No testimonials available at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
