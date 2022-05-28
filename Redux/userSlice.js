import { createSlice } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";

const userSlice = createSlice({
  name: "user",
  initialState: {
    usermeta: [],
  },
  reducers: {
    addUser: (state, action) => {
      const newItem = action.payload;
      //console.log(newItem);
      // state = action.payload;
      state.usermeta = action.payload;
      //       {
      //     jwt: newItem.jwt,
      //     id: newItem.id,
      //     username: newItem.username,
      //     email: newItem.email,
      //     mobileNumber: newItem.mobileNumber,
      //     secondName: newItem.secondName,
      //   };
    },
    middleware: [thunk, logger],
  },
});

export const userActions = userSlice.actions;
export default userSlice;
