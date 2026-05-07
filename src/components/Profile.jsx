import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const SCORE_COLORS = {
  beginner:     "badge-info",
  intermediate: "badge-warning",
  advanced:     "badge-success",
};

export default function Profile() {
  const user = useSelector((store) => store.user);

  if (!user) return null;

  const {
    firstName, lastName, photoUrl, about, age, gender, skills = [],
    lookingFor = [], goals = [], availability, experienceLevel,
    timezone, hackathonInterest, startupInterest,
    learningGoals = [], projectIdeas = [],
  } = user;

  return (
    <div className="max-w-xl mx-auto py-8 px-4 flex flex-col gap-6">

      {/* Header */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body items-center text-center gap-3">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  photoUrl ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                }
                alt={firstName+lastName}
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{firstName + " " + lastName}</h1>
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
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Tech Profile */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Tech Profile</h2>

          {experienceLevel && (
            <Row label="Experience">
              <span className={`badge ${SCORE_COLORS[experienceLevel]} capitalize font-bold`}>
                {experienceLevel}
              </span>
            </Row>
          )}

          {skills.length > 0 && (
            <Row label="Skills">
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s} className="badge badge-primary badge-sm text-xs font-medium capitalize">{s}</span>
                ))}
              </div>
            </Row>
          )}

          {lookingFor.length > 0 && (
            <Row label="Looking For">
              <div className="flex flex-wrap gap-1">
                {lookingFor.map((r) => (
                  <span key={r} className="badge badge-primary badge-sm text-xs font-medium capitalize">
                    {r}
                  </span>
                ))}
              </div>
            </Row>
          )}
        </div>
      </div>

      {/* Availability & Goals */}
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
                  <span key={g} className="badge badge-secondary badge-sm capitalize">
                    {g}
                  </span>
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

      {/* Projects & Learning */}
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
              <Row label="Project Ideas">
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
    </div>
  );
}

// Small layout helper
function Row({ label, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-base-content/40 w-24 shrink-0 mt-0.5 uppercase tracking-wide font-medium">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}