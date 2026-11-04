import React from "react";
import HomeClient from "@/components/home/HomeClient";

import {
  getProductCategories,
  getBestSellerProducts,
  getFeaturedProducts,
  getProductsByIds,
} from "@/lib/actions/products";
import { getPublishedTestimonials } from "@/lib/actions/testimonials";
import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { getHomepageSettings } from "@/lib/actions/settings";
import { getHomepagePromos } from "@/lib/actions/promos";

export const revalidate = 60;

export default async function HomePage() {
  const homepageSettings = await getHomepageSettings();
  const weeklyIds = (homepageSettings?.weekly_deal_product_ids?.match(/\d+/g) || []).map(Number);

  const [
    categories,
    bestSellerProducts,
    featuredProducts,
    weeklyProducts,
    testimonials,
    blogPosts,
    promos,
  ] = await Promise.all([
    getProductCategories(),
    getBestSellerProducts(),
    getFeaturedProducts(),
    weeklyIds.length > 0 ? getProductsByIds(weeklyIds) : Promise.resolve([]),
    getPublishedTestimonials(),
    getPublishedBlogPosts(),
    getHomepagePromos(),
  ]);

  const weeklyDealProducts =
    weeklyProducts.length > 0 ? weeklyProducts : featuredProducts.slice(0, 4);

  return (
    <main>
      <HomeClient
        categories={categories}
        bestSellerProducts={bestSellerProducts}
        featuredProducts={featuredProducts}
        testimonials={testimonials}
        blogPosts={blogPosts}
        homepageSettings={homepageSettings}
        promos={promos}
        weeklyDealProducts={weeklyDealProducts}
      />
    </main>
  );
}
