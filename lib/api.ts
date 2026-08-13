import type {
  AuthSession,
  BarTransaction,
  CheckIn,
  CheckOut,
  ConferenceHallBooking,
  Guest,
  GymSubscription,
  GymSubscriptionType,
  LoginResponse,
  Paginated,
  RestaurantFoodPurchase,
  RestaurantMenu,
  RestaurantSale,
  Room,
  SparAppointment,
  SparService,
  SwimmingPoolSession,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hms_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

function list<T>(path: string) {
  return request<Paginated<T>>(path);
}

export const api = {
  // Auth
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return request<void>("/logout", { method: "POST" });
  },

  // Rooms
  rooms: () => list<Room>("/rooms"),

  // Guests
  guests: () => list<Guest>("/guests"),
  createGuest: (payload: Partial<Guest>) =>
    request<Guest>("/guests", { method: "POST", body: JSON.stringify(payload) }),

  // Check-in / check-out
  checkIns: () => list<CheckIn>("/check-ins"),
  createCheckIn: (payload: Record<string, unknown>) =>
    request<CheckIn>("/check-ins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkOuts: () => list<CheckOut>("/check-outs"),

  // Restaurant
  restaurantMenus: () => list<RestaurantMenu>("/restaurant-menus"),
  restaurantSales: () => list<RestaurantSale>("/restaurant-sales"),
  restaurantFoodPurchases: () =>
    list<RestaurantFoodPurchase>("/restaurant-food-purchases"),

  // Bar
  barSales: () => list<BarTransaction>("/bar-sales"),
  barPurchases: () => list<BarTransaction>("/bar-purchases"),

  // Gym
  gymSubscriptions: () => list<GymSubscription>("/gym-subscriptions"),
  gymSubscriptionTypes: () =>
    list<GymSubscriptionType>("/gym-subscription-types"),

  // Spa
  sparServices: () => list<SparService>("/spar-services"),
  sparAppointments: () => list<SparAppointment>("/spar-appointments"),

  // Pool
  swimmingPoolSessions: () => list<SwimmingPoolSession>("/swimming-pool-sessions"),

  // Conference
  conferenceHallBookings: () =>
    list<ConferenceHallBooking>("/conference-hall-bookings"),
};

// --- Auth session helpers -------------------------------------------------

export function getSession(): AuthSession {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("hms_session");
    return raw ? (JSON.parse(raw) as AuthSession) : {};
  } catch {
    return {};
  }
}

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hms_session", JSON.stringify(session));
  if (session.token) localStorage.setItem("hms_token", session.token);
  else localStorage.removeItem("hms_token");
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hms_session");
  localStorage.removeItem("hms_token");
}

export { BASE_URL };
