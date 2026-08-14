"use client";

import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type {
  CheckIn,
  CheckOut,
  Room,
  RoomOccupancyStatus,
} from "@/lib/types";

const statusConfig: Record<
  RoomOccupancyStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  available: {
    label: "Vacant",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  occupied: {
    label: "Occupied",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  reserved: {
    label: "Reserved",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-700",
    dot: "bg-gray-400",
  },
  out_of_service: {
    label: "Maintenance",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

interface RoomsData {
  rooms: Room[];
  stats: Partial<Record<RoomOccupancyStatus, number>>;
  roomTypes: string[];
  floors: number[];
  total: number;
  currentPage: number;
  lastPage: number;
  checkIns: CheckIn[];
  checkOuts: CheckOut[];
}

export default function RoomStatusPage() {
  const [page, setPage] = useState(1);
  const [roomTypeFilter, setRoomTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useApi<RoomsData>(
    async () => {
      const [roomsRes, checkInsRes, checkOutsRes] = await Promise.all([
        api.rooms({
          page,
          room_type: roomTypeFilter !== "All Types" ? roomTypeFilter : undefined,
          occupancy_status:
            statusFilter !== "All Statuses" ? statusFilter : undefined,
          floor: floorFilter !== "All Floors" ? floorFilter : undefined,
          search: debouncedSearch || undefined,
        }),
        api.checkIns(),
        api.checkOuts(),
      ]);
      return {
        rooms: roomsRes.data ?? [],
        stats: roomsRes.stats ?? {},
        roomTypes: roomsRes.room_types ?? [],
        floors: roomsRes.floors ?? [],
        total: roomsRes.meta?.total ?? 0,
        currentPage: roomsRes.meta?.current_page ?? 1,
        lastPage: roomsRes.meta?.last_page ?? 1,
        checkIns: checkInsRes.data ?? [],
        checkOuts: checkOutsRes.data ?? [],
      };
    },
    [page, roomTypeFilter, statusFilter, floorFilter, debouncedSearch]
  );

  const rooms = data?.rooms ?? [];
  const stats = data?.stats ?? {};
  const roomTypes = data?.roomTypes ?? [];
  const floors = data?.floors ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const lastPage = data?.lastPage ?? 1;
  const checkIns = data?.checkIns ?? [];
  const checkOuts = data?.checkOuts ?? [];

  const checkedOutIds = new Set(checkOuts.map((c) => c.check_in_id));
  const guestByRoom = new Map<number, string>();
  for (const ci of checkIns) {
    if (!checkedOutIds.has(ci.id) && ci.room_id != null) {
      const guestName = ci.guest?.full_name
        ? ci.guest.full_name
        : [ci.guest?.first_name, ci.guest?.last_name].filter(Boolean).join(" ");
      guestByRoom.set(ci.room_id, guestName);
    }
  }

  const availableCount = stats.available ?? 0;
  const occupiedCount = stats.occupied ?? 0;
  const occupancyRate = total ? Math.round((occupiedCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={rooms.length === 0}
      >
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Available Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Occupied Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{occupiedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Occupancy Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {occupancyRate}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search room or guest..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Filter size={18} className="text-gray-400" />
          <SelectFilter
            value={roomTypeFilter}
            onChange={(v) => {
              setRoomTypeFilter(v);
              setPage(1);
            }}
            options={["All Types", ...roomTypes]}
          />
          <SelectFilter
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              "All Statuses",
              "available",
              "occupied",
              "reserved",
              "blocked",
              "out_of_service",
            ]}
          />
          <SelectFilter
            value={floorFilter}
            onChange={(v) => {
              setFloorFilter(v);
              setPage(1);
            }}
            options={["All Floors", ...floors.map(String)]}
          />
        </div>

        {/* Status Board */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status Board</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const cfg = statusConfig[room.occupancy_status] ?? statusConfig.available;
              const guest = guestByRoom.get(room.id);
              return (
                <div
                  key={room.id}
                  className={`rounded-xl border p-4 ${cfg.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {room.name}
                      </p>
                      <p className={`text-xs font-medium ${cfg.text}`}>
                        {cfg.label}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {room.room_type?.name ?? "—"}
                  </p>
                  {guest && (
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {guest}
                    </p>
                  )}
                  {room.notes && (
                    <p className="text-xs text-gray-500 mt-1">{room.notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {rooms.length} of {total} rooms
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {lastPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </PageState>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
