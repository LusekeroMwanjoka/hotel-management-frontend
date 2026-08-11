"use client";

import { useState } from "react";
import { Search, Filter, BedDouble } from "lucide-react";

type RoomStatus = "Vacant" | "Occupied" | "Dirty" | "Maintenance";

interface Room {
  number: string;
  type: string;
  status: RoomStatus;
  floor: number;
  guest?: string;
  notes?: string;
  cleaned?: string;
  nights?: number;
}

const rooms: Room[] = [
  {
    number: "101",
    type: "Standard",
    status: "Vacant",
    floor: 1,
    cleaned: "2h ago",
  },
  {
    number: "102",
    type: "Deluxe",
    status: "Occupied",
    floor: 1,
    guest: "Smith, J.",
    nights: 2,
  },
  {
    number: "103",
    type: "Suite",
    status: "Dirty",
    floor: 1,
    notes: "Requires turn-down",
  },
  {
    number: "104",
    type: "Standard",
    status: "Maintenance",
    floor: 1,
    notes: "HVAC Issue",
  },
  {
    number: "105",
    type: "Standard",
    status: "Vacant",
    floor: 1,
    notes: "Ready",
  },
  {
    number: "201",
    type: "Suite",
    status: "Occupied",
    floor: 2,
    guest: "Doe, A.",
    nights: 1,
  },
  {
    number: "202",
    type: "Deluxe",
    status: "Occupied",
    floor: 2,
    guest: "Lee, C.",
    nights: 3,
  },
  {
    number: "203",
    type: "Standard",
    status: "Dirty",
    floor: 2,
    notes: "Checkout completed",
  },
  {
    number: "204",
    type: "Deluxe",
    status: "Vacant",
    floor: 2,
    cleaned: "1h ago",
  },
  {
    number: "301",
    type: "Suite",
    status: "Vacant",
    floor: 3,
    cleaned: "30m ago",
  },
  {
    number: "302",
    type: "Standard",
    status: "Maintenance",
    floor: 3,
    notes: "Plumbing repair",
  },
  {
    number: "303",
    type: "Deluxe",
    status: "Occupied",
    floor: 3,
    guest: "Brown, M.",
    nights: 4,
  },
];

export default function RoomStatusPage() {
  const [roomTypeFilter, setRoomTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [search, setSearch] = useState("");

  const filtered = rooms.filter((room) => {
    if (roomTypeFilter !== "All Types" && room.type !== roomTypeFilter)
      return false;
    if (statusFilter !== "All Statuses" && room.status !== statusFilter)
      return false;
    if (floorFilter !== "All Floors" && room.floor !== parseInt(floorFilter))
      return false;
    if (search && !room.number.includes(search) && !room.guest?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const statusConfig: Record<RoomStatus, { bg: string; text: string; dot: string }> = {
    Vacant: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
    Occupied: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
    Dirty: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
    Maintenance: { bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-400" },
  };

  const counts = {
    arrivals: 12,
    departures: 8,
    occupancy: 76,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Today&apos;s Arrivals</p>
          <p className="text-2xl font-bold text-gray-900">{counts.arrivals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Today&apos;s Departures</p>
          <p className="text-2xl font-bold text-gray-900">{counts.departures}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Occupancy Rate</p>
          <p className="text-2xl font-bold text-gray-900">{counts.occupancy}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          options={["All Types", "Standard", "Deluxe", "Suite"]}
        />
        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All Statuses", "Vacant", "Occupied", "Dirty", "Maintenance"]}
        />
        <SelectFilter
          value={floorFilter}
          onChange={setFloorFilter}
          options={["All Floors", "1", "2", "3"]}
        />
      </div>

      {/* Status Board */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Status Board</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => {
            const config = statusConfig[room.status];
            return (
              <div
                key={room.number}
                className={`rounded-xl border p-4 ${config.bg}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {room.number}
                    </p>
                    <p className={`text-xs font-medium ${config.text}`}>
                      {room.status}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                </div>
                <p className="text-sm text-gray-600">{room.type}</p>
                {room.guest && (
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {room.guest}
                  </p>
                )}
                {room.nights && (
                  <p className="text-xs text-gray-500">
                    {room.nights} Night{room.nights > 1 ? "s" : ""}
                  </p>
                )}
                {room.cleaned && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cleaned {room.cleaned}
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
