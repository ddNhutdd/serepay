import { useEffect, useRef } from "react";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import CreateBuySell from "./components/CreateBuySell";
import Login from "./components/Login";
import P2PTrading from "./components/P2PTrading";
import Signup from "./components/Signup";
import Swap from "./components/Swap";
import Wallet from "./components/Wallet";
import Config from "./Config";
import MainTemplate from "./templates/MainTemplate";
import SwaptobeWallet from "./components/seresoWallet";
import Profile from "./components/profile";
import Dashboard from "./components/admin/dashboard";
import AdminTemplate from "./templates/AdminTemplate";
import Home from "./components/home/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  exchangeRateSell,
  getExchange as getExchangeApi,
  getListBank,
  getListHistoryP2pPendding,
  getWalletApi,
} from "./util/userCallApi";
import {
  currencySetExchange,
  currencySetExchangeFetchStatus,
} from "./redux/actions/currency.action";
import { getFetchExchangeCount } from "./redux/constant/currency.constant";
import socket from "./util/socket";
import {
  setListCoinRealtime,
  setTotalAssetsBtcRealTime,
  setTotalAssetsRealTime,
} from "./redux/actions/listCoinRealTime.action";
import { userWalletFetchCount } from "./redux/constant/coin.constant";
import { coinUserWallet } from "./redux/actions/coin.action";
import {
  getLocalStorage,
  messageTransferHandle,
  removeLocalStorage,
  roundDecimalValues,
  roundDownDecimalValues,
  setIsMainAccount
} from "./util/common";
import {
  getExchangeRateDisparityFetchCount,
  setExchangeRateDisparity,
  setExchangeRateDisparityApiStatus,
} from "./redux/reducers/exchangeRateDisparitySlice";
import { exchangeRateDisparity as exchangeRateDisparityCallApi } from "src/util/userCallApi";
import ExchangeRateDisparity from "./components/admin/exchangeRateDisparity";
import { api_status, localStorageVariable, url } from "./constant";
import Ads from "./components/admin/ads";
import TransactionSell from "./components/transactionSell";
import Confirm from "./components/confirm";
import AdsHistory from "./components/adsHistory";
import Exchange from "./components/admin/exchange";
import P2pManagement from "./components/p2pManagement";
import TransactionBuy from "./components/transactionBuy";
import Widthdraw from "./components/admin/widthdraw";
import User from "./components/admin/user";
import { create, all } from "mathjs";
import { setNotify } from "./redux/reducers/notifiyP2pSlice";
import RecoveryPassword from "./components/recoveryPassword";
import ForgotPassword from "./components/forgotPassword";
import Verify from "./components/verify";
import ConfirmEmail from "./components/confirmEmail";
import ConfigData from "./components/admin/configData";
import Transfer from "./components/seresoWallet/transfer";
import FormWithdraw from "./components/seresoWallet/walletWithdraw";
import SerepayWalletDeposit from "./components/seresoWallet/walletDeposite";
import SwapAdmin from "./components/admin/swap";
import TransferAdmin from "./components/admin/transferAdmin";
import { setListBank, setStatus } from "./redux/reducers/bankSlice";
import {
  getExchangeRateSellFetchCount,
  setExchangeRateSell,
  setExchangeRateSellApiStatus,
} from "./redux/reducers/exchangeRateSellSlice";
import P2p from "./components/p2p";
import Deposite from "./components/admin/deposite";
import KycAdmin from "./components/admin/kyc";
import P2pAdmin from "./components/admin/p2p";
import { useTranslation } from "react-i18next";
import UserDetail from "./components/admin/user-detail";
import AdminManagement from "./components/admin/admin-management";
import { checkAdmin } from "./util/adminCallApi";

const config = {};
export const math = create(all, config);

export const fetchNotify = function (dispatchHook) {
  return new Promise((resolve, reject) => {
    getListHistoryP2pPendding({ limit: 100, page: 1 })
      .then((resp) => {
        const data = resp?.data?.data?.total || 0;
        dispatchHook(setNotify(data));
        resolve(true);
      })
      .catch((error) => { });
  });
};

function App() {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const fetchExchangeCount = useSelector(getFetchExchangeCount);
  const userWalletFetch = useSelector(userWalletFetchCount);
  const getExchangeRateDisparityFetch = useSelector(
    getExchangeRateDisparityFetchCount
  );
  const getExchangeRateSellFetch = useSelector(getExchangeRateSellFetchCount);
  const { t } = useTranslation();

  const userWallet = useRef([]);

  const getExchange = function () {
    dispatch(currencySetExchangeFetchStatus(api_status.fetching));
    getExchangeApi()
      .then((resp) => {
        dispatch(currencySetExchangeFetchStatus(api_status.fulfilled));
        dispatch(currencySetExchange(resp.data.data));
      })
      .catch((error) => {
        dispatch(currencySetExchangeFetchStatus(api_status.rejected));
      });
  };
  const getUserWallet = function () {
    const listAllCoinPromise = new Promise((resolve) => {
      socket.once("listCoin", (res) => {
        resolve(res);
      });
    });

    listAllCoinPromise.then((listAllCoin) => {
      getWalletApi()
        .then((resp) => {
          const apiResp = resp.data.data;
          const result = {};
          for (const [name, value] of Object.entries(apiResp)) {
            let price =
              listAllCoin.filter(
                (item) =>
                  item.name === name.replace("_balance", "").toUpperCase()
              )[0]?.price ?? 0;
            result[name] = roundDownDecimalValues(value, price);
          }
          if (Object.keys(result)) {
            userWallet.current = result;
            dispatch(coinUserWallet(result));
          }
        })
        .catch(() => { });
    });
  };
  const getExchangeRateDisparityApi = function () {
    dispatch(setExchangeRateDisparityApiStatus(api_status.fetching));
    exchangeRateDisparityCallApi({
      name: "exchangeRate",
    })
      .then((resp) => {
        const rate = resp.data.data[0].value;
        dispatch(setExchangeRateDisparity(rate));
      })
      .catch((error) => {
        dispatch(setExchangeRateDisparityApiStatus(api_status.rejected));
      });
  };
  const calTotalAssets = function (listCoinRealTime, userWallet) {
    if (
      !listCoinRealTime ||
      listCoinRealTime.length <= 0 ||
      !userWallet ||
      userWallet.length <= 0
    ) {
      return -1;
    }
    let result = 0;
    for (const [coinBalance, amount] of Object.entries(userWallet)) {
      const coinName = coinBalance.replace("_balance", "").toUpperCase();
      const price = listCoinRealTime.find(
        (item) => item.name === coinName
      )?.price;
      if (price) {
        result += +amount * price;
      }
    }
    return result;
  };
  const calTotalAssetsBtc = function (totalUsd, listCoinRealTime) {
    if (
      !totalUsd ||
      !listCoinRealTime ||
      totalUsd <= 0 ||
      listCoinRealTime.length <= 0
    )
      return;
    const priceBtc = listCoinRealTime.find(
      (item) => item.name === "BTC"
    )?.price;
    return roundDecimalValues(totalUsd / priceBtc, 100000000);
  };
  const fetchListBank = async function () {
    try {
      dispatch(setStatus(api_status.fetching));
      const listBank = (await getListBank())?.data;
      dispatch(
        setListBank(
          listBank.map((item) => ({
            image: item.logo,
            content: `${item.shortName} (${item.code})`,
            id: item.id,
            code: item.code,
            bin: item.bin,
            shortName: item.shortName,
          }))
        )
      );
      dispatch(setStatus(api_status.fulfilled));
    } catch (error) {
      dispatch(setStatus(api_status.rejected));
    }
  };
  const getExchangeRateSell = async function () {
    try {
      dispatch(setExchangeRateSellApiStatus(api_status.fetching));
      const resp = await exchangeRateSell();
      dispatch(setExchangeRateSell(resp?.data?.data.at(0)?.value));
    } catch (error) {
      dispatch(setExchangeRateSellApiStatus(api_status.rejected));
    }
  };
  const checkAccountAdmin = async () => {
    await checkAdmin()
      ? dispatch({ type: "USER_ADMIN", payload: true })
      : dispatch({ type: "USER_ADMIN", payload: false });
  }

  useEffect(() => {
    if (getLocalStorage(localStorageVariable.user)) {
      const user = getLocalStorage(localStorageVariable.user);
      socket.emit("join", user.id);
      socket.on("ok", (res) => { });
      if (user.expiresInRefreshToken < Date.now()) {
        removeLocalStorage(localStorageVariable.token)
        removeLocalStorage(localStorageVariable.user)
      }
    }
    socket.connect();
    socket.on("listCoin", (resp) => {
      dispatch(setListCoinRealtime(resp));
      const total = calTotalAssets(resp, userWallet.current);
      dispatch(setTotalAssetsRealTime(total));
      dispatch(setTotalAssetsBtcRealTime(calTotalAssetsBtc(total, resp)));
    });

    // kiểm tra xem có đang
    if (isLogin) {
      socket.on("messageTransfer", (res) => {
        messageTransferHandle(res, t)
      })
    }


    // kiểm tra xem tài khoản đang đăng nhập có phải là admin hay không
    checkAccountAdmin();

    fetchListBank();

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (isLogin) {
      socket.on("createP2p", (res) => {
        fetchNotify(dispatch);
      });
    } else {
      dispatch(setNotify(-1));
      socket.off("createP2p");
    }
  }, [isLogin]);
  useEffect(() => {
    getExchange();
  }, [fetchExchangeCount]);
  useEffect(() => {
    isLogin && getUserWallet();
  }, [userWalletFetch, isLogin]);
  useEffect(() => {
    getExchangeRateDisparityApi();
  }, [getExchangeRateDisparityFetch]);
  useEffect(() => {
    getExchangeRateSell();
  }, [getExchangeRateSellFetch]);

  return (
    <BrowserRouter>
      <Config>
        <Switch>
          <MainTemplate path={url.ads_history} component={AdsHistory} />
          <MainTemplate path={url.confirm} component={Confirm} />
          <MainTemplate path={url.transaction_buy} component={TransactionBuy} />
          <MainTemplate
            path={url.transaction_sell}
            component={TransactionSell}
          />
          <MainTemplate path={url.profile} component={Profile} />
          <MainTemplate path={url.p2p} component={P2p} />
          <MainTemplate path={url.wallet} component={SwaptobeWallet} />
          <MainTemplate path={url.p2p_management} component={P2pManagement} />
          <MainTemplate path="/p2p-trading" component={P2PTrading} />
          <MainTemplate path="/swap" component={Swap} />
          <MainTemplate path="/create-ads/buy" component={CreateBuySell} />
          <MainTemplate path="/create-ads/sell" component={CreateBuySell} />
          <MainTemplate path="/login" component={Login} />
          <MainTemplate path="/signup" component={Signup} />
          <MainTemplate
            path={url.recovery_password}
            component={RecoveryPassword}
          />
          <MainTemplate path={url.deposite} component={SerepayWalletDeposit} />
          <MainTemplate path={url.forgot_password} component={ForgotPassword} />
          <MainTemplate path={url.transfer} component={Transfer} />
          <MainTemplate path={url.widthdraw} component={FormWithdraw} />
          <MainTemplate path="/wallet" component={Wallet} />
          <MainTemplate path={url.confirm_email} component={ConfirmEmail} />
          <MainTemplate path={url.verify} component={Verify} />
          <AdminTemplate path="/admin/dashboard" component={Dashboard} />
          <AdminTemplate path="/admin/ads" component={Ads} />
          <AdminTemplate path={url.admin_configData} component={ConfigData} />
          <AdminTemplate path={url.admin_widthdraw} component={Widthdraw} />
          <AdminTemplate path={url.admin_exchange} component={Exchange} />
          <AdminTemplate path={url.admin_user} component={User} />
          <AdminTemplate
            path={url.admin_exchangeRateDisparity}
            component={ExchangeRateDisparity}
          />
          <AdminTemplate path={url.admin_transfer} component={TransferAdmin} />
          <AdminTemplate path={url.admin_swap} component={SwapAdmin} />
          <AdminTemplate path={url.admin_kyc} component={KycAdmin} />
          <AdminTemplate path={url.admin_deposit} component={Deposite} />
          <AdminTemplate path={url.admin_p2p} component={P2pAdmin} />
          <AdminTemplate path={url.admin_userDetail} component={UserDetail} />
          <AdminTemplate path={url.admin_adminManagement} component={AdminManagement} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Config>
    </BrowserRouter>
  );
}
export default App;
