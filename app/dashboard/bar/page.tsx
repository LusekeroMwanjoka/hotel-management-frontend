"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type { BarTransaction } from "@/lib/types";

type Tab = "sales" | "purchases";

interface BarData {
  sales: BarTransaction[];
  purchases: BarTransaction[];
}

const drinkTypeColors: Record<string, string> = {
  beer: "bg-amber-100 text-amber-700",
  wines: "bg-purple-100 text-purple-700",
  spirits: "bg-red-100 text-red-700",
  cocktail: "bg-pink-100 text-pink-700",
  cider: "bg-orange-100 text-orange-700",
  soda: "bg-blue-100 text-blue-700",
  juice: "bg-green-100 text-green-700",
  water: "bg-cyan-100 text-cyan-700",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function BarPage() {
  const { data, loading, error, reload } = useApi<BarData>(async () => {
    const [salesRes, purchasesRes] = await Promise.all([
      api.barSales(),
      api.barPurchases(),
    ]);
    return {
      sales: salesRes.data ?? [],
      purchases: purchasesRes.data ?? [],
    };
  });

  const [activeTab, setActiveTab] = useState<Tab>("sales");
  const [search, setSearch] = useState("");

  const items = activeTab === "sales" ? data?.sales ?? [] : data?.purchases ?? [];

  const filtered = items.filter(
    (item) =>
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.date.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: "sales" as Tab, label: "Sales", icon: Receipt },
          { id: "purchases" as Tab, label: "Purchases", icon: ShoppingCart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
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
            placeholder={`Search ${activeTab}...`}
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
            + New {activeTab === "sales" ? "Sale" : "Purchase"}
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
      >
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
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
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          drinkTypeColors[item.type] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {capitalize(item.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Number(item.quantity ?? 0)} × {Number(item.unit ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${Number(item.price_per_unit ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      ${Number(item.total_price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.captured_by_user?.name ?? `#${item.captured_by}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.verified_by_user?.name ?? `#${item.verified_by}`}
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
      </PageState>
    </div>
  );
}
