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

type Tab = "sales" | "purchases";

interface BarSale {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  date: string;
  capturedBy: string;
  verifiedBy: string;
}

interface BarPurchase {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  date: string;
  capturedBy: string;
  verifiedBy: string;
}

const barSales: BarSale[] = [
  {
    id: "BS-001",
    type: "Beer",
    quantity: 24,
    unit: "bottles",
    pricePerUnit: 5.0,
    totalPrice: 120.0,
    date: "2023-10-24",
    capturedBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
  {
    id: "BS-002",
    type: "Wine",
    quantity: 3,
    unit: "bottles",
    pricePerUnit: 35.0,
    totalPrice: 105.0,
    date: "2023-10-24",
    capturedBy: "M. Brown",
    verifiedBy: "J. Doe",
  },
  {
    id: "BS-003",
    type: "Cocktail",
    quantity: 8,
    unit: "glasses",
    pricePerUnit: 12.0,
    totalPrice: 96.0,
    date: "2023-10-23",
    capturedBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
  {
    id: "BS-004",
    type: "Spirits",
    quantity: 4,
    unit: "shots",
    pricePerUnit: 8.0,
    totalPrice: 32.0,
    date: "2023-10-23",
    capturedBy: "A. Smith",
    verifiedBy: "J. Doe",
  },
];

const barPurchases: BarPurchase[] = [
  {
    id: "BP-001",
    type: "Beer",
    quantity: 10,
    unit: "crates",
    pricePerUnit: 25.0,
    totalPrice: 250.0,
    date: "2023-10-15",
    capturedBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
  {
    id: "BP-002",
    type: "Wine",
    quantity: 24,
    unit: "bottles",
    pricePerUnit: 12.0,
    totalPrice: 288.0,
    date: "2023-10-15",
    capturedBy: "M. Brown",
    verifiedBy: "J. Doe",
  },
  {
    id: "BP-003",
    type: "Spirits",
    quantity: 12,
    unit: "bottles",
    pricePerUnit: 18.0,
    totalPrice: 216.0,
    date: "2023-10-10",
    capturedBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
];

const drinkTypeColors: Record<string, string> = {
  Beer: "bg-amber-100 text-amber-700",
  Wine: "bg-purple-100 text-purple-700",
  Spirits: "bg-red-100 text-red-700",
  Cocktail: "bg-pink-100 text-pink-700",
  Cider: "bg-orange-100 text-orange-700",
  Soda: "bg-blue-100 text-blue-700",
  Juice: "bg-green-100 text-green-700",
  Water: "bg-cyan-100 text-cyan-700",
};

export default function BarPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sales");
  const [search, setSearch] = useState("");

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
              {(activeTab === "sales" ? barSales : barPurchases)
                .filter(
                  (item) =>
                    item.type.toLowerCase().includes(search.toLowerCase()) ||
                    item.date.includes(search)
                )
                .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          drinkTypeColors[item.type] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${item.pricePerUnit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.capturedBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.verifiedBy}
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
