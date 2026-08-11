"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Clock,
  Users,
  Waves,
} from "lucide-react";

interface PoolSession {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  charge: number;
  entryTime: string;
  exitTime: string;
  description?: string;
  capturedBy: string;
  verifiedBy?: string;
}

const sessions: PoolSession[] = [
  {
    id: "PS-001",
    clientName: "John Smith",
    clientPhone: "+1 (555) 123-4567",
    clientEmail: "john@example.com",
    charge: 15.0,
    entryTime: "10:00",
    exitTime: "12:00",
    capturedBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
  {
    id: "PS-002",
    clientName: "Emily Davis",
    clientPhone: "+1 (555) 234-5678",
    charge: 15.0,
    entryTime: "11:30",
    exitTime: "13:30",
    capturedBy: "M. Brown",
    verifiedBy: "J. Doe",
  },
  {
    id: "PS-003",
    clientName: "The Johnson Family",
    clientPhone: "+1 (555) 345-6789",
    charge: 40.0,
    entryTime: "14:00",
    exitTime: "17:00",
    description: "Family package - 4 persons",
    capturedBy: "J. Doe",
  },
  {
    id: "PS-004",
    clientName: "Robert Davis",
    clientPhone: "+1 (555) 456-7890",
    clientEmail: "robert@example.com",
    charge: 15.0,
    entryTime: "15:00",
    exitTime: "16:30",
    capturedBy: "A. Smith",
    verifiedBy: "J. Doe",
  },
  {
    id: "PS-005",
    clientName: "Sarah Johnson",
    clientPhone: "+1 (555) 567-8901",
    charge: 15.0,
    entryTime: "16:00",
    exitTime: "18:00",
    capturedBy: "M. Brown",
  },
];

export default function SwimmingPage() {
  const [search, setSearch] = useState("");

  const filtered = sessions.filter(
    (s) =>
      s.clientName.toLowerCase().includes(search.toLowerCase()) ||
      s.clientPhone.includes(search)
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Manage swimming pool sessions, entry/exit times, and charges.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Today&apos;s Sessions</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Waves size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">5</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Active Swimmers</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Today&apos;s Revenue</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">$100.00</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={18} />
            + New Session
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Charge
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Entry
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Exit
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Captured By
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Verified By
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {session.clientName}
                    </p>
                    {session.description && (
                      <p className="text-xs text-gray-400">
                        {session.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {session.clientPhone}
                    </p>
                    {session.clientEmail && (
                      <p className="text-xs text-gray-400">
                        {session.clientEmail}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    ${session.charge.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.entryTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.exitTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.capturedBy}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.verifiedBy || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
