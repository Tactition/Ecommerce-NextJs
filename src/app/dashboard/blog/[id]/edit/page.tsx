import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/actions/blog";
import BlogForm from "@/components/dashboard/BlogForm";

export const metadata: Metadata = {
  title: "Edit Journal Article | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    notFound();
  }

  const post = await getBlogPostById(blogId);
  if (!post) {
    notFound();
  }

  return <BlogForm initialData={post} />;
}
