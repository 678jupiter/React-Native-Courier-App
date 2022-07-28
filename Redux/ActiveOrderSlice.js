import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const activeOrderSlice = createSlice({
  name: "active",
  initialState: { isActive: false },
  reducers: {
    active(state) {
      state.isActive = true;
    },
    notActive(state) {
      state.isActive = false;
    },
    middleware: [thunk, logger],
  },
});

export const activeOrderActions = activeOrderSlice.actions;
export default activeOrderSlice;
