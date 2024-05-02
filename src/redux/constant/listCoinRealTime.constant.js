export const listCoinRealTimeConstant = {
  setListCoinRealTime: "listCoinRealTime/setListCoinRealTime",
  setTotalAssetsRealTime: "listCoinRealTime/setTotalAssetsRealTime",
  setTotalAssetsBtcRealTime: "listCoinRealTime/setTotalAssetsBtcRealTime",
};
export const defaultState = {
  listCoinRealTime: null,
  totalAssetsRealTime: 0, // usd
  totalAssetsBtcRealTime: 0,
};
export const getListCoinRealTime = (state) =>
  state.listCoinRealTimeReducer.listCoinRealTime;
export const getTotalAssetsRealTime = (state) =>
  state.listCoinRealTimeReducer.totalAssetsRealTime;
export const getTotalAssetsBtcRealTime = (state) =>
  state.listCoinRealTimeReducer.totalAssetsBtcRealTime;
