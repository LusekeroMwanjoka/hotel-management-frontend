"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Hotel,
  UtensilsCrossed,
  Beer,
  Dumbbell,
  Sparkles,
  Waves,
  Building2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  LogOut,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rooms", href: "/dashboard/rooms", icon: Hotel },
  { name: "Check Out", href: "/dashboard/check-out", icon: LogOut },
  { name: "Restaurant", href: "/dashboard/restaurant", icon: UtensilsCrossed },
  { name: "Bar", href: "/dashboard/bar", icon: Beer },
  { name: "Gym", href: "/dashboard/gym", icon: Dumbbell },
  { name: "Spa", href: "/dashboard/spa", icon: Sparkles },
  { name: "Pool", href: "/dashboard/swimming", icon: Waves },
  { name: "Conference", href: "/dashboard/conference", icon: Building2 },
  { name: "Users", href: "/dashboard/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <aside
      className={`flex flex-col bg-emerald-900 text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-emerald-800">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Highlands Lodge</h1>
            <p className="text-xs text-emerald-300">LMS v1.0</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-emerald-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* New Reservation Button */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/dashboard/check-in"
            className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle size={18} />
            + New Reservation
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p
          className={`text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 ${
            collapsed ? "sr-only" : "px-3"
          }`}
        >
          Lodge Management
        </p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-700 text-white font-medium"
                  : "text-emerald-100 hover:bg-emerald-800"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-emerald-800">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-300">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white font-medium text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {user?.name ?? "Staff"}
              </p>
              <p className="truncate capitalize">
                {user?.role ?? user?.department ?? "Lodge Ops"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
