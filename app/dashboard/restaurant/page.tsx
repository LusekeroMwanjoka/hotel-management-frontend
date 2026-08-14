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
  X,
  Loader2,
} from "lucide-react";
import { api, getSession, pageMeta } from "@/lib/api";
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
  menuOptions: RestaurantMenu[];
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
      const [menusRes, salesRes, purchasesRes, menuOptionsRes] =
        await Promise.all([
          api.restaurantMenus({ page, search: debouncedSearch || undefined }),
          api.restaurantSales({ page, search: debouncedSearch || undefined }),
          api.restaurantFoodPurchases({
            page,
            search: debouncedSearch || undefined,
          }),
          api.restaurantMenusAll(),
        ]);
      return {
        menus: menusRes.data ?? [],
        menuOptions: menuOptionsRes.data ?? [],
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
  const menuOptions = data?.menuOptions ?? [];
  const sales = data?.sales ?? [];
  const purchases = data?.purchases ?? [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    type: "starter",
    price: "",
    description: "",
  });
  const [saleForm, setSaleForm] = useState({
    restaurant_menu_id: "",
    price: "",
    date: "",
    remarks: "",
  });
  const [purchaseForm, setPurchaseForm] = useState({
    food_item: "",
    purchase_date: "",
    quantity: "",
    unit: "",
    unit_cost: "",
    supplier: "",
    invoice_number: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const openAddModal = () => {
    setModalError(null);
    const today = new Date().toISOString().slice(0, 10);
    if (activeTab === "menu") {
      setMenuForm({ name: "", type: "starter", price: "", description: "" });
    } else if (activeTab === "sales") {
      setSaleForm({ restaurant_menu_id: "", price: "", date: today, remarks: "" });
    } else {
      setPurchaseForm({
        food_item: "",
        purchase_date: today,
        quantity: "",
        unit: "",
        unit_cost: "",
        supplier: "",
        invoice_number: "",
        remarks: "",
      });
    }
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    const session = getSession();
    const userId = session.user?.id ?? 1;
    setModalError(null);

    if (
      activeTab === "menu" &&
      (!menuForm.name.trim() || !menuForm.price || !menuForm.description.trim())
    ) {
      setModalError("Name, price and description are required.");
      return;
    }
    if (
      activeTab === "sales" &&
      (!saleForm.restaurant_menu_id || !saleForm.price || !saleForm.date)
    ) {
      setModalError("Menu item, price and date are required.");
      return;
    }
    if (
      activeTab === "purchases" &&
      (!purchaseForm.food_item.trim() ||
        !purchaseForm.unit.trim() ||
        !purchaseForm.quantity ||
        !purchaseForm.unit_cost)
    ) {
      setModalError("Food item, unit, quantity and unit cost are required.");
      return;
    }

    setSaving(true);
    try {
      if (activeTab === "menu") {
        await api.createRestaurantMenu({
          name: menuForm.name.trim(),
          type: menuForm.type,
          price: Number(menuForm.price),
          description: menuForm.description.trim(),
        });
      } else if (activeTab === "sales") {
        await api.createRestaurantSale({
          restaurant_menu_id: Number(saleForm.restaurant_menu_id),
          price: Number(saleForm.price),
          date: saleForm.date,
          sale_by: userId,
          verified_by: userId,
          remarks: saleForm.remarks,
        });
      } else {
        await api.createRestaurantFoodPurchase({
          food_item: purchaseForm.food_item.trim(),
          purchase_date: purchaseForm.purchase_date,
          quantity: Number(purchaseForm.quantity),
          unit: purchaseForm.unit,
          unit_cost: Number(purchaseForm.unit_cost),
          total_cost:
            Number(purchaseForm.quantity) * Number(purchaseForm.unit_cost),
          supplier: purchaseForm.supplier || null,
          invoice_number: purchaseForm.invoice_number || null,
          captured_by: userId,
          remarks: purchaseForm.remarks || null,
        });
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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
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

      {showAddModal && activeTab === "menu" && (
        <AddMenuModal
          form={menuForm}
          setForm={setMenuForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
      {showAddModal && activeTab === "sales" && (
        <AddSaleModal
          form={saleForm}
          setForm={setSaleForm}
          menus={menuOptions}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
      {showAddModal && activeTab === "purchases" && (
        <AddPurchaseModal
          form={purchaseForm}
          setForm={setPurchaseForm}
          error={modalError}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
        />
      )}
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
                  MWK {Number(item.price ?? 0).toFixed(2)}
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
                  MWK {Number(sale.price ?? 0).toFixed(2)}
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
                  MWK {Number(p.unit_cost ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  MWK {Number(p.total_cost ?? 0).toFixed(2)}
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

type MenuFormState = {
  name: string;
  type: string;
  price: string;
  description: string;
};

type SaleFormState = {
  restaurant_menu_id: string;
  price: string;
  date: string;
  remarks: string;
};

type PurchaseFormState = {
  food_item: string;
  purchase_date: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  supplier: string;
  invoice_number: string;
  remarks: string;
};

function ModalShell({
  title,
  error,
  saving,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: {
  title: string;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  children: React.ReactNode;
}) {
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
        <div className="p-5 space-y-4">{children}</div>
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
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMenuModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: MenuFormState;
  setForm: (form: MenuFormState) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalShell
      title="Add Menu Item"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Add Item"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="starter">Starter</option>
          <option value="main-course">Main Course</option>
          <option value="dissert">Dessert</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (MWK) *
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </ModalShell>
  );
}

function AddSaleModal({
  form,
  setForm,
  menus,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: SaleFormState;
  setForm: (form: SaleFormState) => void;
  menus: RestaurantMenu[];
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalShell
      title="Add Sale"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Add Sale"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Menu Item *
        </label>
        <select
          value={form.restaurant_menu_id}
          onChange={(e) =>
            setForm({ ...form, restaurant_menu_id: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select an item</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — MWK {Number(m.price ?? 0).toFixed(2)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (MWK) *
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks *
        </label>
        <textarea
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </ModalShell>
  );
}

function AddPurchaseModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  form: PurchaseFormState;
  setForm: (form: PurchaseFormState) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const totalCost =
    (Number(form.quantity) || 0) * (Number(form.unit_cost) || 0);

  return (
    <ModalShell
      title="Add Purchase"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Add Purchase"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Food Item *
        </label>
        <input
          type="text"
          value={form.food_item}
          onChange={(e) => setForm({ ...form, food_item: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purchase Date *
        </label>
        <input
          type="date"
          value={form.purchase_date}
          onChange={(e) =>
            setForm({ ...form, purchase_date: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qty *
          </label>
          <input
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <input
            type="text"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="kg"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Cost *
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.unit_cost}
            onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Total Cost</span>
        <span className="font-medium text-gray-800">
          MWK {totalCost.toFixed(2)}
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Supplier
        </label>
        <input
          type="text"
          value={form.supplier}
          onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Invoice Number
        </label>
        <input
          type="text"
          value={form.invoice_number}
          onChange={(e) =>
            setForm({ ...form, invoice_number: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </ModalShell>
  );
}
