import React from "react";
import EcommerceFooter from "./EcommerceFooter";
import { getSiteSettings } from "@/lib/actions/settings";
import { parsePhoneNumbers, parseEmailAddresses } from "@/lib/settingsUtils";
import { getNavMenuItems } from "@/lib/actions/menus";

export default async function Footer() {
  const [settings, footerMenus] = await Promise.all([
    getSiteSettings(),
    getNavMenuItems("footer"),
  ]);
  const phoneNumbers = parsePhoneNumbers(settings);
  const emailAddresses = parseEmailAddresses(settings);

  return (
    <EcommerceFooter
      siteLogoWhite={settings.site_logo_white || ""}
      siteName={settings.site_name || ""}
      footerAbout={settings.footer_about || ""}
      companyPhone={settings.company_phone || phoneNumbers[0]?.number || ""}
      companyEmail={settings.company_email || emailAddresses[0]?.email || ""}
      companyAddress={settings.company_address || ""}
      companyAddressSecondary={settings.company_address_secondary || ""}
      phoneNumbers={phoneNumbers}
      emailAddresses={emailAddresses}
      footerMenus={footerMenus}
      workingHours={settings.working_hours || ""}
      facebookUrl={settings.facebook_url || ""}
      twitterUrl={settings.twitter_url || ""}
      youtubeUrl={settings.youtube_url || ""}
      linkedinUrl={settings.linkedin_url || ""}
    />
  );
}
