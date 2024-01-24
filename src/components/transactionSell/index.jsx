import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { Input, inputColor, inputType } from "../Common/Input";
import {
  findMin,
  formatCurrency,
  formatStringNumberCultureUS,
  getLocalStorage,
  getRandomElementFromArray,
  processString,
  roundIntl,
} from "src/util/common";
import {
  api_status,
  currencyMapper,
  defaultLanguage,
  localStorageVariable,
  regularExpress,
  url,
} from "src/constant";
import i18n, { availableLanguage } from "src/translation/i18n";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  createP2p,
  getListBanking,
  searchSellQuick,
} from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { useTranslation } from "react-i18next";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";
import { math } from "src/App";
import { getUserWallet } from "src/redux/constant/coin.constant";

function TransactionSell() {
  const amount = getLocalStorage(localStorageVariable.coinFromP2pExchange || 0);

  const selectedCoin = getLocalStorage(
    localStorageVariable.coinNameFromP2pExchange
  );
  const exchangeRedux = useSelector(getExchange);
  const currencyRedux = useSelector(getCurrent);
  const userWalletRedux = useSelector(getUserWallet);
  const listCoinRealTime = useSelector(getListCoinRealTime);
  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const getExchangeRateDisparityFromRedux = useSelector(
    getExchangeRateDisparity
  );
  const { t } = useTranslation();
  const history = useHistory();

  const [selectedDropdownTrader, setSelectedDropdownTrader] = useState({
    userName: t("random"),
  }); // variable used to display on the interface, dropdown trader
  const [price, setPrice] = useState();
  const [isShowDropdownTrader, setIsShowDropdownTrader] = useState(false);
  const [isShowDropdownPayment, setIsShowDropdownPayment] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState();
  const [selectedBank, setSelectedBank] = useState();
  const [userListBank, setUserListBank] = useState();
  const [listTrader, setListTrader] = useState();
  const [errorControl, setErrorControl] = useState({});
  const [callApiCreateP2p, setCallApiCreateP2p] = useState(api_status.pending);
  const [eulaChecked, setEulaChecked] = useState(false);
  const [showComponentLoader, setShowComponentLoader] = useState(true);

  const touchedControl = useRef({});
  const control = useRef({
    amount: "amount",
  });
  const payInputElement = useRef();
  const receiveInputElement = useRef();
  const isSelectedDropdownRandom = useRef(true); // for multilingual part
  const numberCoinsOwned = useRef(-1);

  const [callApiLoadPaymentStatus, setCallApiLoadPaymentStatus] = useState(
    api_status.pending
  );
  const [callApiLoadTraderStatus, setCallApiLoadTraderStatus] = useState(
    api_status.pending
  );

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        isSelectedDropdownRandom.current &&
          setSelectedDropdownTrader({ userName: t("random") });
      }
      currentLanguage = newLanguage;
    });
    validationPageLoad();
    firstLoad();
    document.addEventListener("click", closeAllDrodown);
    return () => {
      document.removeEventListener("click", closeAllDrodown);
    };
  }, []);
  useEffect(() => {
    const price = calcPrice(
      listCoinRealTime,
      selectedCoin,
      exchangeRedux,
      currencyRedux
    );
    setPrice(() => formatCurrency(i18n.language, currencyRedux, price));
    // Calculate the value for the received input
    const amountCoin = payInputElement.current?.value?.replaceAll(",", "");
    const amountVnd = calcVND(
      listCoinRealTime,
      selectedCoin,
      exchangeRedux,
      amountCoin
    );
    if (!amountVnd || isNaN(amountVnd)) {
      receiveInputElement.current.value = 0;
    } else {
      receiveInputElement.current.value = formatCurrency(
        availableLanguage.en,
        "VND",
        amountVnd,
        false
      );
    }
  }, [
    listCoinRealTime,
    selectedCoin,
    exchangeRedux,
    currencyRedux,
    getExchangeRateDisparityFromRedux,
  ]);
  useEffect(() => {
    if (!userWalletRedux || userWalletRedux.length <= 0) return;
    setCoinOwned();
  }, [userWalletRedux]);
  useEffect(() => {
    if (
      selectedTrader &&
      userWalletRedux &&
      Object.keys(userWalletRedux).length > 0
    )
      setShowComponentLoader(() => false);
  }, [selectedTrader, userWalletRedux]);

  const validationPageLoad = function () {
    if (!isLogin) {
      history.push(url.login);
      return;
    }
  };
  const closeAllDrodown = function () {
    setIsShowDropdownTrader(() => false);
    setIsShowDropdownPayment(() => false);
  };
  const renderClassPaymentDropdown = function () {
    if (
      callApiLoadPaymentStatus !== api_status.fetching &&
      userListBank &&
      userListBank.length > 0
    )
      return "";
    else return "--d-none";
  };
  const dropdownTraderToggle = function (e) {
    e.stopPropagation();
    const showFlag = isShowDropdownTrader;
    closeAllDrodown();
    setIsShowDropdownTrader(() => !showFlag);
  };
  const renderClassTraderMenu = function () {
    return isShowDropdownTrader ? "show" : "";
  };
  const fetchApiTrader = function () {
    return new Promise((resolve) => {
      if (callApiLoadTraderStatus === api_status.fetching)
        return resolve(false);
      else setCallApiLoadTraderStatus(api_status.fetching);
      searchSellQuick({
        limit: 100,
        page: 1,
        symbol: selectedCoin,
        amount,
      })
        .then((resp) => {
          setListTrader(() => resp.data.data.array);
          setCallApiLoadTraderStatus(api_status.fulfilled);
          return resolve(resp.data.data.array);
        })
        .catch((err) => {
          console.log(err);
          setCallApiLoadTraderStatus(api_status.rejected);
          return resolve(false);
        });
    });
  };
  const firstLoad = function () {
    fetchApiTrader().then((resp) => {
      setSelectedDropdownTrader(() => ({ userName: "Random" }));
      setSelectedTrader(() => getRandomElementFromArray(resp));
    });

    fetchApiGetListBank()
      .then((resp) => {
        if (resp) {
          if (!resp || resp.length <= 0) {
            callToastError(t("noBankFoundInAccount"));
            history.push(url.profile);
          }
          setUserListBank(() => resp);
          setSelectedBank(() => resp.at(0));
        }
      })
      .catch((err) => {
        callToastError(t("can'tFindUserInformation"));
        history.push(url.profile);
        return;
      });

    payInputElement.current.value = new Intl.NumberFormat(
      currencyMapper.USD,
      roundIntl(10)
    ).format(amount);
  };
  const setCoinOwned = function () {
    const amountCoin = userWalletRedux[selectedCoin.toLowerCase() + "_balance"];
    numberCoinsOwned.current = amountCoin;
  };
  const fetchApiGetListBank = function () {
    return new Promise((resolve, reject) => {
      if (callApiLoadPaymentStatus === api_status.fetching)
        return resolve(false);
      else setCallApiLoadPaymentStatus(() => api_status.fetching);
      getListBanking({
        limit: "100",
        page: "1",
      })
        .then((resp) => {
          setCallApiLoadPaymentStatus(() => api_status.fulfilled);
          return resolve(resp.data.data.array);
        })
        .catch((err) => {
          console.log(err);
          setCallApiLoadPaymentStatus(() => api_status.rejected);
          return reject(false);
        });
    });
  };
  const renderListTrader = function () {
    if (!listTrader || listTrader.length <= 0) return;
    const listResult = [];
    listResult.push(
      <span onClick={traderRandomSelect} key={-1} className="dropdown-item">
        {t("random")}
      </span>
    );
    return listResult.concat(
      listTrader.map((item) => (
        <span
          key={item.id}
          onClick={traderSelect.bind(null, item)}
          className="dropdown-item"
        >
          {item.userName}
        </span>
      ))
    );
  };
  const traderRandomSelect = function () {
    setSelectedDropdownTrader(() => ({ userName: t("random") }));
    setSelectedTrader(() => getRandomElementFromArray(listTrader));
    isSelectedDropdownRandom.current = true;
  };
  const traderSelect = function (item) {
    setSelectedTrader(() => item);
    setSelectedDropdownTrader(() => item);
    isSelectedDropdownRandom.current = false;
  };
  const renderTraderSpin = function () {
    if (callApiLoadTraderStatus === api_status.fetching) return "";
    else return "--d-none";
  };
  const renderClassPaymentSpin = function () {
    return callApiLoadPaymentStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderPaymentDropdownSelected = function () {
    if (!selectedBank) return;
    return `${selectedBank.name_banking} (${selectedBank.owner_banking}: ${selectedBank.number_banking})`;
  };
  const dropdownPaymentToggle = function (e) {
    e.stopPropagation();
    const showFlag = isShowDropdownPayment;
    closeAllDrodown();
    setIsShowDropdownPayment(() => !showFlag);
  };
  const renderClassDropdownPaymentMenu = function () {
    return isShowDropdownPayment ? "show" : "";
  };
  const renderUserListBank = function () {
    if (!userListBank || userListBank.length <= 0) return;
    return userListBank.map((item) => (
      <div
        onClick={bankClickHandle.bind(null, item)}
        key={item.id}
        className="dropdown-item"
      >
        {`${item.name_banking} (${item.owner_banking}: ${item.number_banking})`}
      </div>
    ));
  };
  const bankClickHandle = function (item) {
    setSelectedBank(() => item);
  };
  const renderAdsInfo = function () {
    if (!selectedTrader) return;
    return (
      <>
        <div className="transaction__box-item">
          <span>{t("price")}:</span>
          <span className="hightLightNumber green">{price}</span>
        </div>
        <div className="transaction__box-item amount">
          <span>{t("amountLimits")}:</span>
          <span className="transaction__box-amount-container">
            <span className="transaction__box-amount">
              {selectedTrader.amountMinimum}
            </span>{" "}
            <span className="transaction__box-amount-dash">-</span>{" "}
            <span className="transaction__box-amount">
              {selectedTrader.amount}
            </span>
          </span>
        </div>
        <div className="transaction__box-item">
          <span>{t("available")}: </span>
          <span className="transaction--bold">
            {selectedTrader.amount - selectedTrader.amountSuccess}
          </span>
        </div>
        <div className="transaction__box-item">
          <span>{t("method")}:</span>
          <span className="transaction--bold">{selectedTrader.bankName}</span>
        </div>
        <div className="transaction__box-item">
          <span>{t("paymentWindow")}:</span>
          <span>15 {t("minutes")}</span>
        </div>
      </>
    );
  };
  const renderClassAdsSpin = function () {
    return callApiLoadTraderStatus === api_status.fetching ? "" : "--d-none";
  };
  const calcPrice = function (listCoin, coinName, exchange, currency) {
    if (
      !listCoin ||
      listCoin.length <= 0 ||
      !coinName ||
      !exchange ||
      exchange.length <= 0 ||
      !currency ||
      !getExchangeRateDisparityFromRedux
    )
      return;
    const price = listCoin.find((item) => item.name === coinName)?.price;
    const rate = exchange.find((item) => item.title === currency)?.rate;
    const priceFraction = math.fraction(price);
    const rateFranction = math.fraction(rate);
    const rateDisparityFranction = math.fraction(
      getExchangeRateDisparityFromRedux
    );
    const newPriceFranction = math.add(
      priceFraction,
      math
        .chain(priceFraction)
        .multiply(rateDisparityFranction)
        .divide(100)
        .done()
    );
    return math.number(math.multiply(newPriceFranction, rateFranction));
  };
  const renderHeader = function () {
    const str = t("sellEthViaBankTransferVnd");
    const listSubString = ["122se12ll122", "45BTC54"];
    const callback = function (matched, index) {
      switch (matched) {
        case listSubString.at(0):
          return (
            <span key={index} className="transaction__title-action red">
              {t("sell")}
            </span>
          );
        case listSubString.at(1):
          return selectedCoin;
        default:
          break;
      }
    };
    return processString(str, listSubString, callback);
  };
  const formatValueInput = function () {
    const inputValue = payInputElement.current.value;
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      payInputElement.current.value = inputValue.slice(0, -1);
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    payInputElement.current.value = inputValueFormated;
  };
  const payInputChangeHandle = function () {
    formatValueInput();
    validate();
  };
  const validate = function () {
    let valid = true;
    if (touchedControl.current[control.current.amount]) {
      let amountValid = true;
      const coinInput = payInputElement.current?.value;
      // range
      const numberString = coinInput.replaceAll(",", "");
      const amountAvailable =
        selectedTrader.amount - selectedTrader.amountSuccess;
      if (regularExpress.strongCheckNumber.test(numberString)) {
        if (
          +numberString > amountAvailable ||
          +numberString > selectedTrader.amount
        ) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => ({
            ...error,
            [control.current.amount]: t("Too big."),
          }));
        }
        if (+numberString > numberCoinsOwned.current) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => ({
            ...error,
            [control.current.amount]: t("Insufficient wallet balance."),
          }));
        }
        if (+numberString < selectedTrader.amountMinimum) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => ({
            ...error,
            [control.current.amount]: t("Too small."),
          }));
        }
      }
      // require
      if (!coinInput) {
        valid &= false;
        amountValid &= false;
        setErrorControl((error) => {
          return {
            ...error,
            [control.current.amount]: t("require"),
          };
        });
      }
      // clear error
      if (amountValid) {
        setErrorControl((error) => {
          const newError = { ...error };
          delete newError[control.current.amount];
          return newError;
        });
      }
    }

    return Object.keys(touchedControl).length <= 0 ? false : Boolean(valid);
  };
  const inputCoinFocusHandle = function () {
    touchedControl.current[control.current.amount] = true;
    validate();
  };
  const calcVND = function (listCoin, selectedCoin, exchange, amountCoin) {
    if (
      !listCoin ||
      listCoin.length <= 0 ||
      !selectedCoin ||
      !exchange ||
      exchange.length <= 0 ||
      !amountCoin ||
      !getExchangeRateDisparityFromRedux
    )
      return;
    const priceUsd = listCoin.find((item) => item.name === selectedCoin)?.price;
    const rate = exchange.find((item) => item.title === "VND")?.rate;

    const rateFraction = math.fraction(rate);
    const amountCoinFraction = math.fraction(amountCoin);
    const priceUsdFraction = math.fraction(priceUsd);
    const rateDisparityFraction = math.fraction(
      getExchangeRateDisparityFromRedux
    );
    const newPriceUsdFraction = math.subtract(
      priceUsdFraction,
      math
        .chain(priceUsdFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );

    const result = math
      .chain(amountCoinFraction)
      .multiply(rateFraction)
      .multiply(newPriceUsdFraction)
      .done();
    return math.number(result);
  };
  const eulaCheckboxChangeHandle = function () {
    setEulaChecked(!eulaChecked);
  };
  const fetchApiCreateP2p = function (amount, idP2p, idBankingUser) {
    return new Promise((resolve, reject) => {
      if (callApiCreateP2p === api_status.fetching) reject(false);
      else setCallApiCreateP2p(() => api_status.fetching);

      createP2p({
        amount,
        idP2p,
        idBankingUser,
      })
        .then((resp) => {
          callToastSuccess(t("success"));
          setCallApiCreateP2p(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((err) => {
          console.log(err);
          const mess = err.response.data.message;
          switch (mess) {
            case "You cannot buy your own advertising":
              callToastError(t("youCannotBuyYourOwnAdvertising"));
              break;
            case "The quantity is too small to create an order":
              callToastError(t("theQuantityIsTooSmallToCreateAnOrder"));
              break;
            case "The quantity is too much and the order cannot be created":
              callToastError(
                t("theQuantityIsTooMuchAndTheOrderCannotBeCreated")
              );
              break;
            case "Your balance is insufficient":
              callToastError(t("theAmountOfCryptocurrencyIsInsufficient"));
              break;
            case "You have a transaction order that has not yet been processed":
              callToastError(
                t("youHaveATransactionOrderThatHasNotYetBeenProcessed")
              );
              break;
            default:
              break;
          }
          setCallApiCreateP2p(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const renderClassMainButton = function () {
    const condition1 = callApiLoadTraderStatus === api_status.fetching;
    const condition2 = callApiLoadPaymentStatus === api_status.fetching;
    let condition3 = !eulaChecked;
    const condition4 = callApiCreateP2p === api_status.fetching;

    if (condition1 || condition2 || condition3 || condition4) return "disable";
    else return "";
  };
  const maxClickHandle = function (e) {
    e.stopPropagation();
    const result = findMin(
      numberCoinsOwned.current,
      selectedTrader.amount,
      selectedTrader.amount - selectedTrader.amountSuccess
    );
    payInputElement.current.value = result;
  };
  const submitHandle = function (e) {
    e.preventDefault();
    touchedControl.current[control.current.amount] = true;
    const valid = validate();
    if (!valid) return;
    const amount = payInputElement.current.value.replaceAll(",", "");
    const idP2p = selectedTrader.id;
    const idBankingUser = selectedBank.id;
    fetchApiCreateP2p(amount, idP2p, idBankingUser)
      .then(() => {
        history.push(url.confirm.replace(":id", idP2p));
      })
      .catch((error) => {});
  };
  const renderClassSpinComponent = function () {
    return showComponentLoader ? "" : "--d-none";
  };
  const renderClassMainContent = function () {
    return showComponentLoader ? "--d-none" : "";
  };

  return (
    <div className={`transaction `}>
      <div
        className={`container fadeInBottomToTop ${renderClassMainContent()}`}
      >
        <div className="box transaction__box transaction__header">
          <div>{renderHeader()}</div>
        </div>
        <div className="box transaction__box">
          <div className="transaction__user-dropdown">
            <label>{t("trader")}:</label>
            <div
              onClick={dropdownTraderToggle}
              className="transaction__user-selected"
            >
              <span>{selectedDropdownTrader.userName}</span>
              <span>
                <i className="fa-solid fa-caret-down"></i>
              </span>
            </div>
            <div
              className={`transaction__user-menu ${renderClassTraderMenu()}`}
            >
              <div className="dropdown-menu ">
                {renderListTrader()}
                <div className={`spin-container ${renderTraderSpin()}`}>
                  <Spin />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="box transaction__box">
          <form onSubmit={submitHandle}>
            <div className={`transaction__input-container `}>
              <div className="transaction__input">
                <label>{t("iPay")}:</label>
                <Input
                  color={inputColor.red}
                  ref={payInputElement}
                  onChange={payInputChangeHandle}
                  type={inputType.number}
                  onFocus={inputCoinFocusHandle}
                  errorMes={errorControl[control.current.amount]}
                />
                <span className="transaction__action">
                  <span className="transaction__unit">{selectedCoin}</span>
                  <span onClick={maxClickHandle} className="transaction__max">
                    MAX
                  </span>
                </span>
              </div>
              <div className="transaction__input">
                <label>{t("toReceive")}:</label>
                <Input
                  color={inputColor.green}
                  ref={receiveInputElement}
                  disabled
                  type={inputType.number}
                />
                <span className="transaction__action">
                  <span className="transaction__unit">VND</span>
                </span>
              </div>
            </div>
            <div
              className={`transaction__dropdown ${renderClassPaymentDropdown()}`}
            >
              <label htmlFor="amountInput">{t("chooseYourPayment")}:</label>
              <div
                onClick={dropdownPaymentToggle}
                className="transaction__payment-dropdown"
              >
                <div className="transaction__payment-dropdown-text">
                  {renderPaymentDropdownSelected()}
                </div>
                <span>
                  <i className="fa-solid fa-caret-down"></i>
                </span>
              </div>
              <div
                className={`transaction__payment-dropdown-menu-container ${renderClassDropdownPaymentMenu()}`}
              >
                <div className="dropdown-menu">{renderUserListBank()}</div>
              </div>
            </div>
            <div className={`spin-container ${renderClassPaymentSpin()}`}>
              <Spin />
            </div>
            <input
              checked={eulaChecked}
              onChange={eulaCheckboxChangeHandle}
              id="agreeCheckBox"
              type="checkbox"
              className="--d-none"
            />
            <label className="transaction__checkbox" htmlFor="agreeCheckBox">
              <div className="transaction__checkbox-square">
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="transaction__checkbox-text">
                {t("byClickingContinueYouAgreeToSerepays")}{" "}
                <span className="transaction--green-header">
                  {t("p2PTermsOfService")}
                </span>
              </div>
            </label>
            <button className={renderClassMainButton()} type="submit">
              {t("sell")}
            </button>
          </form>
        </div>
        <h3 className="transaction__title transaction--bold">
          {t("advertisementInformations")}
        </h3>
        <div className="box transaction__box">
          {renderAdsInfo()}
          <div className={`spin-container ${renderClassAdsSpin()}`}>
            <Spin />
          </div>
        </div>
        <div className="box transaction__box">
          <div className="transaction__chat-container">
            <div className="transaction__chat-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <div className="transaction__chat">
              <div className="transaction__chat-header">
                {t("needMoreHelp")}
              </div>
              <div className="transaction__chat-text">
                {t("contactCustomerSupportVia")}{" "}
                <span className="transaction__chat-support">
                  {t("onlineSupport")}.
                </span>{" "}
                {t("weAreAlwaysReadyToHelp")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`spin-container ${renderClassSpinComponent()}`}>
        <Spin />
      </div>
    </div>
  );
}

export default TransactionSell;
