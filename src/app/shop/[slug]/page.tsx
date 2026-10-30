import { redirect } from "next/navigation";

interface ShopSlugProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopSlugPage({ params }: ShopSlugProps) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
