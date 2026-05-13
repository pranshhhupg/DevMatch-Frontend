import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  setOpportunities,
  appendOpportunities,
  addOpportunity,
  updateOpportunityInStore,
  removeOpportunityFromStore,
} from "../utils/opportunitySlice";
import OpportunityCard   from "./OpportunityCard";
import CreateOpportunity from "./CreateOpportunity";

const TYPES  = ["hackathon", "startup", "company hiring", "open source", "freelance"];
const LEVELS = ["beginner", "intermediate", "expert", "any"];
const EMPTY_FILTERS = { eventType: "", location: "", level: "" };

export default function CollabHub() {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((store) => store.user);
  const { list: opportunities } = useSelector((store) => store.opportunity);

  // Filter UI state (what's typed) vs applied state (what was last fetched)
  const [filters,    setFilters]   = useState(EMPTY_FILTERS);
  const [applied,    setApplied]   = useState(EMPTY_FILTERS);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState(null);
  const [page,       setPage]      = useState(1);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetched,    setFetched]  = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState(null); // null = create mode

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchOpportunities = async (
    pageNum = 1,
    activeFilters = applied,
    replace = true
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 12 });
      if (activeFilters.eventType)     params.set("eventType",     activeFilters.eventType);
      if (activeFilters.location) params.set("location", activeFilters.location.trim());
      if (activeFilters.level)    params.set("level",    activeFilters.level);

      const res = await axios.get(
        `${BASE_URL}/collab/opportunities?${params}`,
        { withCredentials: true }
      );

      const { data, total: t, totalPages: tp } = res.data;

      replace
        ? dispatch(setOpportunities(data))
        : dispatch(appendOpportunities(data));

      setTotal(t);
      setTotalPages(tp);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    fetchOpportunities(1, EMPTY_FILTERS, true);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    setApplied(filters);
    fetchOpportunities(1, filters, true);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    fetchOpportunities(1, EMPTY_FILTERS, true);
  };

  const handleLoadMore = () => {
    fetchOpportunities(page + 1, applied, false);
  };

  const handleOpenCreate = () => {
    setEditOpportunity(null);
    setShowModal(true);
  };

  const handleOpenEdit = (opportunity) => {
    setEditOpportunity(opportunity);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditOpportunity(null);
  };

  const handleModalSuccess = (opportunity, isEdit) => {
    if (isEdit) {
      dispatch(updateOpportunityInStore(opportunity));
    } else {
      dispatch(addOpportunity(opportunity));
      setTotal((t) => t + 1);
    }
    handleModalClose();
  };

  const handleDelete = async (opportunityId) => {
    if (!window.confirm("Delete this opportunity? This cannot be undone.")) return;
    try {
      await axios.delete(`${BASE_URL}/collab/opportunity/${opportunityId}`, {
        withCredentials: true,
      });
      dispatch(removeOpportunityFromStore(opportunityId));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to CollabHub</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Find teammates for hackathons, startups, open source, and more
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + List an Opportunity
        </button>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="card bg-base-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">

          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs text-base-content/50 font-semibold uppercase tracking-wide">
              Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
              className="select select-bordered select-sm"
            >
              <option value="">All Types</option>
              {TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs text-base-content/50 font-semibold uppercase tracking-wide">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              placeholder="Mumbai, Remote…"
              className="input input-bordered input-sm"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs text-base-content/50 font-semibold uppercase tracking-wide">
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}
              className="select select-bordered select-sm"
            >
              <option value="">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l} className="capitalize">{l}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end pb-px">
            <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>
              Apply
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────── */}
      {fetched && !loading && !error && (
        <p className="text-sm text-base-content/40 mb-4">
          Showing {opportunities.length} of {total} opportunit
          {total !== 1 ? "ies" : "y"}
        </p>
      )}

      {/* ── Loading (initial) ─────────────────────────────────── */}
      {loading && opportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-60 gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/40 text-sm">Loading opportunities…</p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="alert alert-error max-w-md">
            <span>{error}</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchOpportunities(1, applied, true)}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {fetched && !loading && !error && opportunities.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold">No opportunities found</h3>
          <p className="text-base-content/50 text-sm mt-2">
            Try different filters, or be the first to post!
          </p>
          <button className="btn btn-primary mt-6" onClick={handleOpenCreate}>
            + List an Opportunity
          </button>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      {opportunities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              loggedInUserId={loggedInUser?._id}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Load More ────────────────────────────────────────── */}
      {!loading && page < totalPages && (
        <div className="flex justify-center mt-10">
          <button className="btn btn-outline" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}

      {/* ── Loading more spinner ──────────────────────────────── */}
      {loading && opportunities.length > 0 && (
        <div className="flex justify-center mt-8">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && (
        <CreateOpportunity
          editData={editOpportunity}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}