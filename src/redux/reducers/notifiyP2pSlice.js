import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  notify: 0,
};
const notifyP2pSlice = createSlice({
  name: "notifyP2pSlice",
  initialState,
  reducers: {
    setNotify(state, action) {
      state.notify = action.payload;
    },
  },
});

export default notifyP2pSlice.reducer;
export const { setNotify } = notifyP2pSlice.actions;
export const getNotify = (state) => state.notifyP2pSlice.notify;
