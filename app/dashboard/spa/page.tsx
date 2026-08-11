"use client";

import { useState } from "react";
import { Plus, CalendarDays, List, User, Clock } from "lucide-react";

interface Appointment {
  id: string;
  therapist: string;
  service: string;
  time: string;
  clientName: string;
  status: "Completed" | "Scheduled" | "Pending";
  duration: number; // minutes
}

const therapists = ["Sarah L.", "Michael T.", "Emma W."];

const appointments: Appointment[] = [
  {
    id: "1",
    therapist: "Sarah L.",
    service: "Deep Tissue Massage",
    time: "09:00",
    clientName: "John Smith",
    status: "Completed",
    duration: 60,
  },
  {
    id: "2",
    therapist: "Michael T.",
    service: "Revitalizing Facial",
    time: "10:00",
    clientName: "Emily Davis",
    status: "Scheduled",
    duration: 45,
  },
  {
    id: "3",
    therapist: "Emma W.",
    service: "Body Wrap",
    time: "11:00",
    clientName: "Lisa Park",
    status: "Scheduled",
    duration: 60,
  },
  {
    id: "4",
    therapist: "Sarah L.",
    service: "Swedish Massage",
    time: "14:00",
    clientName: "Robert Davis",
    status: "Scheduled",
    duration: 60,
  },
  {
    id: "5",
    therapist: "Michael T.",
    service: "Hot Stone Therapy",
    time: "15:00",
    clientName: "Maria Chen",
    status: "Pending",
    duration: 90,
  },
  {
    id: "6",
    therapist: "Emma W.",
    service: "Aromatherapy",
    time: "16:00",
    clientName: "Thomas Reed",
    status: "Scheduled",
    duration: 45,
  },
];

const timeSlots = Array.from({ length: 8 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const statusConfig: Record<
  Appointment["status"],
  { bg: string; border: string; text: string }
> = {
  Completed: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
  Scheduled: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
  },
  Pending: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
  },
};

export default function SpaPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [therapistFilter, setTherapistFilter] = useState("All Therapists");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getAppointmentForSlot = (therapist: string, time: string) => {
    return appointments.find(
      (a) => a.therapist === therapist && a.time === time
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Manage daily schedules, therapist assignments, and service
        verifications.
      </p>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700">Today, {today}</p>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Services</option>
            <option>Massage</option>
            <option>Facial</option>
            <option>Body</option>
          </select>
          <select
            value={therapistFilter}
            onChange={(e) => setTherapistFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Therapists</option>
            {therapists.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === "calendar"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CalendarDays size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={18} />
            + New Appointment
          </button>
        </div>
      </div>

      {/* Timetable */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  Time
                </th>
                {therapists.map((therapist) => (
                  <th
                    key={therapist}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"
                  >
                    {therapist}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeSlots.map((time) => (
                <tr key={time} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <span className="text-sm font-medium text-gray-600">
                      {time}
                    </span>
                  </td>
                  {therapists.map((therapist) => {
                    const appt = getAppointmentForSlot(therapist, time);
                    if (!appt) {
                      return (
                        <td
                          key={therapist}
                          className="px-2 py-3 border-l border-gray-100"
                        >
                          <div className="h-20 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-300">
                              Available
                            </span>
                          </div>
                        </td>
                      );
                    }
                    const cfg = statusConfig[appt.status];
                    const height = Math.max(
                      80,
                      (appt.duration / 60) * 100
                    );
                    return (
                      <td
                        key={therapist}
                        className="px-2 py-1 border-l border-gray-100"
                      >
                        <div
                          className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}
                          style={{ minHeight: `${height}px` }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs font-medium ${cfg.text}`}
                            >
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">
                            {appt.service}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <User size={12} />
                            <span>{appt.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{appt.duration} min</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
