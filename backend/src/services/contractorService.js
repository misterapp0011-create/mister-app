import { query } from '../config/db.js';

/**
 * List browsable contractor profiles for the "Find a pro" customer view.
 * Supports optional filtering by trade slug, city, and a free-text search
 * across name/bio.
 */
export async function listContractors({ trade, city, q } = {}) {
  const conditions = ['u.is_active = TRUE', 'u.is_suspended = FALSE'];
  const params = [];

  if (trade) {
    params.push(trade);
    conditions.push(`t.slug = $${params.length}`);
  }

  if (city) {
    params.push(`%${city}%`);
    conditions.push(`cp.service_city ILIKE $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(u.full_name ILIKE $${params.length} OR cp.bio ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT
       cp.id,
       u.full_name,
       t.name AS trade_name,
       t.slug AS trade_slug,
       cp.bio,
       cp.years_experience,
       cp.service_city,
       cp.service_province,
       cp.market_rate_cad,
       cp.rate_type,
       cp.profile_photo_url,
       cp.is_verified,
       cp.avg_rating,
       cp.review_count,
       cp.is_available
     FROM contractor_profiles cp
     JOIN users u ON u.id = cp.user_id
     JOIN trades t ON t.id = cp.primary_trade_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY cp.avg_rating DESC, cp.review_count DESC`,
    params
  );

  return rows;
}
