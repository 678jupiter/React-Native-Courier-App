import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const resSlice = createSlice({
  name: "myres",
  initialState: {
    aboutRes: [],
  },
  reducers: {
    addRes: (state, action) => {
      state.aboutRes = action.payload;
    },
    middleware: [thunk, logger],
  },
});
export const resActions = resSlice.actions;
export default resSlice;
