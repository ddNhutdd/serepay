import { createSlice } from "@reduxjs/toolkit";
import { api_status } from "src/constant";
const exchangeRateSellSlice = createSlice({
  name: "exchangeRateSell",
  initialState: {
    exchangeRateSell: 0,
    exchangeRateSellApiStatus: api_status.pending,
    exchangeRateSellFetchCount: 0,
  },
  reducers: {
    setExchangeRateSell: (state, action) => {
      state.exchangeRateSellApiStatus = api_status.fulfilled;
      state.exchangeRateSell = action.payload;
    },
    setExchangeRateSellApiStatus: (state, action) => {
      state.exchangeRateSellApiStatus = action.payload;
    },
    fetchExchangeRateSell: (state) => {
      state.exchangeRateSellFetchCount += 1;
    },
  },
});

export default exchangeRateSellSlice.reducer;
export const {
  setExchangeRateSell,
  setExchangeRateSellApiStatus,
  fetchExchangeRateSell,
} = exchangeRateSellSlice.actions;

export const getExchangeRateSell = (state) =>
  state.exchangeRateSell.exchangeRateSell;
export const getExchangeRateSellApiStatus = (state) =>
  state.exchangeRateSell.exchangeRateSellApiStatus;
export const getExchangeRateSellFetchCount = (state) =>
  state.exchangeRateSell.exchangeRateSellFetchCount;
