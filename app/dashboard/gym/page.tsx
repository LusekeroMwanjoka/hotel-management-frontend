"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Check,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type { GymSubscription } from "@/lib/types";

interface GymData {
  subscriptions: GymSubscription[];
  meta: { total: number; currentPage: number; lastPage: number };
  types: string[];
}

export default function GymPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = useApi<GymData>(
    async () => {
      const [subsRes, typesRes] = await Promise.all([
        api.gymSubscriptions({
          page,
          search: debouncedSearch || undefined,
          type: typeFilter !== "All Types" ? typeFilter : undefined,
        }),
        api.gymSubscriptionTypes(),
      ]);
      return {
        subscriptions: subsRes.data ?? [],
        meta: pageMeta(subsRes),
        types: (typesRes.data ?? []).map((t) => t.name).sort(),
      };
    },
    [page, typeFilter, debouncedSearch]
  );

  const subscriptions = data?.subscriptions ?? [];
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };
  const types = data?.types ?? [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Manage active memberships, renewals, and verifications.
      </p>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Types</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={18} />
            + New Subscription
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={subscriptions.length === 0}
      >
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charge
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => {
                  const memberName = sub.guest?.full_name
                    ? sub.guest.full_name
                    : [sub.guest?.first_name, sub.guest?.last_name]
                        .filter(Boolean)
                        .join(" ");
                  const active = sub.end_date >= today;
                  const verified = sub.verified_by != null;
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">
                          {memberName || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {sub.subscription_type?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.start_date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.end_date}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        ${Number(sub.charge ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {active ? <Check size={12} /> : <Clock size={12} />}
                          {active ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            verified
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {verified ? <Check size={12} /> : <Clock size={12} />}
                          {verified ? "Verified" : "Awaiting Review"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={meta.currentPage}
            lastPage={meta.lastPage}
            total={meta.total}
            shown={subscriptions.length}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </PageState>
    </div>
  );
}
