"use client";

import { useMemo, useState } from "react";
import { Plus, Search, User, Clock, CalendarDays } from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type { SparAppointment, SparService } from "@/lib/types";

interface SpaData {
  services: SparService[];
  appointments: SparAppointment[];
  meta: { total: number; currentPage: number; lastPage: number };
}

export default function SpaPage() {
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = useApi<SpaData>(
    async () => {
      const [servicesRes, appointmentsRes] = await Promise.all([
        api.sparServices(),
        api.sparAppointments({
          page,
          search: debouncedSearch || undefined,
          service:
            serviceFilter !== "All Services" ? serviceFilter : undefined,
        }),
      ]);
      return {
        services: servicesRes.data ?? [],
        appointments: appointmentsRes.data ?? [],
        meta: pageMeta(appointmentsRes),
      };
    },
    [page, serviceFilter, debouncedSearch]
  );

  const appointments = data?.appointments ?? [];
  const services = data?.services ?? [];
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)
      ),
    [appointments]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SparAppointment[]>();
    for (const appt of sorted) {
      const list = map.get(appt.date) ?? [];
      list.push(appt);
      map.set(appt.date, list);
    }
    return Array.from(map.entries());
  }, [sorted]);

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
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus size={18} />
          + New Appointment
        </button>
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
                        {appt.spar_service?.name ?? "Service"}
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
                        ${Number(appt.charge ?? 0).toFixed(2)}
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
    </div>
  );
}
