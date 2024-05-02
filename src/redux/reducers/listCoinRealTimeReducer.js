import {
  defaultState,
  listCoinRealTimeConstant,
} from "../constant/listCoinRealTime.constant";
export const listCoinRealTimeReducer = function (state = defaultState, action) {
  switch (action.type) {
    case listCoinRealTimeConstant.setListCoinRealTime: {
      return {
        ...state,
        listCoinRealTime: action.payload,
      };
    }
    case listCoinRealTimeConstant.setTotalAssetsRealTime:
      return {
        ...state,
        totalAssetsRealTime: action.payload,
      };
    case listCoinRealTimeConstant.setTotalAssetsBtcRealTime:
      return {
        ...state,
        totalAssetsBtcRealTime: action.payload,
      };
    default:
      return {
        ...state,
      };
  }
};
