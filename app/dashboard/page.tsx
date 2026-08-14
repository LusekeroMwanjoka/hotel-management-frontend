"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  DoorOpen,
  BedDouble,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { DashboardEvent, DashboardResponse } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function trendText(today: number, yesterday: number) {
  const diff = today - yesterday;
  if (diff === 0) return { text: "same as yesterday", up: true };
  return {
    text: `${diff > 0 ? "+" : ""}${diff} vs yesterday`,
    up: diff > 0,
  };
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => new Date());

  const range = useMemo(() => {
    const start = new Date(cursor);
    const end = new Date(cursor);
    if (viewMode === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
    }
    return { start: toISO(start), end: toISO(end) };
  }, [viewMode, cursor]);

  const { data, loading, error, reload } = useApi<DashboardResponse>(
    async () => api.dashboard(range),
    [range]
  );

  const stats = data?.stats;
  const recent = data?.recent_check_ins ?? [];
  const events = data?.events ?? [];

  const eventMap = useMemo(() => {
    const map = new Map<string, DashboardEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const occupancyRate = stats?.total_rooms
    ? Math.round((stats.occupied_rooms / stats.total_rooms) * 100)
    : 0;

  const arrivalsTrend = trendText(
    stats?.today_arrivals ?? 0,
    stats?.yesterday_arrivals ?? 0
  );
  const departuresTrend = trendText(
    stats?.today_departures ?? 0,
    stats?.yesterday_departures ?? 0
  );

  const shift = (dir: -1 | 1) => {
    setCursor((c) => {
      const d = new Date(c);
      if (viewMode === "month") {
        d.setMonth(d.getMonth() + dir);
      } else {
        d.setDate(d.getDate() + dir * 7);
      }
      return d;
    });
  };

  const title =
    viewMode === "month"
      ? `${cursor.toLocaleString("default", { month: "long" })} ${cursor.getFullYear()}`
      : `${new Date(range.start).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        })} – ${new Date(range.end).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        })}`;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DoorOpen}
          label="Today's Arrivals"
          value={String(stats?.today_arrivals ?? 0)}
          trend={arrivalsTrend.text}
          trendUp={arrivalsTrend.up}
          color="emerald"
        />
        <StatCard
          icon={DoorOpen}
          label="Today's Departures"
          value={String(stats?.today_departures ?? 0)}
          trend={departuresTrend.text}
          trendUp={departuresTrend.up}
          color="blue"
        />
        <StatCard
          icon={BedDouble}
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          trend={`${stats?.occupied_rooms ?? 0} of ${stats?.total_rooms ?? 0} rooms`}
          color="purple"
        />
        <StatCard
          icon={Users}
          label="Active Guests"
          value={String(stats?.active_guests ?? 0)}
          trend="currently checked in"
          color="orange"
        />
      </div>

      {/* Calendar & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shift(-1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <button
                onClick={() => shift(1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-sm rounded-md font-medium ${
                  viewMode === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm rounded-md font-medium ${
                  viewMode === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-400 py-10 text-center">
              Loading calendar…
            </p>
          )}
          {error && (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={reload}
                className="mt-2 text-sm text-emerald-600 font-medium"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && viewMode === "month" && (
            <MonthCalendar cursor={cursor} events={eventMap} />
          )}
          {!loading && !error && viewMode === "week" && (
            <WeekView start={new Date(range.start)} events={eventMap} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Check-ins
          </h3>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No recent check-ins.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.guest_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.room_name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{item.checkin_time}</p>
                    <span className="text-xs font-medium text-emerald-600">
                      Checked In
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          {trendUp !== undefined &&
            (trendUp ? (
              <TrendingUp size={14} className="text-emerald-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            ))}
          <span
            className={`text-xs ${
              trendUp === undefined
                ? "text-gray-400"
                : trendUp
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function MonthCalendar({
  cursor,
  events,
}: {
  cursor: Date;
  events: Map<string, DashboardEvent[]>;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

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
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const dayEvents = events.get(dateKey(year, month, day)) ?? [];
          return (
            <div
              key={day}
              className={`aspect-square p-1 rounded-lg border text-xs ${
                isToday
                  ? "border-emerald-500 bg-emerald-50"
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
              {dayEvents.slice(0, 2).map((ev, idx) => (
                <div
                  key={idx}
                  className={`text-[10px] px-1 py-0.5 rounded mt-0.5 truncate ${
                    ev.type === "arrival"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ev.label}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[10px] text-gray-400 px-1">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-500">Arrivals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-500">Departures</span>
        </div>
      </div>
    </div>
  );
}

function WeekView({
  start,
  events,
}: {
  start: Date;
  events: Map<string, DashboardEvent[]>;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const today = new Date();

  return (
    <div className="space-y-2">
      {days.map((d) => {
        const key = toISO(d);
        const dayEvents = events.get(key) ?? [];
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div
            key={key}
            className={`rounded-lg border p-3 ${
              isToday ? "border-emerald-300 bg-emerald-50" : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {d.toLocaleDateString("default", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-400">
                {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
              </span>
            </div>
            {dayEvents.length === 0 ? (
              <p className="text-xs text-gray-400">No arrivals or departures</p>
            ) : (
              <div className="space-y-1">
                {dayEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ev.type === "arrival" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-gray-600">{ev.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
