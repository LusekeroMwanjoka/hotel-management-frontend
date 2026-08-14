// Shared types mirroring the Laravel API resource contract (snake_case).
// These are the shapes the frontend expects from the backend endpoints.

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  department?: string;
  status?: string;
}

export interface RoomType {
  id: number;
  code: string;
  name: string;
  base_rate: number;
  bed_type?: string;
  description?: string | null;
  notes?: string | null;
}

export type RoomOccupancyStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "blocked"
  | "out_of_service";

export interface Room {
  id: number;
  room_type_id: number;
  name: string;
  occupancy_status: RoomOccupancyStatus;
  description?: string | null;
  notes?: string | null;
  room_type?: RoomType;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name?: string;
  nationality: string;
  id_type?: string | null;
  id_number?: string | null;
  phone?: string | null;
  email?: string | null;
  home_address?: string | null;
  postal_address?: string | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CheckIn {
  id: number;
  guest_id: number;
  room_id: number;
  checkin_date: string;
  checkin_time: string;
  expected_checkout_date?: string | null;
  expected_checkout_time?: string | null;
  base_rate: number;
  number_of_days: number;
  mode_of_payment?: string;
  checkin_by: number;
  verified_by?: number | null;
  guest?: Guest;
  room?: Room;
  checked_in_by?: User;
  verified_by_user?: User;
  created_at?: string;
}

export interface CheckOut {
  id: number;
  check_in_id: number;
  checkout_date: string;
  checkout_time: string;
  checkout_by: number;
  verified_by?: number | null;
  remarks?: string | null;
  check_in?: CheckIn;
  checked_out_by?: User;
  verified_by_user?: User;
  created_at?: string;
}

export interface RestaurantMenu {
  id: number;
  name: string;
  type: "starter" | "main-course" | "dissert";
  price: number;
  description: string;
}

export interface RestaurantSale {
  id: number;
  restaurant_menu_id: number;
  price: number;
  date: string;
  sale_by: number;
  verified_by: number;
  remarks: string;
  restaurant_menu?: RestaurantMenu;
  sale_by_user?: User;
  verified_by_user?: User;
}

export interface RestaurantFoodPurchase {
  id: number;
  food_item: string;
  purchase_date: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  supplier?: string | null;
  invoice_number?: string | null;
  captured_by?: number | null;
  verified_by?: number | null;
  remarks?: string | null;
  captured_by_user?: User;
  verified_by_user?: User;
}

export interface BarTransaction {
  id: number;
  type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  date: string;
  captured_by: number;
  verified_by: number;
  captured_by_user?: User;
  verified_by_user?: User;
}

export interface GymSubscriptionType {
  id: number;
  name: string;
  charge: number;
  duration: number;
  charge_period?: string;
}

export interface GymSubscription {
  id: number;
  gym_subscription_type_id: number;
  guest_id: number;
  start_date: string;
  end_date: string;
  charge: number;
  captured_by: number;
  verified_by?: number | null;
  subscription_type?: GymSubscriptionType;
  guest?: Guest;
  captured_by_user?: User;
  verified_by_user?: User;
}

export interface SparService {
  id: number;
  name: string;
  type: string;
  charge: number;
  description?: string | null;
}

export interface SparAppointment {
  id: number;
  spar_service_id: number;
  client_name: string;
  client_phone_number: string;
  client_email?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  charge: number;
  description?: string | null;
  spar_service?: SparService;
}

export interface SwimmingPoolSession {
  id: number;
  client_name: string;
  client_phone_number: string;
  client_email?: string | null;
  charge: number;
  entry_time: string;
  exit_time: string;
  description?: string | null;
  captured_by: number;
  verified_by?: number | null;
  captured_by_user?: User;
  verified_by_user?: User;
}

export interface ConferenceHallBooking {
  id: number;
  hall_name: string;
  hall_number: string;
  date: string;
  start_time: string;
  end_time: string;
  charge: number;
  entry_time: string;
  exit_time: string;
  hours_exceeded?: number;
  exceeding_penalty?: number;
  description?: string | null;
  captured_by: number;
  verified_by?: number | null;
  captured_by_user?: User;
  verified_by_user?: User;
}

// Laravel paginated response envelope
export interface Paginated<T> {
  data: T[];
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page?: number;
    from?: number;
    to?: number;
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface RoomsResponse extends Paginated<Room> {
  stats?: Partial<Record<RoomOccupancyStatus, number>>;
  room_types?: string[];
  floors?: number[];
}

export interface SwimmingPoolSessionsResponse
  extends Paginated<SwimmingPoolSession> {
  stats?: {
    total_sessions: number;
    total_revenue: number;
    clients_served: number;
  };
}

export interface LoginResponse {
  token?: string;
  user?: User;
}

export interface AuthSession {
  token?: string;
  user?: User | null;
}
