"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ShoppingCart,
  Receipt,
  X,
  Loader2,
} from "lucide-react";
import { api, getSession, pageMeta } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDebouncedValue } from "@/lib/useDebounce";
import { PageState } from "@/components/DataState";
import { Pagination } from "@/components/Pagination";
import type { BarTransaction } from "@/lib/types";

type Tab = "sales" | "purchases";

interface BarData {
  sales: BarTransaction[];
  purchases: BarTransaction[];
  salesMeta: { total: number; currentPage: number; lastPage: number };
  purchasesMeta: { total: number; currentPage: number; lastPage: number };
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
  const [activeTab, setActiveTab] = useState<Tab>("sales");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const [showAddModal, setShowAddModal] = useState(false);
  const [barForm, setBarForm] = useState({
    type: "beer",
    quantity: "",
    unit: "",
    price_per_unit: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<BarData>(
    async () => {
      const [salesRes, purchasesRes] = await Promise.all([
        api.barSales({ page, search: debouncedSearch || undefined }),
        api.barPurchases({ page, search: debouncedSearch || undefined }),
      ]);
      return {
        sales: salesRes.data ?? [],
        purchases: purchasesRes.data ?? [],
        salesMeta: pageMeta(salesRes),
        purchasesMeta: pageMeta(purchasesRes),
      };
    },
    [page, debouncedSearch]
  );

  const items: BarTransaction[] =
    activeTab === "sales" ? data?.sales ?? [] : data?.purchases ?? [];
  const meta =
    activeTab === "sales"
      ? data?.salesMeta ?? { total: 0, currentPage: 1, lastPage: 1 }
      : data?.purchasesMeta ?? { total: 0, currentPage: 1, lastPage: 1 };

  const openAddModal = () => {
    setModalError(null);
    setBarForm({
      type: "beer",
      quantity: "",
      unit: "",
      price_per_unit: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (
      !barForm.quantity ||
      !barForm.unit ||
      !barForm.price_per_unit ||
      !barForm.date
    ) {
      setModalError("All fields are required.");
      return;
    }

    const session = getSession();
    const userId = session.user?.id ?? 1;
    const payload = {
      type: barForm.type,
      quantity: Number(barForm.quantity),
      unit: Number(barForm.unit),
      price_per_unit: Number(barForm.price_per_unit),
      total_price:
        Number(barForm.quantity) *
        Number(barForm.unit) *
        Number(barForm.price_per_unit),
      date: barForm.date,
      captured_by: userId,
      verified_by: userId,
    };

    setModalError(null);
    setSaving(true);
    try {
      if (activeTab === "sales") {
        await api.createBarSale(payload);
      } else {
        await api.createBarPurchase(payload);
      }
      setShowAddModal(false);
      reload();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
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
                {items.map((item) => (
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
                      MWK {Number(item.price_per_unit ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      MWK {Number(item.total_price ?? 0).toFixed(2)}
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
          <Pagination
            currentPage={meta.currentPage}
            lastPage={meta.lastPage}
            total={meta.total}
            shown={items.length}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </PageState>

      {showAddModal && (
        <AddBarModal
          title={activeTab === "sales" ? "Add Sale" : "Add Purchase"}
          form={barForm}
          setForm={setBarForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

type BarFormState = {
  type: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
  date: string;
};

const drinkTypes = [
  "beer",
  "wines",
  "water",
  "spirits",
  "cider",
  "juice",
  "soda",
  "cocktail",
];

function AddBarModal({
  title,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  title: string;
  form: BarFormState;
  setForm: (form: BarFormState) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const total =
    (Number(form.quantity) || 0) *
    (Number(form.unit) || 0) *
    (Number(form.price_per_unit) || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {drinkTypes.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="number"
                min={0}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Unit (MWK) *
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.price_per_unit}
              onChange={(e) =>
                setForm({ ...form, price_per_unit: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-medium text-gray-800">
              MWK {total.toFixed(2)}
            </span>
          </div>
        </div>
        {error && (
          <div className="mx-5 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
