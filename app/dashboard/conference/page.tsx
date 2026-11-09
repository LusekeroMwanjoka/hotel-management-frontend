"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  List,
  Clock,
  Building2,
  DollarSign,
  X,
  Loader2,
} from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type { ConferenceHallBooking } from "@/lib/types";

function bookingStatus(date: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return "Completed";
  if (date === today) return "Today";
  return "Upcoming";
}

const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  Today: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  Upcoming: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
};

interface ConferenceData {
  bookings: ConferenceHallBooking[];
  meta: { total: number; currentPage: number; lastPage: number };
}

export default function ConferencePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    hall_name: "",
    hall_number: "",
    date: "",
    start_time: "",
    end_time: "",
    charge: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<ConferenceData>(
    async () => {
      const res = await api.conferenceHallBookings({
        page,
        search: debouncedSearch || undefined,
      });
      return {
        bookings: res.data ?? [],
        meta: pageMeta(res),
      };
    },
    [page, debouncedSearch]
  );

  const bookings = data?.bookings ?? [];
  const meta = data?.meta ?? { total: 0, currentPage: 1, lastPage: 1 };
  const selectedBooking =
    bookings.find((b) => b.id === selectedId) ?? bookings[0] ?? null;

  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const openAddModal = () => {
    setModalError(null);
    setBookingForm({
      hall_name: "",
      hall_number: "",
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
      !bookingForm.hall_name.trim() ||
      !bookingForm.hall_number.trim() ||
      !bookingForm.date ||
      !bookingForm.start_time ||
      !bookingForm.end_time ||
      !bookingForm.charge
    ) {
      setModalError(
        "Hall name, hall number, date, times and charge are required."
      );
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      await api.createConferenceHallBooking({
        hall_name: bookingForm.hall_name.trim(),
        hall_number: bookingForm.hall_number.trim(),
        date: bookingForm.date,
        start_time: bookingForm.start_time,
        end_time: bookingForm.end_time,
        entry_time: bookingForm.start_time,
        exit_time: bookingForm.end_time,
        charge: Number(bookingForm.charge),
        description: bookingForm.description || null,
      });
      setShowAddModal(false);
      reload();
    } catch (e) {
      setModalError(
        e instanceof Error ? e.message : "Failed to add booking."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CalendarDays size={16} className="inline mr-1.5" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List size={16} className="inline mr-1.5" />
            List
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={bookings.length === 0}
      >
        {viewMode === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  {currentMonth} {currentYear}
                </h3>
              </div>
              <CalendarGrid
                month={today.getMonth()}
                year={today.getFullYear()}
                bookings={bookings}
              />
            </div>
            <BookingDetail booking={selectedBooking} />
          </div>
        ) : (
          <BookingTable
            bookings={bookings}
            onSelect={setSelectedId}
            selectedId={selectedBooking?.id ?? null}
          />
        )}
        <Pagination
          currentPage={meta.currentPage}
          lastPage={meta.lastPage}
          total={meta.total}
          shown={bookings.length}
          loading={loading}
          onPageChange={setPage}
        />
      </PageState>

      {showAddModal && (
        <AddBookingModal
          form={bookingForm}
          setForm={setBookingForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function CalendarGrid({
  month,
  year,
  bookings,
}: {
  month: number;
  year: number;
  bookings: ConferenceHallBooking[];
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const bookingsByDay = new Map<number, ConferenceHallBooking[]>();
  for (const b of bookings) {
    const d = new Date(b.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const list = bookingsByDay.get(day) ?? [];
      list.push(b);
      bookingsByDay.set(day, list);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const dayBookings = bookingsByDay.get(day) ?? [];
          return (
            <div
              key={day}
              className={`aspect-square p-1 rounded-lg border text-xs ${
                isToday
                  ? "border-emerald-500 bg-emerald-50"
                  : dayBookings.length > 0
                  ? "border-blue-200 bg-blue-50"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-medium ${
                  isToday ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                {day}
              </span>
              {dayBookings.slice(0, 2).map((b, idx) => (
                <div
                  key={idx}
                  className="text-[10px] px-1 py-0.5 rounded mt-0.5 truncate bg-blue-100 text-blue-700"
                >
                  {b.hall_name}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="text-[10px] text-gray-400 px-1">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingDetail({
  booking,
}: {
  booking: ConferenceHallBooking | null;
}) {
  if (!booking) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center">
        <p className="text-sm text-gray-400">Select a booking to view details</p>
      </div>
    );
  }

  const status = bookingStatus(booking.date);
  const cfg = statusConfig[status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{booking.hall_name}</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Hall Number</p>
          <p className="text-sm font-medium text-gray-800">
            {booking.hall_number}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Booking Date</p>
          <p className="text-sm font-medium text-gray-800">
            {booking.date} • {booking.start_time} to {booking.end_time}
          </p>
        </div>

        {booking.description && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700">{booking.description}</p>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Charge</span>
            <span className="font-medium text-gray-800">
              MWK {Number(booking.charge ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Overage Penalty</span>
            <span className="font-medium text-gray-800">
              MWK {Number(booking.exceeding_penalty ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            Captured by:{" "}
            <span className="text-gray-700">
              {booking.captured_by_user?.name ?? `#${booking.captured_by}`}
            </span>
          </p>
          <p>
            Verified by:{" "}
            <span className="text-gray-700">
              {booking.verified_by_user?.name ?? "—"}
            </span>
          </p>
        </div>

        <div className="flex gap-2 pt-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Clock size={14} />
            Check-in
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm hover:bg-amber-100 transition-colors">
            <DollarSign size={14} />
            Add Overage
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingTable({
  bookings,
  onSelect,
  selectedId,
}: {
  bookings: ConferenceHallBooking[];
  onSelect: (id: number) => void;
  selectedId: number | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Hall
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Time
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Charge
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const status = bookingStatus(b.date);
              const cfg = statusConfig[status];
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === b.id ? "bg-emerald-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {b.hall_name}
                    </p>
                    <p className="text-xs text-gray-400">{b.hall_number}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {b.start_time} - {b.end_time}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    MWK {Number(b.charge ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type BookingFormState = {
  hall_name: string;
  hall_number: string;
  date: string;
  start_time: string;
  end_time: string;
  charge: string;
  description: string;
};

function AddBookingModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: BookingFormState;
  setForm: (form: BookingFormState) => void;
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
          <h3 className="font-semibold text-gray-800">New Booking</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Name *
              </label>
              <input
                type="text"
                value={form.hall_name}
                onChange={(e) =>
                  setForm({ ...form, hall_name: e.target.value })
                }
                placeholder="e.g. Main Hall"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Number *
              </label>
              <input
                type="text"
                value={form.hall_number}
                onChange={(e) =>
                  setForm({ ...form, hall_number: e.target.value })
                }
                placeholder="e.g. H-01"
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
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge (MWK) *
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
