import { BANK_API_DOMAIN, axiosService } from "./service";
export const createWalletApi = function (coinName) {
  try {
    return axiosService.post("/api/user/createWallet", {
      symbol: coinName,
    });
  } catch (error) { }
};
export const getWalletApi = function () {
  try {
    return axiosService.post("/api/user/getWallet");
  } catch (error) { }
};
export const getHistorySwapApi = function (data) {
  try {
    return axiosService.post("/api/swap/historyswap", data);
  } catch (error) { }
};
export const getDepositHistory = function (data) {
  try {
    return axiosService.post("/api/blockico/getblocks", data);
  } catch (error) { }
};
export const swapCoinApi = function (data) {
  try {
    return axiosService.post("/api/swap/swap", data);
  } catch (error) { }
};
export const transferToAddress = function (data) {
  try {
    return axiosService.post("/api/user/transferToAddress", data);
  } catch (error) { }
};
export const getHistoryWidthdraw = function (data) {
  try {
    return axiosService.post("/api/user/gethistorywidthdraw", data);
  } catch (error) { }
};
export const transferToUsername = function (data) {
  try {
    return axiosService.post("/api/user/transferToUsername", data);
  } catch (error) { }
};
export const historytransfer = function (data) {
  try {
    return axiosService.post("/api/user/historytransfer", data);
  } catch (error) { }
};
export const getExchange = function () {
  try {
    return axiosService.post("/api/exchange/getExchange");
  } catch (error) { }
};
export const uploadKyc = function (data) {
  try {
    return axiosService.post("/api/uploadKyc", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) { }
};
export const getProfile = function () {
  try {
    return axiosService.post("/api/user/getProfile");
  } catch (error) { }
};
export const generateOTPToken = function () {
  try {
    return axiosService.post("/api/user/generateOTPToken");
  } catch (error) { }
};
export const turnOn2FA = function (data) {
  try {
    return axiosService.post("/api/user/turnOn2FA", data);
  } catch (error) { }
};
export const turnOff2FA = function (data) {
  try {
    return axiosService.post("/api/user/turnOff2FA", data);
  } catch (error) { }
};
export const exchangeRateDisparity = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getConfig", data);
  } catch (error) { }
};
export const updateExchangeRateDisparity = function (data) {
  try {
    return axiosService.post("/api/p2pBank/updateConfig", data);
  } catch (error) { }
};
export const getListAdsBuy = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuy", data);
  } catch (error) { }
};
export const getListAdsSell = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSell", data);
  } catch (error) { }
};
export const companyAddAds = function (data) {
  try {
    return axiosService.post("/api/p2pBank/companyAddAds", data);
  } catch (error) { }
};
export const getListAdsSellToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSellToUser", data);
  } catch (error) { }
};
export const getListAdsBuyToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuyToUser", data);
  } catch (error) { }
};
export const getListAdsBuyPenddingToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsBuyPenddingToUser", data);
  } catch (error) { }
};
export const getListAdsSellPenddingToUser = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListAdsSellPenddingToUser", data);
  } catch (error) { }
};
export const searchBuyQuick = function (data) {
  try {
    return axiosService.post("/api/p2pBank/sreachBuyQuick", data);
  } catch (error) { }
};
export const searchSellQuick = function (data) {
  try {
    return axiosService.post("/api/p2pBank/sreachSellQuick", data);
  } catch (error) { }
};
export const addListBanking = function (data) {
  try {
    return axiosService.post("/api/user/addListBanking", data);
  } catch (error) { }
};
export const getListBanking = function (data) {
  try {
    return axiosService.post("/api/user/getListBankingUser", data);
  } catch (error) { }
};
export const createP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/createP2p", data);
  } catch (error) { }
};
export const getInfoP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getInfoP2p", data);
  } catch (error) { }
};
export const userCancelP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/userCancelP2pCommand", data);
  } catch (error) { }
};
export const userConfirmP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/userConfirmP2pCommand", data);
  } catch (error) { }
};
export const companyConfirmP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/CompanyConfirmP2pCommand", data);
  } catch (error) { }
};
export const companyCancelP2pCommand = function (data) {
  try {
    return axiosService.post("/api/p2pBank/CompanyCancelP2pCommand", data);
  } catch (error) { }
};
export const getListHistoryP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2p", data);
  } catch (error) { }
};
export const getListHistoryP2pPendding = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2pPendding", data);
  } catch (error) { }
};
export const getListHistoryP2pWhere = function (data) {
  try {
    return axiosService.post("/api/p2pBank/getListHistoryP2pWhere", data);
  } catch (error) { }
};
export const companyCancelP2p = function (data) {
  try {
    return axiosService.post("/api/p2pBank/cancelP2p", data);
  } catch (error) { }
};
export const createWalletBEP20 = function () {
  try {
    return axiosService.post("/api/blockico/createWalletBEP20", {
      symbol: "USDT.BEP20",
    });
  } catch (error) { }
};
export const sendMailForGetPassword = function (data) {
  try {
    return axiosService.post("/api/user/sendmailforgetpassword", data);
  } catch (error) { }
};
export const forGetPassword = function (data) {
  try {
    return axiosService.post("api/user/forgetpassword", data);
  } catch (error) { }
};
export const verifyEmail = function (verifyToken) {
  try {
    return axiosService.get("/api/user/verifyEmail/" + verifyToken);
  } catch (error) { }
};
export const exchangeRateSell = function () {
  try {
    return axiosService.post("api/p2pBank/getConfig", {
      name: "exchangeRateSell",
    });
  } catch (error) { }
};
export const changePasswords = function (data) {
  try {
    return axiosService.post("/api/user/updatepassword", data);
  } catch (error) { }
};
export const loginWallet = function (data) {
  try {
    return axiosService.post("/api/user/loginWallet", data);
  } catch (error) { }
}
export const addWallet = () => {
  try {
    return axiosService.post("/api/user/addWallet")
  } catch (error) {
  }
}
export const editNickNameWallet = (data) => {
  try {
    return axiosService.post("/api/user/editNickNameWallet", data)
  } catch (error) {
    console.log(error);
  }
}


//==========================================
export const getQrBankPayment = async function (
  accountNo,
  accountName,
  acqId,
  addInfo,
  amount
) {
  try {
    const url = BANK_API_DOMAIN + "/generate";
    const clientId = "1b57b8a1-5646-4a0b-8564-e5c28e29cd62";
    const apiKey = "51f83735-3327-47cf-be94-91916df4da5b";
    const requestData = {
      accountNo,
      accountName,
      acqId,
      addInfo,
      amount,
      template: "compact",
    };

    const headers = new Headers({
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    });

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestData),
    };

    const responseJson = await fetch(url, requestOptions);
    return responseJson.json();
  } catch (error) { }
};

export const getListBank = async function () {
  try {
    const url = BANK_API_DOMAIN + "/banks";
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const requestOptions = {
      method: "GET",
      headers: headers,
    };
    const responseJson = await fetch(url, requestOptions);
    return responseJson.json();
  } catch (error) { }
};
