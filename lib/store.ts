import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import referenceReducer from "./slices/referenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reference: referenceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
