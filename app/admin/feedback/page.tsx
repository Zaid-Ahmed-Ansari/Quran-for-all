"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "../../lib/auth";
import {
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Star,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

type FeedbackType = "bug_report" | "feature_request";
type FeedbackStatus = "open" | "resolved";

interface FeedbackRow {
  id: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  created_at: string;
}

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug_report: "Bug report",
  feature_request: "Feature request",
};

function getTypeIcon(type: FeedbackType) {
  if (type === "feature_request") return Star;
  return AlertCircle;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) {
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function AdminFeedbackPage() {
  const [list, setList] = useState<FeedbackRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FeedbackType | "">("");
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "">("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        setError("Not signed in");
        setList([]);
        return;
      }
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      params.set("sort", sort);
      const res = await fetch(`/api/admin/feedback?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      const { data, count } = await res.json();
      setList(data ?? []);
      setTotalCount(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load feedback");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, sort]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleToggleStatus = async (id: string, currentStatus: FeedbackStatus) => {
    const nextStatus: FeedbackStatus = currentStatus === "open" ? "resolved" : "open";
    const session = await getSession();
    if (!session?.access_token) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      setList((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row))
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredList = search.trim()
    ? list.filter((row) => {
        const q = search.toLowerCase();
        return (
          row.message.toLowerCase().includes(q) ||
          TYPE_LABELS[row.type].toLowerCase().includes(q) ||
          row.status.toLowerCase().includes(q)
        );
      })
    : list;

  const hasFilters = filterType || filterStatus || search.trim();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-amber-500" size={28} />
          Feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bug reports and feature requests from users.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by message or type..."
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType((e.target.value || "") as FeedbackType | "")}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
          >
            <option value="">All types</option>
            <option value="bug_report">Bug report</option>
            <option value="feature_request">Feature request</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus((e.target.value || "") as FeedbackStatus | "")}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button
            type="button"
            onClick={() => fetchFeedback()}
            disabled={loading}
            className="p-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          {loading ? "Loading…" : `${filteredList.length} of ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setFilterType("");
              setFilterStatus("");
              setSearch("");
            }}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && list.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-sm">Loading feedback…</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            {hasFilters ? "No matching feedback" : "No feedback yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters ? "Try changing filters or search." : "User feedback will appear here."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Message</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row) => {
                  const typeKey: FeedbackType = row.type === "feature_request" ? "feature_request" : "bug_report";
                  const TypeIcon = getTypeIcon(typeKey);
                  const isExpanded = expandedId === row.id;
                  const isLong = row.message.length > 120;
                  const displayMessage = isLong && !isExpanded
                    ? `${row.message.slice(0, 120)}…`
                    : row.message;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                          <TypeIcon className="h-3.5 w-3.5" />
                          {TYPE_LABELS[typeKey]}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="text-slate-800">
                          {displayMessage}
                          {isLong && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : row.id)}
                              className="ml-1 text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                            >
                              {isExpanded ? (
                                <> less <ChevronUp className="h-3.5 w-3.5 inline" /></>
                              ) : (
                                <> more <ChevronDown className="h-3.5 w-3.5 inline" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(row.id, row.status)}
                          disabled={updatingId === row.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            row.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {updatingId === row.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : row.status === "resolved" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                          {row.status === "resolved" ? "Resolved" : "Open"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
