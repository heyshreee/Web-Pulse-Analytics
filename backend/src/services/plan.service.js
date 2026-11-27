import supabase from '../config/supabase.js';
import {
  getPlanConfig,
  getPlanLimits as getCanonicalPlanLimits,
  listPublicPlans,
  normalizePlanId,
} from '../config/plans.js';

let plansCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function invalidatePlansCache() {
  plansCache = null;
  lastFetchTime = 0;
}

/**
 * Fetch plans, merging DB metadata over the canonical backend plan config
 * while ensuring all 5 tiers and entitlements are always present.
 */
export const getAllPlans = async () => {
  const now = Date.now();
  if (plansCache && now - lastFetchTime < CACHE_DURATION) {
    return plansCache;
  }

  const canonical = listPublicPlans();

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_usd', { ascending: true });

    if (error || !Array.isArray(data) || data.length === 0) {
      plansCache = canonical;
      lastFetchTime = now;
      return canonical;
    }

    const dbById = new Map(data.map((row) => [normalizePlanId(row.id), row]));
    const merged = canonical.map((plan) => {
      const dbRow = dbById.get(plan.id);
      if (!dbRow) return plan;
      return {
        ...plan,
        name: dbRow.name || plan.name,
        ...(dbRow.entitlements && typeof dbRow.entitlements === 'object'
          ? { entitlements: { ...plan.entitlements, ...dbRow.entitlements } }
          : {}),
        ...(dbRow.access && typeof dbRow.access === 'object'
          ? { access: { ...plan.access, ...dbRow.access } }
          : {}),
      };
    });

    plansCache = merged;
    lastFetchTime = now;
    return merged;
  } catch (error) {
    console.warn('[PlanService] Falling back to canonical plan config:', error?.message);
    return plansCache || canonical;
  }
};

export const getPlanLimits = async (planId) => getCanonicalPlanLimits(planId);

export { getPlanConfig, normalizePlanId, listPublicPlans };

export default {
  getAllPlans,
  getPlanLimits,
  getPlanConfig,
  normalizePlanId,
  listPublicPlans,
  invalidatePlansCache,
};
