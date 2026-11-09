import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
}

function initialUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hms_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: User | null };
    return parsed?.user ?? null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: initialUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
