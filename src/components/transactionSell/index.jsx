import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { Input, inputColor, inputType } from "../Common/Input";
import {
  findMin,
  formatCurrency,
  formatStringNumberCultureUS,
  getLocalStorage,
  getRandomElementFromArray,
  observeWidth,
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
import { math } from "src/App";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { Button, htmlType } from "../Common/Button";
import Dropdown from "../Common/dropdown/Dropdown";
import { getListBank } from "src/redux/reducers/bankSlice";
import { getExchangeRateSell } from "src/redux/reducers/exchangeRateSellSlice";

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
  const getExchangeRateDisparityFromRedux = useSelector(getExchangeRateSell);
  const { t } = useTranslation();
  const history = useHistory();
  const listBankRedux = useSelector(getListBank);

  const [selectedDropdownTrader, setSelectedDropdownTrader] = useState(); // variable used to display on the interface, dropdown trader
  const [selectedTrader, setSelectedTrader] = useState();
  const [listTrader, setListTrader] = useState();
  const [price, setPrice] = useState();
  const [selectedBank, setSelectedBank] = useState();
  const [userListBank, setUserListBank] = useState();
  const [errorControl, setErrorControl] = useState({});
  const [eulaChecked, setEulaChecked] = useState(false);
  const [showComponentLoader, setShowComponentLoader] = useState(true);
  const [inputPaddingRight, setInputPaddingRight] = useState(0);

  const touchedControl = useRef({});
  const control = useRef({
    amount: "amount",
  });
  const payInputElement = useRef();
  const receiveInputElement = useRef();
  const numberCoinsOwned = useRef(-1);

  const [callApiLoadPaymentStatus, setCallApiLoadPaymentStatus] = useState(
    api_status.pending
  );
  const [callApiLoadTraderStatus, setCallApiLoadTraderStatus] = useState(
    api_status.pending
  );
  const [callApiCreateP2p, setCallApiCreateP2p] = useState(api_status.pending);

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
      }
      currentLanguage = newLanguage;
    });
    validationPageLoad();

    const inputObserver = observeWidth(setInputPaddingRight);
    inputObserver.observe(document.querySelector(".transaction__action"));

    return () => {
      inputObserver.disconnect();
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
  useEffect(() => {
    if (listBankRedux && listBankRedux.length > 0) {
      firstLoad();
    }
  }, [listBankRedux]);

  const validationPageLoad = function () {
    if (!isLogin) {
      history.push(url.login);
      return;
    }
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
  const findLogoBank = function (bankName) {
    if (!listBankRedux || listBankRedux.length <= 0) return;
    const finded = listBankRedux.find((item) => item.content === bankName);
    return finded?.image;
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
          const respData = resp.data.data.array;
          for (const user of respData) {
            user.content = user.userName;
          }
          const result = [{ id: -1, content: "Random" }, ...respData];
          setListTrader(() => result);
          setCallApiLoadTraderStatus(api_status.fulfilled);
          return resolve(result);
        })
        .catch((err) => {
          setCallApiLoadTraderStatus(api_status.rejected);
          return resolve(false);
        });
    });
  };
  const firstLoad = function () {
    Promise.all([fetchApiTrader(), fetchApiGetListBank()])
      .then((resp) => {
        const resp0 = resp.at(0);
        setSelectedDropdownTrader(resp0.at(0));
        setSelectedTrader(() => getRandomElementFromArray(resp0.slice(1)));
        //
        const resp1 = resp.at(1);
        if (!resp1 || resp1.length <= 0) {
          callToastError(t("noBankFoundInAccount"));
          history.push(url.profile);
        }
        for (const record of resp1) {
          record.content = `${record.name_banking} (${record.owner_banking}) (${record.number_banking})`;
          record.image = findLogoBank(record.name_banking);
        }
        setUserListBank(() => resp1);
        setSelectedBank(() => resp1.at(0));
      })
      .catch((err) => {
        callToastError(t("can'tFindUserInformation"));
        history.push(url.profile);
        return;
      })
      .finally(() => {
        setShowComponentLoader(false);
        payInputElement.current.value = new Intl.NumberFormat(
          currencyMapper.USD,
          roundIntl(10)
        ).format(amount);
      });
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
          setCallApiLoadPaymentStatus(() => api_status.rejected);
          return reject(false);
        });
    });
  };
  const traderSelect = function (item) {
    setSelectedDropdownTrader(item);
    if (item.id === -1) {
      setSelectedTrader(getRandomElementFromArray(listTrader.slice(1)));
    } else if (item.id !== -1) {
      setSelectedTrader(item);
    }
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
    const newPriceFranction = math.subtract(
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
    const listSubString = ["122SE12LL122", "45BTC54"];
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
            [control.current.amount]: "tooBig",
          }));
        }
        if (+numberString > numberCoinsOwned.current) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => ({
            ...error,
            [control.current.amount]: "insufficientWalletBalance",
          }));
        }
        if (+numberString < selectedTrader.amountMinimum) {
          valid &= false;
          amountValid &= false;
          setErrorControl((error) => ({
            ...error,
            [control.current.amount]: "tooSmall",
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
            [control.current.amount]: "require",
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
  const renderDisableMainButton = function () {
    const condition1 = callApiLoadTraderStatus === api_status.fetching;
    const condition2 = callApiLoadPaymentStatus === api_status.fetching;
    let condition3 = !eulaChecked;
    const condition4 = callApiCreateP2p === api_status.fetching;

    if (condition1 || condition2 || condition3 || condition4) return true;
    else return false;
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
    <div className={`transaction`}>
      <div
        className={`container fadeInBottomToTop ${renderClassMainContent()}`}
      >
        <div className="box transaction__box transaction__header">
          <div>{renderHeader()}</div>
        </div>
        <div className="box transaction__box">
          <div className="transaction__user-dropdown">
            <label>{t("trader")}:</label>
            <Dropdown
              id={`dropdownTrader`}
              list={listTrader}
              itemClickHandle={traderSelect}
              itemSelected={selectedDropdownTrader}
            />
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
                  errorMes={t(errorControl[control.current.amount])}
                  style={{ paddingRight: inputPaddingRight }}
                />
                <span className="transaction__action">
                  <span className="transaction__unit">{selectedCoin}</span>
                  <span onClick={maxClickHandle} className="transaction__max">
                    {t("max").toUpperCase()}
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
                  style={{ paddingRight: 45 }}
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
              <Dropdown
                id={`dropdownPaymentSell`}
                list={userListBank}
                itemClickHandle={bankClickHandle}
                itemSelected={selectedBank}
              />
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
              htmlSubmit={htmlType.submit}
              disabled={renderDisableMainButton()}
            >
              {t("sell")}
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
      <div className={`spin-container ${renderClassSpinComponent()}`}>
        <Spin />
      </div>
    </div>
  );
}

export default TransactionSell;
