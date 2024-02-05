import React, { useEffect, useState, useRef } from "react";
import { Spin } from "antd";
import { Input, inputColor, inputType } from "../Common/Input";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  api_status,
  currency,
  currencyMapper,
  defaultLanguage,
  localStorageVariable,
  regularExpress,
  url,
} from "src/constant";
import {
  createP2p,
  getListBanking,
  searchBuyQuick,
} from "src/util/userCallApi";
import {
  formatCurrency,
  formatStringNumberCultureUS,
  getLocalStorage,
  getRandomElementFromArray,
  observeWidth,
  processString,
  roundIntl,
} from "src/util/common";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import i18n, {
  availableLanguage,
  availableLanguageCodeMapper,
} from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { math } from "src/App";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";
import { Button } from "../Common/Button";

function TransactionBuy() {
  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const history = useHistory();
  const amount = getLocalStorage(localStorageVariable.coinFromP2pExchange || 0); // Number of coins sent from p2pExchange
  const selectedCoin = getLocalStorage(
    localStorageVariable.coinNameFromP2pExchange
  );
  const { t } = useTranslation();
  const getExchangeRateDisparityFromRedux = useSelector(
    getExchangeRateDisparity
  );
  const [callApiLoadTraderStatus, setCallApiLoadTraderStatus] = useState(
    api_status.pending
  );
  const [callApiLoadPaymentStatus, setCallApiLoadPaymentStatus] = useState(
    api_status.pending
  );
  const [callApiCreateP2p, setCallApiCreateP2p] = useState(api_status.pending);

  const [selectedDropdownTrader, setSelectedDropdownTrader] = useState({
    userName: t("random"),
  }); // variable used to display on the interface, dropdown trader
  const [selectedTrader, setSelectedTrader] = useState();
  const [listTrader, setListTrader] = useState();
  const [isShowDropdownTrader, setIsShowDropdownTrader] = useState(false);
  const [isShowDropdownPayment, setIsShowDropdownPayment] = useState(false);
  const [userListBank, setUserListBank] = useState();
  const [selectedBank, setSelectedBank] = useState();
  const currencyRedux = useSelector(getCurrent);
  const listCoinRealTime = useSelector(getListCoinRealTime);
  const exchangeRedux = useSelector(getExchange);
  const [price, setPrice] = useState();
  const [showComponentSpin, setShowComponentSpin] = useState(true);
  const [inputPadding, setInputPadding] = useState(0);

  const inputCoinElement = useRef();
  const inputMoneyElement = useRef();
  const control = useRef({
    amount: "amount",
  });
  const [eulaChecked, setEulaChecked] = useState(false);
  const touchedControl = useRef({});
  const [errorControl, setErrorControl] = useState({});
  const hasRunFlag = useRef(false); // variable to identify a function that is run once
  const isSelectedDropdownRandom = useRef(true); // for multilingual part

  const validate = function () {
    let valid = true;
    if (touchedControl.current[control.current.amount]) {
      const moneyInput = inputMoneyElement.current?.value;
      const coinString = inputCoinElement.current?.value.replaceAll(",", "");
      const availableCoin =
        selectedTrader.amount - selectedTrader.amountSuccess;
      let amountValid = true;

      // range
      if (regularExpress.strongCheckNumber.test(coinString)) {
        if (
          +coinString > selectedTrader.amount ||
          +coinString > availableCoin
        ) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => {
            return {
              ...error,
              [control.current.amount]: "tooBig",
            };
          });
        }
        if (+coinString < selectedTrader.amountMinimum) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => {
            return {
              ...error,
              [control.current.amount]: "tooSmall",
            };
          });
        }
      }
      // require
      if (!moneyInput) {
        valid &= false;
        amountValid &= false;
        setErrorControl((error) => {
          return {
            ...error,
            [control.current.amount]: "require",
          };
        });
      }
      // remove error
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
  const validationPageLoad = function () {
    if (!isLogin) {
      history.push(url.login);
      return;
    }
  };
  const renderTraderSpin = function () {
    if (callApiLoadTraderStatus === api_status.fetching) return "";
    else return "--d-none";
  };
  const fetchApiTrader = function () {
    return new Promise((resolve) => {
      if (callApiLoadTraderStatus === api_status.fetching)
        return resolve(false);
      else setCallApiLoadTraderStatus(() => api_status.fetching);
      searchBuyQuick({
        limit: 100,
        page: 1,
        symbol: selectedCoin,
        amount,
      })
        .then((resp) => {
          setCallApiLoadTraderStatus();
          setListTrader(() => resp.data.data.array);
          return resolve(resp.data.data.array);
        })
        .catch((err) => {
          setCallApiLoadTraderStatus(api_status.rejected);
          return resolve(false);
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
  const traderSelect = function (item) {
    setSelectedTrader(() => item);
    setSelectedDropdownTrader(() => item);
    isSelectedDropdownRandom.current = false;
  };
  const renderClassAdsSpin = function () {
    return callApiLoadTraderStatus === api_status.fetching ? "" : "--d-none";
  };
  const traderRandomSelect = function () {
    setSelectedDropdownTrader(() => ({ userName: t("random") }));
    setSelectedTrader(() => getRandomElementFromArray(listTrader));
    isSelectedDropdownRandom.current = true;
  };
  const closeAllDrodown = function () {
    setIsShowDropdownTrader(() => false);
    setIsShowDropdownPayment(() => false);
  };
  const dropdownTraderToggle = function (e) {
    e.stopPropagation();
    const showFlag = isShowDropdownTrader;
    closeAllDrodown();
    setIsShowDropdownTrader(() => !showFlag);
  };
  const dropdownPaymentToggle = function (e) {
    e.stopPropagation();
    const showFlag = isShowDropdownPayment;
    closeAllDrodown();
    setIsShowDropdownPayment(() => !showFlag);
  };
  const renderClassTraderMenu = function () {
    return isShowDropdownTrader ? "show" : "";
  };
  const renderAdsInfo = function () {
    if (!selectedTrader) return;
    return (
      <>
        <div className="transaction__box-item">
          <span>{t("price")}:</span>
          <span className="hightLightNumber red">{price}</span>
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
          setCallApiLoadPaymentStatus(() => api_status.rejected);
          return reject(false);
        });
    });
  };
  const firstLoad = function () {
    fetchApiTrader().then((resp) => {
      setSelectedDropdownTrader(() => ({ userName: t("random") }));
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
  };
  const loadInputMoney = function () {
    let result;
    let amount = +getLocalStorage(localStorageVariable.moneyFromP2pExchange);
    if (!amount) {
      amount = +getLocalStorage(localStorageVariable.coinFromP2pExchange) || 0;
      result = calcVnd(listCoinRealTime, selectedCoin, exchangeRedux, amount);
    } else {
      const vnd = calVNDFromOtherCurrencies(
        exchangeRedux,
        currencyRedux,
        amount
      );
      result = vnd;
    }
    inputMoneyElement.current.value = formatCurrency(
      availableLanguage.en,
      currency.vnd,
      result,
      false
    );
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
  const renderClassDropdownPaymentMenu = function () {
    return isShowDropdownPayment ? "show" : "";
  };
  const renderClassPaymentSpin = function () {
    return callApiLoadPaymentStatus === api_status.fetching ? "" : "--d-none";
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
  const renderPaymentDropdownSelected = function () {
    if (!selectedBank) return;
    return `${selectedBank.name_banking} (${selectedBank.owner_banking}: ${selectedBank.number_banking})`;
  };
  const inputCoinFocusHandle = function () {
    touchedControl.current[control.current.amount] = true;
    validate();
  };
  const inputCoinChangeHandle = function () {
    formatValueInput();
    validate();
  };
  const formatValueInput = function () {
    const inputValue = inputMoneyElement.current.value;
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      inputMoneyElement.current.value = inputValue.slice(0, -1);
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    inputMoneyElement.current.value = inputValueFormated;
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
    const rateDisparityFraction = math.fraction(
      getExchangeRateDisparityFromRedux
    );

    const rateFraction = math.fraction(rate);
    const newPriceFraction = math.add(
      priceFraction,
      math
        .chain(priceFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );
    const result = math.multiply(rateFraction, newPriceFraction);
    return math.number(result);
  };
  const calcCoin = function (listCoin, coinName, exchange, vnd) {
    if (
      !listCoin ||
      listCoin.length <= 0 ||
      !coinName ||
      !exchange ||
      exchange.length <= 0 ||
      !vnd ||
      !getExchangeRateDisparityFromRedux
    )
      return;

    const priceUsd = listCoin.find((item) => item.name === coinName)?.price;
    const exchangeVnd = exchange.find((item) => item.title === "VND")?.rate;

    const priceUsdFraction = math.fraction(priceUsd);
    const rateDisparity = math.fraction(getExchangeRateDisparityFromRedux);
    const newPriceUsdFraction = math.add(
      priceUsdFraction,
      math.chain(priceUsdFraction).multiply(rateDisparity).divide(100).done()
    );
    const vndFraction = math.fraction(vnd);
    const exchangeVndFraction = math.fraction(exchangeVnd);

    const result = math
      .chain(vndFraction)
      .divide(exchangeVndFraction)
      .divide(newPriceUsdFraction)
      .done();
    return result;
  };
  const calcVnd = function (listCoin, coinName, exchange, amountCoin) {
    if (
      !listCoin ||
      listCoin.length <= 0 ||
      !coinName ||
      !exchange ||
      exchange.length <= 0 ||
      !amountCoin ||
      !getExchangeRateDisparityFromRedux
    )
      return 0;
    const priceUsd = listCoin.find((item) => item.name === coinName)?.price;
    const rate = exchange.find((item) => item.title === "VND")?.rate;

    const rateDisparityFraction = math.fraction(
      getExchangeRateDisparityFromRedux
    );
    const priceUsdFraction = math.fraction(priceUsd);

    const newPriceUsdFraction = math.add(
      priceUsdFraction,
      math
        .chain(priceUsdFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );
    const rateFraction = math.fraction(rate);
    const amountCoinFraction = math.fraction(amountCoin);

    const result = math
      .chain(amountCoinFraction)
      .multiply(newPriceUsdFraction)
      .multiply(rateFraction)
      .done();

    return math.number(result);
  };
  const calVNDFromOtherCurrencies = function (exchange, currency, amountMoney) {
    const rateDollarToVnd = exchange.find((item) => item.title === "VND")?.rate;
    const rateCurrentToDollar = exchange.find(
      (item) => item.title === currency
    )?.rate;

    const rateDollarToVndFraction = math.fraction(rateDollarToVnd);
    const rateCurrentToDollarFraction = math.fraction(rateCurrentToDollar);
    const amountMoneyFraction = math.fraction(amountMoney);

    const result = math
      .chain(amountMoneyFraction)
      .divide(rateCurrentToDollarFraction)
      .multiply(rateDollarToVndFraction)
      .done();

    return math.number(result);
  };
  const roundRule = function (value) {
    if (value > 10000) return 8;
    else if (value >= 100 && value <= 9999) return 6;
    else return 2;
  };
  const submitHandle = function (e) {
    e.preventDefault();
    touchedControl.current[control.current.amount] = true;
    const valid = validate();
    if (!valid) return;
    const amount = inputCoinElement.current.value.replaceAll(",", "");
    const idP2p = selectedTrader.id;
    const idBankingUser = selectedBank.id;
    fetchApiCreateP2p(amount, idP2p, idBankingUser)
      .then(() => {
        history.push(url.confirm.replace(":id", idP2p));
      })
      .catch(() => {});
  };
  const renderDisableMainButton = function () {
    const condition1 = callApiLoadTraderStatus === api_status.fetching;
    const condition2 = callApiLoadPaymentStatus === api_status.fetching;
    let condition3 = !eulaChecked;
    const condition4 = callApiCreateP2p === api_status.fetching;

    if (condition1 || condition2 || condition3 || condition4) return true;
    else return false;
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
  const renderHeader = function () {
    const str = t("buyBtcViaBankTransferVnd");
    const listSubString = ["122BU12Y122", "45BTC54"];
    const callback = function (matched, index) {
      switch (matched) {
        case listSubString.at(0):
          return (
            <span key={index} className="transaction__title-action green">
              {t("buy")}
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
  const renderClassShowComponentSpin = function () {
    return showComponentSpin ? "" : "--d-none";
  };
  const renderClassShowComponentMainContent = function () {
    return showComponentSpin ? "--d-none" : "";
  };
  const maxClickHandle = function () {
    const coinAvailable = selectedTrader.amount - selectedTrader.amountSuccess;
    const coinName = selectedTrader.symbol;
    const price = listCoinRealTime.find(
      (item) => item.name === coinName
    )?.price;
    const rate = exchangeRedux.find((item) => item.title === "VND")?.rate;

    const coinAvailableFraction = math.fraction(coinAvailable);
    const priceFraction = math.fraction(price);
    const rateFraction = math.fraction(rate);
    const rateDisparityFraction = math.fraction(
      getExchangeRateDisparityFromRedux
    );

    const priceBuyFraction = math.add(
      priceFraction,
      math
        .chain(priceFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );

    const resultFraction = math
      .chain(coinAvailableFraction)
      .multiply(priceBuyFraction)
      .multiply(rateFraction)
      .done();
    const resultString = new Intl.NumberFormat(
      availableLanguageCodeMapper.en
    ).format(math.number(resultFraction));

    inputMoneyElement.current.value = resultString;
  };

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

    const inputObserver = observeWidth(setInputPadding);
    inputObserver.observe(document.querySelector(".transaction__action"));

    return () => {
      document.removeEventListener("click", closeAllDrodown);
      inputObserver.disconnect();
    };
  }, []);
  useEffect(() => {
    // Display price in the advertising information section
    const price = calcPrice(
      listCoinRealTime,
      selectedCoin,
      exchangeRedux,
      currencyRedux
    );
    setPrice(() => formatCurrency(i18n.language, currencyRedux, price));

    // calculates the value for input coin
    try {
      const amountCoin = calcCoin(
        listCoinRealTime,
        selectedCoin,
        exchangeRedux,
        +inputMoneyElement.current.value.replaceAll(",", "")
      );
      if (!amountCoin || Number.isNaN(amountCoin)) {
        inputCoinElement.current.value = 0;
      } else {
        const price = listCoinRealTime.find(
          (item) => item.name === selectedCoin
        )?.price;
        inputCoinElement.current.value = new Intl.NumberFormat(
          currencyMapper.USD,
          roundIntl(roundRule(price))
        ).format(amountCoin);
      }
    } catch (error) {
      inputCoinElement.current.value = 0;
    }
    validate();

    // calculates the value for input vnd
    if (
      listCoinRealTime &&
      listCoinRealTime.length > 0 &&
      selectedCoin &&
      exchangeRedux &&
      exchangeRedux.length > 0 &&
      currencyRedux &&
      selectedTrader &&
      !hasRunFlag.current
    ) {
      loadInputMoney();
      hasRunFlag.current = true;
      setShowComponentSpin(() => false);
    }
  }, [
    listCoinRealTime,
    selectedCoin,
    exchangeRedux,
    currencyRedux,
    getExchangeRateDisparityFromRedux,
  ]);

  return (
    <div className={`transaction`}>
      <div
        className={`container fadeInBottomToTop ${renderClassShowComponentMainContent()}`}
      >
        <div className="box transaction__box transaction__header">
          <div>{renderHeader()}</div>
        </div>
        <div className="box transaction__box ">
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
              className={`transaction__user-menu  ${renderClassTraderMenu()}`}
            >
              <div className={`dropdown-menu`}>
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
            <div className={`transaction__input-container`}>
              <div className="transaction__input">
                <label htmlFor="amountInput">{t("iWillPay")}:</label>
                <Input
                  style={{ paddingRight: inputPadding }}
                  type={inputType.number}
                  color={inputColor.red}
                  onChange={inputCoinChangeHandle}
                  onFocus={inputCoinFocusHandle}
                  ref={inputMoneyElement}
                  errorMes={t(errorControl[control.current.amount])}
                />
                <span className="transaction__action">
                  <span className="transaction__unit">VND</span>
                  <span onClick={maxClickHandle} className="transaction__max">
                    {t("max").toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="transaction__input">
                <label htmlFor="receiveInput">{t("toReceive")}:</label>
                <Input
                  type={inputType.number}
                  color={inputColor.green}
                  ref={inputCoinElement}
                  disabled
                  style={{ paddingRight: 50 }}
                />
                <span className="transaction__action">
                  <span
                    id="receiveUnitTransaction"
                    className="transaction__unit result"
                  >
                    {selectedCoin}
                  </span>
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
            <Button
              loading={callApiCreateP2p === api_status.fetching}
              disabled={renderDisableMainButton()}
            >
              {t("buy")}
            </Button>
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
      <div className={`spin-container ${renderClassShowComponentSpin()}`}>
        <Spin />
      </div>
    </div>
  );
}

export default TransactionBuy;
