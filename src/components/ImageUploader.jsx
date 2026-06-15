/**
 * ImageUploader
 * ─────────────────────────────────────────────────────────────────────────────
 * A reusable click/drag-drop image uploader that shows a preview and calls
 * onUpload(file) with the selected File object — it does NOT upload itself.
 * The parent component decides when/how to send it to the server.
 *
 * Props:
 *   currentImage  – URL of the current image to show as preview (optional)
 *   onUpload(file) – called immediately when user picks/drops a valid image
 *   shape          – "circle" (default, for avatars) | "banner" (wide)
 *   label          – text label shown above (optional)
 *   uploading      – boolean, shows spinner overlay while parent is POSTing
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useRef, useState } from "react";

const DEFAULT_AVATAR =
  "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768";

const DEFAULT_BANNER =
  "https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-group-icon-png-image_1796653.jpg";

export default function ImageUploader({
  currentImage,
  onUpload,
  shape = "circle",
  label,
  uploading = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview]  = useState(currentImage || null);
  const [error, setError]  = useState("");

  const isBanner = shape === "banner";

  const validate = (file) => {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are accepted.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return false;
    }
    return true;
  };

  const handleFile = (file) => {
    setError("");
    if (!validate(file)) return;

    // Show instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const fallback = isBanner ? DEFAULT_BANNER : DEFAULT_AVATAR;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="label-text font-medium">{label}</label>
      )}

      {/* ── Drop / click zone ── */}
      <div
        className={`relative cursor-pointer group transition-all duration-200 ${
          isBanner
            ? "w-full h-36 rounded-2xl overflow-hidden"
            : "w-24 h-24 rounded-full overflow-hidden"
        } ${dragOver ? "ring-4 ring-primary ring-offset-2" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Current / preview image */}
        <img
          src={preview || fallback}
          alt="upload preview"
          className={`w-full h-full object-cover ${isBanner ? "" : "rounded-full"}`}
          onError={(e) => { e.target.src = fallback; }}
        />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1
            bg-black/50 text-white transition-opacity duration-200
            ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            ${isBanner ? "rounded-2xl" : "rounded-full"}`}
        >
          {uploading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-xs font-semibold">
                {isBanner ? "Upload Banner" : "Change Photo"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Helper text */}
      {!isBanner && (
        <p className="text-xs text-base-content/40">
          Click or drag an image · max 5 MB
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}