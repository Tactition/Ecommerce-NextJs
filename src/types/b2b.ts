export type DealerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface DealerTier {
  id: number;
  name: string;
  slug: string;
  discount_percent: number;
  description?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DealerProfile {
  id: number;
  user_id: number;
  business_name: string;
  contact_person: string;
  business_phone: string;
  business_email: string;
  tax_number: string;
  business_type: string;
  business_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  document_url?: string | null;
  status: DealerStatus;
  tier_id?: number | null;
  rejection_reason?: string | null;
  internal_notes?: string | null;
  allow_credit_terms: number;
  credit_limit: number;
  credit_days: number;
  approved_at?: string | null;
  approved_by?: number | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  tier_name?: string | null;
  tier_discount_percent?: number | null;
  user_name?: string;
  user_email?: string;
}

export interface WholesalePrice {
  id: number;
  product_id: number;
  variation_id?: number | null;
  tier_id?: number | null;
  dealer_id?: number | null;
  wholesale_price: number;
  min_quantity: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DealerAddress {
  id: number;
  dealer_id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number;
  created_at: string;
}

export interface B2BAuditLog {
  id: number;
  dealer_id: number;
  admin_id?: number | null;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  notes?: string | null;
  created_at: string;
  admin_name?: string;
}

export interface PriceCalculationResult {
  finalPrice: number;
  retailPrice: number;
  discountPercent: number;
  minQuantity: number;
  ruleApplied: 'DEALER_OVERRIDE' | 'TIER_PRODUCT_OVERRIDE' | 'TIER_PERCENT_DISCOUNT' | 'DEFAULT_WHOLESALE' | 'RETAIL_FALLBACK';
  isWholesale: boolean;
}
