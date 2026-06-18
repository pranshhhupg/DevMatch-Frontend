const WEIGHT_MAX = {
  role:               20,
  preferredRoles:           15,
  skills:                   18,
  goals:                    10,
  timezone:                  6,
  preferredTimezones:        6,
  experienceLevel:           5,
  preferredExperienceLevel:  5,
  preferredAvailability:     5,
  preferredInterests:        5,
  interests:                 3,
  projects:                  2,
};

const FACTOR_LABELS = {
  role:               "Role fit",
  preferredRoles:           "Pref. Role",
  skills:                   "Skills",
  goals:                    "Goals",
  timezone:                 "Timezone",
  preferredTimezones:       "Timezone",
  experienceLevel:          "Experience",
  preferredExperienceLevel: "Experience",
  preferredAvailability:    "Availability",
  preferredInterests:       "Interests",
  interests:                "Interests",
  projects:                 "Projects",
};

function getScoreMeta(score) {
  if (score >= 60) {
    return {
      color: "badge-success",
      ring: "ring-success/30",
      label: "Great match",
    };
  }

  if (score >= 45) {
    return {
      color: "badge-warning",
      ring: "ring-warning/30",
      label: "Good match",
    };
  }

  if (score >= 25) {
    return {
      color: "badge-info",
      ring: "ring-info/30",
      label: "Decent match",
    };
  }

  return {
    color: "badge-ghost",
    ring: "ring-base-300",
    label: "Low match",
  };
}

export default function MatchBadge({
  score = 0,
  reasons = [],
  breakdown = {},
  rawBreakdown = {},
}) {

  const {color, label} = getScoreMeta(score);

  // Merge duplicate pairs — keep whichever has the higher raw score,
  // label it with the winner's key so the label stays accurate.
  const mergedBreakdown = { ...rawBreakdown };
  const tzA   = mergedBreakdown.timezone           ?? 0;
  const tzB   = mergedBreakdown.preferredTimezones ?? 0;
  mergedBreakdown.timezone = Math.max(tzA, tzB);
  delete mergedBreakdown.preferredTimezones;

  const expA  = mergedBreakdown.experienceLevel           ?? 0;
  const expB  = mergedBreakdown.preferredExperienceLevel  ?? 0;
  mergedBreakdown.experienceLevel = Math.max(expA, expB);
  delete mergedBreakdown.preferredExperienceLevel;

  const intA  = mergedBreakdown.interests          ?? 0;
  const intB  = mergedBreakdown.preferredInterests ?? 0;
  mergedBreakdown.interests = Math.max(intA, intB);
  delete mergedBreakdown.preferredInterests;

  const hasBreakdown =
    Object.keys(mergedBreakdown || {}).length > 0;

  return (
    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-base-300">

      {/* Score row */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className={`badge ${color} font-bold`}>
            {score}%
          </span>

          <span className="text-xs text-base-content/50">
            {label}
          </span>

        </div>

        {reasons.length > 0 && (
          <span className="text-xs mr-2 text-right text-base-content/40 italic">
            {reasons[0]}
          </span>
        )}

      </div>

      {/* Breakdown bars */}

      {hasBreakdown && (

        <div className="space-y-1">

          {Object.entries(mergedBreakdown || {})

            .filter(([, pts]) => pts > 0)

            .sort(([, a], [, b]) => b - a)

            .map(([key, pts]) => {

              const pct = Math.min(pts, 100);

              const barColor =
                pct >= 70
                  ? "bg-success"
                  : pct >= 40
                  ? "bg-warning"
                  : "bg-base-content/20";

              return (

                <div
                  key={key}
                  className="flex items-center gap-2"
                >

                  <span className="text-[10px] text-base-content/40 w-16 shrink-0 text-right">
                    {FACTOR_LABELS[key]}
                  </span>

                  <div className="flex-1 h-1 bg-base-300 rounded-full overflow-hidden">

                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />

                  </div>

                  <span className="text-[10px] text-base-content/40 w-8 text-right">
                    {pct}%
                  </span>

                </div>

              );
            })}

        </div>

      )}

    </div>
  );
}