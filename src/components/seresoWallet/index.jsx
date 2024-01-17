import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormWithdraw from "./walletWithdraw";
import SerepayWalletList from "./walletList";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import SerepayWalletDeposit from "./walletDeposite";
import {
  getLocalStorage,
  parseURLParameters,
  setLocalStorage,
} from "src/util/common";
import {
  coinString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import i18n from "src/translation/i18n";

import {
  coinSetCoin,
  userWalletFetchCount,
} from "src/redux/actions/coin.action";
import {
  actionContent,
  getShow,
  setShow,
} from "src/redux/reducers/wallet2Slice";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { DOMAIN } from "src/util/service";
import { Button, buttonClassesType } from "../Common/Button";
function SwaptobeWallet() {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { search } = useLocation();
  const userWallet = useSelector(getUserWallet);
  const isLogin = useSelector((root) => root.loginReducer.isLogin);
  const dispatch = useDispatch();
  const showActionContent = useSelector(getShow);

  useEffect(() => {
    // check is login
    if (!isLogin) {
      setLocalStorage(localStorageVariable.previousePage, { ...location });
      const { coin } = useParams;
      dispatch(coinSetCoin(coin ?? "BTC"));
      history.push(url.login);
      return;
    }
    const { username, coin } = parseURLParameters(search); // have params into url
    if (coin) dispatch(coinSetCoin(coin));
    if (username) dispatch(setShow(actionContent.withdraw));
    //
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    dispatch(userWalletFetchCount());
  }, []);
  useEffect(() => {
    const ele = document.getElementById("showTotalValue");
    if (ele)
      ele.innerHTML = new Intl.NumberFormat("en-US").format(
        userWallet["usdt_balance"] || 0
      );
  }, [userWallet]);

  const sellBuyNowHandleClick = function () {
    if (isLogin) {
      dispatch(coinSetCoin(coinString.USDT));
      history.push(url.p2pTrading);
    } else {
      history.push(url.login);
    }
  };
  const renderActionContent = () => {
    switch (showActionContent) {
      case actionContent.main:
        return <SerepayWalletList />;
      case actionContent.withdraw:
        return <FormWithdraw />;
      case actionContent.desposite:
        return <SerepayWalletDeposit />;
      default:
        return;
    }
  };
  const backToActionContentMainClickHandle = (e) => {
    dispatch(setShow(actionContent.main));
  };
  const renderStyleShowMain = function () {
    return showActionContent === actionContent.main ? {} : { display: "none" };
  };
  const renderStyleShowWidthdraw = function () {
    return showActionContent === actionContent.withdraw
      ? {}
      : { display: "none" };
  };
  const renderStyleShowDesposite = function () {
    return showActionContent === actionContent.desposite
      ? {}
      : { display: "none" };
  };

  return (
    <div className="swaptobe-wallet fadeInBottomToTop">
      <div className="container">
        <h5 className="title">
          <span className="title__header" style={renderStyleShowMain()}>
            <span>{t("walletOverview")}</span>
          </span>
          <span
            className="title__header"
            style={renderStyleShowWidthdraw()}
            onClick={backToActionContentMainClickHandle}
          >
            <i className="fa-solid fa-arrow-left-long"></i>
            <span>{t("withdraw")}</span>
          </span>
          <span
            className="title__header"
            style={renderStyleShowDesposite()}
            onClick={backToActionContentMainClickHandle}
          >
            <i className="fa-solid fa-arrow-left-long"></i>
            <span>{t("deposit")} Cryto</span>
          </span>
        </h5>
        <div className="info">
          <div>{t("amount")} USDT</div>
          <div>
            <span id="showTotalValue"></span>{" "}
            <img src={DOMAIN + "images/USDT.png"} alt="usdt" />
          </div>
        </div>
        {renderActionContent()}
      </div>
    </div>
  );
}
export default SwaptobeWallet;
