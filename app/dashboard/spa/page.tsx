"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, User, Clock, CalendarDays, X, Loader2 } from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  invalidateSpaServices,
  loadSpaServices,
} from "@/lib/slices/referenceSlice";
import type { SpaAppointment, SpaService } from "@/lib/types";

interface SpaData {
  appointments: SpaAppointment[];
  meta: { total: number; currentPage: number; lastPage: number };
}

export default function SpaPage() {
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadSpaServices());
  }, [dispatch]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [apptForm, setApptForm] = useState({
    spa_service_id: "",
    client_name: "",
    client_phone_number: "",
    client_email: "",
    date: "",
    start_time: "",
    end_time: "",
    charge: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    type: "",
    charge: "",
    description: "",
  });
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<SpaData>(
    async () => {
      const appointmentsRes = await api.spaAppointments({
        page,
        search: debouncedSearch || undefined,
        service:
          serviceFilter !== "All Services" ? serviceFilter : undefined,
      });
      return {
        appointments: appointmentsRes.data ?? [],
        meta: pageMeta(appointmentsRes),
      };
    },
    [page, serviceFilter, debouncedSearch]
  );

  const appointments = data?.appointments ?? [];
  const services = useAppSelector((s) => s.reference.spaServices);
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)
      ),
    [appointments]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SpaAppointment[]>();
    for (const appt of sorted) {
      const list = map.get(appt.date) ?? [];
      list.push(appt);
      map.set(appt.date, list);
    }
    return Array.from(map.entries());
  }, [sorted]);

  const openAddModal = () => {
    setModalError(null);
    setApptForm({
      spa_service_id: "",
      client_name: "",
      client_phone_number: "",
      client_email: "",
      date: new Date().toISOString().slice(0, 10),
      start_time: "",
      end_time: "",
      charge: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (
      !apptForm.spa_service_id ||
      !apptForm.client_name.trim() ||
      !apptForm.client_phone_number.trim() ||
      !apptForm.date ||
      !apptForm.start_time ||
      !apptForm.end_time
    ) {
      setModalError(
        "Service, client name, phone, date and times are required."
      );
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      await api.createSpaAppointment({
        spa_service_id: Number(apptForm.spa_service_id),
        client_name: apptForm.client_name.trim(),
        client_phone_number: apptForm.client_phone_number.trim(),
        client_email: apptForm.client_email || null,
        date: apptForm.date,
        start_time: apptForm.start_time,
        end_time: apptForm.end_time,
        charge: apptForm.charge ? Number(apptForm.charge) : undefined,
        description: apptForm.description || null,
      });
      setShowAddModal(false);
      reload();
    } catch (e) {
      setModalError(
        e instanceof Error ? e.message : "Failed to add appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  const openAddService = () => {
    setServiceError(null);
    setServiceForm({ name: "", type: "", charge: "", description: "" });
    setShowServiceModal(true);
  };

  const handleCreateService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.type.trim()) {
      setServiceError("Name and type are required.");
      return;
    }
    setSavingService(true);
    setServiceError(null);
    try {
      await api.createSpaService({
        name: serviceForm.name.trim(),
        type: serviceForm.type.trim(),
        charge: serviceForm.charge ? Number(serviceForm.charge) : undefined,
        description: serviceForm.description || null,
      });
      setShowServiceModal(false);
      reload();
      dispatch(invalidateSpaServices());
      dispatch(loadSpaServices());
    } catch (e) {
      setServiceError(
        e instanceof Error ? e.message : "Failed to add service."
      );
    } finally {
      setSavingService(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Manage daily schedules and service appointments.
      </p>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search client or service..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Services</option>
            {services.map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddService}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} />
            Add Service
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            + New Appointment
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={appointments.length === 0}
      >
        {/* Schedule grouped by date */}
        <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <div
              key={date}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <CalendarDays size={16} className="text-emerald-600" />
                <h3 className="font-semibold text-gray-800">{date}</h3>
                <span className="text-xs text-gray-400">
                  {items.length} appointment{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-24">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                        <Clock size={14} className="text-gray-400" />
                        {appt.start_time}
                      </div>
                      <p className="text-xs text-gray-400">{appt.end_time}</p>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-sm font-semibold text-gray-800">
                        {appt.spa_service?.name ?? "Service"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={12} />
                        <span>{appt.client_name}</span>
                        <span className="text-gray-300">•</span>
                        <span>{appt.client_phone_number}</span>
                      </div>
                    </div>
                    {appt.description && (
                      <p className="text-xs text-gray-500 max-w-xs">
                        {appt.description}
                      </p>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        MWK {Number(appt.charge ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={meta.currentPage}
          lastPage={meta.lastPage}
          total={meta.total}
          shown={appointments.length}
          loading={loading}
          onPageChange={setPage}
        />
      </PageState>

      {showAddModal && (
        <AddAppointmentModal
          services={services}
          form={apptForm}
          setForm={setApptForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showServiceModal && (
        <AddServiceModal
          form={serviceForm}
          setForm={setServiceForm}
          error={serviceError}
          saving={savingService}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleCreateService}
        />
      )}
    </div>
  );
}

type ApptFormState = {
  spa_service_id: string;
  client_name: string;
  client_phone_number: string;
  client_email: string;
  date: string;
  start_time: string;
  end_time: string;
  charge: string;
  description: string;
};

function AddAppointmentModal({
  services,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  services: SpaService[];
  form: ApptFormState;
  setForm: (form: ApptFormState) => void;
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
          <h3 className="font-semibold text-gray-800">New Appointment</h3>
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
              Service *
            </label>
            <select
              value={form.spa_service_id}
              onChange={(e) => {
                const s = services.find(
                  (x) => x.id === Number(e.target.value)
                );
                setForm({
                  ...form,
                  spa_service_id: e.target.value,
                  charge: s ? String(s.charge) : form.charge,
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — MWK {Number(s.charge ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
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

type ServiceFormState = {
  name: string;
  type: string;
  charge: string;
  description: string;
};

function AddServiceModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: ServiceFormState;
  setForm: (form: ServiceFormState) => void;
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
          <h3 className="font-semibold text-gray-800">Add Service</h3>
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
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Swedish Massage"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              placeholder="e.g. Massage"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              "Add Service"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
