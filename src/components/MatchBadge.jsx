const WEIGHT_MAX = {
  lookingFor: 35,
  skills: 25,
  goals: 15,
  timezone: 8,
  experienceLevel: 7,
  interests: 5,
  projects: 5,
};

const FACTOR_LABELS = {
  lookingFor: "Role fit",
  skills: "Skills",
  goals: "Goals",
  timezone: "Timezone",
  experienceLevel: "Experience",
  interests: "Interests",
  projects: "Projects",
};

function getScoreMeta(score) {
  if (score >= 75) {
    return {
      color: "badge-success",
      ring: "ring-success/30",
      label: "Great match",
    };
  }

  if (score >= 50) {
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

  const { color, label } = getScoreMeta(score);

  const hasBreakdown =
    Object.keys(rawBreakdown || {}).length > 0;

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
          <span className="text-xs text-base-content/40 italic">
            {reasons[0]}
          </span>
        )}

      </div>

      {/* Breakdown bars */}

      {hasBreakdown && (

        <div className="space-y-1">

          {Object.entries(rawBreakdown || {})

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