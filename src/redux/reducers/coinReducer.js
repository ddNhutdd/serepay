import { defaultState, coin } from "../constant/coin.constant";
export const coinReducer = (state = defaultState, action) => {
  switch (action.type) {
    case coin.setCoin:
      return {
        ...state,
        coin: action.payload,
      };
    case coin.userWalletFetchCount:
      let cre = ++state.userWalletFetchCount;
      return {
        ...state,
        userWalletFetchCount: cre,
      };
    case coin.userWallet:
      return {
        ...state,
        userWallet: action.payload,
      };
    case coin.totalValue:
      return {
        ...state,
        totalValue: action.payload,
      };
    case coin.setAmountCoin:
      return {
        ...state,
        amountCoin: action.payload,
      };
    default:
      return state;
  }
};
