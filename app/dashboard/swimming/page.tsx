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
  X,
  Loader2,
} from "lucide-react";
import { api, getSession, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type { SwimmingPoolSession } from "@/lib/types";

interface SwimmingData {
  sessions: SwimmingPoolSession[];
  meta: { total: number; currentPage: number; lastPage: number };
  stats: {
    total_sessions: number;
    total_revenue: number;
    clients_served: number;
  };
}

export default function SwimmingPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const [showAddModal, setShowAddModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    client_name: "",
    client_phone_number: "",
    client_email: "",
    entry_time: "",
    exit_time: "",
    charge: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<SwimmingData>(
    async () => {
      const res = await api.swimmingPoolSessions({
        page,
        search: debouncedSearch || undefined,
      });
      return {
        sessions: res.data ?? [],
        meta: pageMeta(res),
        stats: res.stats ?? {
          total_sessions: 0,
          total_revenue: 0,
          clients_served: 0,
        },
      };
    },
    [page, debouncedSearch]
  );

  const sessions = data?.sessions ?? [];
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };
  const stats = data?.stats ?? {
    total_sessions: 0,
    total_revenue: 0,
    clients_served: 0,
  };

  const openAddModal = () => {
    setModalError(null);
    setSessionForm({
      client_name: "",
      client_phone_number: "",
      client_email: "",
      entry_time: "",
      exit_time: "",
      charge: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (
      !sessionForm.client_name.trim() ||
      !sessionForm.client_phone_number.trim() ||
      !sessionForm.entry_time ||
      !sessionForm.exit_time
    ) {
      setModalError("Client name, phone, entry and exit times are required.");
      return;
    }

    const session = getSession();
    const userId = session.user?.id ?? 1;

    setSaving(true);
    setModalError(null);
    try {
      await api.createSwimmingPoolSession({
        client_name: sessionForm.client_name.trim(),
        client_phone_number: sessionForm.client_phone_number.trim(),
        client_email: sessionForm.client_email || null,
        charge: sessionForm.charge ? Number(sessionForm.charge) : undefined,
        entry_time: sessionForm.entry_time,
        exit_time: sessionForm.exit_time,
        description: sessionForm.description || null,
        captured_by: userId,
        verified_by: null,
      });
      setShowAddModal(false);
      reload();
    } catch (e) {
      setModalError(
        e instanceof Error ? e.message : "Failed to add session."
      );
    } finally {
      setSaving(false);
    }
  };

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
            {stats.total_sessions}
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
            MWK {stats.total_revenue.toFixed(2)}
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
            {stats.clients_served}
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
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
                {sessions.map((session) => (
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
                      MWK {Number(session.charge ?? 0).toFixed(2)}
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
          <Pagination
            currentPage={meta.currentPage}
            lastPage={meta.lastPage}
            total={meta.total}
            shown={sessions.length}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </PageState>

      {showAddModal && (
        <AddSessionModal
          form={sessionForm}
          setForm={setSessionForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

type SessionFormState = {
  client_name: string;
  client_phone_number: string;
  client_email: string;
  entry_time: string;
  exit_time: string;
  charge: string;
  description: string;
};

function AddSessionModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: SessionFormState;
  setForm: (form: SessionFormState) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">New Session</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={form.client_name}
              onChange={(e) =>
                setForm({ ...form, client_name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                value={form.client_phone_number}
                onChange={(e) =>
                  setForm({ ...form, client_phone_number: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.client_email}
                onChange={(e) =>
                  setForm({ ...form, client_email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Time *
              </label>
              <input
                type="time"
                value={form.entry_time}
                onChange={(e) =>
                  setForm({ ...form, entry_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Time *
              </label>
              <input
                type="time"
                value={form.exit_time}
                onChange={(e) =>
                  setForm({ ...form, exit_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge (MWK)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.charge}
              onChange={(e) => setForm({ ...form, charge: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        {error && (
          <div className="mx-5 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
