import { axiosService } from "./service";
export const createWalletApi = function (coinName) {
  try {
    return axiosService.post("/api/user/createWallet", {
      symbol: coinName,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getWalletApi = function () {
  try {
    return axiosService.post("/api/user/getWallet");
  } catch (error) {
    console.log(error);
  }
};
export const getHistorySwapApi = function (data) {
  try {
    return axiosService.post("/api/swap/historyswap", data);
  } catch (error) {
    console.log(error);
  }
};
export const getDepositHistory = function (data) {
  try {
    return axiosService.post("/api/blockico/getblocks", data);
  } catch (error) {
    console.log(error);
  }
};
export const swapCoinApi = function (data) {
  try {
    return axiosService.post("/api/swap/swap", data);
  } catch (error) {
    console.log(error);
  }
};
export const transferToAddress = function (data) {
  try {
    return axiosService.post("/api/user/transferToAddress", data);
  } catch (error) {
    console.log(error);
  }
};
export const getHistoryWidthdraw = function (data) {
  try {
    return axiosService.post("/api/user/gethistorywidthdraw", data);
  } catch (error) {
    console.log(error);
  }
};
export const transferToUsername = function (data) {
  try {
    return axiosService.post("/api/user/transferToUsername", data);
  } catch (error) {
    console.log(error);
  }
};
export const historytransfer = function (data) {
  try {
    return axiosService.post("/api/user/historytransfer", data);
  } catch (error) {
    console.log(error);
  }
};
export const getExchange = function () {
  try {
    return axiosService.post("/api/exchange/getExchange");
  } catch (error) {
    console.log(error);
  }
};
export const uploadKyc = function (data) {
  try {
    return axiosService.post("/api/uploadKyc", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = function () {
  try {
    return axiosService.post("/api/user/getProfile");
  } catch (error) {
    console.log(error);
  }
};
export const generateOTPToken = function () {
  try {
    return axiosService.post("/api/user/generateOTPToken");
  } catch (error) {
    console.log(error);
  }
};
export const turnOn2FA = function (data) {
  try {
    return axiosService.post("/api/user/turnOn2FA", data);
  } catch (error) {
    console.log(error);
  }
};
export const turnOff2FA = function (data) {
  try {
    return axiosService.post("/api/user/turnOff2FA", data);
  } catch (error) {
    console.log(error);
  }
};
export const exchangeRateDisparity = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getConfig", data);
  } catch (error) {
    console.log(error);
  }
};
export const updateExchangeRateDisparity = function (data) {
  try {
    return axiosService.post("/api/p2pBank/updateConfig", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsBuy = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuy", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsSell = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSell", data);
  } catch (error) {
    console.log(error);
  }
};
export const companyAddAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/companyAddAds", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsSellToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSellToUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsBuyToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuyToUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsBuyPenddingToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuyPenddingToUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListAdsSellPenddingToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSellPenddingToUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const searchBuyQuick = function (data) {
  try {
    return axiosService.post("/api/p2pBank/sreachBuyQuick", data);
  } catch (error) {
    console.log(error);
  }
};
export const searchSellQuick = function (data) {
  try {
    return axiosService.post("/api/p2pBank/sreachSellQuick", data);
  } catch (error) {
    console.log(error);
  }
};
export const addListBanking = function (data) {
  try {
    return axiosService.post("/api/user/addListBanking", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListBanking = function (data) {
  try {
    return axiosService.post("/api/user/getListBankingUser", data);
  } catch (error) {
    console.log(error);
  }
};
export const createP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/createP2p", data);
  } catch (error) {
    console.log(error);
  }
};
export const getInfoP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getInfoP2p", data);
  } catch (error) {
    console.log(error);
  }
};
export const userCancelP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/userCancelP2pCommand", data);
  } catch (error) {
    console.log(error);
  }
};
export const userConfirmP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/userConfirmP2pCommand", data);
  } catch (error) {
    console.log(error);
  }
};
export const companyConfirmP2pCommand = function (data) {
  try {
    console.log(data);
    return axiosService.post("/api/p2pBank/CompanyConfirmP2pCommand", data);
  } catch (error) {
    console.log(error);
  }
};
export const companyCancelP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/CompanyCancelP2pCommand", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListHistoryP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2p", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListHistoryP2pPendding = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2pPendding", data);
  } catch (error) {
    console.log(error);
  }
};
export const getListHistoryP2pWhere = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2pWhere", data);
  } catch (error) {
    console.log(error);
  }
};
export const companyCancelP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/cancelP2p", data);
  } catch (error) {
    console.log(error);
  }
};
export const createWalletBEP20 = function () {
  try {
    return axiosService.post("/api/blockico/createWalletBEP20", {
      symbol: "USDT.BEP20",
    });
  } catch (error) {
    console.log(error);
  }
};
