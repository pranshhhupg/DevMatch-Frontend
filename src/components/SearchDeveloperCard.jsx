import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import DeveloperLink from "./DeveloperLink";

export default function SearchDeveloperCard({ user, highlight = "" }) {
  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    about,
    skills = [],
    role = [],
    goals = [],
    availability,
    experienceLevel,
    hackathonInterest,
    startupInterest,
  } = user;

  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const isHighlighted = (skill) => {
    if (!highlight.trim()) return false;
    return skill.toLowerCase().includes(highlight.toLowerCase());
  };

  const handleConnect = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${_id}`,
        {},
        { withCredentials: true }
      );
      setStatus("connected");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to send request";
      setErrMsg(msg);
      setStatus("error");
    }
  };

  // Own roles this dev plays — filter "any" since it's not meaningful to display
  const ownRoles = role.filter((r) => r !== "any");

  return (
    <div
      className="
        group relative overflow-hidden rounded-lg
        bg-base-200/80 backdrop-blur-xl
        border border-base-300
        shadow-md hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
         flex flex-col
      "
    >

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden shrink-0">

        <DeveloperLink userId={_id} className="block h-full">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="
              w-full h-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
            onError={(e) => {
              e.target.src =
                "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768";
            }}
          />
        </DeveloperLink>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Availability */}
        {availability && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-black/70 border-none text-white capitalize px-3 py-2 backdrop-blur-md rounded-md">
              ● {availability}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Name */}
        <div>
          <DeveloperLink
            userId={_id}
            className="hover:text-primary transition-colors"
          >
            <h2 className="text-xl font-bold leading-tight">
              {firstName} {lastName}
            </h2>
          </DeveloperLink>

          {/* Role this dev plays — was incorrectly "Looking for" before */}
          {ownRoles.length > 0 && (
            <p className="text-sm text-primary font-medium mt-1 capitalize">
              {ownRoles.slice(0, 2).join(", ")}
            </p>
          )}
        </div>

        {/* About */}
        {about && (
          <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
            {about}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className={`
                  px-3 py-1 rounded-md text-xs font-semibold transition-all
                  ${
                    isHighlighted(skill)
                      ? "bg-primary text-primary-content shadow-md"
                      : "bg-base-300 hover:bg-base-100"
                  }
                `}
              >
                {skill}
              </span>
            ))}

            {skills.length > 4 && (
              <span className="px-3 py-1 rounded-md text-xs bg-base-300">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="alert alert-error py-2 text-sm rounded-lg">
            <span>{errMsg}</span>
          </div>
        )}

        {/* Connect Button */}
        <div className="mt-auto pt-2">
          {status === "connected" ? (
            <button
              className="btn btn-success w-full rounded-lg text-base font-semibold"
              disabled
            >
               Request Sent
            </button>
          ) : (
            <button
              className={`
                btn btn-primary w-full rounded-lg text-base font-semibold
                shadow-md hover:shadow-lg
                transition-all duration-300 hover:scale-[1.01]
                ${status === "loading" ? "loading" : ""}
              `}
              onClick={handleConnect}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Connect"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}