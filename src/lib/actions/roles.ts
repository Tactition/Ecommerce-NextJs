"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { requirePermission, invalidateRoleCache } from "@/lib/rbac";
import { roleCreateSchema, roleUpdateSchema } from "@/lib/validations";
import { Role } from "@/types/rbac";
import { revalidatePath } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Retrieves all dynamic roles along with their permission list and user counts.
 */
export async function getAllRolesAction(): Promise<Role[]> {
  await requirePermission("roles", "view");

  try {
    // 1. Fetch all roles and count assigned users
    const [roleRows] = await pool.query<RowDataPacket[]>(`
      SELECT r.id, r.name, r.slug, r.description, r.is_system, r.created_at, r.updated_at,
             COUNT(u.id) as user_count
      FROM roles r
      LEFT JOIN users u ON u.role = r.slug
      GROUP BY r.id
      ORDER BY r.is_system DESC, r.name ASC
    `);

    // 2. Fetch all role permissions
    const [permRows] = await pool.query<RowDataPacket[]>(`
      SELECT role_id, module, action FROM role_permissions
    `);

    const permsMap = new Map<number, string[]>();
    permRows.forEach((p) => {
      const arr = permsMap.get(p.role_id) || [];
      arr.push(`${p.module}:${p.action}`);
      permsMap.set(p.role_id, arr);
    });

    return roleRows.map((r) => {
      const isSystemAdmin = r.slug === "admin";
      return {
        id: Number(r.id),
        name: String(r.name),
        slug: String(r.slug),
        description: r.description ? String(r.description) : null,
        is_system: Number(r.is_system || 0),
        permissions: isSystemAdmin ? ["*"] : permsMap.get(r.id) || [],
        user_count: Number(r.user_count || 0),
        created_at: r.created_at ? String(r.created_at) : undefined,
        updated_at: r.updated_at ? String(r.updated_at) : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching all roles:", error);
    return [];
  }
}

/**
 * Creates a new role with custom permissions.
 */
export async function createRoleAction(formData: FormData) {
  await requirePermission("roles", "create");

  const rawPermissions = formData.get("permissions");
  let parsedPermissions: string[] = [];
  if (typeof rawPermissions === "string") {
    try {
      parsedPermissions = JSON.parse(rawPermissions);
    } catch {
      parsedPermissions = [];
    }
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    permissions: parsedPermissions,
  };

  const parsed = roleCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed.",
    };
  }

  const { name, slug, description, permissions } = parsed.data;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    // Check if slug is unique
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE slug = ? LIMIT 1",
      [cleanSlug]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: `A role with slug '${cleanSlug}' already exists. Please pick a unique identifier.`,
      };
    }

    // Insert into roles
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, 0)",
      [name.trim(), cleanSlug, description ? description.trim() : null]
    );

    const roleId = result.insertId;

    // Insert permissions
    if (permissions.length > 0) {
      const values: [number, string, string][] = [];
      permissions.forEach((perm) => {
        const [mod, act] = perm.split(":");
        if (mod && act) {
          values.push([roleId, mod, act]);
        }
      });

      if (values.length > 0) {
        for (const [rId, m, a] of values) {
          await pool.execute(
            "INSERT IGNORE INTO role_permissions (role_id, module, action) VALUES (?, ?, ?)",
            [rId, m, a]
          );
        }
      }
    }

    invalidateRoleCache(cleanSlug);
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");

    return { success: true, roleId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create role.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing role's name, description, and permissions.
 */
export async function updateRoleAction(formData: FormData) {
  await requirePermission("roles", "edit");

  const rawPermissions = formData.get("permissions");
  let parsedPermissions: string[] = [];
  if (typeof rawPermissions === "string") {
    try {
      parsedPermissions = JSON.parse(rawPermissions);
    } catch {
      parsedPermissions = [];
    }
  }

  const raw = {
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: parsedPermissions,
  };

  const parsed = roleUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed.",
    };
  }

  const { id, name, description, permissions } = parsed.data;

  try {
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, slug, is_system FROM roles WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existingRows || existingRows.length === 0) {
      return { success: false, error: "Role not found." };
    }

    const currentRole = existingRows[0];
    const isSystemAdmin = currentRole.slug === "admin";

    // Update name and description
    await pool.execute<ResultSetHeader>(
      "UPDATE roles SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description ? description.trim() : null, id]
    );

    // If it's the super administrator role, we preserve full access
    if (!isSystemAdmin) {
      // Clear old permissions and write updated set
      await pool.execute("DELETE FROM role_permissions WHERE role_id = ?", [id]);

      if (permissions.length > 0) {
        for (const perm of permissions) {
          const [mod, act] = perm.split(":");
          if (mod && act) {
            await pool.execute(
              "INSERT IGNORE INTO role_permissions (role_id, module, action) VALUES (?, ?, ?)",
              [id, mod, act]
            );
          }
        }
      }
    }

    invalidateRoleCache(currentRole.slug);
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role.";
    return { success: false, error: message };
  }
}

/**
 * Deletes a custom role if it's not a system role and has no assigned users.
 */
export async function deleteRoleAction(roleId: number) {
  await requirePermission("roles", "delete");

  try {
    const [roleRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, slug, name, is_system FROM roles WHERE id = ? LIMIT 1",
      [roleId]
    );

    if (!roleRows || roleRows.length === 0) {
      return { success: false, error: "Role not found." };
    }

    const role = roleRows[0];

    if (role.is_system === 1 || role.slug === "admin") {
      return {
        success: false,
        error: `Cannot delete '${role.name}': This is a protected system role required by the core platform.`,
      };
    }

    // Check if any users are currently assigned to this role
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users WHERE role = ?",
      [role.slug]
    );

    const userCount = Number(userRows[0]?.count || 0);
    if (userCount > 0) {
      return {
        success: false,
        error: `Cannot delete '${role.name}': There are currently ${userCount} team member(s) assigned to this role. Reassign them before deleting.`,
      };
    }

    // Delete permissions and role
    await pool.execute("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
    await pool.execute("DELETE FROM roles WHERE id = ?", [roleId]);

    invalidateRoleCache(role.slug);
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete role.";
    return { success: false, error: message };
  }
}
