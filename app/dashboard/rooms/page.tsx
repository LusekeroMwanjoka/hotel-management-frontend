"use client";

import { useMemo, useState } from "react";
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
  checkIns: CheckIn[];
  checkOuts: CheckOut[];
}

function roomFloor(name: string) {
  const n = parseInt(name.replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return 0;
  return Math.floor(n / 100);
}

export default function RoomStatusPage() {
  const { data, loading, error, reload } = useApi<RoomsData>(async () => {
    const [roomsRes, checkInsRes, checkOutsRes] = await Promise.all([
      api.rooms(),
      api.checkIns(),
      api.checkOuts(),
    ]);
    return {
      rooms: roomsRes.data ?? [],
      checkIns: checkInsRes.data ?? [],
      checkOuts: checkOutsRes.data ?? [],
    };
  });

  const [roomTypeFilter, setRoomTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [search, setSearch] = useState("");

  const rooms = data?.rooms ?? [];
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

  const roomTypes = useMemo(
    () =>
      Array.from(
        new Set(rooms.map((r) => r.room_type?.name ?? "Unknown"))
      ).sort(),
    [rooms]
  );
  const floors = useMemo(
    () =>
      Array.from(new Set(rooms.map((r) => roomFloor(r.name)))).sort(
        (a, b) => a - b
      ),
    [rooms]
  );

  const filtered = rooms.filter((room) => {
    const typeName = room.room_type?.name ?? "Unknown";
    if (roomTypeFilter !== "All Types" && typeName !== roomTypeFilter)
      return false;
    if (
      statusFilter !== "All Statuses" &&
      room.occupancy_status !== statusFilter
    )
      return false;
    if (floorFilter !== "All Floors" && roomFloor(room.name) !== parseInt(floorFilter))
      return false;
    if (search) {
      const guest = guestByRoom.get(room.id) ?? "";
      if (
        !room.name.toLowerCase().includes(search.toLowerCase()) &&
        !guest.toLowerCase().includes(search.toLowerCase())
      )
        return false;
    }
    return true;
  });

  const occupiedCount = rooms.filter(
    (r) => r.occupancy_status === "occupied"
  ).length;
  const availableCount = rooms.filter(
    (r) => r.occupancy_status === "available"
  ).length;
  const occupancyRate = rooms.length
    ? Math.round((occupiedCount / rooms.length) * 100)
    : 0;

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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Filter size={18} className="text-gray-400" />
          <SelectFilter
            value={roomTypeFilter}
            onChange={setRoomTypeFilter}
            options={["All Types", ...roomTypes]}
          />
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
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
            onChange={setFloorFilter}
            options={["All Floors", ...floors.map(String)]}
          />
        </div>

        {/* Status Board */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status Board</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((room) => {
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
