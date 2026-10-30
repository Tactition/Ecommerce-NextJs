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
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.short_description || product.description || `Buy ${product.name} at Wall Street Interiors. Guaranteed quality & doorstep delivery.`,
    openGraph: {
      title: `${product.name} | Wall Street Interiors`,
      description: product.short_description || product.description || undefined,
      images: product.image && product.image.trim() !== "" ? [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ] : undefined,
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

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={related}
      variations={variations}
      allAttributes={allAttributes}
      whatsappNumber={siteSettings?.whatsapp_number || ""}
    />
  );
}
