import React from "react";
import EcommerceHeader from "./EcommerceHeader";
import { getSiteSettings } from "@/lib/actions/settings";
import { parsePhoneNumbers, parseEmailAddresses } from "@/lib/settingsUtils";
import { getNavMenuItems } from "@/lib/actions/menus";
import { getProductCategories } from "@/lib/actions/products";

export default async function Header() {
  const [settings, headerMenus, categoryMenus, productCategories] = await Promise.all([
    getSiteSettings(),
    getNavMenuItems("header"),
    getNavMenuItems("categories"),
    getProductCategories(),
  ]);

  const phoneNumbers = parsePhoneNumbers(settings);
  const emailAddresses = parseEmailAddresses(settings);

  return (
    <EcommerceHeader
      siteLogo={settings.site_logo || ""}
      siteLogoWhite={settings.site_logo_white || ""}
      companyPhone={settings.company_phone || phoneNumbers[0]?.number || ""}
      companyEmail={settings.company_email || emailAddresses[0]?.email || ""}
      companyAddress={settings.company_address || ""}
      phoneNumbers={phoneNumbers}
      emailAddresses={emailAddresses}
      headerMenus={headerMenus}
      categoryMenus={categoryMenus}
      productCategories={productCategories}
      workingHours={settings.working_hours || ""}
    />
  );
}
