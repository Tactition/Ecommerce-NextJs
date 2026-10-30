import React from "react";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import ContactClientForm from "@/components/contact/ContactClientForm";
import { getSiteSettings } from "@/lib/actions/settings";
import { parsePhoneNumbers, parseEmailAddresses } from "@/lib/settingsUtils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Wall Street Interiors";
  return {
    title: `Contact Us | ${siteName} - Consultations & B2B Wholesale`,
    description:
      settings.meta_description ||
      "Get in touch with Wall Street Interiors for bespoke interior architecture consultations, custom furniture fabrication, 3D wall paneling, and B2B wholesale trade orders.",
  };
}

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phoneNumbers = parsePhoneNumbers(settings);
  const emailAddresses = parseEmailAddresses(settings);

  return (
    <main>
      {/* Breadcrumb Section */}
      <Breadcrumb title="Contact Us" category="Company" />

      {/* Contact Section */}
      <section className="contact-section fix section-padding">
        <div className="container">
          <div className="contact-section-wrapper">
            <div className="row">
              {/* Left Column: Contact Information */}
              <div className="col-xl-5">
                <div className="contact-info">
                  <div className="contact-info__contact">
                    <h5 className="contact-info__contact--title">Contact Channels</h5>
                    <p className="contact-info__contact--subtitle">
                      Speak with our interior architects or visit our design studio in Srinagar.
                    </p>
                    <div className="contact-info__contact--contact-items">
                      <ul className="contact-info-items" style={{ listStyle: "none", padding: 0 }}>
                        {/* Dynamic Phone Numbers */}
                        {phoneNumbers.map((p) => (
                          <li key={p.id} className="mb-3">
                            <i className="fa-solid fa-phone"></i>
                            <div>
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", display: "block" }}>
                                {p.label} {p.is_primary ? "(Primary)" : ""}
                              </span>
                              <a href={`tel:${p.number.replace(/\s+/g, "")}`} style={{ fontWeight: 600 }}>
                                {p.number}
                              </a>
                            </div>
                          </li>
                        ))}

                        {/* Dynamic Emails */}
                        {emailAddresses.map((e) => (
                          <li key={e.id} className="mb-3">
                            <i className="fa-regular fa-envelope"></i>
                            <div>
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", display: "block" }}>
                                {e.label} {e.is_primary ? "(Primary)" : ""}
                              </span>
                              <a href={`mailto:${e.email}`} style={{ fontWeight: 600 }}>
                                {e.email}
                              </a>
                            </div>
                          </li>
                        ))}

                        {/* Physical Address */}
                        {settings.company_address ? (
                          <li className="mb-3">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", display: "block" }}>
                                Primary Studio & Workshop
                              </span>
                              <span>{settings.company_address}</span>
                            </div>
                          </li>
                        ) : null}

                        {settings.company_address_secondary && (
                          <li className="mb-3">
                            <i className="fas fa-building"></i>
                            <div>
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", display: "block" }}>
                                Secondary Branch / Lab
                              </span>
                              <span>{settings.company_address_secondary}</span>
                            </div>
                          </li>
                        )}

                        {settings.working_hours && (
                          <li className="mb-3">
                            <i className="fa-regular fa-clock"></i>
                            <div>
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", display: "block" }}>
                                Operating Hours
                              </span>
                              <span>{settings.working_hours}</span>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="contact-info__contact--social-icon d-flex align-items-center mt-4">
                      {settings.facebook_url && (
                        <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                      )}
                      {settings.twitter_url && (
                        <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                      {settings.linkedin_url && (
                        <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      )}
                      {settings.youtube_url && (
                        <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-youtube"></i>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="contact-info__icon">
                    <div className="icon-1">
                      <img src="/assets/images/contact/shape-1.png" alt="icon" />
                    </div>
                    <div className="icon-2">
                      <img src="/assets/images/contact/shape-2.png" alt="icon" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="col-xl-7">
                <ContactClientForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Map Section */}
      <div className="contact-map-section fix">
        <div className="map-items">
          <div className="googpemap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.95373531531885!3d-37.81732767975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4e793770d3%3A0x9e44d6ad731ac329!2sEnvato!5e0!3m2!1sen!2s!4v1641984054261!5m2!1sen!2s"
              style={{ border: 0, width: "100%", height: "450px" }}
              allowFullScreen={false}
              loading="lazy"
              title="Central Diagnostics Lab"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
