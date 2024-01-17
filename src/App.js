import { useEffect, useRef } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import CreateBuySell from "./components/CreateBuySell";
import Login from "./components/Login";
import P2PTrading from "./components/P2PTrading";
import Signup from "./components/Signup";
import Swap from "./components/Swap";
import Wallet from "./components/Wallet";
import ScrollToTop from "./ScrollToTop";
import MainTemplate from "./templates/MainTemplate";
import SwaptobeWallet from "./components/seresoWallet";
import Profile from "./components/profile";
import Dashboard from "./components/admin/dashboard";
import AdminTemplate from "./templates/AdminTemplate";
import Home from "./components/home/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  getExchange as getExchangeApi,
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
import { roundDecimalValues } from "./util/common";
import KYC from "./components/admin/kycUsers";
import {
  getExchangeRateDisparityFetchCount,
  setExchangeRateDisparity,
  setExchangeRateDisparityApiStatus,
} from "./redux/reducers/exchangeRateDisparitySlice";
import { exchangeRateDisparity as exchangeRateDisparityCallApi } from "src/util/userCallApi";
import ExchangeRateDisparity from "./components/admin/exchangeRateDisparity";
import { api_status, url } from "./constant";
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

const config = {};
export const math = create(all, config);

function App() {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const fetchExchangeCount = useSelector(getFetchExchangeCount);
  const userWalletFetch = useSelector(userWalletFetchCount);
  const getExchangeRateDisparityFetch = useSelector(
    getExchangeRateDisparityFetchCount
  );
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
        console.log(error);
      });
  };
  const getUserWallet = function () {
    const listAllCoinPromise = new Promise((resolve) => {
      socket.once("listCoin", (res) => {
        resolve(res);
      });
    });
    //
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
            result[name] = roundDecimalValues(value, price);
          }
          if (Object.keys(result)) {
            userWallet.current = result;
            dispatch(coinUserWallet(result));
          }
        })
        .catch((error) => console.log(error));
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
        console.log(error);
      });
  };

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      socket.emit("join", user.id);
      socket.on("ok", (res) => {
        console.log(res, "joined");
      });
      if (user.expiresInRefreshToken < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    //
    socket.connect();
    socket.on("listCoin", (resp) => {
      dispatch(setListCoinRealtime(resp));
      const total = calTotalAssets(resp, userWallet.current);
      dispatch(setTotalAssetsRealTime(total));
      dispatch(setTotalAssetsBtcRealTime(calTotalAssetsBtc(total, resp)));
    });
    //
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    getExchange();
  }, [fetchExchangeCount]);
  useEffect(() => {
    isLogin && getUserWallet();
  }, [userWalletFetch, isLogin]);
  useEffect(() => {
    getExchangeRateDisparityApi();
  }, [getExchangeRateDisparityFetch]);
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

  return (
    <BrowserRouter>
      <ScrollToTop>
        <Switch>
          <MainTemplate path={url.ads_history} component={AdsHistory} />
          <MainTemplate path={url.confirm} component={Confirm} />
          <MainTemplate path={url.transaction_buy} component={TransactionBuy} />
          <MainTemplate
            path={url.transaction_sell}
            component={TransactionSell}
          />
          <MainTemplate path={url.profile} component={Profile} />
          <MainTemplate path={url.wallet} component={SwaptobeWallet} />
          <MainTemplate path={url.p2p_management} component={P2pManagement} />
          <MainTemplate path="/p2p-trading" component={P2PTrading} />
          <MainTemplate path="/swap" component={Swap} />
          <MainTemplate path="/create-ads/buy" component={CreateBuySell} />
          <MainTemplate path="/create-ads/sell" component={CreateBuySell} />
          <MainTemplate path="/login" component={Login} />
          <MainTemplate path="/signup" component={Signup} />
          <MainTemplate path="/wallet" component={Wallet} />
          <AdminTemplate path="/admin/dashboard" component={Dashboard} />
          <AdminTemplate path="/admin/ads" component={Ads} />
          <AdminTemplate path={url.admin_widthdraw} component={Widthdraw} />
          <AdminTemplate path={url.admin_exchange} component={Exchange} />
          <AdminTemplate path="/admin/kyc" component={KYC} />
          <AdminTemplate path={url.admin_user} component={User} />
          <AdminTemplate
            path={url.admin_exchangeRateDisparity}
            component={ExchangeRateDisparity}
          />
          <Route exact path="/" component={Home} />
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
export default App;
