import { SiteSettings, ContactNumberItem, ContactEmailItem } from "@/types";

export function parsePhoneNumbers(settings: SiteSettings): ContactNumberItem[] {
  if (settings.phone_numbers) {
    try {
      const parsed = JSON.parse(settings.phone_numbers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn("Could not parse phone_numbers JSON:", e);
    }
  }

  if (settings.company_phone && settings.company_phone.trim()) {
    return [
      {
        id: "p-primary",
        number: settings.company_phone.trim(),
        label: "Support Hotline",
        is_primary: true,
      },
    ];
  }

  return [];
}

export function parseEmailAddresses(settings: SiteSettings): ContactEmailItem[] {
  if (settings.email_addresses) {
    try {
      const parsed = JSON.parse(settings.email_addresses);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn("Could not parse email_addresses JSON:", e);
    }
  }

  if (settings.company_email && settings.company_email.trim()) {
    return [
      {
        id: "e-primary",
        email: settings.company_email.trim(),
        label: "General Inquiries",
        is_primary: true,
      },
    ];
  }

  return [];
}
