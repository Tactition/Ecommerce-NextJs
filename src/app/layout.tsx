import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Onest } from "next/font/google";
import "./globals.css";
import "./b2b.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteSettings } from "@/lib/actions/settings";
import { getCustomerSession } from "@/lib/auth/customer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-primary",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Wall Street Interiors";
  const metaTitle = settings.meta_title || `${siteName} | Luxury Interior Architecture, Custom Furniture & B2B Wholesale`;
  const metaDesc =
    settings.meta_description ||
    "Wall Street Interiors is Srinagar's premier studio for bespoke interior architecture, handcrafted luxury furniture, 3D architectural wall panels, and B2B wholesale trade supplies.";
  const metaKeywords = settings.meta_keywords
    ? settings.meta_keywords.split(",").map((k) => k.trim())
    : [
        "Wall Street Interiors",
        "Interior Design Srinagar",
        "Custom Furniture",
        "Wall Paneling",
        "Modular Kitchens",
        "Luxury Home Decor",
        "B2B Interior Wholesale",
      ];
  const favicon = settings.site_favicon || "/assets/images/favicon.png";

  return {
    metadataBase: new URL(process.env.AUTH_URL || "http://localhost:3000"),
    title: {
      default: metaTitle,
      template: `%s | ${siteName}`,
    },
    description: metaDesc,
    keywords: metaKeywords,
    authors: [{ name: settings.meta_author || siteName }],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      siteName: siteName,
      images: settings.site_logo ? [{ url: settings.site_logo }] : undefined,
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, customerSession] = await Promise.all([
    getSiteSettings(),
    getCustomerSession(),
  ]);
  const favicon = settings.site_favicon || "/assets/images/favicon.png";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["HomeGoodsStore", "InteriorDesignStudio", "WholesaleStore"],
        "@id": "https://wallstreetinteriors.com/#organization",
        "name": settings.site_name || "Wall Street Interiors",
        "alternateName": [
          "Wall Street Interiors Srinagar",
          "Wall Street Interior Materials House",
          "Wall Street Habba Kadal"
        ],
        "url": "https://wallstreetinteriors.com",
        "logo": settings.site_logo ? `https://wallstreetinteriors.com${settings.site_logo}` : "https://wallstreetinteriors.com/assets/images/logo/logo.png",
        "description": settings.meta_description || "Srinagar's importer-direct interior materials house for wallpapers, wooden flooring, PVC panels, faux tin ceilings, and window blinds with showroom at Habba Kadal and central godown at Fateh Kadal.",
        "telephone": "+91-9018454526",
        "priceRange": "₹₹ - ₹₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, UPI, Credit Card, Bank Transfer",
        "areaServed": [
          { "@type": "City", "name": "Srinagar" },
          { "@type": "AdministrativeArea", "name": "Kashmir" },
          { "@type": "AdministrativeArea", "name": "Jammu and Kashmir" },
          { "@type": "Country", "name": "India" }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Near New Habba Kadal Bridge, Habba Kadal",
          "addressLocality": "Srinagar",
          "addressRegion": "Jammu & Kashmir",
          "postalCode": "190001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "34.0768",
          "longitude": "74.8055"
        },
        "department": [
          {
            "@type": "Store",
            "name": "Wall Street Interiors - Experience Showroom",
            "description": "Retail experience showroom displaying wallpapers, wooden flooring, PVC wall panels, faux tin ceilings, and custom blinds.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near New Habba Kadal Bridge, Habba Kadal",
              "addressLocality": "Srinagar",
              "addressRegion": "Jammu & Kashmir",
              "postalCode": "190001",
              "addressCountry": "IN"
            },
            "telephone": "+91-9018454526"
          },
          {
            "@type": "WholesaleStore",
            "name": "Wall Street Interiors - Central Wholesale Depot & Godown",
            "description": "Central storage godown and B2B wholesale trade supply depot for contractors, builders, and interior designers.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near Syed Ali Akbar Mosque, Fateh Kadal",
              "addressLocality": "Srinagar",
              "addressRegion": "Jammu & Kashmir",
              "postalCode": "190002",
              "addressCountry": "IN"
            },
            "telephone": "+91-7889804942"
          }
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:30",
            "closes": "19:30"
          }
        ],
        "sameAs": [
          settings.facebook_url || "https://facebook.com/wallstreetinteriors",
          settings.instagram_url || "https://instagram.com/wallstreetinteriors",
          settings.youtube_url || "https://youtube.com/wallstreetinteriors"
        ].filter(Boolean)
      }
    ]
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${outfit.variable} ${onest.variable}`}
    >
      <head>
        <link rel="shortcut icon" href={favicon} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {/* Preload critical icon font to prevent layout shift & delayed icons */}
        <link
          rel="preload"
          href="/assets/webfonts/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/webfonts/fa-regular-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/webfonts/fa-brands-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Core Layout & Theme Stylesheets (unused legacy sheets purged) */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider initialSession={customerSession}>
          <LayoutShell header={<Header />} footer={<Footer />}>
            {children}
          </LayoutShell>
          <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
        </AuthProvider>
      </body>
    </html>
  );
}
