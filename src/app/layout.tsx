import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteSettings } from "@/lib/actions/settings";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/components/auth/AuthProvider";

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
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getSession(),
  ]);
  const favicon = settings.site_favicon || "/assets/images/favicon.png";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href={favicon} />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/icomoon-one.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/css/splitting.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/meanmenu.css" />
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/nice-select.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider initialSession={session}>
          <LayoutShell header={<Header />} footer={<Footer />}>
            {children}
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
