import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const myLocationSlice = createSlice({
  name: "myloc",
  initialState: {
    myLoc: [],
  },
  reducers: {
    addLocation: (state, action) => {
      state.myLoc = action.payload;
    },
    middleware: [thunk, logger],
  },
});
export const myLocActions = myLocationSlice.actions;
export default myLocationSlice;
