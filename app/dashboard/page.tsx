"use client";

import {
  TrendingUp,
  TrendingDown,
  Users,
  DoorOpen,
  BedDouble,
} from "lucide-react";

export default function DashboardPage() {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DoorOpen}
          label="Today's Arrivals"
          value="12"
          trend="+3 vs yesterday"
          trendUp
          color="emerald"
        />
        <StatCard
          icon={DoorOpen}
          label="Today's Departures"
          value="8"
          trend="-2 vs yesterday"
          trendUp={false}
          color="blue"
        />
        <StatCard
          icon={BedDouble}
          label="Occupancy Rate"
          value="76%"
          trend="+5% vs last week"
          trendUp
          color="purple"
        />
        <StatCard
          icon={Users}
          label="Active Guests"
          value="34"
          trend="+8 new this week"
          trendUp
          color="orange"
        />
      </div>

      {/* Quick Actions & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
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
          <CalendarGrid month={today.getMonth()} year={today.getFullYear()} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Check-ins
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Sarah Johnson",
                room: "Suite 402",
                time: "14:30",
                status: "Checked In",
              },
              {
                name: "Michael Chen",
                room: "Deluxe 205",
                time: "13:15",
                status: "Checked In",
              },
              {
                name: "Emma Wilson",
                room: "Standard 103",
                time: "12:00",
                status: "Pending",
              },
              {
                name: "Robert Davis",
                room: "Suite 310",
                time: "11:45",
                status: "Checked In",
              },
              {
                name: "Lisa Park",
                room: "Deluxe 202",
                time: "10:30",
                status: "Checked In",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{item.time}</p>
                  <span
                    className={`text-xs font-medium ${
                      item.status === "Checked In"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
  trend: string;
  trendUp: boolean;
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
      <div className="flex items-center gap-1 mt-1">
        {trendUp ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span
          className={`text-xs ${
            trendUp ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

function CalendarGrid({ month, year }: { month: number; year: number }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Sample events
  const events: Record<number, { label: string; color: string }[]> = {
    3: [
      { label: "Tech Summit 23", color: "bg-blue-100 text-blue-700" },
      { label: "Wedding Reception", color: "bg-purple-100 text-purple-700" },
    ],
    15: [{ label: "Corporate Event", color: "bg-amber-100 text-amber-700" }],
    22: [{ label: "Board Meeting", color: "bg-emerald-100 text-emerald-700" }],
  };

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
          const dayEvents = events[day] || [];
          const isToday = day === 11; // Simulate Oct 11 as today
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
              {dayEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className={`text-[10px] px-1 py-0.5 rounded mt-0.5 truncate ${ev.color}`}
                >
                  {ev.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        {["Pending", "Confirmed", "In-Progress", "Completed"].map(
          (status, i) => {
            const colors = [
              "bg-gray-300",
              "bg-blue-400",
              "bg-amber-400",
              "bg-emerald-400",
            ];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${colors[i]}`}
                />
                <span className="text-xs text-gray-500">{status}</span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
