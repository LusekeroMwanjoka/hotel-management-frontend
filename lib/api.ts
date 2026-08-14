import type {
  AuthSession,
  BarTransaction,
  CheckIn,
  CheckOut,
  ConferenceHallBooking,
  DashboardResponse,
  Guest,
  GymSubscription,
  GymSubscriptionType,
  LoginResponse,
  Paginated,
  RestaurantFoodPurchase,
  RestaurantMenu,
  RestaurantSale,
  Room,
  RoomsResponse,
  RoomType,
  SparAppointment,
  SparService,
  SwimmingPoolSession,
  SwimmingPoolSessionsResponse,
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

type QueryParams = Record<string, string | number | undefined>;

function withQuery(path: string, params: QueryParams = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

async function listAll<T>(path: string): Promise<Paginated<T>> {
  const first = await request<Paginated<T>>(path);
  const lastPage = first.meta?.last_page ?? 1;
  if (lastPage <= 1) return first;

  const data = [...first.data];
  const sep = path.includes("?") ? "&" : "?";
  for (let page = 2; page <= lastPage; page++) {
    const next = await request<Paginated<T>>(`${path}${sep}page=${page}`);
    data.push(...next.data);
  }
  return { ...first, data };
}

export interface PageMeta {
  total: number;
  currentPage: number;
  lastPage: number;
}

export function pageMeta<T>(res: Paginated<T>): PageMeta {
  return {
    total: res.meta?.total ?? 0,
    currentPage: res.meta?.current_page ?? 1,
    lastPage: res.meta?.last_page ?? 1,
  };
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

  // Dashboard
  dashboard: (params: { start?: string; end?: string } = {}) =>
    request<DashboardResponse>(withQuery("/dashboard", params)),

  // Rooms
  rooms: (params: {
    page?: number;
    per_page?: number;
    room_type?: string;
    occupancy_status?: string;
    floor?: string;
    search?: string;
  } = {}) => {
    const qs = new URLSearchParams({ per_page: String(params.per_page ?? 10) });
    if (params.page) qs.set("page", String(params.page));
    if (params.room_type) qs.set("room_type", params.room_type);
    if (params.occupancy_status)
      qs.set("occupancy_status", params.occupancy_status);
    if (params.floor) qs.set("floor", params.floor);
    if (params.search) qs.set("search", params.search);
    return request<RoomsResponse>(`/rooms?${qs.toString()}`);
  },

  roomTypes: () => listAll<RoomType>("/room-types"),
  createRoom: async (payload: Partial<Room>) => {
    const res = await request<{ data: Room }>("/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  createRoomType: async (payload: Partial<RoomType>) => {
    const res = await request<{ data: RoomType }>("/room-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Guests
  guests: () => list<Guest>("/guests"),
  guestsAll: () => listAll<Guest>("/guests"),
  createGuest: async (payload: Partial<Guest>) => {
    const res = await request<{ data: Guest }>("/guests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Check-in / check-out
  checkIns: (params: { page?: number } = {}) =>
    list<CheckIn>(withQuery("/check-ins", params)),
  createCheckIn: (payload: Record<string, unknown>) =>
    request<CheckIn>("/check-ins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkOuts: (params: { page?: number } = {}) =>
    list<CheckOut>(withQuery("/check-outs", params)),

  // Restaurant
  restaurantMenus: (params: { page?: number; search?: string } = {}) =>
    list<RestaurantMenu>(withQuery("/restaurant-menus", params)),
  restaurantSales: (params: { page?: number; search?: string } = {}) =>
    list<RestaurantSale>(withQuery("/restaurant-sales", params)),
  restaurantFoodPurchases: (params: { page?: number; search?: string } = {}) =>
    list<RestaurantFoodPurchase>(
      withQuery("/restaurant-food-purchases", params)
    ),
  restaurantMenusAll: () => listAll<RestaurantMenu>("/restaurant-menus"),
  createRestaurantMenu: async (payload: Partial<RestaurantMenu>) => {
    const res = await request<{ data: RestaurantMenu }>("/restaurant-menus", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  createRestaurantSale: async (payload: Partial<RestaurantSale>) => {
    const res = await request<{ data: RestaurantSale }>("/restaurant-sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  createRestaurantFoodPurchase: async (
    payload: Partial<RestaurantFoodPurchase>
  ) => {
    const res = await request<{ data: RestaurantFoodPurchase }>(
      "/restaurant-food-purchases",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  // Bar
  barSales: (params: { page?: number; search?: string } = {}) =>
    list<BarTransaction>(withQuery("/bar-sales", params)),
  barPurchases: (params: { page?: number; search?: string } = {}) =>
    list<BarTransaction>(withQuery("/bar-purchases", params)),
  createBarSale: async (payload: Partial<BarTransaction>) => {
    const res = await request<{ data: BarTransaction }>("/bar-sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  createBarPurchase: async (payload: Partial<BarTransaction>) => {
    const res = await request<{ data: BarTransaction }>("/bar-purchases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Gym
  gymSubscriptions: (params: {
    page?: number;
    search?: string;
    type?: string;
  } = {}) => list<GymSubscription>(withQuery("/gym-subscriptions", params)),
  gymSubscriptionTypes: () =>
    listAll<GymSubscriptionType>("/gym-subscription-types"),
  createGymSubscription: async (payload: Partial<GymSubscription>) => {
    const res = await request<{ data: GymSubscription }>("/gym-subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Spa
  sparServices: () => listAll<SparService>("/spar-services"),
  sparAppointments: (params: {
    page?: number;
    search?: string;
    service?: string;
  } = {}) => list<SparAppointment>(withQuery("/spar-appointments", params)),
  createSparAppointment: async (payload: Partial<SparAppointment>) => {
    const res = await request<{ data: SparAppointment }>("/spar-appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  createSparService: async (payload: Partial<SparService>) => {
    const res = await request<{ data: SparService }>("/spar-services", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Pool
  swimmingPoolSessions: (params: { page?: number; search?: string } = {}) =>
    request<SwimmingPoolSessionsResponse>(
      withQuery("/swimming-pool-sessions", params)
    ),
  createSwimmingPoolSession: async (
    payload: Partial<SwimmingPoolSession>
  ) => {
    const res = await request<{ data: SwimmingPoolSession }>(
      "/swimming-pool-sessions",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  // Conference
  conferenceHallBookings: (params: { page?: number; search?: string } = {}) =>
    list<ConferenceHallBooking>(withQuery("/conference-hall-bookings", params)),
  createConferenceHallBooking: async (
    payload: Partial<ConferenceHallBooking>
  ) => {
    const res = await request<{ data: ConferenceHallBooking }>(
      "/conference-hall-bookings",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  },
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
