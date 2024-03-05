import { availableLanguage } from "src/translation/i18n";
import { DOMAIN } from "src/util/service";

export const localStorageVariable = {
  lng: "lng",
  token: "token",
  user: "user",
  currency: "currency",
  previousePage: "previousePage",
  coin: "coin",
  adsItem: "adsItem",
  createAds: "createAds",
  coinToTransaction: "amFP2PE",
  moneyToTransaction: "amFP2PEM",
  coinNameToTransaction: "cnfP2PE",
  coinFromWalletList: "cnwl",
  amountFromWalletList: "amcnwl",
  thisIsAdmin: "adta",
  p2pManagementPending: "p2pp",
  expireToken: "lex",
  reLoginR: "reLoginR",
};

export const url = {
  home: "/",
  signup: "/signup",
  profile: "/profile",
  wallet: "/wallet-2",
  swap: "/swap",
  verify: "/verify/:token",
  login: "/login",
  p2pTrading: "/p2p-trading",
  create_ads_sell: "/create-ads/sell",
  create_ads_buy: "/create-ads/buy",
  admin_ads: "/admin/ads",
  ads_history: "/ads-history",
  transaction_sell: "/transaction-sell",
  transaction_buy: "/transaction-buy",
  confirm: "/confirm/:id",
  p2p_management: "/p2p-management",
  admin_user: "/admin/user",
  recovery_password: "/recovery-password",
  forgot_password: "/forget-password/:token",
  confirm_email: "/confirm-email",
  transfer: "/transfer",
  widthdraw: "/widthdraw",
  deposite: "/deposite",
  p2p: "/p2p",

  admin_swap: "/admin/swap",
  admin_kyc: "/admin/kyc",
  admin_exchange: "/admin/exchange",
  admin_widthdraw: "/admin/widthdraw",
  admin_configData: "/admin/config-data",
  admin_exchangeRateDisparity: "/admin/exchange-rate-disparity",
  admin_transfer: "/admin/transfer",
  admin_wallet: "/admin/wallet",
  admin_deposite: "/admin/deposite",
};

const currentDomain = window.location.href;
export const deploy_domain = currentDomain;

export const api_url = {
  login: "api/user/login",
  refreshToken: "api/user/refreshToken",
};

export const image_domain = DOMAIN + "images/USDT.png";

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
  strongCheckNumber: /^(?!$)\d+(\.\d+)?$/,
  accountExpress:
    /^[A-ZĂÂĐÊÔƠƯỨỪỮỬỰĨỈỴỸÀẢÃÁẠĂẰẦẴẤẶẢẨẬẶÈẺẼÉẸÊỀỂỄẾỆÌỈĨÍỊÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢÙỦŨÚỤƯỨỪỮỬỰỲỶỸÝỴ0-9 ]{5,50}$/,
  phone: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
};

export const actionTrading = {
  buy: "buy",
  sell: "sell",
};

export const commontString = {
  noData: "No Data",
  error: "Error",
  success: "Success",
  pleaseEnterReason: "Please enter reason",
};

export const coinString = {
  USDT: "USDT",
};

export const apiResponseErrorMessage = {
  usernameMini: "UserName more than 3 degits",
  password_1: "password more than 5 degits",
  password_2: "password more than 6 degits",
  accountExist: "User does not exist !",
  emailExist: "Email already exists !",
  accountIncorrect: "Email or password is incorrect! ",
  bankExist: "Bank account number already exists",
  insufficientBalance: "Insufficient balance",
  imagesCannotBeLeftBlank: "Images cannot be left blank",
};
