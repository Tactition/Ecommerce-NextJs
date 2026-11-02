import React from "react";
import HomeClient from "@/components/home/HomeClient";

import {
  getProductCategories,
  getBestSellerProducts,
  getFeaturedProducts,
  getPopularProducts,
  getOnSaleProducts,
  getProductsByIds,
} from "@/lib/actions/products";
import { getPublishedTestimonials } from "@/lib/actions/testimonials";
import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { getHomepageSettings } from "@/lib/actions/settings";
import { getHomepagePromos } from "@/lib/actions/promos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    categories,
    bestSellerProducts,
    featuredProducts,
    popularProducts,
    onSaleProducts,
    testimonials,
    blogPosts,
    homepageSettings,
    promos,
  ] = await Promise.all([
    getProductCategories(),
    getBestSellerProducts(),
    getFeaturedProducts(),
    getPopularProducts(),
    getOnSaleProducts(),
    getPublishedTestimonials(),
    getPublishedBlogPosts(),
    getHomepageSettings(),
    getHomepagePromos(),
  ]);

  const weeklyIds = (homepageSettings?.weekly_deal_product_ids?.match(/\d+/g) || []).map(Number);

  const weeklyDealProducts =
    weeklyIds.length > 0
      ? await getProductsByIds(weeklyIds)
      : featuredProducts.slice(0, 4);

  return (
    <main>
      <HomeClient
        categories={categories}
        bestSellerProducts={bestSellerProducts}
        featuredProducts={featuredProducts}
        popularProducts={popularProducts}
        onSaleProducts={onSaleProducts}
        testimonials={testimonials}
        blogPosts={blogPosts}
        homepageSettings={homepageSettings}
        promos={promos}
        weeklyDealProducts={weeklyDealProducts}
      />
    </main>
  );
}
