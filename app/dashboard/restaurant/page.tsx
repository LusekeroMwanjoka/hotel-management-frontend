"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { api, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type {
  RestaurantFoodPurchase,
  RestaurantMenu,
  RestaurantSale,
} from "@/lib/types";

type Tab = "menu" | "sales" | "purchases";

interface RestaurantData {
  menus: RestaurantMenu[];
  sales: RestaurantSale[];
  purchases: RestaurantFoodPurchase[];
  menusMeta: { total: number; currentPage: number; lastPage: number };
  salesMeta: { total: number; currentPage: number; lastPage: number };
  purchasesMeta: { total: number; currentPage: number; lastPage: number };
}

const typeConfig: Record<string, string> = {
  starter: "bg-blue-100 text-blue-700",
  "main-course": "bg-emerald-100 text-emerald-700",
  dissert: "bg-purple-100 text-purple-700",
};

function typeLabel(type: string) {
  if (type === "main-course") return "Main Course";
  if (type === "dissert") return "Dessert";
  return "Starter";
}

export default function RestaurantPage() {
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = useApi<RestaurantData>(
    async () => {
      const [menusRes, salesRes, purchasesRes] = await Promise.all([
        api.restaurantMenus({ page, search: debouncedSearch || undefined }),
        api.restaurantSales({ page, search: debouncedSearch || undefined }),
        api.restaurantFoodPurchases({
          page,
          search: debouncedSearch || undefined,
        }),
      ]);
      return {
        menus: menusRes.data ?? [],
        sales: salesRes.data ?? [],
        purchases: purchasesRes.data ?? [],
        menusMeta: pageMeta(menusRes),
        salesMeta: pageMeta(salesRes),
        purchasesMeta: pageMeta(purchasesRes),
      };
    },
    [page, debouncedSearch]
  );

  const menus = data?.menus ?? [];
  const sales = data?.sales ?? [];
  const purchases = data?.purchases ?? [];

  const meta =
    activeTab === "menu"
      ? data?.menusMeta ?? { total: 0, currentPage: 1, lastPage: 1 }
      : activeTab === "sales"
      ? data?.salesMeta ?? { total: 0, currentPage: 1, lastPage: 1 }
      : data?.purchasesMeta ?? { total: 0, currentPage: 1, lastPage: 1 };

  const shown =
    activeTab === "menu"
      ? menus.length
      : activeTab === "sales"
      ? sales.length
      : purchases.length;

  const empty = shown === 0;

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
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            + New{" "}
            {activeTab === "menu"
              ? "Item"
              : activeTab === "sales"
              ? "Sale"
              : "Purchase"}
          </button>
        </div>
      </div>

      <PageState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={empty}
      >
        {activeTab === "menu" && <MenuTable items={menus} />}
        {activeTab === "sales" && <SalesTable sales={sales} />}
        {activeTab === "purchases" && <PurchasesTable purchases={purchases} />}
        <Pagination
          currentPage={meta.currentPage}
          lastPage={meta.lastPage}
          total={meta.total}
          shown={shown}
          loading={loading}
          onPageChange={setPage}
        />
      </PageState>
    </div>
  );
}

function MenuTable({ items }: { items: RestaurantMenu[] }) {
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
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      typeConfig[item.type] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {typeLabel(item.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  ${Number(item.price ?? 0).toFixed(2)}
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

function SalesTable({ sales }: { sales: RestaurantSale[] }) {
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
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {sale.restaurant_menu?.name ?? `#${sale.restaurant_menu_id}`}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  ${Number(sale.price ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{sale.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sale.sale_by_user?.name ?? `#${sale.sale_by}`}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sale.verified_by_user?.name ?? `#${sale.verified_by}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchasesTable({ purchases }: { purchases: RestaurantFoodPurchase[] }) {
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
            {purchases.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {p.food_item}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.quantity} {p.unit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  ${Number(p.unit_cost ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  ${Number(p.total_cost ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.purchase_date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.supplier ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.captured_by_user?.name ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
