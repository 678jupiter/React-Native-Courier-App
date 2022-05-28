import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    riderOrders: [
      // active: false
    ],
  },
  reducers: {
    getOrders: (state, action) => {
      state.riderOrders = action.payload;
    },
    middleware: [thunk, logger],
  },
});

export const orderActions = orderSlice.actions;
export default orderSlice;
