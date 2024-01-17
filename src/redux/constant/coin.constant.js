import { coinString, localStorageVariable } from "src/constant";
import { getLocalStorage } from "src/util/common";

export const coin = {
  userWalletFetchCount: "coin/userWalletFetchCount",
  totalValue: "coin/totalValue",
  setCoin: "coin/setCoin",
  setAmountCoin: "coin/setAmountCoin",
  userWallet: "coin/userWallet",
};

export const defaultState = {
  coin: getLocalStorage(localStorageVariable.coin) || coinString.USDT,
  amountCoin: 0,
  userWalletFetchCount: 0, // mỗi lần muốn làm mới thông tin ví của user thì tăng biến này lên 1, app.js call api và fetch data vào userWallet
  userWallet: [], // duoc load du lieu tu header 1
  totalValue: 0,
};

export const getCoinCreateWallet = (state) => state.coinReducer.createWallet;
export const getCoinAll = (state) => state.coinReducer.totalValue;
export const getAmountCoin = (state) => state.coinReducer.amountCoin;
export const getUserWallet = (state) => state.coinReducer.userWallet;
export const userWalletFetchCount = (state) =>
  state.coinReducer.userWalletFetchCount;
export const getCoin = (state) => state.coinReducer.coin;
