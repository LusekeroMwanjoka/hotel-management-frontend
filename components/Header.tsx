"use client";

import { Search, Bell, Settings, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { api, clearSession } from "@/lib/api";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/rooms": "Room Status",
  "/dashboard/check-in": "New Reservation",
  "/dashboard/conference": "Conference Hall Bookings",
  "/dashboard/gym": "Gym Subscriptions",
  "/dashboard/spa": "Spa Appointments",
  "/dashboard/restaurant": "Restaurant",
  "/dashboard/bar": "Bar",
  "/dashboard/swimming": "Swimming Pool",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || pathname;

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Token may already be invalid; clear local session regardless.
    }
    clearSession();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
          />
        </div>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Settings size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
