import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const tokenSlice = createSlice({
  name: "token",
  initialState: {
    userToken: {},
  },
  reducers: {
    addToken: (state, action) => {
      const newItem = action.payload;
      state.userToken = action.payload;
    },
    middleware: [thunk, logger],
  },
});

export const tokenActions = tokenSlice.actions;
export default tokenSlice;
