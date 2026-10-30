import React from "react";
import { Metadata } from "next";
import BlogForm from "@/components/dashboard/BlogForm";

export const metadata: Metadata = {
  title: "Create Journal Article | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default function CreateBlogPage() {
  return <BlogForm initialData={null} />;
}
