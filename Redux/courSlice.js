import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const curSlice = createSlice({
  name: "cur",
  initialState: {
    curmeta: [],
  },
  reducers: {
    addcur: (state, action) => {
      state.curmeta = action.payload;
    },
    middleware: [thunk, logger],
  },
});

export const curActions = curSlice.actions;
export default curSlice;
