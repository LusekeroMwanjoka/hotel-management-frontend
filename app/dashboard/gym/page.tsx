"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Check,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Subscription {
  id: string;
  memberName: string;
  memberId: string;
  type: string;
  startDate: string;
  expiryDate: string;
  paymentStatus: "Paid" | "Processing" | "Overdue";
  verificationStatus: "Verified" | "Awaiting Review" | "Pending";
  maker?: string;
  checker?: string;
}

const subscriptions: Subscription[] = [
  {
    id: "1",
    memberName: "Eleanor Hayes",
    memberId: "MEM-2938",
    type: "Annual Premium",
    startDate: "2023-11-01",
    expiryDate: "2024-11-01",
    paymentStatus: "Paid",
    verificationStatus: "Verified",
    maker: "J. Doe",
    checker: "A. Smith",
  },
  {
    id: "2",
    memberName: "Thomas Reed",
    memberId: "MEM-8472",
    type: "Monthly Base",
    startDate: "2024-04-15",
    expiryDate: "2024-05-15",
    paymentStatus: "Paid",
    verificationStatus: "Awaiting Review",
    maker: "M. Brown",
  },
  {
    id: "3",
    memberName: "Maria Chen",
    memberId: "MEM-1102",
    type: "Annual Standard",
    startDate: "2024-01-10",
    expiryDate: "2025-01-10",
    paymentStatus: "Processing",
    verificationStatus: "Verified",
    maker: "A. Smith",
    checker: "J. Doe",
  },
  {
    id: "4",
    memberName: "David Kim",
    memberId: "MEM-5591",
    type: "Monthly Premium",
    startDate: "2024-03-20",
    expiryDate: "2024-04-20",
    paymentStatus: "Overdue",
    verificationStatus: "Pending",
    maker: "J. Doe",
  },
];

const paymentConfig: Record<
  Subscription["paymentStatus"],
  { bg: string; text: string; icon: React.ElementType }
> = {
  Paid: { bg: "bg-emerald-100", text: "text-emerald-700", icon: Check },
  Processing: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Clock,
  },
  Overdue: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: AlertCircle,
  },
};

const verificationConfig: Record<
  Subscription["verificationStatus"],
  { bg: string; text: string }
> = {
  Verified: { bg: "bg-emerald-50", text: "text-emerald-700" },
  "Awaiting Review": { bg: "bg-amber-50", text: "text-amber-700" },
  Pending: { bg: "bg-gray-100", text: "text-gray-600" },
};

export default function GymPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  return (
    <div className="space-y-6">
      {/* Page Description */}
      <p className="text-sm text-gray-500">
        Manage active memberships, renewals, and verifications.
      </p>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Types</option>
            <option>Monthly Base</option>
            <option>Monthly Premium</option>
            <option>Annual Standard</option>
            <option>Annual Premium</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Processing</option>
            <option>Overdue</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={18} />
            + New Subscription
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => {
                const payCfg = paymentConfig[sub.paymentStatus];
                const PayIcon = payCfg.icon;
                const verCfg = verificationConfig[sub.verificationStatus];
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {sub.memberName}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {sub.memberId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{sub.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sub.startDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sub.expiryDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payCfg.bg} ${payCfg.text}`}
                      >
                        <PayIcon size={12} />
                        {sub.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${verCfg.bg} ${verCfg.text}`}
                        >
                          {sub.verificationStatus === "Verified" && (
                            <Check size={12} />
                          )}
                          {sub.verificationStatus === "Awaiting Review" && (
                            <Clock size={12} />
                          )}
                          {sub.verificationStatus}
                        </span>
                        {sub.maker && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Maker: {sub.maker}
                            {sub.checker && ` • Checker: ${sub.checker}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing 1 to 4 of 42 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded bg-emerald-600 text-white text-sm font-medium">
              1
            </button>
            <button className="w-8 h-8 rounded hover:bg-gray-200 text-sm text-gray-600">
              2
            </button>
            <button className="w-8 h-8 rounded hover:bg-gray-200 text-sm text-gray-600">
              3
            </button>
            <span className="text-gray-400">...</span>
            <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
