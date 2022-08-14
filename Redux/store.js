import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

import authSlice from "./AuthSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userSlice from "./userSlice";
import activeOrderSlice from "./ActiveOrderSlice";
import tokenSlice from "./tokenSlice";
import holderSlice from "./holderslice";
import curSlice from "./courSlice";
import resSlice from "./myRestSlice";
import myLocationSlice from "./myLocationSlice";
import reRefetchSlice from "./reRefetch";

const persistConfig = {
  key: "ayee",
  storage: AsyncStorage,
};

const reducers = combineReducers({
  fuser: holderSlice.reducer,
  cur: curSlice.reducer,
  auth: authSlice.reducer,
  token: tokenSlice.reducer,
  user: userSlice.reducer,
  active: activeOrderSlice.reducer,
  myres: resSlice.reducer,
  myloc: myLocationSlice.reducer,
  reRefetch: reRefetchSlice.reducer,

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
