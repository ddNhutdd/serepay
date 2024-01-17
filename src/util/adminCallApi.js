import { axiosService } from "./service";
export const getKycUserPendding = function (data) {
  try {
    return axiosService.post("/api/admin/getKycUserPendding", data);
  } catch (error) {
    console.log(error);
  }
};
export const activeUserKyc = function (data) {
  try {
    return axiosService.post("/api/admin/activeUserKyc", data);
  } catch (error) {
    console.log(error);
  }
};
export const cancelUserKyc = function (data) {
  try {
    return axiosService.post("/api/admin/cancelUserKyc", data);
  } catch (error) {
    console.log(error);
  }
};
export const getAllAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAllAds", data);
  } catch (error) {
    console.log(error);
  }
};
export const getAllAdsPending = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAllAdsPendding", data);
  } catch (error) {
    console.log(error);
  }
};
export const getAdsToWhere = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getAdsToWhere", data);
  } catch (error) {
    console.log(error);
  }
};
export const confirmAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/confirmAds", data);
  } catch (error) {
    console.log(error);
  }
};
export const refuseAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/refuseAds", data);
  } catch (error) {
    console.log(error);
  }
};
export const addExchange = function (data) {
  try {
    return axiosService.post("/api/exchange/addExchange", data);
  } catch (error) {
    console.log(error);
  }
};
export const editExchange = function (data) {
  try {
    return axiosService.post("/api/exchange/editExchange", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListWidthdrawCoinAll = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoinAll", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListWidthdrawCoin = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoin", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListWidthdrawCoinPendding = function (data) {
  try {
    return axiosService.post("/api/admin/getListWidthdrawCoinPendding", data);
  } catch (error) {
    console.log(error);
  }
};
export const activeWidthdraw = function (data) {
  try {
    return axiosService.post("/api/admin/activeWidthdraw", data);
  } catch (error) {
    console.log(error);
  }
};
export const cancelWidthdraw = function (data) {
  try {
    return axiosService.post("/api/admin/cancelWidthdraw", data);
  } catch (error) {
    console.log(error);
  }
};
export const getAllUser = function (data) {
  try {
    return axiosService.post("/api/admin/getAllUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const typeAds = function (data) {
  try {
    return axiosService.post("/api/admin/typeAds", data);
  } catch (error) {
    console.log(error);
  }
};
export const turn2fa = function (data) {
  try {
    return axiosService.post("/api/admin/turn2fa", data);
  } catch (error) {
    console.log(error);
  }
};
export const activeuser = function (data) {
  try {
    return axiosService.post("/api/admin/activeuser", data);
  } catch (error) {
    console.log(error);
  }
};
