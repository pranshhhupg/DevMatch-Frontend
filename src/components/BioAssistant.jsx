/**
 * BioAssistant
 * ─────────────────────────────────────────────────────────────────────────────
 * Inline AI panel that sits below the "About" textarea in EditProfile.
 * Lets the user generate, rephrase, concise, expand, or change the tone of
 * their developer bio using Gemini, powered by the form's current field values
 * as context.
 *
 * Props:
 *   currentBio  – the current value of form.about (string)
 *   formContext – the full form object so Gemini has profile context
 *   onApply(bio) – called when user clicks "Use This" on a suggestion
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

// ── Action config ─────────────────────────────────────────────────────────────
const ACTIONS = [
  {
    id: "generate",
    label:"Generate",
    desc:"Write a fresh bio from your profile details",
    color:"btn-primary",
    needsBio: false,
  },
  {
    id:"rephrase",
    label:"Rephrase",
    desc:"Same meaning, fresh wording",
    color:"btn-primary",
    needsBio: true,
  },
  {
    id:"concise",
    label:"Make Concise",
    desc:"Shorter and punchier",
    color:"btn-primary",
    needsBio: true,
  },
  {
    id:"expand",
    label:"Expand",
    desc:"Add more detail to your profile",
    color: "btn-primary",
    needsBio: true,
  },
  {
    id: "professional",
    label: "Professional",
    desc: "Polished, confident tone",
    color:"btn-primary",
    needsBio: true,
  },
  {
    id:"casual",
    label:"Casual",
    desc: "Friendly, conversational tone",
    color:"btn-primary",
    needsBio: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function BioAssistant({ currentBio, formContext, onApply }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [suggestion, setSuggestion] = useState("");   // latest AI result
  const [error, setError] = useState("");
  const [history,setHistory] = useState([]);   // previous suggestions

  const runAction = async (action) => {
    // Actions that need a bio check
    if (action.needsBio && !currentBio?.trim()) {
      setError(`Write something in your bio first, then use "${action.label}".`);
      return;
    }

    setLoading(true);
    setActiveAction(action.id);
    setError("");
    setSuggestion("");

    try {
      const res = await axios.post(
        `${BASE_URL}/profile/generate-bio`,
        {
          action:     action.id,
          currentBio: currentBio || "",
          context: {
            firstName:         formContext.firstName,
            lastName:          formContext.lastName,
            skills:            formContext.skills,
            experienceLevel:   formContext.experienceLevel,
            goals:             formContext.goals,
            lookingFor:        formContext.lookingFor,
            hackathonInterest: formContext.hackathonInterest,
            startupInterest:   formContext.startupInterest,
            availability:      formContext.availability,
            learningGoals:     formContext.learningGoals,
            projectIdeas:      formContext.projectIdeas,
          },
        },
        { withCredentials: true }
      );

      const bio = res.data.data.bio;
      setSuggestion(bio);
      // Keep a short history (last 3)
      setHistory((prev) => [{ action: action.label, bio }, ...prev].slice(0, 3));
    } catch (err) {
      setError(err?.response?.data?.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (bio) => {
    onApply(bio);
    setSuggestion("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">

      {/* ── Toggle button ──────────────────────────────────────── */}
      <button
        type="button"
        className={`btn btn-sm gap-2 self-start transition-all ${
          open
            ? "btn-primary"
            : "btn-outline btn-primary"
        }`}
        onClick={() => { setOpen((v) => !v); setError(""); setSuggestion(""); }}
      >
        <span>✨</span>
        <span>AI Bio Assistant</span>
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {/* ── Panel ──────────────────────────────────────────────── */}
      {open && (
        <div className="bg-base-300/50 border border-base-300 rounded-2xl p-4 flex flex-col gap-4">

          {/* Action grid */}
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wide font-semibold mb-3">
              Choose an action
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={loading}
                  onClick={() => runAction(action)}
                  className={`btn btn-sm gap-2 justify-start ${
                    activeAction === action.id && loading
                      ? "loading btn-disabled"
                      : action.color
                  } ${
                    activeAction === action.id && !loading
                      ? "ring-2 ring-offset-1 ring-current"
                      : ""
                  }`}
                  title={action.desc}
                >
                  {!(activeAction === action.id && loading) && (
                    <span>{action.icon}</span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 text-sm text-base-content/60 py-1">
              <span className="loading loading-dots loading-sm text-primary" />
              <span>
                Making it {ACTIONS.find(a => a.id === activeAction)?.desc?.toLowerCase()}…
              </span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="alert alert-error py-2 text-sm rounded-xl">
              <span>{error}</span>
            </div>
          )}

          {/* Suggestion result */}
          {suggestion && !loading && (
            <div className="flex flex-col gap-3">
              <div className="bg-base-100 border border-primary/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Suggestion
                  </span>
                  <span className={`text-xs font-mono ${
                    suggestion.length > 270
                      ? "text-warning"
                      : "text-base-content/40"
                  }`}>
                    {suggestion.length}/300
                  </span>
                </div>
                <p className="text-sm text-base-content/90 leading-relaxed">
                  {suggestion}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => handleApply(suggestion)}
                >
                  Use This
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => activeAction && runAction(ACTIONS.find(a => a.id === activeAction))}
                  title="Regenerate"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSuggestion("")}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 1 && !suggestion && !loading && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-semibold">
                Previous suggestions
              </p>
              {history.slice(1).map((item, i) => (
                <div
                  key={i}
                  className="bg-base-100 rounded-xl p-3 flex items-start justify-between gap-3 border border-base-300"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs text-base-content/40">{item.action}</span>
                    <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs shrink-0"
                    onClick={() => handleApply(item.bio)}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tip when no suggestion yet */}
          {!suggestion && !loading && !error && (
            <p className="text-xs text-base-content/40 text-center">
              Fill in your skills, goals, and experience above for better results
            </p>
          )}
        </div>
      )}
    </div>
  );
}