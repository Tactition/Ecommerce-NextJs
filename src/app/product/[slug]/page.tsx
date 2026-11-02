import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { getProductVariations, getAllAttributesWithValues } from "@/lib/actions/variations";
import { getSiteSettings } from "@/lib/actions/settings";
import ProductDetailsClient from "@/components/shop/ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Wall Street Interiors",
    };
  }

  const seoTitle = `${product.name} in Srinagar | Wall Street Interiors`;
  const seoDesc =
    product.short_description ||
    product.description ||
    `Buy ${product.name} in Srinagar, Kashmir at importer-direct wholesale and retail prices from Wall Street Interiors. Visit our Habba Kadal showroom or WhatsApp +919018454526.`;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: [
      `${product.name} Srinagar`,
      `${product.name} Kashmir`,
      `${product.category_name || "interior materials"} Srinagar`,
      "wholesale interior material Kashmir",
      "Wall Street Interiors Habba Kadal",
    ],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images:
        product.image && product.image.trim() !== ""
          ? [
              {
                url: product.image,
                width: 800,
                height: 800,
                alt: `${product.name} in Srinagar Kashmir`,
              },
            ]
          : undefined,
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [related, variations, allAttributes, siteSettings] = await Promise.all([
    getRelatedProducts(product.category_slug, product.id, 4),
    getProductVariations(product.id),
    getAllAttributesWithValues(),
    getSiteSettings(),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://wallstreetinteriors.com/product/${product.slug}#product`,
        "name": `${product.name} in Srinagar`,
        "image": product.image ? (product.image.startsWith("http") ? product.image : `https://wallstreetinteriors.com${product.image}`) : undefined,
        "description": product.short_description || product.description,
        "sku": `WSI-${product.id}`,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "Wall Street Interiors",
        },
        "offers": {
          "@type": "Offer",
          "url": `https://wallstreetinteriors.com/product/${product.slug}`,
          "priceCurrency": "INR",
          "price": Number(product.price) || 0,
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "seller": {
            "@type": "Organization",
            "name": "Wall Street Interiors",
            "telephone": "+91-9018454526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near New Habba Kadal Bridge, Habba Kadal",
              "addressLocality": "Srinagar",
              "addressRegion": "Jammu & Kashmir",
              "postalCode": "190001",
              "addressCountry": "IN"
            }
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating ? Number(product.rating) : 4.9,
          "reviewCount": product.reviews_count ? Number(product.reviews_count) : 24,
          "bestRating": 5,
          "worstRating": 1
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wallstreetinteriors.com" },
          { "@type": "ListItem", "position": 2, "name": product.category_name || "Shop", "item": `https://wallstreetinteriors.com/category/${product.category_slug}` },
          { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://wallstreetinteriors.com/product/${product.slug}` }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProducts={related}
        variations={variations}
        allAttributes={allAttributes}
        whatsappNumber={siteSettings?.whatsapp_number || "+919018454526"}
      />
    </>
  );
}
