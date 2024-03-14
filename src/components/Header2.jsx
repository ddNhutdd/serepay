import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n, { availableLanguageMapper } from "../translation/i18n";
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from "../util/common";
import {
  api_status,
  defaultCurrency,
  defaultLanguage,
  localStorageVariable,
  url,
} from "../constant";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { currencySetCurrent } from "src/redux/actions/currency.action";
import { callToastSuccess } from "src/function/toast/callToast";
import {
  getTotalAssetsBtcRealTime,
  getTotalAssetsRealTime,
} from "src/redux/constant/listCoinRealTime.constant";
import { getNotify } from "src/redux/reducers/notifiyP2pSlice";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { Modal, Spin } from "antd";
import { getAccountName } from "src/redux/reducers/accountSlice";
import { loginWallet } from "src/util/userCallApi";

export default function Header2({ history }) {
  const { isLogin, username, isAdmin } = useSelector(
    (root) => root.loginReducer
  );
  const accountName = useSelector(getAccountName);
  const notifyRedux = useSelector(getNotify);
  const currencyFromRedux = useSelector(getCurrent);

  const [currentLanguage, setCurrentLanguage] = useState(
    getLocalStorage(localStorageVariable.lng) || defaultLanguage
  );
  const [currentCurrency, setCurrentCurrency] = useState(
    currencyFromRedux || defaultCurrency
  );
  const { t } = useTranslation();
  const totalAssetsRealTime = useSelector(getTotalAssetsRealTime);
  const totalAssetsBtcRealTime = useSelector(getTotalAssetsBtcRealTime);
  const listExChange = useSelector(getExchange);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isShowMenuLanguage, setIsShowMenuLanguage] = useState(false);
  const [isShowMenuCurrency, setIsShowMenuCurrency] = useState(false);
  const [isShowMenuWallet, setIsShowMenuWallet] = useState(false);
  const [isShowMenuUser, setIsShowMenuUser] = useState(false);
  const [totalMoney, setTotalMoney] = useState(0); // it is the string it displays on the web
  const [isModalLanguageOpen, setIsModalLanguageOpen] = useState(false);
  const [isModalCurrencyOpen, setIsModalCurrencyOpen] = useState(false);
  const [isModalAccInfoOpent, setIsModalAccInfoOpent] = useState(false);
  const [listWallet, setListWallet] = useState();
  const [callApiLoginWalletStatus, setCallApiLoginWalletStatus] = useState(api_status.pending);
  const [currentWalletUsdtBalance, setCurrentWalletUsdtBalance] = useState(0);

  const dispatch = useDispatch();
  const location = useLocation();

  const barButtonClickHandle = function () {
    setIsShowMenu((s) => !s);
  };
  const renderClassShowMenu = function () {
    return isShowMenu ? "show" : "";
  };
  const renderClassShowMenuLanguage = function () {
    return isShowMenuLanguage ? "show" : "";
  };
  const renderClassShowMenuCurrency = function () {
    return isShowMenuCurrency ? "show" : "";
  };
  const languageToggle = function (e) {
    e.stopPropagation();
    const temFlag = isShowMenuLanguage;
    closeMenu();
    setIsShowMenuLanguage((s) => !temFlag);
  };
  const redirectPageClickHandle = function (e) {
    const container = e.target.closest(".container");
    const listItem = container.querySelectorAll("[data-page]");
    for (const item of listItem) {
      item.classList.remove("active");
    }
    const urlLocal = e.currentTarget.dataset.page;
    e.currentTarget.classList.add("active");
    history.push(urlLocal);
    setIsShowMenu(() => false);

    if (urlLocal === url.wallet) {
      dispatch(userWalletFetchCount());
    }
    return;
  };
  const languageItemClickHandle = function (e) {
    const container = e.target.closest(".header2__language-menu");
    for (const item of container.children) {
      item.classList.remove("active");
    }
    e.currentTarget.classList.add("active");
    setIsShowMenuLanguage(() => false);
    setIsShowMenu(() => false);
    setCurrentLanguage(this);
    setLocalStorage(localStorageVariable.lng, this);
    i18n.changeLanguage(this);
  };
  const renderMenuLanguage = function () {
    const country = Object.values(availableLanguageMapper);
    const countrySorted = country.sort();
    return countrySorted.map((item) => {
      let codeContry = "";
      for (const [code, name] of Object.entries(availableLanguageMapper)) {
        if (item === name) {
          codeContry = code;
          break;
        }
      }
      return (
        <div
          onClick={languageItemClickHandle.bind(codeContry)}
          key={codeContry}
          className={`header2__language-item ${codeContry === currentLanguage ? "active" : ""
            }`}
        >
          <span>
            <img
              src={process.env.PUBLIC_URL + `/img/icon${codeContry}.png`}
              alt={codeContry}
            />
          </span>
          <span>{item}</span>
        </div>
      );
    });
  };
  const renderListCurrency = function () {
    const listCurr = listExChange.map((item) => item.title);
    const listCurrSorted = listCurr.sort();
    return listCurrSorted.map((item, index) => (
      <div
        key={index}
        onClick={currencyItemClickHandle.bind(item)}
        className={`header2__currrency-item ${item === currentCurrency ? "active" : ""
          } `}
      >
        {item}
      </div>
    ));
  };
  const currencyItemClickHandle = function () {
    setLocalStorage(localStorageVariable.currency, this);
    setCurrentCurrency(() => this);
    setIsShowMenuCurrency(() => false);
    setIsShowMenu(() => false);
    dispatch(currencySetCurrent(this));
  };
  const currencyToggle = function (e) {
    e.stopPropagation();
    const temFlag = isShowMenuCurrency;
    closeMenu();
    setIsShowMenuCurrency(() => !temFlag);
  };
  const closeMenu = function () {
    setIsShowMenuCurrency(() => false);
    setIsShowMenuLanguage(() => false);
    setIsShowMenuWallet(() => false);
    setIsShowMenuUser(() => false);
  };
  const renderClassShowMenuWallet = function () {
    return isShowMenuWallet ? "show" : "";
  };
  const walletToggle = function (e) {
    e.stopPropagation();
    const temFlag = isShowMenuWallet;
    closeMenu();
    setIsShowMenuWallet(() => !temFlag);
  };
  const renderClassShowMenuUser = function () {
    return isShowMenuUser ? "show" : "";
  };
  const userToggle = function (e) {
    e.stopPropagation();
    const temFlag = isShowMenuUser;
    closeMenu();
    setIsShowMenuUser(() => !temFlag);
  };
  const logout = () => {
    const tem = t("logOut");
    const temTitle = t("success");
    dispatch({ type: "USER_ADMIN", payload: false });
    removeLocalStorage(localStorageVariable.lng);
    localStorage.removeItem(localStorageVariable.user);
    localStorage.removeItem(localStorageVariable.token);
    removeLocalStorage(localStorageVariable.coinToTransaction);
    removeLocalStorage(localStorageVariable.currency);
    removeLocalStorage(localStorageVariable.adsItem);
    removeLocalStorage(localStorageVariable.coinNameToTransaction);
    removeLocalStorage(localStorageVariable.createAds);
    removeLocalStorage(localStorageVariable.moneyToTransaction);
    dispatch(currencySetCurrent(defaultCurrency));
    removeLocalStorage(localStorageVariable.coin);
    removeLocalStorage(localStorageVariable.coinFromWalletList);
    removeLocalStorage(localStorageVariable.amountFromWalletList);
    removeLocalStorage(localStorageVariable.thisIsAdmin);
    removeLocalStorage(localStorageVariable.expireToken);
    removeLocalStorage(localStorageVariable.accountName);
    removeLocalStorage(localStorageVariable.accountUsdt);
    history.push(url.home);
    dispatch({ type: "USER_LOGOUT" });
    callToastSuccess(tem, temTitle);
  };
  const redirectLogin = function () {
    history.push(url.login);
    setIsShowMenu(() => false);
    return;
  };
  const renderClassWithLogin = function (loggedInClass, notLoggedInYetClass) {
    return isLogin ? loggedInClass : notLoggedInYetClass;
  };
  const renderTotalMoney = function () {
    if (
      !totalAssetsRealTime ||
      totalAssetsRealTime < 0 ||
      !currentCurrency ||
      !listExChange ||
      listExChange.length <= 0
    )
      return;
    const exchange = listExChange.find(
      (item) => item.title === currentCurrency
    );
    if (!exchange) return;
    const result = calcMoney(totalAssetsRealTime, exchange.rate);
    setTotalMoney(() => result);
  };
  const calcMoney = function (usd, exchange) { };
  const setActiveCurrentPage = function () {
    const pathname = location.pathname;
    const container = document.querySelector(".header2");
    if (!container) return;
    const listItem = container.querySelectorAll("[data-page]");
    for (const item of listItem) {
      item.classList.remove("active");
      if (item.dataset.page === pathname) {
        item.classList.add("active");
      }
    }
  };
  const renderClassShowNotify = function () {
    return notifyRedux > 0 ? "" : "--d-none";
  };
  const renderClassShowAdmin = function () {
    return isAdmin ? "" : "--d-none";
  };
  const showModalLanguage = () => {
    setIsModalLanguageOpen(true);
  };
  const closeModalLanguage = () => {
    setIsModalLanguageOpen(false);
  };
  const renderListLanguageModal = function () {
    const countryArray = Object.entries(availableLanguageMapper).map(
      ([key, value]) => {
        return { key, value };
      }
    );
    const sortedLanguages = countryArray.sort((a, b) => {
      const valueA = a.value.toLowerCase();
      const valueB = b.value.toLowerCase();
      return valueA.localeCompare(valueB);
    });

    const setActive = function (itemLanguage) {
      return currentLanguage === itemLanguage ? "" : "--visible-hidden";
    };
    const itemClickHandle = function (language) {
      setIsShowMenu(() => false);
      closeModalLanguage();
      setCurrentLanguage(language);
      setLocalStorage(localStorageVariable.lng, language);
      i18n.changeLanguage(language);
    };

    return sortedLanguages.map(({ key, value }) => {
      return (
        <li
          key={key}
          onClick={itemClickHandle.bind(null, key)}
          className="p-3 d-flex alignItem-c justify-sb p-3 hover-p"
        >
          <div className="d-flex alignItem-c justify-start gap-2">
            <span>
              <img
                alt={value}
                src={process.env.PUBLIC_URL + `/img/icon${key}.png`}
              />
            </span>
            <span>{value}</span>
          </div>
          <div className={`header2__LanguageModal__stick ${setActive(key)}`}>
            <i className="fa-solid fa-check"></i>
          </div>
        </li>
      );
    });
  };
  const showModalCurrency = () => {
    setIsModalCurrencyOpen(true);
  };
  const closeModalCurrency = () => {
    setIsModalCurrencyOpen(false);
  };
  const renderListCurrencyModal = function () {
    const exchangeArray = listExChange.map((item) => item.title).sort();

    const setActive = function (itemCurrency) {
      return currentCurrency === itemCurrency ? "" : "--visible-hidden";
    };
    const itemClickHandle = function (key) {
      setLocalStorage(localStorageVariable.currency, key);
      setCurrentCurrency(() => key);
      closeModalCurrency();
      dispatch(currencySetCurrent(key));
      setIsShowMenu(false);
    };

    return exchangeArray.map((item) => (
      <li
        key={item}
        onClick={itemClickHandle.bind(null, item)}
        className="p-3 d-flex alignItem-c justify-sb p-3 hover-p"
      >
        <div className="d-flex alignItem-c justify-start gap-2">
          <span>{item}</span>
        </div>
        <div className={`header2__LanguageModal__stick ${setActive(item)}`}>
          <i className="fa-solid fa-check"></i>
        </div>
      </li>
    ));
  };
  const showModalAccountInfo = () => {
    setIsModalAccInfoOpent(true);

    // call api login wallet
    callApiLoginWallet()
  }
  const closeModalAccountInfo = () => {
    setIsModalAccInfoOpent(false);
  }
  const callApiLoginWallet = async () => {
    try {
      if (callApiLoginWalletStatus === api_status.fetching) return;
      setCallApiLoginWalletStatus(api_status.fetching);
      const userId = getLocalStorage(localStorageVariable.user)?.id;
      const resp = await loginWallet({ idUser: userId });
      console.log(resp.data.data);
      const allWallet = [resp.data.data.infoUserLogin, ...resp.data.data.wallet];
      const currentUsdtBalance = allWallet.filter(item => item === userId)?.USDT_balance;
      setCurrentWalletUsdtBalance(currentUsdtBalance)
      setCallApiLoginWalletStatus(api_status.fulfilled);
    } catch (error) {
      console.log(error);
      setCallApiLoginWalletStatus(api_status.rejected);
    }
  }

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    setCurrentLanguage(language);

    document.addEventListener("click", closeMenu);
    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);
  useEffect(() => {
    renderTotalMoney();
  }, [totalAssetsRealTime, listExChange, currencyFromRedux]);
  useEffect(() => {
    setActiveCurrentPage();
  }, [location]);

  return (
    <>
      <header className="header2 fadeInTopToBottom">
        <div className="container">
          <div className="logo" onClick={() => history.push("/")}>
            <img src="/img/logowhite.png" alt="Remitano Logo" />
          </div>
          <div className={`menu ${renderClassShowMenu()}`}>
            <div
              data-page={url.swap}
              className="navlink"
              onClick={redirectPageClickHandle}
            >
              {t("swap")}
            </div>
            <div
              onClick={redirectPageClickHandle}
              className="navlink"
              data-page={url.p2pTrading}
            >
              {t("p2pTrading")}
            </div>
            <div
              onClick={redirectPageClickHandle}
              className={`navlink ${renderClassShowAdmin()}`}
              data-page={url.admin_user}
            >
              {t("admin")}
            </div>
          </div>
          <div onClick={barButtonClickHandle} className="bar-button">
            <i className="fa-solid fa-bars-staggered"></i>
          </div>
          <div className={`header2__right ${renderClassShowMenu()}`}>
            <div className="header2__language">
              <div
                onClick={languageToggle}
                className="header2__language-seletor"
              >
                <img
                  src={
                    process.env.PUBLIC_URL + `/img/icon${currentLanguage}.png`
                  }
                  alt="language"
                />
              </div>
              <div
                className={`header2__language-menu ${renderClassShowMenuLanguage()}`}
              >
                {renderMenuLanguage()}
              </div>
            </div>
            <div
              onClick={showModalLanguage}
              className="header2__languageModalButton alignItem-c justify-sb py-2"
            >
              <div className="d-f gap-2 alignItem-c justify-start">
                <span>
                  <i className="fa-solid fa-globe"></i>
                </span>
                <span>{t("language")}</span>
              </div>
              <div className="d-flex gap-2">
                <span>
                  <img
                    src={
                      process.env.PUBLIC_URL + `/img/icon${currentLanguage}.png`
                    }
                  />
                </span>
                <span>{availableLanguageMapper[currentLanguage]}</span>
                <span>
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
            </div>
            <div className={`header2__currency`}>
              <div
                onClick={currencyToggle}
                className="header2__currency-selector"
              >
                {currentCurrency}
              </div>
              <div
                className={`header2__currrency-menu ${renderClassShowMenuCurrency()}`}
              >
                {renderListCurrency()}
              </div>
            </div>
            <div
              onClick={showModalCurrency}
              className="header2__languageModalButton alignItem-c justify-sb py-2"
            >
              <div className="d-flex alignItem-c justify-c gap-2">
                <span>
                  <i className="fa-solid fa-money-bill-wheat"></i>
                </span>
                <span>{t("currency")}</span>
              </div>
              <div className="d-flex alignItem-c justify-c gap-2">
                <span>{currentCurrency}</span>
                <span>
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
            </div>
            <div
              className={`header2__wallet ${renderClassWithLogin(
                "",
                "--d-none"
              )}`}
            >
              <span
                className={`${renderClassShowNotify()} header2__wallet__bag`}
              >
                <i className="fa-regular fa-clock"></i>
              </span>
              <div onClick={walletToggle} className="header2__wallet-title">
                {t("wallet")}
              </div>
              <div
                className={`header2__wallet-menu ${renderClassShowMenuWallet()}`}
              >
                <div
                  onClick={redirectPageClickHandle}
                  data-page={url.wallet}
                  className="header2__wallet-item"
                >
                  <i className="fa-solid fa-wallet"></i>
                  <span>{t("wallet")}</span>
                </div>
                <div
                  onClick={redirectPageClickHandle}
                  data-page={url.ads_history}
                  className="header2__wallet-item"
                >
                  <i className="fa-solid fa-rectangle-ad"></i>
                  <span>{t("advertisingHistory")}</span>
                </div>
                <div
                  onClick={redirectPageClickHandle}
                  data-page={url.p2p_management}
                  className="header2__wallet-item"
                >
                  <span
                    className={`${renderClassShowNotify()} header2__wallet-item-bag`}
                  >
                    {notifyRedux}
                  </span>
                  <i className="fa-solid fa-comments-dollar"></i>
                  <span>{t("p2PHistory")}</span>
                </div>
              </div>
            </div>
            <div
              className={`header2__user ${renderClassWithLogin(
                "",
                "--d-none"
              )}`}
            >
              <div onClick={userToggle} className="header2__username">
                {username}
              </div>
              <div
                className={`header2__user-info ${renderClassShowMenuUser()}`}
              >
                <div
                  onClick={redirectPageClickHandle}
                  data-page={url.profile}
                  className="header2__user-info-item"
                >
                  <i className="fa-regular fa-user"></i>
                  <span>{t("profile")}</span>
                </div>
                <div
                  onClick={showModalAccountInfo}
                  className="header2__user-info-item"
                >
                  <i className="fa-solid fa-id-badge"></i>
                  <span>{accountName}</span>
                </div>
                <div onClick={logout} className="header2__user-info-item">
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>{t("logOut")}</span>
                </div>
              </div>
            </div>
            <div
              onClick={redirectLogin}
              className={`header2__login ${renderClassWithLogin(
                "--d-none",
                ""
              )}`}
            >
              {t("login")}
              {" / "}
              {t("register")}
            </div>
          </div>
        </div>
      </header>
      <Modal
        open={isModalLanguageOpen}
        onCancel={closeModalLanguage}
        header={null}
        footer={null}
        wrapClassName="header2__LanguageModal"
      >
        <ul className="header2__LanguageModal__content">
          <li
            onClick={closeModalLanguage}
            key={-1}
            className="header2__LanguageModal__header p-3 d-flex alignItem-c justify-sb p-3 bb-1"
          >
            <span>{t("language")}</span>
            <span className="hover-p">
              <i className="fa-solid fa-xmark"></i>
            </span>
          </li>
          {renderListLanguageModal()}
        </ul>
      </Modal>
      <Modal
        header={null}
        footer={null}
        wrapClassName="header2__LanguageModal"
        open={isModalCurrencyOpen}
        onCancel={closeModalCurrency}
      >
        <ul className="header2__LanguageModal__content">
          <li
            onClick={closeModalCurrency}
            key={-1}
            className="header2__LanguageModal__header p-3 d-flex alignItem-c justify-sb p-3 bb-1"
          >
            <span>{t("currency")}</span>
            <span className="hover-p">
              <i className="fa-solid fa-xmark"></i>
            </span>
          </li>
          {renderListCurrencyModal()}
        </ul>
      </Modal>
      <Modal
        header={null}
        footer={null}
        wrapClassName="header2__LanguageModal"
        open={isModalAccInfoOpent}
        onCancel={closeModalAccountInfo}
      >
        <ul className="header2__LanguageModal__content">
          <li
            onClick={closeModalAccountInfo}
            key={-1}
            className="header2__LanguageModal__header p-3 d-flex alignItem-c justify-sb p-3 bb-1"
          >
            <span>{t("account")}</span>
            <span className="hover-p">
              <i className="fa-solid fa-xmark"></i>
            </span>
          </li>
          <div className="header2__accountInfo">
            <div>
              {accountName}
              <i className="fa-solid fa-angle-down"></i>
            </div>
            <div>account</div>
            <div>{currentWalletUsdtBalance} USDT</div>
            <div>
              <Spin />
            </div>
          </div>
        </ul>
      </Modal>
    </>
  );
}
