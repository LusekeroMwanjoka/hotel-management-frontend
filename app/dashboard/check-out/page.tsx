"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { PageState } from "@/components/DataState";
import type { CheckIn } from "@/lib/types";

interface CheckOutData {
  activeCheckIns: CheckIn[];
}

function guestName(ci: CheckIn) {
  return (
    ci.guest?.full_name ||
    [ci.guest?.first_name, ci.guest?.last_name].filter(Boolean).join(" ") ||
    `Guest #${ci.guest_id}`
  );
}

export default function CheckOutPage() {
  const router = useRouter();
  const [checkInId, setCheckInId] = useState("");
  const [checkoutDate, setCheckoutDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [checkoutTime, setCheckoutTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [remarks, setRemarks] = useState("");
  const [applyPenalty, setApplyPenalty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<CheckOutData>(async () => {
    const [checkInsRes, checkOutsRes] = await Promise.all([
      api.checkIns({ page: 1 }),
      api.checkOuts({ page: 1 }),
    ]);
    const checkedOutIds = new Set(
      (checkOutsRes.data ?? []).map((c) => c.check_in_id)
    );
    return {
      activeCheckIns: (checkInsRes.data ?? []).filter(
        (ci) => !checkedOutIds.has(ci.id)
      ),
    };
  }, []);

  const active = data?.activeCheckIns ?? [];
  const selected = active.find((ci) => ci.id === Number(checkInId)) ?? null;

  const isLate = useMemo(() => {
    if (!selected?.expected_checkout_date) return false;
    const expected = `${selected.expected_checkout_date} ${
      selected.expected_checkout_time ?? "00:00"
    }`;
    const actual = `${checkoutDate} ${checkoutTime}`;
    return actual > expected;
  }, [selected, checkoutDate, checkoutTime]);

  const handleSubmit = async () => {
    if (!checkInId) {
      setSubmitError("Please select a guest to check out.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const checkOut = await api.createCheckOut({
        check_in_id: Number(checkInId),
        checkout_date: checkoutDate,
        checkout_time: checkoutTime,
        remarks: remarks || null,
      });

      if (applyPenalty && isLate) {
        await api.createCheckOutPenalty({ check_out_id: checkOut.id });
      }

      router.push("/dashboard/rooms");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to check out.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageState loading={loading} error={error} onRetry={reload} empty={false}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active guests */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Active Guests ({active.length})
            </h3>
            {active.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No guests are currently checked in.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {active.map((ci) => (
                  <button
                    key={ci.id}
                    type="button"
                    onClick={() => setCheckInId(String(ci.id))}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      Number(checkInId) === ci.id
                        ? "bg-emerald-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {guestName(ci)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ci.room?.name ?? `Room #${ci.room_id}`} • In since{" "}
                          {ci.checkin_date}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        Expected out {ci.expected_checkout_date ?? "—"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Check-out form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">Check Out</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Selected Guest
                </label>
                <p className="text-sm font-medium text-gray-800">
                  {selected ? guestName(selected) : "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={checkoutTime}
                    onChange={(e) => setCheckoutTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {isLate && (
                <label className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={applyPenalty}
                    onChange={(e) => setApplyPenalty(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-emerald-600"
                  />
                  <span>
                    <span className="font-medium flex items-center gap-1">
                      <AlertTriangle size={14} /> Late check-out
                    </span>
                    Apply a late penalty for exceeding the expected checkout
                    time.
                  </span>
                </label>
              )}

              {submitError && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !selected}
                className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Checking out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Complete Check-out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </PageState>
    </div>
  );
}
