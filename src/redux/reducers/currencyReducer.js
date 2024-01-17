import { currency } from "../constant/currency.constant";
import { defaultState } from "../constant/currency.constant";

export const currencyReducer = (state = defaultState, action) => {
  switch (action.type) {
    case currency.current: {
      return {
        ...state,
        current: action.payload,
      };
    }
    case currency.exchange: {
      return {
        ...state,
        exchange: action.payload,
      };
    }
    case currency.exchangeFetchStatus:
      return {
        ...state,
        exchangeFetchStatus: action.payload,
      };
    case currency.fetchExchangeCount: {
      const count = ++state.fetchExchangeCount;
      return {
        ...state,
        fetchExchangeCount: count,
      };
    }

    default:
      return state;
  }
};
