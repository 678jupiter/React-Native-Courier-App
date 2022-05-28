import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

import authSlice from "./AuthSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userSlice from "./userSlice";
import orderSlice from "./OrderSlice";

const persistConfig = {
  key: "ayee",
  storage: AsyncStorage,
};

const reducers = combineReducers({
  auth: authSlice.reducer,
  user: userSlice.reducer,
  orders: orderSlice.reducer,
  // other reducers goes here...
});

const _persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: _persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export const persistor = persistStore(store);

export default store;
