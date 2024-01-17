import { createSlice } from "@reduxjs/toolkit";
export const actionContent = {
  main: "main",
  withdraw: "withdraw",
  desposite: "desposite",
};
const wallet2Slice = createSlice({
  name: "wallet2",
  initialState: {
    show: actionContent.main,
    coin: "USDT",
    amount: 0,
  },
  reducers: {
    setShow: (state, action) => {
      state.show = action.payload;
    },
    setCoin: (state, action) => {
      state.coin = action.payload;
    },
    setCoinAmount: (state, action) => {
      state.amount = action.payload;
    },
  },
});
export default wallet2Slice.reducer;
export const { setShow, setCoin, setCoinAmount } = wallet2Slice.actions;
export const getShow = (rootState) => rootState.wallet2Reducer.show;
export const getCoin = (rootState) => rootState.wallet2Reducer.coin;
export const getCoinAmount = (rootState) => rootState.wallet2Reducer.amount;
