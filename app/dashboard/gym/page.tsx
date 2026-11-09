"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Check,
  Clock,
  MoreHorizontal,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  loadGuests,
  loadGymSubscriptionTypes,
} from "@/lib/slices/referenceSlice";
import type {
  Guest,
  GymSubscription,
  GymSubscriptionType,
} from "@/lib/types";

interface GymData {
  subscriptions: GymSubscription[];
  meta: { total: number; currentPage: number; lastPage: number };
}

export default function GymPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const dispatch = useAppDispatch();
  const { data, loading, error, reload } = useApi<GymData>(
    async () => {
      const subsRes = await api.gymSubscriptions({
        page,
        search: debouncedSearch || undefined,
        type: typeFilter !== "All Types" ? typeFilter : undefined,
      });
      return {
        subscriptions: subsRes.data ?? [],
        meta: pageMeta(subsRes),
      };
    },
    [page, typeFilter, debouncedSearch]
  );

  const subscriptions = data?.subscriptions ?? [];
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };

  const subscriptionTypes = useAppSelector(
    (s) => s.reference.gymSubscriptionTypes
  );
  const guests = useAppSelector((s) => s.reference.guests);
  const types = subscriptionTypes.map((t) => t.name).sort();

  useEffect(() => {
    dispatch(loadGymSubscriptionTypes());
    dispatch(loadGuests());
  }, [dispatch]);
  const today = new Date().toISOString().slice(0, 10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [subForm, setSubForm] = useState({
    gym_subscription_type_id: "",
    guest_id: "",
    start_date: "",
    end_date: "",
    charge: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openAddModal = () => {
    setModalError(null);
    setSubForm({
      gym_subscription_type_id: "",
      guest_id: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
      charge: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (
      !subForm.gym_subscription_type_id ||
      !subForm.guest_id ||
      !subForm.start_date ||
      !subForm.end_date
    ) {
      setModalError(
        "Subscription type, guest, start and end dates are required."
      );
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      await api.createGymSubscription({
        gym_subscription_type_id: Number(subForm.gym_subscription_type_id),
        guest_id: Number(subForm.guest_id),
        start_date: subForm.start_date,
        end_date: subForm.end_date,
        charge: subForm.charge ? Number(subForm.charge) : undefined,
      });
      setShowAddModal(false);
      reload();
    } catch (e) {
      setModalError(
        e instanceof Error ? e.message : "Failed to add subscription."
      );
    } finally {
      setSaving(false);
    }
  };

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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
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
                        MWK {Number(sub.charge ?? 0).toFixed(2)}
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

      {showAddModal && (
        <AddSubscriptionModal
          subscriptionTypes={subscriptionTypes}
          guests={guests}
          form={subForm}
          setForm={setSubForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

type SubFormState = {
  gym_subscription_type_id: string;
  guest_id: string;
  start_date: string;
  end_date: string;
  charge: string;
};

function guestName(g: Guest) {
  return (
    g.full_name ||
    [g.first_name, g.last_name].filter(Boolean).join(" ")
  );
}

function AddSubscriptionModal({
  subscriptionTypes,
  guests,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  subscriptionTypes: GymSubscriptionType[];
  guests: Guest[];
  form: SubFormState;
  setForm: (form: SubFormState) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");

  const selectedGuest =
    guests.find((g) => g.id === Number(form.guest_id)) ?? null;
  const filteredGuests = guests.filter((g) => {
    const q = guestSearch.toLowerCase();
    if (!q) return true;
    return guestName(g).toLowerCase().includes(q);
  });

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
          <h3 className="font-semibold text-gray-800">New Subscription</h3>
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
              Subscription Type *
            </label>
            <select
              value={form.gym_subscription_type_id}
              onChange={(e) => {
                const t = subscriptionTypes.find(
                  (x) => x.id === Number(e.target.value)
                );
                setForm({
                  ...form,
                  gym_subscription_type_id: e.target.value,
                  charge: t ? String(t.charge) : form.charge,
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a type</option>
              {subscriptionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — MWK {Number(t.charge ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setGuestDropdownOpen((o) => !o)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between"
              >
                <span
                  className={
                    selectedGuest ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {selectedGuest ? guestName(selectedGuest) : "Select a guest"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {guestDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search guests..."
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredGuests.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">
                        No guests found.
                      </p>
                    ) : (
                      filteredGuests.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, guest_id: String(g.id) });
                            setGuestDropdownOpen(false);
                            setGuestSearch("");
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            Number(form.guest_id) === g.id
                              ? "bg-emerald-50"
                              : ""
                          }`}
                        >
                          {guestName(g)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
