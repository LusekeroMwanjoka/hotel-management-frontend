"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Plus, X, Loader2, Settings, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type {
  CheckIn,
  CheckOut,
  Room,
  RoomOccupancyStatus,
  RoomType,
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
  roomTypeOptions: RoomType[];
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

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: "",
    room_type_id: "",
    occupancy_status: "available",
    description: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showAddRoomType, setShowAddRoomType] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState({
    code: "",
    name: "",
    base_rate: "",
    bed_type: "single",
    description: "",
    notes: "",
  });
  const [savingType, setSavingType] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  const [showManageTypes, setShowManageTypes] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useApi<RoomsData>(
    async () => {
      const [roomsRes, checkInsRes, checkOutsRes, roomTypesRes] =
        await Promise.all([
          api.rooms({
            page,
            room_type:
              roomTypeFilter !== "All Types" ? roomTypeFilter : undefined,
            occupancy_status:
              statusFilter !== "All Statuses" ? statusFilter : undefined,
            floor: floorFilter !== "All Floors" ? floorFilter : undefined,
            search: debouncedSearch || undefined,
          }),
          api.checkIns(),
          api.checkOuts(),
          api.roomTypes(),
        ]);
      return {
        rooms: roomsRes.data ?? [],
        roomTypeOptions: roomTypesRes.data ?? [],
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
  const roomTypeOptions = data?.roomTypeOptions ?? [];
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

  const openAddRoom = () => {
    setFormError(null);
    setRoomForm({
      name: "",
      room_type_id: "",
      occupancy_status: "available",
      description: "",
      notes: "",
    });
    setShowAddRoom(true);
  };

  const handleCreateRoom = async () => {
    if (!roomForm.name.trim() || !roomForm.room_type_id) {
      setFormError("Room name and room type are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api.createRoom({
        name: roomForm.name.trim(),
        room_type_id: Number(roomForm.room_type_id),
        occupancy_status: roomForm.occupancy_status as RoomOccupancyStatus,
        description: roomForm.description || null,
        notes: roomForm.notes || null,
      });
      setShowAddRoom(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to add room.");
    } finally {
      setSaving(false);
    }
  };

  const openAddRoomType = () => {
    setTypeError(null);
    setEditingType(null);
    setRoomTypeForm({
      code: "",
      name: "",
      base_rate: "",
      bed_type: "single",
      description: "",
      notes: "",
    });
    setShowAddRoomType(true);
  };

  const openEditRoomType = (type: RoomType) => {
    setTypeError(null);
    setEditingType(type);
    setRoomTypeForm({
      code: type.code,
      name: type.name,
      base_rate: String(type.base_rate ?? ""),
      bed_type: type.bed_type ?? "single",
      description: type.description ?? "",
      notes: type.notes ?? "",
    });
    setShowAddRoomType(true);
  };

  const handleDeleteRoomType = async (type: RoomType) => {
    if (!window.confirm(`Delete room type "${type.name}"?`)) return;
    try {
      await api.deleteRoomType(type.id);
      reload();
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Failed to delete room type."
      );
    }
  };

  const handleCreateRoomType = async () => {
    if (
      !roomTypeForm.code.trim() ||
      !roomTypeForm.name.trim() ||
      !roomTypeForm.base_rate
    ) {
      setTypeError("Code, name and base rate are required.");
      return;
    }
    const payload = {
      code: roomTypeForm.code.trim(),
      name: roomTypeForm.name.trim(),
      base_rate: Number(roomTypeForm.base_rate),
      bed_type: roomTypeForm.bed_type,
      description: roomTypeForm.description || null,
      notes: roomTypeForm.notes || null,
    };
    setSavingType(true);
    setTypeError(null);
    try {
      if (editingType) {
        await api.updateRoomType(editingType.id, payload);
      } else {
        await api.createRoomType(payload);
      }
      setShowAddRoomType(false);
      setEditingType(null);
      reload();
    } catch (e) {
      setTypeError(
        e instanceof Error ? e.message : "Failed to save room type."
      );
    } finally {
      setSavingType(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowManageTypes(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Settings size={18} />
              Manage Types
            </button>
            <button
              onClick={openAddRoomType}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Plus size={18} />
              Add Room Type
            </button>
            <button
              onClick={openAddRoom}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} />
              Add Room
            </button>
          </div>
        </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={rooms.length === 0}
      >
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

      {showAddRoom && (
        <AddRoomModal
          roomTypes={roomTypeOptions}
          form={roomForm}
          setForm={setRoomForm}
          error={formError}
          saving={saving}
          onClose={() => setShowAddRoom(false)}
          onSubmit={handleCreateRoom}
        />
      )}

      {showAddRoomType && (
        <AddRoomTypeModal
          editing={editingType}
          form={roomTypeForm}
          setForm={setRoomTypeForm}
          error={typeError}
          saving={savingType}
          onClose={() => {
            setShowAddRoomType(false);
            setEditingType(null);
          }}
          onSubmit={handleCreateRoomType}
        />
      )}

      {showManageTypes && (
        <ManageRoomTypesModal
          roomTypes={roomTypeOptions}
          onClose={() => setShowManageTypes(false)}
          onEdit={(type) => {
            setShowManageTypes(false);
            openEditRoomType(type);
          }}
          onDelete={handleDeleteRoomType}
        />
      )}
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

type RoomFormState = {
  name: string;
  room_type_id: string;
  occupancy_status: string;
  description: string;
  notes: string;
};

function AddRoomModal({
  roomTypes,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  roomTypes: RoomType[];
  form: RoomFormState;
  setForm: (form: RoomFormState) => void;
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
          <h3 className="font-semibold text-gray-800">Add Room</h3>
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
              Room Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Room 101"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              value={form.room_type_id}
              onChange={(e) =>
                setForm({ ...form, room_type_id: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a room type</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — MWK {Number(t.base_rate ?? 0).toFixed(2)}/night
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.occupancy_status}
              onChange={(e) =>
                setForm({ ...form, occupancy_status: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
              <option value="blocked">Blocked</option>
              <option value="out_of_service">Out of Service</option>
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
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
              "Add Room"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type RoomTypeFormState = {
  code: string;
  name: string;
  base_rate: string;
  bed_type: string;
  description: string;
  notes: string;
};

function AddRoomTypeModal({
  editing,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  editing?: RoomType | null;
  form: RoomTypeFormState;
  setForm: (form: RoomTypeFormState) => void;
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
          <h3 className="font-semibold text-gray-800">
            {editing ? "Edit Room Type" : "Add Room Type"}
          </h3>
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
              Code *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. STD"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Standard"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Rate (MWK) *
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.base_rate}
              onChange={(e) =>
                setForm({ ...form, base_rate: e.target.value })
              }
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bed Type *
            </label>
            <select
              value={form.bed_type}
              onChange={(e) => setForm({ ...form, bed_type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="twin">Twin</option>
              <option value="queen">Queen</option>
              <option value="king">King</option>
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
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
              editing ? "Save Changes" : "Add Room Type"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageRoomTypesModal({
  roomTypes,
  onClose,
  onEdit,
  onDelete,
}: {
  roomTypes: RoomType[];
  onClose: () => void;
  onEdit: (type: RoomType) => void;
  onDelete: (type: RoomType) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Manage Room Types</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {roomTypes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No room types yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {roomTypes.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.code} • {t.bed_type ?? "—"} • MWK{" "}
                      {Number(t.base_rate ?? 0).toFixed(2)}/night
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
