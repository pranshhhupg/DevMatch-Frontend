import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

// ── Static option lists ────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Java", "Spring",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "Docker",
  "Kubernetes", "AWS", "Tailwind CSS", "Figma", "Flutter", "Kotlin",
];

const LOOKING_FOR_OPTIONS = [
  { value: "frontend dev",    label: "Frontend Dev"    },
  { value: "backend dev",     label: "Backend Dev"     },
  { value: "ml engineer",     label: "ML Engineer"     },
  { value: "designer",        label: "Designer"        },
  { value: "product manager", label: "Product Manager" },
  { value: "devops",          label: "DevOps"          },
  { value: "mobile dev",      label: "Mobile Dev"      },
  { value: "any",             label: "Anyone"          },
];

const GOALS_OPTIONS = [
  { value: "build a startup", label: "Build a Startup"  },
  { value: "win hackathons",  label: "Win Hackathons"   },
  { value: "learn new tech",  label: "Learn New Tech"   },
  { value: "open source",     label: "Open Source"      },
  { value: "freelance",       label: "Freelance"        },
  { value: "get a job",       label: "Get a Job"        },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekends",  label: "Weekends"  },
  { value: "evenings",  label: "Evenings"  },
  { value: "full-time", label: "Full-Time" },
  { value: "flexible",  label: "Flexible"  },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner",     label: "Beginner (< 1 yr)"     },
  { value: "intermediate", label: "Intermediate (1–3 yrs)" },
  { value: "advanced",     label: "Advanced (3+ yrs)"      },
];

const COMMON_TIMEZONES = [
  "Asia/Kolkata", "Asia/Tokyo", "Asia/Singapore", "Asia/Dubai",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Australia/Sydney", "Pacific/Auckland",
];

// ── Helper: tag input ─────────────────────────────────────────────────────────
function TagInput({ label, placeholder, values, onChange, suggestions = [] }) {
  const [input, setInput] = useState("");
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  );

  const add = (val) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  const remove = (val) => onChange(values.filter((v) => v !== val));

  return (
    <div className="flex flex-col gap-1">
      <label className="label-text font-medium">{label}</label>
      <div className="flex flex-wrap gap-1 min-h-8">
        {values.map((v) => (
          <span key={v} className="badge badge-primary gap-1">
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-primary-content/60 hover:text-primary-content font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className="input input-bordered input-sm w-full"
        />
        {input && filtered.length > 0 && (
          <ul className="absolute z-10 bg-base-100 border border-base-300 rounded-box w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
            {filtered.slice(0, 6).map((s) => (
              <li
                key={s}
                className="px-3 py-1.5 text-sm hover:bg-base-200 cursor-pointer"
                onMouseDown={() => add(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-base-content/40">Press Enter or comma to add</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EditProfile() {
  const user     = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    firstName:              user?.firstName              || "",
    lastName:              user?.lastName              || "",
    photoUrl:          user?.photoUrl          || "",
    age:               user?.age               || "",
    gender:            user?.gender            || "",
    about:             user?.about             || "",
    skills:            user?.skills            || [],
    lookingFor:        user?.lookingFor        || ["any"],
    goals:             user?.goals             || [],
    availability:      user?.availability      || "flexible",
    experienceLevel:   user?.experienceLevel   || "intermediate",
    timezone:          user?.timezone          || "Asia/Kolkata",
    hackathonInterest: user?.hackathonInterest || false,
    startupInterest:   user?.startupInterest   || false,
    learningGoals:     user?.learningGoals     || [],
    projectIdeas:      user?.projectIdeas      || [],
  });

  const [saving,  setSaving ] = useState(false);
  const [toast,   setToast  ] = useState(null); // { type: "success"|"error", msg }

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Multi-checkbox toggle helper
  const toggleArray = (key, value) => {
    const arr = form[key];
    set(key, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };
  
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!form.firstName?.trim()) return showToast("error", "Name is required");
    if (form.lookingFor.length === 0)
      return showToast("error", "Select at least one role you're looking for");

    setSaving(true);
    try {
      const res = await axios.put(`${BASE_URL}/profile/edit`, form, {
        withCredentials: true,
      });
      dispatch(addUser(res.data.data));
      showToast("success", "Profile saved successfully!");
      navigate("/feed");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-top toast-center z-50`}>
          <div className={`alert alert-${toast.type}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <div className="flex flex-col gap-8">

        {/* ── Section 1: Basic Info ─────────────────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-base-content/70 text-sm uppercase tracking-wider">
            Basic Info
          </h2>

          <div className="form-control">
            <label className="label"><span className="label-text">Name</span></label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("name", e.target.value)}
              className="input input-bordered w-full"
              placeholder="Your Last Name"
            />

            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("name", e.target.value)}
              className="input input-bordered w-full mt-2"
              placeholder="Your Last Name"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Photo URL</span></label>
            <input
              type="url"
              value={form.photoUrl}
              onChange={(e) => set("photoUrl", e.target.value)}
              className="input input-bordered w-full"
              placeholder="https://..."
            />
            {form.photoUrl && (
              <img
                src={form.photoUrl}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover mt-2"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Age</span></label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set("age", parseInt(e.target.value) || "")}
                className="input input-bordered w-full"
                min={16}
                max={80}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Gender</span></label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">About</span>
              <span className="label-text-alt text-base-content/40">
                {form.about.length}/300
              </span>
            </label>
            <textarea
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              className="textarea textarea-bordered w-full resize-none"
              rows={3}
              maxLength={300}
              placeholder="Tell others about yourself..."
            />
          </div>
        </section>

        {/* ── Section 2: Tech Profile ───────────────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-base-content/70 text-sm uppercase tracking-wider">
            Tech Profile
          </h2>

          <TagInput
            label="Skills"
            placeholder="e.g. React, Node.js..."
            values={form.skills}
            onChange={(v) => set("skills", v)}
            suggestions={SKILL_SUGGESTIONS}
          />

          <div className="form-control">
            <label className="label">
              <span className="label-text">Experience Level</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {EXPERIENCE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={value}
                    checked={form.experienceLevel === value}
                    onChange={() => set("experienceLevel", value)}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Looking For</span>
              <span className="label-text-alt text-base-content/40">
                Who do you want to build with?
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`badge cursor-pointer select-none transition-all ${
                    form.lookingFor.includes(value)
                      ? "badge-primary"
                      : "badge-ghost hover:badge-outline"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.lookingFor.includes(value)}
                    onChange={() => toggleArray("lookingFor", value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Availability & Preferences ────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-base-content/70 text-sm uppercase tracking-wider">
            Availability & Preferences
          </h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Availability</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVAILABILITY_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value={value}
                    checked={form.availability === value}
                    onChange={() => set("availability", value)}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Timezone</span></label>
            <select
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className="select select-bordered w-full"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Goals</span>
              <span className="label-text-alt text-base-content/40">
                What are you building towards?
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GOALS_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`badge cursor-pointer select-none transition-all ${
                    form.goals.includes(value)
                      ? "badge-secondary"
                      : "badge-ghost hover:badge-outline"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.goals.includes(value)}
                    onChange={() => toggleArray("goals", value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Hackathon & Startup toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-sm">Hackathon Interest</p>
                <p className="text-xs text-base-content/40">
                  I'm keen to join hackathons
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.hackathonInterest}
                onChange={(e) => set("hackathonInterest", e.target.checked)}
                className="toggle toggle-primary"
              />
            </label>

            <div className="divider my-0" />

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-sm">Startup Interest</p>
                <p className="text-xs text-base-content/40">
                  I'm open to building a startup
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.startupInterest}
                onChange={(e) => set("startupInterest", e.target.checked)}
                className="toggle toggle-primary"
              />
            </label>
          </div>
        </section>

        {/* ── Section 4: Projects & Learning ───────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-base-content/70 text-sm uppercase tracking-wider">
            Projects & Learning
          </h2>

          <TagInput
            label="Learning Goals"
            placeholder="e.g. System Design, Machine Learning..."
            values={form.learningGoals}
            onChange={(v) => set("learningGoals", v)}
          />

          <TagInput
            label="Project Ideas"
            placeholder="e.g. AI code reviewer, Dev networking app..."
            values={form.projectIdeas}
            onChange={(v) => set("projectIdeas", v)}
          />
        </section>

        {/* ── Save button ───────────────────────────────────────── */}
        <button
          className={`btn btn-primary w-full ${saving ? "loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}