import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { setMyOpportunities, removeOpportunityFromStore } from "../utils/opportunitySlice";

// ── Static maps ───────────────────────────────────────────────────────────────
const SCORE_BADGE = {
  beginner:     "badge-info",
  intermediate: "badge-warning",
  advanced:     "badge-success",
};

const TYPE_META = {
  "hackathon":      { badge: "badge-primary",  icon: "" },
  "startup":        { badge: "badge-secondary", icon: "" },
  "company hiring": { badge: "badge-success",   icon: "" },
  "open source":    { badge: "badge-info",      icon: "" },
  "freelance":      { badge: "badge-warning",   icon: "" },
};

function Row({ label, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-base-content/40 w-24 shrink-0 mt-0.5 uppercase tracking-wide font-semibold">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((store) => store.user);
  const { myList: myOpportunities } = useSelector((store) => store.opportunity);

  const [loadingOpps, setLoadingOpps] = useState(false);

  // Fetch the logged-in user's own opportunities for the profile section
  useEffect(() => {
    const fetchMyOpportunities = async () => {
      setLoadingOpps(true);
      try {
        const res = await axios.get(`${BASE_URL}/collab/my-opportunities`, {
          withCredentials: true,
        });
        dispatch(setMyOpportunities(res.data.data));
      } catch (err) {
        console.error("Failed to fetch my opportunities:", err.message);
      } finally {
        setLoadingOpps(false);
      }
    };

    fetchMyOpportunities();
  }, []);

  const handleDeleteOpportunity = async (id) => {
    if (!window.confirm("Delete this opportunity?")) return;
    try {
      await axios.delete(`${BASE_URL}/collab/opportunity/${id}`, {
        withCredentials: true,
      });
      dispatch(removeOpportunityFromStore(id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  if (!user) return null;

  const {
    name, photoUrl, about, age, gender,
    skills = [], lookingFor = [], goals = [],
    availability, experienceLevel, timezone,
    hackathonInterest, startupInterest,
    learningGoals = [], projectIdeas = [],
  } = user;

  return (
    <div className="max-w-xl mx-auto py-8 px-4 flex flex-col gap-6">

      {/* ── Header Card ──────────────────────────────────────── */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body items-center text-center gap-3">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  photoUrl ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                }
                alt={name}
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            {(age || gender) && (
              <p className="text-sm text-base-content/50">
                {[age && `${age} yrs`, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {about && (
            <p className="text-sm text-base-content/70 max-w-sm">{about}</p>
          )}

          <Link to="/profile/edit" className="btn btn-primary btn-sm mt-1">
            ✏️ Edit Profile
          </Link>
        </div>
      </div>

      {/* ── Tech Profile ─────────────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Tech Profile</h2>

          {experienceLevel && (
            <Row label="Experience">
              <span className={`badge ${SCORE_BADGE[experienceLevel] || "badge-ghost"} capitalize`}>
                {experienceLevel}
              </span>
            </Row>
          )}

          {skills.length > 0 && (
            <Row label="Skills">
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s} className="badge badge-primary badge-sm capitalize font-semibold">{s}</span>
                ))}
              </div>
            </Row>
          )}

          {lookingFor.length > 0 && (
            <Row label="Looking For">
              <div className="flex flex-wrap gap-1">
                {lookingFor.map((r) => (
                  <span key={r} className="badge badge-primary badge-sm capitalize font-semibold">
                    {r}
                  </span>
                ))}
              </div>
            </Row>
          )}
        </div>
      </div>

      {/* ── Availability & Goals ─────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Availability & Goals</h2>

          {availability && (
            <Row label="Availability">
              <span className="badge badge-outline capitalize">{availability}</span>
            </Row>
          )}

          {timezone && (
            <Row label="Timezone">
              <span className="text-sm text-base-content/70">{timezone}</span>
            </Row>
          )}

          {goals.length > 0 && (
            <Row label="Goals">
              <div className="flex flex-wrap gap-1">
                {goals.map((g) => (
                  <span key={g} className="badge badge-secondary badge-sm capitalize">{g}</span>
                ))}
              </div>
            </Row>
          )}

          <Row label="Interests">
            <div className="flex gap-2 flex-wrap">
              {hackathonInterest && (
                <span className="badge badge-accent badge-sm">⚡ Hackathons</span>
              )}
              {startupInterest && (
                <span className="badge badge-accent badge-sm">🚀 Startups</span>
              )}
              {!hackathonInterest && !startupInterest && (
                <span className="text-sm text-base-content/40">—</span>
              )}
            </div>
          </Row>
        </div>
      </div>

      {/* ── Projects & Learning ──────────────────────────────── */}
      {(learningGoals.length > 0 || projectIdeas.length > 0) && (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body gap-4">
            <h2 className="card-title text-base">Projects & Learning</h2>

            {learningGoals.length > 0 && (
              <Row label="Learning">
                <div className="flex flex-wrap gap-1">
                  {learningGoals.map((g) => (
                    <span key={g} className="badge badge-ghost badge-sm">{g}</span>
                  ))}
                </div>
              </Row>
            )}

            {projectIdeas.length > 0 && (
              <Row label="Ideas">
                <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                  {projectIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </Row>
            )}
          </div>
        </div>
      )}

      {/* ── My Opportunities ─────────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-base">My Opportunities</h2>
            <Link to="/collab" className="btn btn-ghost btn-xs">
              + List New
            </Link>
          </div>

          {/* Loading */}
          {loadingOpps && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm text-primary" />
            </div>
          )}

          {/* Empty */}
          {!loadingOpps && myOpportunities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-base-content/40">
                You haven't listed any opportunities yet.
              </p>
              <Link to="/collab" className="btn btn-primary btn-sm mt-3">
                Go to Collab Hub
              </Link>
            </div>
          )}

          {/* List */}
          {!loadingOpps && myOpportunities.length > 0 && (
            <div className="flex flex-col gap-3">
              {myOpportunities.map((opp) => {
                const meta = TYPE_META[opp.eventType] || { badge: "badge-ghost", icon: "📌" };
                return (
                  <div
                    key={opp._id}
                    className="flex items-start justify-between gap-3 p-3 bg-base-100 rounded-xl"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${meta.badge} badge-sm capitalize`}>
                          {meta.icon} {opp.eventType}
                        </span>
                        {!opp.isActive && (
                          <span className="badge badge-ghost badge-sm">Inactive</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-1">
                        {opp.title}
                      </p>
                      <p className="text-xs text-base-content/40">
                        📍 {opp.location}
                        {opp.duration ? ` · ⏱ ${opp.duration}` : ""}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate("/collab")}
                        title="Edit in Collab Hub"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDeleteOpportunity(opp._id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}