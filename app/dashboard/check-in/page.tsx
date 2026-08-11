"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Search,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  X,
} from "lucide-react";

const steps = [
  { id: 1, label: "Select Room" },
  { id: 2, label: "Guest Details" },
  { id: 3, label: "Stay & Payment" },
];

export default function CheckInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState({
    name: "Suite 402 - Alpine View",
    type: "King Bed • 45m² • Forest Facing",
  });
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Guest form
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    nextOfKin: "",
  });

  // Stay details
  const [checkInDate, setCheckInDate] = useState("2023-10-24");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutDate, setCheckOutDate] = useState("2023-10-27");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [guests, setGuestsCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");

  const roomRate = 250;
  const nights = 3;
  const taxes = roomRate * nights * 0.1;
  const total = roomRate * nights + taxes;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step Progress */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={16} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= step.id ? "text-emerald-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-3 ${
                  currentStep > step.id ? "bg-emerald-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Room Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Selected Room</h3>
              <button
                onClick={() => setShowRoomSelector(!showRoomSelector)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Change Room
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">402</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {selectedRoom.name}
                </p>
                <p className="text-sm text-gray-500">{selectedRoom.type}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Available
              </span>
            </div>
          </div>

          {/* Step 2: Guest Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Guest Information
            </h3>

            {/* Search Existing */}
            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-center text-sm text-gray-400 mb-4">
              — OR CREATE NEW —
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={guest.firstName}
                  onChange={(e) =>
                    setGuest({ ...guest, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={guest.lastName}
                  onChange={(e) =>
                    setGuest({ ...guest, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) =>
                    setGuest({ ...guest, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) =>
                    setGuest({ ...guest, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID / Passport Number
                </label>
                <input
                  type="text"
                  value={guest.idNumber}
                  onChange={(e) =>
                    setGuest({ ...guest, idNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next of Kin{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Name & Contact"
                  value={guest.nextOfKin}
                  onChange={(e) =>
                    setGuest({ ...guest, nextOfKin: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Stay Details & Payment */}
        <div className="space-y-6">
          {/* Stay Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Stay Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Nights
                </label>
                <p className="text-lg font-bold text-gray-900">{nights}</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Guests
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setGuestsCount(Math.max(1, guests - 1))
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuestsCount(guests + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Room Rate (${roomRate} × {nights})
                </span>
                <span className="font-medium text-gray-800">
                  ${(roomRate * nights).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxes & Fees (10%)</span>
                <span className="font-medium text-gray-800">
                  ${taxes.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-800">
                  Total Balance
                </span>
                <span className="font-bold text-lg text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Deposit Required</span>
                <span className="font-medium text-amber-600">$400.00</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-2">
                Payment Method
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === "card"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard size={16} />
                  Card
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === "cash"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Banknote size={16} />
                  Cash
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => router.back()}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Capture & Check-in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
