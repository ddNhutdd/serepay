import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  notifyP2p: {
    showNotify: false,
    amountNotify: 0,
  },
};
const notifyP2pSlice = createSlice({
  name: "notifyP2pSlice",
  initialState,
  reducers: {
    setNotify(state, action) {
      state.notifyP2p = action.payload;
    },
  },
});

export default notifyP2pSlice.reducer;
export const { setNotify } = notifyP2pSlice.actions;
export const getNotify = (state) => state.notifyP2pSlice.notifyP2p;
