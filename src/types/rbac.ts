export interface RolePermission {
  module: string;
  action: "view" | "create" | "edit" | "delete";
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_system: number;
  permissions: string[]; // Formatted as "module:action", e.g., "products:view"
  user_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RbacModuleDefinition {
  id: string;
  label: string;
  description: string;
  actions: ("view" | "create" | "edit" | "delete")[];
}

export const RBAC_MODULES: readonly RbacModuleDefinition[] = [
  {
    id: "orders",
    label: "Orders & Fulfillment",
    description: "Manage client orders, custom sizing details, status updates & invoices",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "products",
    label: "Products & Catalog",
    description: "Manage physical furniture products, finishes, prices & custom sizing",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "categories",
    label: "Product Categories",
    description: "Organize taxonomy, parent-child product categories, and badges",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "menus",
    label: "Navigation Menus",
    description: "Control header, category dropdown, and footer navigation structures",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "services",
    label: "Interior Services",
    description: "Manage architectural design services, turnkey solutions & pricing",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "careers",
    label: "Careers & Openings",
    description: "Manage job opportunities, role openings, and candidate applications",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "brands",
    label: "Partner Brands",
    description: "Manage authorized luxury fittings & hardware manufacturer partners",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "gallery",
    label: "Work & Spatial Gallery",
    description: "Manage WebGL interactive showcase items and interior photo portfolio",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "testimonials",
    label: "Customer Reviews",
    description: "Moderate and feature customer testimonials and rating stars",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "faqs",
    label: "FAQs & Knowledge",
    description: "Frequently asked questions displayed across service and contact pages",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "blog",
    label: "Editorial & Blog",
    description: "Create, draft, and publish architecture articles and interior trends",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "submissions",
    label: "Client Inquiries & Leads",
    description: "Inspect customer quote requests, consultation inquiries, and contact submissions",
    actions: ["view", "edit", "delete"],
  },
  {
    id: "settings",
    label: "Website & Brand Settings",
    description: "Configure site logos, favicon, SEO meta tags, multiple phones and branch addresses",
    actions: ["view", "edit"],
  },
  {
    id: "users",
    label: "Staff & User Accounts",
    description: "Manage administrator and staff login accounts and password resets",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "roles",
    label: "Roles & Access Control (RBAC)",
    description: "Create dynamic roles, configure permission matrices and granular privileges",
    actions: ["view", "create", "edit", "delete"],
  },
] as const;

export type RbacModuleId = typeof RBAC_MODULES[number]["id"];
export type RbacAction = "view" | "create" | "edit" | "delete";

export const RBAC_MODULE_IDS: readonly string[] = RBAC_MODULES.map((m) => m.id);

/**
 * Pure evaluation function: checks if a permissions list allows a specific module and action.
 * Can be safely executed in Edge Middleware, Server Components, and Client Components.
 */
export function hasPermission(
  permissions: string[] | undefined,
  module: string,
  action: string
): boolean {
  if (!permissions || permissions.length === 0) return false;

  // Wildcard permissions
  if (permissions.includes("*") || permissions.includes("*:*")) return true;
  if (permissions.includes(`${module}:*`)) return true;

  // Exact permission match
  return permissions.includes(`${module}:${action}`);
}

