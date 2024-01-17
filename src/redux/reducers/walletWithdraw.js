import { createSlice } from "@reduxjs/toolkit";
export const form = {
  Wallet: "wallet",
  UserName: "userName",
};
const walletWithdrawSlice = createSlice({
  name: "walletWithdraw",
  initialState: {
    show: form.Wallet,
  },
  reducers: {
    setShow: (state, action) => {
      state.show = action.payload;
    },
  },
});
export default walletWithdrawSlice.reducer;
export const { setShow } = walletWithdrawSlice.actions;
export const getShow = (rootState) => rootState.walletWithdrawSlice.show;
