"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";

export interface ProductAttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  slug: string;
  color_code?: string | null;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  values: ProductAttributeValue[];
}

export interface ProductVariationValueItem {
  attribute_id: number;
  attribute_name: string;
  value_id: number;
  value_label: string;
  slug?: string;
  attribute_slug?: string;
}

export interface ProductVariation {
  id: number;
  product_id: number;
  sku: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image: string | null;
  is_active: boolean;
  attributes: Record<string, string>; // e.g. { "size": "standard-5x7", "color": "natural-oak" }
  attribute_names: Record<string, string>; // e.g. { "Size / Dimensions": "Standard (5x7 ft)", "Color / Finish": "Natural Oak" }
  values?: ProductVariationValueItem[];
}

/**
 * Fetch all available product attributes and their configured values
 */
const fetchAllAttributesWithValuesUncached = async (): Promise<ProductAttribute[]> => {
  try {
    const [[attrRows], [valRows]] = await Promise.all([
      pool.query<RowDataPacket[]>(
        "SELECT id, name, slug FROM product_attributes ORDER BY id ASC"
      ),
      pool.query<RowDataPacket[]>(
        "SELECT id, attribute_id, value, slug, color_code FROM product_attribute_values ORDER BY id ASC"
      ),
    ]);

    const valuesByAttr = new Map<number, ProductAttributeValue[]>();
    for (const v of valRows) {
      if (!valuesByAttr.has(v.attribute_id)) {
        valuesByAttr.set(v.attribute_id, []);
      }
      valuesByAttr.get(v.attribute_id)!.push({
        id: v.id,
        attribute_id: v.attribute_id,
        value: v.value,
        slug: v.slug,
        color_code: v.color_code || null,
      });
    }

    return attrRows.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      values: valuesByAttr.get(a.id) || [],
    }));
  } catch (error) {
    console.error("Error fetching attributes with values:", error);
    return [];
  }
};

const fetchAllAttributesWithValuesCached = unstable_cache(
  fetchAllAttributesWithValuesUncached,
  ["all-attributes-with-values"],
  { tags: ["attributes"], revalidate: 3600 }
);

export async function getAllAttributesWithValues(): Promise<ProductAttribute[]> {
  return fetchAllAttributesWithValuesCached();
}

const fetchProductVariationsUncached = async (
  productId: number,
  includeInactive: boolean = false
): Promise<ProductVariation[]> => {
  try {
    const query = includeInactive
      ? `SELECT id, product_id, sku, price, original_price, stock, image, is_active
         FROM product_variations
         WHERE product_id = ?
         ORDER BY id ASC`
      : `SELECT id, product_id, sku, price, original_price, stock, image, is_active
         FROM product_variations
         WHERE product_id = ? AND is_active = 1
         ORDER BY id ASC`;
    const [varRows] = await pool.query<RowDataPacket[]>(query, [productId]);

    if (varRows.length === 0) return [];

    const varIds = varRows.map((r) => r.id);
    const [pivotRows] = await pool.query<RowDataPacket[]>(
      `SELECT pvv.variation_id, pvv.attribute_id, pvv.value_id, pa.slug as attr_slug, pa.name as attr_name, pav.slug as val_slug, pav.value as val_name
       FROM product_variation_values pvv
       JOIN product_attributes pa ON pvv.attribute_id = pa.id
       JOIN product_attribute_values pav ON pvv.value_id = pav.id
       WHERE pvv.variation_id IN (?)`,
      [varIds]
    );

    const attrMap = new Map<number, {
      attrs: Record<string, string>;
      names: Record<string, string>;
      values: ProductVariationValueItem[];
    }>();
    for (const p of pivotRows) {
      if (!attrMap.has(p.variation_id)) {
        attrMap.set(p.variation_id, { attrs: {}, names: {}, values: [] });
      }
      const entry = attrMap.get(p.variation_id)!;
      entry.attrs[p.attr_slug] = p.val_slug;
      entry.names[p.attr_name] = p.val_name;
      entry.values.push({
        attribute_id: p.attribute_id,
        attribute_name: p.attr_name,
        value_id: p.value_id,
        value_label: p.val_name,
        slug: p.val_slug,
        attribute_slug: p.attr_slug,
      });
    }

    return varRows.map((r) => {
      const mapped = attrMap.get(r.id) || { attrs: {}, names: {}, values: [] };
      return {
        id: r.id,
        product_id: r.product_id,
        sku: r.sku,
        price: Number(r.price),
        original_price: r.original_price ? Number(r.original_price) : null,
        stock: Number(r.stock),
        image: r.image || null,
        is_active: Boolean(r.is_active),
        attributes: mapped.attrs,
        attribute_names: mapped.names,
        values: mapped.values,
      };
    });
  } catch (error) {
    console.error("Error fetching product variations:", error);
    return [];
  }
};

export async function getProductVariations(
  productId: number,
  includeInactive: boolean = false
): Promise<ProductVariation[]> {
  if (includeInactive) {
    return fetchProductVariationsUncached(productId, true);
  }
  const cachedFn = unstable_cache(
    () => fetchProductVariationsUncached(productId, false),
    [`product-variations-${productId}`],
    { tags: ["products", "variations"], revalidate: 3600 }
  );
  return cachedFn();
}

/**
 * Admin action: create a new attribute (e.g. "Wood Species")
 */
export async function createAttributeAction(name: string) {
  await requireAuth();
  if (!name.trim()) return { success: false, error: "Attribute name is required" };

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const [res] = await pool.execute<ResultSetHeader>(
      "INSERT INTO product_attributes (name, slug) VALUES (?, ?)",
      [name.trim(), slug]
    );
    return { success: true, id: res.insertId, slug };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create attribute";
    return { success: false, error: msg };
  }
}

/**
 * Admin action: create a new attribute value (e.g. "Walnut")
 */
export async function createAttributeValueAction(attributeId: number, value: string, colorCode?: string) {
  await requireAuth();
  if (!value.trim()) return { success: false, error: "Value is required" };

  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const [res] = await pool.execute<ResultSetHeader>(
      "INSERT INTO product_attribute_values (attribute_id, value, slug, color_code) VALUES (?, ?, ?, ?)",
      [attributeId, value.trim(), slug, colorCode || null]
    );
    return { success: true, id: res.insertId, slug };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create attribute value";
    return { success: false, error: msg };
  }
}

export interface SaveVariationInput {
  id?: number;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  image?: string | null;
  is_active: boolean | number;
  value_ids?: number[]; // e.g. [1, 5] IDs in product_attribute_values
  values?: { attribute_id: number; value_id: number; value_name?: string }[];
}

/**
 * Admin action: save all variations for a product
 */
export async function saveProductVariationsAction(
  productId: number,
  hasVariations: boolean,
  variations: SaveVariationInput[]
) {
  await requireAuth();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (!hasVariations || variations.length === 0) {
      await conn.query("UPDATE products SET has_variations = 0 WHERE id = ?", [productId]);
      await conn.query("DELETE FROM product_variations WHERE product_id = ?", [productId]);
      await conn.commit();
      revalidatePath(`/product`);
      revalidatePath(`/dashboard/products`);
      return { success: true };
    }

    // Set has_variations = 1
    await conn.query("UPDATE products SET has_variations = 1 WHERE id = ?", [productId]);

    // Delete existing variations for this product and re-insert normalized
    await conn.query("DELETE FROM product_variations WHERE product_id = ?", [productId]);

    for (const v of variations) {
      const [vRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO product_variations (product_id, sku, price, original_price, stock, image, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          v.sku || null,
          v.price || 0,
          v.original_price || null,
          v.stock || 0,
          v.image || null,
          v.is_active ? 1 : 0,
        ]
      );

      const newVarId = vRes.insertId;

      const valIds = v.value_ids && v.value_ids.length > 0
        ? v.value_ids
        : v.values && v.values.length > 0
        ? v.values.map((val) => val.value_id)
        : [];

      if (valIds.length > 0) {
        for (const valId of valIds) {
          // Find attribute_id for this value_id
          const [valRows] = await conn.query<RowDataPacket[]>(
            "SELECT attribute_id FROM product_attribute_values WHERE id = ? LIMIT 1",
            [valId]
          );
          if (valRows.length > 0) {
            const attrId = valRows[0].attribute_id;
            await conn.execute(
              "INSERT INTO product_variation_values (variation_id, attribute_id, value_id) VALUES (?, ?, ?)",
              [newVarId, attrId, valId]
            );
          }
        }
      }
    }

    await conn.commit();
    revalidatePath(`/product`);
    revalidatePath(`/dashboard/products`);
    return { success: true };
  } catch (err: unknown) {
    await conn.rollback();
    const msg = err instanceof Error ? err.message : "Failed to save variations";
    return { success: false, error: msg };
  } finally {
    conn.release();
  }
}

export interface DynamicAttributeItem {
  id?: number;
  name: string;
  values: string[];
}

export interface DynamicVariationRowInput {
  id?: number;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  image?: string | null;
  is_active: boolean | number;
  combination: Record<string, string>; // e.g. { "Size": "King", "Wood Finish": "Teak" }
}

export async function saveDynamicProductVariationsAction(
  productId: number,
  hasVariations: boolean,
  attributes: DynamicAttributeItem[],
  variations: DynamicVariationRowInput[]
) {
  await requireAuth();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If hasVariations is true and variations is empty, but attributes exist, auto-generate combinations
    let workingVariations: DynamicVariationRowInput[] = [...variations];
    const validAttributes = attributes
      .filter((a) => a.name.trim() !== "" && a.values.some((v) => v && v.trim() !== ""))
      .map((a) => ({
        ...a,
        values: a.values.map((v) => v.trim()).filter(Boolean),
      }));

    if (hasVariations && workingVariations.length === 0 && validAttributes.length > 0) {
      const [prodRows] = await conn.query<RowDataPacket[]>(
        "SELECT price, original_price, stock, slug, image FROM products WHERE id = ? LIMIT 1",
        [productId]
      );
      const prod = prodRows[0];
      let combos: Record<string, string>[] = [{}];
      for (const attr of validAttributes) {
        const nextCombos: Record<string, string>[] = [];
        for (const existingCombo of combos) {
          for (const val of attr.values) {
            nextCombos.push({
              ...existingCombo,
              [attr.name.trim()]: val,
            });
          }
        }
        combos = nextCombos;
      }

      const basePrefix = (prod?.slug || "PROD")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

      workingVariations = combos.map((combo) => {
        const skuSuffix = Object.values(combo)
          .map((val) => val.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
          .join("-");
        return {
          sku: `${basePrefix}-${skuSuffix}`,
          price: Number(prod?.price || 0),
          original_price: prod?.original_price ? Number(prod.original_price) : null,
          stock: Number(prod?.stock || 10),
          image: prod?.image || null,
          is_active: 1,
          combination: combo,
        };
      });
    }

    if (!hasVariations || workingVariations.length === 0) {
      await conn.query("UPDATE products SET has_variations = 0 WHERE id = ?", [productId]);
      await conn.query("DELETE FROM product_variations WHERE product_id = ?", [productId]);
      await conn.commit();
      revalidatePath(`/product`);
      revalidatePath(`/product/[slug]`, "page");
      revalidatePath(`/shop`);
      revalidatePath(`/`);
      revalidatePath(`/dashboard/products`);
      revalidatePath(`/dashboard/products/[id]/edit`, "page");
      return { success: true };
    }

    await conn.query("UPDATE products SET has_variations = 1 WHERE id = ?", [productId]);

    // Map of attribute & value identifiers: `${attrName.toLowerCase()}:::${valName.toLowerCase()}` -> { attrId, valId }
    const lookupMap = new Map<string, { attrId: number; valId: number }>();

    for (const attr of attributes) {
      const attrName = attr.name.trim();
      if (!attrName) continue;
      const baseSlug = attrName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `attr-${Date.now()}`;
      let attrSlug = baseSlug;

      let attrId: number;
      const [existingAttr] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM product_attributes WHERE LOWER(name) = LOWER(?) OR slug = ? LIMIT 1",
        [attrName, baseSlug]
      );
      if (existingAttr && existingAttr.length > 0) {
        attrId = existingAttr[0].id;
      } else {
        let counter = 1;
        while (true) {
          const [dup] = await conn.query<RowDataPacket[]>(
            "SELECT id FROM product_attributes WHERE slug = ? LIMIT 1",
            [attrSlug]
          );
          if (dup.length === 0) break;
          attrSlug = `${baseSlug}-${counter++}`;
        }
        const [insAttr] = await conn.execute<ResultSetHeader>(
          "INSERT INTO product_attributes (name, slug) VALUES (?, ?)",
          [attrName, attrSlug]
        );
        attrId = insAttr.insertId;
      }

      for (const valRaw of attr.values) {
        const valName = valRaw.trim();
        if (!valName) continue;
        const valSlug = valName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `val-${Date.now()}`;

        let valId: number;
        const [existingVal] = await conn.query<RowDataPacket[]>(
          "SELECT id FROM product_attribute_values WHERE attribute_id = ? AND (LOWER(value) = LOWER(?) OR slug = ?) LIMIT 1",
          [attrId, valName, valSlug]
        );
        if (existingVal && existingVal.length > 0) {
          valId = existingVal[0].id;
        } else {
          const [insVal] = await conn.execute<ResultSetHeader>(
            "INSERT INTO product_attribute_values (attribute_id, value, slug) VALUES (?, ?, ?)",
            [attrId, valName, valSlug]
          );
          valId = insVal.insertId;
        }

        lookupMap.set(`${attrName.toLowerCase()}:::${valName.toLowerCase()}`, { attrId, valId });
      }
    }

    // Also ensure all combinations from variations rows are included in lookupMap
    for (const v of workingVariations) {
      for (const [rawAttrName, rawValName] of Object.entries(v.combination || {})) {
        const attrName = rawAttrName.trim();
        const valName = rawValName.trim();
        if (!attrName || !valName) continue;
        const key = `${attrName.toLowerCase()}:::${valName.toLowerCase()}`;
        if (lookupMap.has(key)) continue;

        const baseSlug = attrName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `attr-${Date.now()}`;
        let attrSlug = baseSlug;

        let attrId: number;
        const [existingAttr] = await conn.query<RowDataPacket[]>(
          "SELECT id FROM product_attributes WHERE LOWER(name) = LOWER(?) OR slug = ? LIMIT 1",
          [attrName, baseSlug]
        );
        if (existingAttr && existingAttr.length > 0) {
          attrId = existingAttr[0].id;
        } else {
          let counter = 1;
          while (true) {
            const [dup] = await conn.query<RowDataPacket[]>(
              "SELECT id FROM product_attributes WHERE slug = ? LIMIT 1",
              [attrSlug]
            );
            if (dup.length === 0) break;
            attrSlug = `${baseSlug}-${counter++}`;
          }
          const [insAttr] = await conn.execute<ResultSetHeader>(
            "INSERT INTO product_attributes (name, slug) VALUES (?, ?)",
            [attrName, attrSlug]
          );
          attrId = insAttr.insertId;
        }

        const valSlug = valName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `val-${Date.now()}`;
        let valId: number;
        const [existingVal] = await conn.query<RowDataPacket[]>(
          "SELECT id FROM product_attribute_values WHERE attribute_id = ? AND (LOWER(value) = LOWER(?) OR slug = ?) LIMIT 1",
          [attrId, valName, valSlug]
        );
        if (existingVal && existingVal.length > 0) {
          valId = existingVal[0].id;
        } else {
          const [insVal] = await conn.execute<ResultSetHeader>(
            "INSERT INTO product_attribute_values (attribute_id, value, slug) VALUES (?, ?, ?)",
            [attrId, valName, valSlug]
          );
          valId = insVal.insertId;
        }

        lookupMap.set(key, { attrId, valId });
      }
    }

    // Clear previous variations for this product
    await conn.query("DELETE FROM product_variations WHERE product_id = ?", [productId]);

    // Insert new variations
    for (const v of workingVariations) {
      const [vRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO product_variations (product_id, sku, price, original_price, stock, image, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          v.sku || null,
          v.price || 0,
          v.original_price || null,
          v.stock || 0,
          v.image || null,
          v.is_active ? 1 : 0,
        ]
      );
      const newVarId = vRes.insertId;

      for (const [attrKey, valKey] of Object.entries(v.combination || {})) {
        const mapped = lookupMap.get(`${attrKey.trim().toLowerCase()}:::${valKey.trim().toLowerCase()}`);
        if (mapped) {
          await conn.execute(
            "INSERT INTO product_variation_values (variation_id, attribute_id, value_id) VALUES (?, ?, ?)",
            [newVarId, mapped.attrId, mapped.valId]
          );
        }
      }
    }

    await conn.commit();
    revalidatePath(`/product`);
    revalidatePath(`/product/[slug]`, "page");
    revalidatePath(`/shop`);
    revalidatePath(`/`);
    revalidatePath(`/dashboard/products`);
    revalidatePath(`/dashboard/products/[id]/edit`, "page");
    revalidateTag("attributes");
    revalidateTag("variations");
    revalidateTag("products");
    return { success: true };
  } catch (err: unknown) {
    await conn.rollback();
    const msg = err instanceof Error ? err.message : "Failed to save dynamic variations";
    return { success: false, error: msg };
  } finally {
    conn.release();
  }
}
