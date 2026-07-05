function formatRate(cents, rateType) {
  if (rateType === 'quote' || !cents) return 'Custom quote';
  const dollars = cents / 100;
  const amount = Number.isInteger(dollars) ? dollars : dollars.toFixed(2);
  return rateType === 'flat' ? `$${amount} flat` : `$${amount}/hr`;
}

function initials(fullName) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ContractorCard({ contractor }) {
  const {
    full_name: fullName,
    trade_name: tradeName,
    bio,
    service_city: city,
    service_province: province,
    profile_photo_url: photoUrl,
    is_verified: isVerified,
    is_available: isAvailable,
    avg_rating: avgRating,
    review_count: reviewCount,
    market_rate_cad: rateCad,
    rate_type: rateType,
  } = contractor;

  return (
    <div className="rounded-2xl border border-navy-500 bg-navy-700/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-500 text-sm font-semibold text-white">
              {initials(fullName)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 title={fullName} className="truncate text-sm font-semibold text-white">
              {fullName}
            </h3>
            <div className="flex items-center gap-1.5">
              <p title={tradeName} className="truncate text-xs font-medium text-accent-light">
                {tradeName}
              </p>
              {isVerified && (
                <span className="shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-light">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-navy-200">
              {city}
              {province ? `, ${province}` : ''}
            </p>
          </div>
        </div>

        {!isAvailable && (
          <span className="shrink-0 rounded-full bg-navy-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-200">
            Unavailable
          </span>
        )}
      </div>

      {bio && <p className="mt-3 line-clamp-2 text-xs text-navy-200">{bio}</p>}

      <div className="mt-3 flex items-center justify-between border-t border-navy-600 pt-3 text-xs">
        <div className="flex items-center gap-1 text-navy-100">
          <span className="text-accent-light">★</span>
          <span className="font-semibold text-white">{Number(avgRating).toFixed(1)}</span>
          <span className="text-navy-300">({reviewCount})</span>
        </div>
        <span className="font-semibold text-white">{formatRate(rateCad, rateType)}</span>
      </div>
    </div>
  );
}
