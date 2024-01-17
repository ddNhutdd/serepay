import { createSlice } from "@reduxjs/toolkit";
import { api_status } from "src/constant";
const exchangeRateDisparitySlice = createSlice({
  name: "exchangeRateDisparity",
  initialState: {
    exchangeRateDisparity: 0,
    exchangeRateDisparityApiStatus: api_status.pending,
    exchangeRateDisparityFetchCount: 0,
  },
  reducers: {
    setExchangeRateDisparity: (state, action) => {
      state.exchangeRateDisparityApiStatus = api_status.fulfilled;
      state.exchangeRateDisparity = action.payload;
    },
    setExchangeRateDisparityApiStatus: (state, action) => {
      state.exchangeRateDisparityApiStatus = action.payload;
    },
    fetchExchangeRateDisparity: (state) => {
      state.exchangeRateDisparityFetchCount += 1;
    },
  },
});
export default exchangeRateDisparitySlice.reducer;
export const {
  setExchangeRateDisparity,
  fetchExchangeRateDisparity,
  setExchangeRateDisparityApiStatus,
} = exchangeRateDisparitySlice.actions;
//
export const getExchangeRateDisparity = (rootState) =>
  rootState.exchangeRateDisparityReducer.exchangeRateDisparity;
export const getExchangeRateDisparityFetchCount = (rootState) =>
  rootState.exchangeRateDisparityReducer.exchangeRateDisparityFetchCount;
export const exchangeRateDisparityApiStatus = (rootState) =>
  rootState.exchangeRateDisparityReducer.exchangeRateDisparityApiStatus;
