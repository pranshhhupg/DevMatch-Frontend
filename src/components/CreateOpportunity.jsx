import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPES  = ["hackathon", "startup", "company hiring", "open source", "freelance"];
const LEVELS = ["beginner", "intermediate", "expert", "any"];

const ROLE_OPTIONS = [
  "frontend dev", "backend dev", "ml engineer", "designer",
  "product manager", "devops", "mobile dev", "data analyst", "qa engineer",
];

const TECH_SUGGESTIONS = [
  "React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Java", "Spring",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL",
  "Docker", "Kubernetes", "AWS", "Flutter", "Kotlin", "Swift",
];

const EMPTY_FORM = {
  title: "", description: "", eventType: "hackathon", location: "",
  duration: "", techStack: [], teamSize: "", level: "any",
  rolesNeeded: [], applyLink: "",
};

// ── Local TagInput ─────────────────────────────────────────────────────────────
// (self-contained so CreateOpportunity has no external component deps)
function TagInput({ label, placeholder, values, onChange, suggestions = [] }) {
  const [input, setInput] = useState("");
  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !values.map((v) => v.toLowerCase()).includes(s.toLowerCase())
  );

  const add = (val) => {
    const v = val.trim();
    if (v && !values.map((x) => x.toLowerCase()).includes(v.toLowerCase()))
      onChange([...values, v]);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="label-text font-medium text-sm">{label}</span>
      <div className="flex flex-wrap gap-1 min-h-6">
        {values.map((v) => (
          <span key={v} className="badge badge-primary badge-sm gap-1">
            {v}
            <button
              type="button"
              className="font-bold leading-none"
              onClick={() => onChange(values.filter((x) => x !== v))}
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
          <ul className="absolute z-30 bg-base-100 border border-base-300 rounded-box w-full mt-1 max-h-36 overflow-y-auto shadow-xl">
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
      <p className="text-[10px] text-base-content/40">Press Enter or comma to add</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateOpportunity({ editData, onClose, onSuccess }) {
  const dialogRef = useRef(null);
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const isEdit = Boolean(editData);

  // Pre-fill in edit mode, reset in create mode
  useEffect(() => {
    setForm(
      isEdit
        ? {
            title:       editData.title       ?? "",
            description: editData.description ?? "",
            eventType:   editData.eventType   ?? "hackathon",
            location:    editData.location    ?? "",
            duration:    editData.duration    ?? "",
            techStack:   editData.techStack   ?? [],
            teamSize:    editData.teamSize    ?? "",
            level:       editData.level       ?? "any",
            rolesNeeded: editData.rolesNeeded ?? [],
            applyLink:   editData.applyLink   ?? "",
          }
        : EMPTY_FORM
    );
    setError("");
  }, [editData]);

  // Open the native <dialog> as a modal
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleRole = (role) => {
    set(
      "rolesNeeded",
      form.rolesNeeded.includes(role)
        ? form.rolesNeeded.filter((r) => r !== role)
        : [...form.rolesNeeded, role]
    );
  };

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim())                   return setError("Title is required");
    if (form.title.trim().length < 5)         return setError("Title must be at least 5 characters");
    if (!form.description.trim())             return setError("Description is required");
    if (form.description.trim().length < 20)  return setError("Description must be at least 20 characters");
    if (!form.eventType)                           return setError("Type is required");
    if (!form.location.trim())                return setError("Location is required");

    const payload = {
      ...form,
      title:       form.title.trim(),
      description: form.description.trim(),
      location:    form.location.trim(),
      teamSize:    form.teamSize ? parseInt(form.teamSize) : undefined,
    };

    setSaving(true);
    try {
      const url = isEdit
        ? `${BASE_URL}/collab/opportunity/${editData._id}`
        : `${BASE_URL}/collab/opportunity`;

      const res = await axios({
        method: isEdit ? "put" : "post",
        url,
        data: payload,
        withCredentials: true,
      });

      onSuccess(res.data.data, isEdit);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl">
            {isEdit ? "Edit Opportunity" : "List an Opportunity"}
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title *</span>
              <span className="label-text-alt text-base-content/40">
                {form.title.length}/100
              </span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Looking for a co-founder for an EdTech startup"
              className="input input-bordered w-full"
              maxLength={100}
            />
          </div>

          {/* Type + Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Type *</span>
              </label>
              <select
                value={form.eventType}
                onChange={(e) => set("eventType", e.target.value)}
                className="select select-bordered w-full capitalize"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Level Required</span>
              </label>
              <select
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                className="select select-bordered w-full capitalize"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l} className="capitalize">{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Location *</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Remote"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Duration</span>
                <span className="label-text-alt text-base-content/40">Optional</span>
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 48 hours, 3 months"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Team Size */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Total Team Size</span>
              <span className="label-text-alt text-base-content/40">Optional</span>
            </label>
            <input
              type="number"
              value={form.teamSize}
              onChange={(e) => set("teamSize", e.target.value)}
              placeholder="How many members including you?"
              className="input input-bordered w-full"
              min={1}
              max={100}
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description *</span>
              <span className="label-text-alt text-base-content/40">
                {form.description.length}/1000
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the opportunity — what you're building, the problem you're solving, and what kind of people you're looking for…"
              className="textarea textarea-bordered w-full resize-none"
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Tech Stack */}
          <TagInput
            label="Tech Stack"
            placeholder="e.g. React, Node.js, MongoDB…"
            values={form.techStack}
            onChange={(v) => set("techStack", v)}
            suggestions={TECH_SUGGESTIONS}
          />

          {/* Roles Needed — checkbox badges */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Roles Needed</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const selected = form.rolesNeeded.includes(role);
                return (
                  <label
                    key={role}
                    className={`badge cursor-pointer select-none transition-all capitalize ${
                      selected
                        ? "badge-secondary"
                        : "badge-ghost hover:badge-outline"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selected}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Apply / External link */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Apply / More Info Link</span>
              <span className="label-text-alt text-base-content/40">Optional</span>
            </label>
            <input
              type="url"
              value={form.applyLink}
              onChange={(e) => set("applyLink", e.target.value)}
              placeholder="https://devfolio.co/..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            className={`btn btn-primary w-full ${saving ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : isEdit
              ? "Update Opportunity"
              : "Post Opportunity"}
          </button>
        </div>
      </div>

      {/* Backdrop click closes modal */}
      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  );
}