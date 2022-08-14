import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const reRefetchSlice = createSlice({
  name: "reRefetch",
  initialState: {
    reRefetchmeta: [],
  },
  reducers: {
    addreRefetch: (state, action) => {
      state.reRefetchmeta = action.payload;
    },
    middleware: [thunk, logger],
  },
});

export const reRefetchActions = reRefetchSlice.actions;
export default reRefetchSlice;
