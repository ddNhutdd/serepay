import { coin } from "../constant/coin.constant";

export const userWalletFetchCount = function () {
  return {
    type: coin.userWalletFetchCount,
  };
};

export const coinUserWallet = function (payload) {
  return {
    type: coin.userWallet,
    payload,
  };
};

export const coinTotalValue = function (payload) {
  return {
    type: coin.totalValue,
    payload,
  };
};

export const coinSetCoin = function (payload) {
  return {
    type: coin.setCoin,
    payload,
  };
};

export const coinSetAmountCoin = function (payload) {
  return {
    type: coin.setAmountCoin,
    payload,
  };
};
