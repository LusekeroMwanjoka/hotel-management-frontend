import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type {
  Guest,
  GymSubscriptionType,
  RestaurantMenu,
  RoomType,
  SpaService,
} from "@/lib/types";

export interface ReferenceState {
  guests: Guest[];
  roomTypes: RoomType[];
  spaServices: SpaService[];
  gymSubscriptionTypes: GymSubscriptionType[];
  restaurantMenus: RestaurantMenu[];
  loaded: {
    guests: boolean;
    roomTypes: boolean;
    spaServices: boolean;
    gymSubscriptionTypes: boolean;
    restaurantMenus: boolean;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ReferenceState = {
  guests: [],
  roomTypes: [],
  spaServices: [],
  gymSubscriptionTypes: [],
  restaurantMenus: [],
  loaded: {
    guests: false,
    roomTypes: false,
    spaServices: false,
    gymSubscriptionTypes: false,
    restaurantMenus: false,
  },
  loading: false,
  error: null,
};

export const loadGuests = createAsyncThunk(
  "reference/loadGuests",
  async (_, { getState }) => {
    const state = getState() as { reference: ReferenceState };
    if (state.reference.loaded.guests) {
      return { guests: state.reference.guests };
    }
    const res = await api.guestsAll();
    return { guests: res.data ?? [] };
  }
);

export const loadRoomTypes = createAsyncThunk(
  "reference/loadRoomTypes",
  async (_, { getState }) => {
    const state = getState() as { reference: ReferenceState };
    if (state.reference.loaded.roomTypes) {
      return { roomTypes: state.reference.roomTypes };
    }
    const res = await api.roomTypes();
    return { roomTypes: res.data ?? [] };
  }
);

export const loadSpaServices = createAsyncThunk(
  "reference/loadSpaServices",
  async (_, { getState }) => {
    const state = getState() as { reference: ReferenceState };
    if (state.reference.loaded.spaServices) {
      return { spaServices: state.reference.spaServices };
    }
    const res = await api.spaServices();
    return { spaServices: res.data ?? [] };
  }
);

export const loadGymSubscriptionTypes = createAsyncThunk(
  "reference/loadGymSubscriptionTypes",
  async (_, { getState }) => {
    const state = getState() as { reference: ReferenceState };
    if (state.reference.loaded.gymSubscriptionTypes) {
      return { gymSubscriptionTypes: state.reference.gymSubscriptionTypes };
    }
    const res = await api.gymSubscriptionTypes();
    return { gymSubscriptionTypes: res.data ?? [] };
  }
);

export const loadRestaurantMenus = createAsyncThunk(
  "reference/loadRestaurantMenus",
  async (_, { getState }) => {
    const state = getState() as { reference: ReferenceState };
    if (state.reference.loaded.restaurantMenus) {
      return { restaurantMenus: state.reference.restaurantMenus };
    }
    const res = await api.restaurantMenusAll();
    return { restaurantMenus: res.data ?? [] };
  }
);

const referenceSlice = createSlice({
  name: "reference",
  initialState,
  reducers: {
    invalidateGuests(state) {
      state.loaded.guests = false;
    },
    invalidateRoomTypes(state) {
      state.loaded.roomTypes = false;
    },
    invalidateSpaServices(state) {
      state.loaded.spaServices = false;
    },
    invalidateGymSubscriptionTypes(state) {
      state.loaded.gymSubscriptionTypes = false;
    },
    invalidateRestaurantMenus(state) {
      state.loaded.restaurantMenus = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGuests.fulfilled, (state, action) => {
        state.guests = action.payload.guests;
        state.loaded.guests = true;
        state.error = null;
      })
      .addCase(loadRoomTypes.fulfilled, (state, action) => {
        state.roomTypes = action.payload.roomTypes;
        state.loaded.roomTypes = true;
        state.error = null;
      })
      .addCase(loadSpaServices.fulfilled, (state, action) => {
        state.spaServices = action.payload.spaServices;
        state.loaded.spaServices = true;
        state.error = null;
      })
      .addCase(loadGymSubscriptionTypes.fulfilled, (state, action) => {
        state.gymSubscriptionTypes = action.payload.gymSubscriptionTypes;
        state.loaded.gymSubscriptionTypes = true;
        state.error = null;
      })
      .addCase(loadRestaurantMenus.fulfilled, (state, action) => {
        state.restaurantMenus = action.payload.restaurantMenus;
        state.loaded.restaurantMenus = true;
        state.error = null;
      });
  },
});

export const {
  invalidateGuests,
  invalidateRoomTypes,
  invalidateSpaServices,
  invalidateGymSubscriptionTypes,
  invalidateRestaurantMenus,
} = referenceSlice.actions;

export default referenceSlice.reducer;
