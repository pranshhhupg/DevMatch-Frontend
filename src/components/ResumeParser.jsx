/**
 * ResumeParser
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal that lets the user upload a PDF/DOCX resume, sends it to the backend
 * AI endpoint, and shows a review pane before applying the extracted data to
 * the EditProfile form.
 *
 * Props:
 *   onApply(parsedData)  – called when the user confirms extracted data
 *   onClose()            – called to dismiss the modal
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const DEFAULT_AVATAR =
  "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768";

// ── Step enum ────────────────────────────────────────────────────────────────
const STEP = {
  UPLOAD:   "upload",
  PARSING:  "parsing",
  REVIEW:   "review",
  ERROR:    "error",
};

// ── tiny helpers ─────────────────────────────────────────────────────────────
function Badge({ label, color = "badge-primary" }) {
  return (
    <span className={`badge ${color} badge-sm capitalize`}>{label}</span>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold uppercase tracking-wide text-base-content/40">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResumeParser({ onApply, onClose }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(STEP.UPLOAD);
  const [file,setFile] = useState(null);          // File object
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null);          // extracted profile
  const [errMsg,setErrMsg] = useState("");

  // ── File handling ─────────────────────────────────────────────────────────
  const acceptFile = (f) => {
    if (!f) return;
    const ok = ["application/pdf", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!ok.includes(f.type)) {
      setErrMsg("Please upload a PDF or Word (.docx) document.");
      setStep(STEP.ERROR);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrMsg("File is too large. Maximum size is 10 MB.");
      setStep(STEP.ERROR);
      return;
    }
    setFile(f);
    setStep(STEP.UPLOAD); // stay on upload, file chosen
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  // ── Parse ─────────────────────────────────────────────────────────────────
  const handleParse = async () => {
    if (!file) return;
    setStep(STEP.PARSING);
    setErrMsg("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(`${BASE_URL}/profile/parse-resume`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParsed(res.data.data);
      setStep(STEP.REVIEW);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to parse the resume. Please try a different file.";
      setErrMsg(msg);
      setStep(STEP.ERROR);
    }
  };

  // ── Apply extracted data ──────────────────────────────────────────────────
  const handleApply = () => {
    if (parsed) onApply(parsed);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderUpload = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Import from Resume</h2>
        <p className="text-sm text-base-content/50 mt-1">
          Upload your resume and AI will fill your profile automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/10"
            : file
            ? "border-success bg-success/10"
            : "border-base-300 hover:border-primary hover:bg-base-200/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => acceptFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">✅</div>
            <p className="font-semibold text-success">{file.name}</p>
            <p className="text-xs text-base-content/40">
              {(file.size / 1024).toFixed(0)} KB · Click to change
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">📂</div>
            <div>
              <p className="font-semibold">Drop your resume here</p>
              <p className="text-sm text-base-content/50">
                or click to browse · PDF or DOCX · max 10 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="alert alert-info py-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
        </svg>
        <span className="text-sm">
          Your resume is processed securely. Nothing is stored — only the extracted profile data is returned.
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={handleParse}
          disabled={!file}
        >
          ✨ Extract Profile with AI
        </button>
      </div>
    </div>
  );

  const renderParsing = () => (
    <div className="flex flex-col items-center gap-6 py-10">
      <span className="loading loading-spinner loading-lg text-primary" />
      <div className="text-center">
        <p className="font-semibold text-lg">Analysing your resume…</p>
        <p className="text-sm text-base-content/50 mt-1">
          Claude AI is reading your resume and building your profile.
        </p>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {["Reading skills", "Inferring goals", "Detecting experience", "Writing bio"].map((s, i) => (
          <span key={i} className="badge badge-ghost badge-sm animate-pulse">{s}</span>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="text-5xl">😕</div>
      <div className="text-center">
        <p className="font-semibold text-error text-lg">Parsing failed</p>
        <p className="text-sm text-base-content/60 mt-1 max-w-xs">{errMsg}</p>
      </div>
      <div className="flex gap-3">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={() => { setFile(null); setStep(STEP.UPLOAD); }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const p = parsed;
    if (!p) return null;

    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold"> Profile Extracted</h2>
          <p className="text-sm text-base-content/50">
            Review the extracted data before applying it to your profile.
          </p>
        </div>

        {/* Extracted data preview card */}
        <div className="bg-base-200 rounded-2xl p-5 flex flex-col gap-4 max-h-[55vh] overflow-y-auto">

          {/* Name + basics */}
          <ReviewSection title="Basic Info">
            <div className="flex items-center gap-3">
              <img
                src={DEFAULT_AVATAR}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <div>
                <p className="font-bold text-base">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-xs text-base-content/50">
                  {[p.age && `${p.age} yrs`, p.gender].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </div>
          </ReviewSection>

          {/* About */}
          {p.about && (
            <ReviewSection title="Bio">
              <p className="text-sm text-base-content/80 leading-relaxed">{p.about}</p>
            </ReviewSection>
          )}

          {/* Skills */}
          {p.skills?.length > 0 && (
            <ReviewSection title={`Skills (${p.skills.length})`}>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <Badge key={s} label={s} color="badge-primary" />
                ))}
              </div>
            </ReviewSection>
          )}

          {/* Experience + availability */}
          <ReviewSection title="Experience & Availability">
            <div className="flex flex-wrap gap-2">
              <Badge label={p.experienceLevel} color="outline outline-primary" />
              <Badge label={p.availability} color="outline outline-primary" />
              {p.hackathonInterest && <Badge label="Hackathons" color="outline outline-primary" />}
              {p.startupInterest   && <Badge label="Startups"   color="outline outline-primary" />}
            </div>
          </ReviewSection>

          {/* Goals */}
          {p.goals?.length > 0 && (
            <ReviewSection title="Goals">
              <div className="flex flex-wrap gap-1.5">
                {p.goals.map((g) => (
                  <Badge key={g} label={g} color="outline outline-primary" />
                ))}
              </div>
            </ReviewSection>
          )}

          {/* Looking for */}
          {p.lookingFor?.length > 0 && (
            <ReviewSection title="Looking For">
              <div className="flex flex-wrap gap-1.5">
                {p.lookingFor.map((r) => (
                  <Badge key={r} label={r} color="outline outline-primary" />
                ))}
              </div>
            </ReviewSection>
          )}

          {/* Learning goals */}
          {p.learningGoals?.length > 0 && (
            <ReviewSection title="Learning">
              <div className="flex flex-wrap gap-1.5">
                {p.learningGoals.map((g) => (
                  <Badge key={g} label={g} color="badge-primary" />
                ))}
              </div>
            </ReviewSection>
          )}

          {/* Project ideas */}
          {p.projectIdeas?.length > 0 && (
            <ReviewSection title="Projects">
              <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                {p.projectIdeas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </ReviewSection>
          )}

          {/* Timezone */}
          <ReviewSection title="Timezone">
            <p className="text-sm text-base-content/70">{p.timezone}</p>
          </ReviewSection>
        </div>

        {/* Note */}
        <p className="text-xs text-base-content/40 text-center">
          You can edit any field after applying. Your photo URL won't be changed.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            className="btn btn-ghost"
            onClick={() => { setFile(null); setParsed(null); setStep(STEP.UPLOAD); }}
          >
             Upload Another
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApply}
          >
            Apply to Profile 
          </button>
        </div>
      </div>
    );
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          className="btn btn-ghost btn-circle btn-sm absolute top-4 right-4"
          onClick={onClose}
        >
          ✕
        </button>

        {step === STEP.UPLOAD  && renderUpload()}
        {step === STEP.PARSING && renderParsing()}
        {step === STEP.ERROR   && renderError()}
        {step === STEP.REVIEW  && renderReview()}
      </div>
    </div>
  );
}