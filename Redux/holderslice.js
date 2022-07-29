import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const holderSlice = createSlice({
  name: "fuser",
  initialState: {
    userfmeta: [],
  },
  reducers: {
    addFake: (state, action) => {
      state.userfmeta = action.payload;
    },
    middleware: [thunk, logger],
  },
});
export const fakeuserActions = holderSlice.actions;
export default holderSlice;
