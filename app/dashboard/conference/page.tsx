"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Clock,
  User,
  Building2,
  BadgeCheck,
  Edit3,
  DollarSign,
} from "lucide-react";

interface Booking {
  id: string;
  hallName: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientContact: string;
  baseCost: number;
  cateringEstimate: number;
  totalEstimated: number;
  status: "Pending" | "Confirmed" | "In-Progress" | "Completed";
  verificationStatus: "Verified" | "Pending" | "Awaiting Review";
  maker: string;
  checker: string;
}

const bookings: Booking[] = [
  {
    id: "BK-001",
    hallName: "Grand Hall A",
    eventName: "Tech Summit 23",
    date: "2023-10-03",
    startTime: "09:00",
    endTime: "18:00",
    clientName: "Nexus Innovations",
    clientContact: "Sarah Jenkins",
    baseCost: 4500.0,
    cateringEstimate: 1200.0,
    totalEstimated: 5700.0,
    status: "In-Progress",
    verificationStatus: "Verified",
    maker: "J. Doe (Front Desk)",
    checker: "A. Smith (Manager)",
  },
  {
    id: "BK-002",
    hallName: "Conference Room B",
    eventName: "Wedding Reception",
    date: "2023-10-15",
    startTime: "14:00",
    endTime: "22:00",
    clientName: "The Johnson Family",
    clientContact: "Mary Johnson",
    baseCost: 3200.0,
    cateringEstimate: 2500.0,
    totalEstimated: 5700.0,
    status: "Confirmed",
    verificationStatus: "Pending",
    maker: "J. Doe (Front Desk)",
    checker: "—",
  },
  {
    id: "BK-003",
    hallName: "Grand Hall A",
    eventName: "Corporate Gala",
    date: "2023-10-22",
    startTime: "18:00",
    endTime: "23:00",
    clientName: "GlobalTech Inc.",
    clientContact: "David Lee",
    baseCost: 5500.0,
    cateringEstimate: 3200.0,
    totalEstimated: 8700.0,
    status: "Pending",
    verificationStatus: "Awaiting Review",
    maker: "M. Brown (Events)",
    checker: "—",
  },
];

const statusConfig: Record<
  Booking["status"],
  { bg: string; text: string; dot: string }
> = {
  Pending: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
  },
  Confirmed: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  "In-Progress": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  Completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
};

export default function ConferencePage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking>(bookings[0]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
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
            List
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus size={18} />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {currentMonth} {currentYear}
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm rounded-md bg-emerald-100 text-emerald-700 font-medium">
                Month
              </button>
              <button className="px-3 py-1 text-sm rounded-md text-gray-500 hover:bg-gray-100">
                Week
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dayBookings = bookings.filter(
                (b) => parseInt(b.date.split("-")[2]) === day
              );
              return (
                <div
                  key={day}
                  className={`aspect-square p-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                    dayBookings.length > 0
                      ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-700">{day}</span>
                  {dayBookings.map((b, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] px-1 py-0.5 rounded mt-0.5 truncate ${
                        statusConfig[b.status].bg
                      } ${statusConfig[b.status].text}`}
                    >
                      {b.eventName}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            {["Pending", "Confirmed", "In-Progress", "Completed / Issue"].map(
              (label, i) => {
                const colors = [
                  "bg-gray-300",
                  "bg-blue-400",
                  "bg-amber-400",
                  "bg-emerald-400",
                ];
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Booking Details Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {selectedBooking.eventName}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                statusConfig[selectedBooking.status].bg
              } ${statusConfig[selectedBooking.status].text}`}
            >
              {selectedBooking.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Hall</p>
              <p className="text-sm font-medium text-gray-800">
                {selectedBooking.hallName}
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Booking Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedBooking.date} • {selectedBooking.startTime} to{" "}
                  {selectedBooking.endTime}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Client Details</p>
              <p className="text-sm font-medium text-gray-800">
                {selectedBooking.clientName}
              </p>
              <p className="text-sm text-gray-500">
                Contact: {selectedBooking.clientContact}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Cost</span>
                  <span className="font-medium text-gray-800">
                    ${selectedBooking.baseCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Catering (Est)</span>
                  <span className="font-medium text-gray-800">
                    ${selectedBooking.cateringEstimate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-800">
                    Total Estimated
                  </span>
                  <span className="font-bold text-gray-900">
                    ${selectedBooking.totalEstimated.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Verification Status</p>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedBooking.verificationStatus === "Verified"
                    ? "bg-emerald-100 text-emerald-700"
                    : selectedBooking.verificationStatus === "Pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <BadgeCheck size={12} />
                {selectedBooking.verificationStatus}
              </span>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Maker:{" "}
                <span className="text-gray-700">
                  {selectedBooking.maker}
                </span>
              </p>
              <p>
                Checker:{" "}
                <span className="text-gray-700">
                  {selectedBooking.checker}
                </span>
              </p>
            </div>

            <div className="flex gap-2 pt-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Edit3 size={14} />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm hover:bg-amber-100 transition-colors">
                <DollarSign size={14} />
                Add Overage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
