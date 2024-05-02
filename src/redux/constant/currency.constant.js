import {
  api_status,
  defaultCurrency,
  localStorageVariable,
} from "src/constant";
import { getLocalStorage } from "src/util/common";

export const currency = {
  current: "currency/setCurrent",
  exchange: "currency/setExchange",
  exchangeFetchStatus: "currency/exchangeFetchStatus",
  fetchExchangeCount: "currency/setFetchExchangeCount",
};

export const defaultState = {
  current: getLocalStorage(localStorageVariable.currency) || defaultCurrency,
  exchange: [],
  exchangeFetchStatus: api_status.pending,
  fetchExchangeCount: 0,
};

export const getCurrent = (state) => state.currencyReducer.current;
export const getExchange = (state) => state.currencyReducer.exchange;
export const getExchangeFetchStatus = (state) =>
  state.currencyReducer.exchangeFetchStatus;
export const getFetchExchangeCount = (state) =>
  state.currencyReducer.fetchExchangeCount;
