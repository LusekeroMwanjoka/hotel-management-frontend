"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  X,
  Loader2,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type { Room } from "@/lib/types";

export default function CheckInPage() {
  const router = useRouter();
  const { data: rooms, loading, error, reload } = useApi<Room[]>(async () => {
    const res = await api.rooms({ occupancy_status: "available", per_page: 500 });
    return res.data ?? [];
  });

  const availableRooms = useMemo(
    () => (rooms ?? []).filter((r) => r.occupancy_status === "available"),
    [rooms]
  );

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Guest form
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    email: "",
    phone: "",
    idNumber: "",
    nextOfKin: "",
  });

  // Stay details
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [guests, setGuestsCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");

  const roomRate = Number(selectedRoom?.room_type?.base_rate ?? 0);
  const nights = useMemo(() => {
    const start = new Date(checkInDate).getTime();
    const end = new Date(checkOutDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
    return Math.round((end - start) / 86400000);
  }, [checkInDate, checkOutDate]);

  const total = roomRate * nights;

  const handleSubmit = async () => {
    if (!selectedRoom) {
      setSubmitError("Please select a room.");
      return;
    }
    if (!guest.firstName || !guest.lastName || !guest.nationality) {
      setSubmitError("Guest first name, last name and nationality are required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const createdGuest = await api.createGuest({
        first_name: guest.firstName,
        last_name: guest.lastName,
        nationality: guest.nationality,
        email: guest.email || null,
        phone: guest.phone || null,
        id_number: guest.idNumber || null,
        next_of_kin_name: guest.nextOfKin || null,
      });

      const session = getSession();
      const checkinBy = session.user?.id ?? 1;

      await api.createCheckIn({
        guest_id: createdGuest.id,
        room_id: selectedRoom.id,
        checkin_date: checkInDate,
        checkin_time: checkInTime,
        expected_checkout_date: checkOutDate,
        expected_checkout_time: checkOutTime,
        base_rate: roomRate,
        number_of_days: nights,
        mode_of_payment: paymentMethod,
        checkin_by: checkinBy,
      });

      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to complete check-in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={false}
      >
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Selected Room</h3>
                <button
                  onClick={() => setShowRoomSelector(!showRoomSelector)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Change Room
                </button>
              </div>

              {selectedRoom ? (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-sm">
                      {selectedRoom.name.replace(/\D/g, "").slice(-3) ||
                        selectedRoom.name}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {selectedRoom.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedRoom.room_type?.name ?? "—"} •{" "}
                      {selectedRoom.room_type?.bed_type ?? ""}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Available
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRoomSelector(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                >
                  Select a room to continue
                </button>
              )}

              {showRoomSelector && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      Available Rooms ({availableRooms.length})
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {availableRooms.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400 text-center">
                        No available rooms.
                      </p>
                    ) : (
                      availableRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowRoomSelector(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {room.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {room.room_type?.name ?? "—"} • $
                              {Number(room.room_type?.base_rate ?? 0).toFixed(2)}
                              /night
                            </p>
                          </div>
                          <span className="text-emerald-600 text-sm">Select</span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => setShowRoomSelector(false)}
                      className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded"
                    >
                      <X size={14} /> Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">
                Guest Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={guest.firstName}
                    onChange={(e) =>
                      setGuest({ ...guest, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={guest.lastName}
                    onChange={(e) =>
                      setGuest({ ...guest, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={guest.nationality}
                    onChange={(e) =>
                      setGuest({ ...guest, nationality: e.target.value })
                    }
                    placeholder="e.g. Kenyan"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={guest.phone}
                    onChange={(e) =>
                      setGuest({ ...guest, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={guest.email}
                    onChange={(e) =>
                      setGuest({ ...guest, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID / Passport Number
                  </label>
                  <input
                    type="text"
                    value={guest.idNumber}
                    onChange={(e) =>
                      setGuest({ ...guest, idNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next of Kin{" "}
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name & Contact"
                    value={guest.nextOfKin}
                    onChange={(e) =>
                      setGuest({ ...guest, nextOfKin: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Stay Details & Payment */}
          <div className="space-y-6">
            {/* Stay Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Stay Details</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nights
                  </label>
                  <p className="text-lg font-bold text-gray-900">{nights}</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Guests
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuestsCount(Math.max(1, guests - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">
                      {guests}
                    </span>
                    <button
                      onClick={() => setGuestsCount(guests + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Room Rate (${roomRate.toFixed(2)} × {nights})
                  </span>
                  <span className="font-medium text-gray-800">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">
                    Total Balance
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <label className="block text-xs text-gray-500 mb-2">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      paymentMethod === "card"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard size={16} />
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      paymentMethod === "cash"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote size={16} />
                    Cash
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.back()}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Capture & Check-in"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageState>
    </div>
  );
}
