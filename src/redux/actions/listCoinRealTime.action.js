import { listCoinRealTimeConstant } from "../constant/listCoinRealTime.constant";

export const setListCoinRealtime = function (payload) {
  return {
    type: listCoinRealTimeConstant.setListCoinRealTime,
    payload,
  };
};

export const setTotalAssetsRealTime = function (payload) {
  return {
    type: listCoinRealTimeConstant.setTotalAssetsRealTime,
    payload,
  };
};

export const setTotalAssetsBtcRealTime = function (payload) {
  return {
    type: listCoinRealTimeConstant.setTotalAssetsBtcRealTime,
    payload,
  };
};
