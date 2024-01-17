import { availableLanguage } from "src/translation/i18n";

export const localStorageVariable = {
  lng: "lng",
  token: "token",
  user: "user",
  currency: "currency",
  previousePage: null,
  coin: "coin",
  adsItem: "adsItem",
  createAds: "createAds",
  coinFromP2pExchange: "amFP2PE",
  moneyFromP2pExchange: "amFP2PEM",
  coinNameFromP2pExchange: "cnfP2PE",
};

export const deploy_domain = "http://192.168.0.109:3000/wallet-2";

export const url = {
  home: "/",
  signup: "/signup",
  profile: "/profile",
  wallet: "/wallet-2",
  swap: "/swap",
  login: "/login",
  p2pTrading: "/p2p-trading",
  admin_kyc: "/admin/kyc",
  admin_exchangeRateDisparity: "/admin/exchange-rate-disparity",
  create_ads_sell: "/create-ads/sell",
  create_ads_buy: "/create-ads/buy",
  admin_ads: "/admin/ads",
  admin_exchange: "/admin/exchange",
  admin_widthdraw: "/admin/widthdraw",
  ads_history: "/ads-history",
  transaction_sell: "/transaction-sell",
  transaction_buy: "/transaction-buy",
  confirm: "/confirm/:id",
  p2p_management: "/p2p-management",
  admin_user: "/admin/user",
};

export const api_url = {
  login: "api/user/login",
  refreshToken: "api/user/refreshToken",
};

export const image_domain = "https://remitano.dk-tech.vn/images/USDT.png";

export const api_status = {
  pending: "pending",
  fetching: "fetching",
  fulfilled: "fulfilled",
  rejected: "rejected",
};

export const currency = {
  vnd: "VND",
  eur: "EUR",
  usd: "USD",
};

export const currencyMapper = {
  USD: "en-US",
  VND: "vi-VN",
  EUR: "it-IT",
};

export const defaultLanguage = availableLanguage.en;
export const defaultCurrency = "USD";
export const regularExpress = {
  checkNumber: /^[+-]?([0-9]*[.])?[0-9]*$/,
};

export const actionTrading = {
  buy: "buy",
  sell: "sell",
};

export const commontString = {
  noData: "No Data",
  error: "Error",
  success: "Success",
};

export const coinString = {
  USDT: "USDT",
};
