"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Clock,
  Users,
  Waves,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type { SwimmingPoolSession } from "@/lib/types";

export default function SwimmingPage() {
  const { data, loading, error, reload } = useApi<SwimmingPoolSession[]>(
    async () => {
      const res = await api.swimmingPoolSessions();
      return res.data ?? [];
    }
  );

  const [search, setSearch] = useState("");

  const sessions = data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const filtered = sessions.filter(
    (s) =>
      s.client_name.toLowerCase().includes(search.toLowerCase()) ||
      s.client_phone_number.includes(search)
  );

  const todaySessions = sessions.filter((s) => {
    // Sessions don't carry a date; count all as today's records for now.
    return true;
  }).length;
  const totalRevenue = sessions.reduce(
    (sum, s) => sum + Number(s.charge ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Manage swimming pool sessions, entry/exit times, and charges.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Sessions</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Waves size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {todaySessions}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Clients Served</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(sessions.map((s) => s.client_name)).size}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={18} />
            + New Session
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={sessions.length === 0}
      >
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Charge
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Entry
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Exit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Captured By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Verified By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {session.client_name}
                      </p>
                      {session.description && (
                        <p className="text-xs text-gray-400">
                          {session.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {session.client_phone_number}
                      </p>
                      {session.client_email && (
                        <p className="text-xs text-gray-400">
                          {session.client_email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      ${Number(session.charge ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.entry_time}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.exit_time}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.captured_by_user?.name ??
                        `#${session.captured_by}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.verified_by_user?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageState>
    </div>
  );
}
