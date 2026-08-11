"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
} from "lucide-react";

type Tab = "menu" | "sales" | "purchases";

interface MenuItem {
  id: string;
  name: string;
  type: "Starter" | "Main Course" | "Dessert";
  price: number;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Salmon",
    type: "Main Course",
    price: 24.99,
    description: "Atlantic salmon with herb butter and seasonal vegetables",
  },
  {
    id: "2",
    name: "Caesar Salad",
    type: "Starter",
    price: 12.99,
    description: "Romaine lettuce, parmesan, croutons, Caesar dressing",
  },
  {
    id: "3",
    name: "Beef Tenderloin",
    type: "Main Course",
    price: 32.99,
    description: "8oz tenderloin with mashed potatoes and peppercorn sauce",
  },
  {
    id: "4",
    name: "Chocolate Lava Cake",
    type: "Dessert",
    price: 10.99,
    description: "Warm chocolate cake with molten center, vanilla ice cream",
  },
  {
    id: "5",
    name: "Tomato Basil Soup",
    type: "Starter",
    price: 8.99,
    description: "Roasted tomato soup with fresh basil and cream",
  },
  {
    id: "6",
    name: "Tiramisu",
    type: "Dessert",
    price: 11.99,
    description: "Classic Italian dessert with mascarpone and espresso",
  },
];

interface Sale {
  id: string;
  item: string;
  price: number;
  date: string;
  soldBy: string;
  verifiedBy: string;
}

const sales: Sale[] = [
  {
    id: "S-001",
    item: "Grilled Salmon",
    price: 24.99,
    date: "2023-10-24",
    soldBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
  {
    id: "S-002",
    item: "Beef Tenderloin",
    price: 32.99,
    date: "2023-10-24",
    soldBy: "M. Brown",
    verifiedBy: "J. Doe",
  },
  {
    id: "S-003",
    item: "Caesar Salad",
    price: 12.99,
    date: "2023-10-23",
    soldBy: "J. Doe",
    verifiedBy: "A. Smith",
  },
];

interface Purchase {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  date: string;
  supplier: string;
  capturedBy: string;
}

const purchases: Purchase[] = [
  {
    id: "P-001",
    item: "Salmon Fillet",
    quantity: 25,
    unit: "kg",
    unitCost: 12.5,
    totalCost: 312.5,
    date: "2023-10-20",
    supplier: "OceanFresh Supplies",
    capturedBy: "J. Doe",
  },
  {
    id: "P-002",
    item: "Beef Tenderloin",
    quantity: 30,
    unit: "kg",
    unitCost: 18.0,
    totalCost: 540.0,
    date: "2023-10-20",
    supplier: "Premium Meats Ltd",
    capturedBy: "M. Brown",
  },
  {
    id: "P-003",
    item: "Fresh Vegetables",
    quantity: 50,
    unit: "kg",
    unitCost: 3.5,
    totalCost: 175.0,
    date: "2023-10-22",
    supplier: "Green Valley Farms",
    capturedBy: "J. Doe",
  },
];

export default function RestaurantPage() {
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: "menu" as Tab, label: "Menu", icon: UtensilsCrossed },
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

      {/* Actions Bar */}
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
            + New {activeTab === "menu" ? "Item" : activeTab === "sales" ? "Sale" : "Purchase"}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "menu" && <MenuTable items={menuItems} search={search} />}
      {activeTab === "sales" && <SalesTable sales={sales} search={search} />}
      {activeTab === "purchases" && (
        <PurchasesTable purchases={purchases} search={search} />
      )}
    </div>
  );
}

function MenuTable({
  items,
  search,
}: {
  items: MenuItem[];
  search: string;
}) {
  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.type.toLowerCase().includes(search.toLowerCase())
  );

  const typeConfig: Record<string, string> = {
    Starter: "bg-blue-100 text-blue-700",
    "Main Course": "bg-emerald-100 text-emerald-700",
    Dessert: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Description
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
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[item.type]}`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                  {item.description}
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
  );
}

function SalesTable({
  sales,
  search,
}: {
  sales: Sale[];
  search: string;
}) {
  const filtered = sales.filter((s) =>
    s.item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Sold By
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Verified By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {sale.item}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  ${sale.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sale.date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sale.soldBy}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sale.verifiedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchasesTable({
  purchases,
  search,
}: {
  purchases: Purchase[];
  search: string;
}) {
  const filtered = purchases.filter(
    (p) =>
      p.item.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Unit Cost
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Supplier
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Captured By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {p.item}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.quantity} {p.unit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  ${p.unitCost.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  ${p.totalCost.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.supplier}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.capturedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
