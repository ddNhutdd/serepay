import { createSlice } from "@reduxjs/toolkit";
import { api_status } from "src/constant";

const initialState = {
  listBank: [],
  status: api_status.pending,
};

const userSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {
    setListBank: (state, action) => {
      state.listBank = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export default userSlice.reducer;
export const { setListBank, setStatus } = userSlice.actions;
export const getListBank = (state) => state.bank.listBank;
export const getStatus = (state) => state.bank.status;
export const getBankState = (state) => state.bank;
