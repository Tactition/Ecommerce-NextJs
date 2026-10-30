"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product, ProductCategory, deleteProductAction, toggleProductStatusAction } from "@/lib/actions/products";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: ProductCategory[];
}

export default function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize and synchronize current page from URL (?page=X)
  const initialPageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialPageParam) || initialPageParam < 1 ? 1 : initialPageParam
  );
  const [pageSize] = useState(10);

  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    if (!isNaN(p) && p >= 1 && p !== currentPage) {
      setCurrentPage(p);
    }
  }, [searchParams]);

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    startTransition(async () => {
      const res = await deleteProductAction(targetId);
      if (res.success) {
        setProducts((prev) => {
          const updated = prev.filter((p) => p.id !== targetId);
          const newTotalPages = Math.max(1, Math.ceil(updated.length / pageSize));
          if (currentPage > newTotalPages) {
            changePage(newTotalPages);
          }
          return updated;
        });
      }
      setDeleteConfirmId(null);
    });
  };

  const handleToggleStatus = (p: Product) => {
    startTransition(async () => {
      const res = await toggleProductStatusAction(p.id, p.status || "active");
      if (res.success && res.status) {
        const nextStatus = res.status;
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
        );
      }
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    changePage(1);
  };

  const handleCategoryFilterChange = (cat: string) => {
    setSelectedCategory(cat);
    changePage(1);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subcategory_name && p.subcategory_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" ||
      p.category_slug === selectedCategory ||
      p.subcategory_slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Computations
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (activePage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (activePage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>
            Product Catalog Management
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", margin: 0 }}>
            Create, edit, price, and feature products displayed across the storefront.
          </p>
        </div>

        <Link
          href={`/dashboard/products/create?page=${currentPage}`}
          prefetch={true}
          className="abid-btn abid-btn-primary"
          style={{
            padding: "10px 20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 700,
            borderRadius: "8px",
          }}
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="abid-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px", maxWidth: "480px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search products by name, category, or subcategory..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                borderRadius: "8px",
                border: "1px solid var(--color-surface-border)",
                fontSize: "0.92rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--color-surface-border)",
              fontSize: "0.9rem",
              background: "#FFFFFF",
              color: "var(--color-secondary)",
              outline: "none",
            }}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.parent_id ? `  └─ ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="data-table-wrapper" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category & Subcategory</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Badges</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isActive = p.status === "active";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid var(--color-surface-border)",
                              background: "#F8FAFC",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--color-secondary)", fontSize: "0.95rem" }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                              {p.brand || "Wall Street Interiors"} • /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              backgroundColor: "#F1F5F9",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              color: "var(--color-secondary)",
                              display: "inline-block",
                            }}
                          >
                            {p.category_name}
                          </span>
                          {p.subcategory_name && (
                            <div style={{ marginTop: "3px" }}>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  backgroundColor: "#EEF2FF",
                                  color: "#4F46E5",
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                }}
                              >
                                └─ {p.subcategory_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "var(--color-secondary)" }}>₹{p.price.toFixed(2)}</div>
                        {p.original_price && (
                          <div style={{ fontSize: "0.78rem", color: "#94A3B8", textDecoration: "line-through" }}>
                            ₹{p.original_price.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: p.stock > 10 ? "#10B981" : p.stock > 0 ? "#F59E0B" : "#EF4444",
                          }}
                        >
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {p.is_best_seller && (
                            <span style={{ fontSize: "0.72rem", background: "#FEF3C7", color: "#D97706", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              Best Seller
                            </span>
                          )}
                          {p.is_featured && (
                            <span style={{ fontSize: "0.72rem", background: "#E0E7FF", color: "#4F46E5", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              Featured
                            </span>
                          )}
                          {p.is_popular && (
                            <span style={{ fontSize: "0.72rem", background: "#FCE7F3", color: "#DB2777", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              Popular
                            </span>
                          )}
                          {p.is_on_sale && (
                            <span style={{ fontSize: "0.72rem", background: "#DCFCE7", color: "#16A34A", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              Sale
                            </span>
                          )}
                          {p.badge && (
                            <span style={{ fontSize: "0.72rem", background: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleStatus(p)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: isActive ? "#10B981" : "#94A3B8",
                          }}
                        >
                          {isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <Link
                            href={`/dashboard/products/${p.id}/edit?page=${activePage}`}
                            prefetch={true}
                            className="abid-btn abid-btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.82rem",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #FCA5A5",
                              background: "#FEF2F2",
                              color: "#EF4444",
                              cursor: "pointer",
                            }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--color-surface-border)",
          }}
        >
          <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
            Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong>{endIndex}</strong> of <strong>{totalItems}</strong> products
            {selectedCategory !== "all" && ` (filtered by ${selectedCategory})`}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => changePage(1)}
              disabled={activePage === 1}
              className="pagination-btn"
              title="First Page"
              aria-label="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => changePage(activePage - 1)}
              disabled={activePage === 1}
              className="pagination-btn"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} style={{ padding: "0 6px", color: "#94A3B8", fontSize: "0.88rem" }}>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => changePage(Number(p))}
                  className={`pagination-btn ${activePage === p ? "active" : ""}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => changePage(activePage + 1)}
              disabled={activePage === totalPages}
              className="pagination-btn"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => changePage(totalPages)}
              disabled={activePage === totalPages}
              className="pagination-btn"
              title="Last Page"
              aria-label="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation (Centered in Viewport via Portal) */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? It will be removed from all storefront categories."
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
