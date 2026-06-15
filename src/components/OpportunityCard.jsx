import { useNavigate } from "react-router-dom";
import OpportunityDetails from "./OpportunityDetail";
import { useState } from "react";
import DeveloperLink from "./DeveloperLink";

// ── Static maps ───────────────────────────────────────────────────────────────
const TYPE_META = {
  "hackathon": { badge: "badge-primary",   icon: "", label: "Hackathon" },
  "startup": { badge: "badge-primary",  icon: "", label: "Startup" },
  "company hiring":{ badge: "badge-primary",    icon: "", label: "Company Hiring"},
  "open source":{ badge: "badge-primary",       icon: "", label: "Open Source" },
  "freelance": { badge: "badge-primary",    icon: "", label: "Freelance"},
};

const LEVEL_BADGE = {
  "beginner": "badge-primary",
  "intermediate":"badge-primary",
  "expert": "badge-primary",
  "any":"badge-primary",
};

function timeAgo(dateStr) {
  const ms    = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days  = Math.floor(ms / 86_400_000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OpportunityCard({
  opportunity,
  loggedInUserId,
  onEdit,
  onDelete,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const {
    _id, title, description, eventType, location, duration,
    techStack = [], teamSize, level, rolesNeeded = [],
    applyLink, postedBy, createdAt,
  } = opportunity;

  const isOwner =
    postedBy?._id === loggedInUserId ||
    postedBy?._id?.toString() === loggedInUserId?.toString();

  const typeMeta = TYPE_META[eventType] || { badge: "badge-ghost", icon: "📌", label: eventType };

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="card-body p-5 flex flex-col gap-3 flex-1">

        {/* ── Row 1: type badge + timestamp ──────────────────── */}
        <div className="flex items-center justify-between">
          <span className={`badge ${typeMeta.badge} gap-1 rounded-sm capitalize font-medium`}>
            {typeMeta.icon} {typeMeta.label}
          </span>
          <span className="text-xs text-base-content/40">{timeAgo(createdAt)}</span>
        </div>
        <div className="my-2">
        {/* ── Title ──────────────────────────────────────────── */}
        <h3 className="font-bold text-base leading-snug line-clamp-2">{title}</h3>

        {/* ── Description ────────────────────────────────────── */}
        <p className="text-sm text-base-content/70 line-clamp-5">{description}</p>
        <button
        className="w-full flex items-center gap-3 text-base-content/50 hover:text-primary hover:cursor-pointer transition-colors mt-3"
        onClick={() => setShowDetails(true)}
        >
        <div className="flex-1 h-px bg-primary" />
        
        <span className="text-xs font-medium">
            Click to Learn more
        </span>

        <div className="flex-1 h-px bg-primary" />
        </button>
        </div>
        {/* ── Meta row ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/50">
          {location && <span>📍 {location}</span>}
          {duration && <span>⏱ {duration}</span>}
          {teamSize && <span>👥 {teamSize} members</span>}
          {level && (
            <span className={`badge ${LEVEL_BADGE[level] || "badge-ghost"} rounded-sm badge-sm capitalize font-semibold`}>
              {level}
            </span>
          )}
        </div>

        {/* ── Tech Stack chips ───────────────────────────────── */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStack.slice(0, 5).map((t) => (
              <span key={t} className="badge badge-outline badge-sm capitalize font-semibold">{t}</span>
            ))}
            {techStack.length > 5 && (
              <span className="badge badge-outline badge-sm capitalize font-semibold">+{techStack.length - 5}</span>
            )}
          </div>
        )}

        {/* ── Roles needed ───────────────────────────────────── */}
        {rolesNeeded.length > 0 && (
          <p className="text-xs text-base-content/50">
            <span className="font-semibold text-base-content/70">Looking for: </span>
            {rolesNeeded.join(", ")}
          </p>
        )}

        {/* ── Divider ────────────────────────────────────────── */}
        <div className="divider my-0" />

        {/* ── Footer: poster + actions ───────────────────────── */}
        <div className="flex items-center justify-between gap-2">

          {/* Poster info */}
          <div className="flex items-center gap-2 min-w-0">
            <DeveloperLink userId={postedBy?._id}>
              <div className="avatar shrink-0">
                <div className="w-7 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-1">
                  <img
                    src={
                      postedBy?.photoUrl ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt={postedBy?.firstName || "User"}
                  />
                </div>
              </div>
            </DeveloperLink>
            <div className="min-w-0">
              <DeveloperLink userId={postedBy?._id} className="hover:underline hover:text-primary transition-colors">
                <p className="text-xs font-semibold truncate leading-tight">
                  {postedBy?.firstName || "Unknown"} {postedBy?.lastName}
                </p>
              </DeveloperLink>
              {postedBy?.experienceLevel && (
                <p className="text-[10px] text-base-content/40 capitalize">
                  {postedBy.experienceLevel}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 shrink-0">
            {isOwner ? (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onEdit(opportunity)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => onDelete(_id)}
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-xs"
                onClick={() => navigate(`/chat/${postedBy?._id}`)}
              >
                Message
              </button>
            )}
          </div>
        </div>

        {/* ── External Apply link ────────────────────────────── */}
        {applyLink && (
          <a
            href={applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-xs w-1/2 mt-1"
          >
            Apply/Learn More
          </a>
        )}
      </div>
      {showDetails && (
        <OpportunityDetails
          opportunity={opportunity}
          onClose={() => setShowDetails(false)}
        />
        )}
    </div>
  );
}