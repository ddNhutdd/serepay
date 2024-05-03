import { axiosService } from "./service";
export const getKycUserPendding = function (data) {
  try {
    return axiosService.post("/api/admin/getKycUserPendding", data);
  } catch (error) { }
};
export const activeUserKyc = function (data) {
  try {
    return axiosService.post("/api/admin/activeUserKyc", data);
  } catch (error) { }
};
export const cancelUserKyc = function (data) {
  try {
    return axiosService.post("/api/admin/cancelUserKyc", data);
  } catch (error) { }
};
export const getAllAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAllAds", data);
  } catch (error) { }
};
export const getAllAdsPending = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAllAdsPendding", data);
  } catch (error) { }
};
export const getAdsToWhere = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAdsToWhere", data);
  } catch (error) { }
};
export const confirmAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/confirmAds", data);
  } catch (error) { }
};
export const refuseAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/refuseAds", data);
  } catch (error) { }
};
export const addExchange = function (data) {
  try {
    return axiosService.post("/api/exchange/addExchange", data);
  } catch (error) { }
};
export const editExchange = function (data) {
  try {
    return axiosService.post("/api/exchange/editExchange", data);
  } catch (error) { }
};
export const getListWidthdrawCoinAll = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoinAll", data);
  } catch (error) { }
};
export const getListWidthdrawCoin = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoin", data);
  } catch (error) { }
};
export const getListWidthdrawCoinPendding = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoinPendding", data);
  } catch (error) { }
};
export const activeWidthdraw = function (data) {
  try {
    return axiosService.post("/api/admin/activeWidthdraw", data);
  } catch (error) { }
};
export const cancelWidthdraw = function (data) {
  try {
    return axiosService.post("/api/admin/cancelWidthdraw", data);
  } catch (error) { }
};
export const getAllUser = function (data) {
  try {
    return axiosService.post("/api/admin/getAllUser", data);
  } catch (error) { }
};
export const typeAds = function (data) {
  try {
    return axiosService.post("/api/admin/typeAds", data);
  } catch (error) { }
};
export const turn2fa = function (data) {
  try {
    return axiosService.post("/api/admin/turn2fa", data);
  } catch (error) { }
};
export const activeuser = function (data) {
  try {
    return axiosService.post("/api/admin/activeuser", data);
  } catch (error) { }
};
export const getConfigAdmin = function () {
  try {
    return axiosService.post("/api/p2pBank/getConfigAdmin");
  } catch (error) { }
};
export const updateConfigAdmin = function (data) {
  try {
    return axiosService.post("/api/p2pBank/updateConfigAdmin", data);
  } catch (error) { }
};
export const historytransferAdmin = function (data) {
  try {
    return axiosService.post("/api/adminv2/historytransferAdmin", data);
  } catch (error) { }
};
export const getWalletToUserAdmin = function (data) {
  try {
    return axiosService.post("/api/adminv2/getWalletToUserAdmin", data);
  } catch (error) { }
};
export const updateAmountWalletToId = function (data) {
  try {
    return axiosService.post("/api/adminv2/updateAmountWalletToId", data);
  } catch (error) { }
};
export const historySwapAdmin = function (data) {
  try {
    return axiosService.post("/api/swap/historySwapAdmin", data);
  } catch (error) { }
};
export const searchUserFromUserName = function (data) {
  try {
    return axiosService.post("/api/admin/sreachusertousername", data);
  } catch (error) { }
};
export const getUserAllExcel = function () {
  try {
    return axiosService.post("/api/adminv2/getUserAll");
  } catch (error) { }
};
export const historytransferAdminAll = function () {
  try {
    return axiosService.post("/api/adminv2/historytransferAdminAll");
  } catch (error) { }
};
export const getHistoryDepositAdmin = function (data) {
  try {
    return axiosService.post("/api/adminv2/getHistoryDepositAdmin", data);
  } catch (error) { }
};
export const getHistoryDepositAdminAllExcel = function () {
  try {
    return axiosService.post("/api/adminv2/getHistoryDepositAdminAll");
  } catch (error) { }
};
export const searchWalletToWithdraw = (data) => {
  try {
    return axiosService.post("/api/adminv2/sreachWalletToWithdraw", data);
  } catch (error) {
  }
}
export const getHistoryToWhereAdmin = (data) => {
  try {
    return axiosService.post("/api/p2pBank/getHistoryToWhereAdmin", data);
  } catch (error) {

  }
}
export const AdminConfirmP2pCommand = (data) => {
  try {
    return axiosService.post("/api/p2pBank/AdminConfirmP2pCommand", data);
  } catch (error) {
  }
}
export const getWalletToWithdrawWhere = (data) => {
  try {
    return axiosService.post("/api/adminv2/getWalletToWithdrawWhere", data);
  } catch (error) {
  }
}
export const getAllUserWallet = (data) => {
  try {
    return axiosService.post("/api/adminv2/getAllUserWallet", data);
  } catch (error) {
  }
}
