import React, { memo, useEffect, useState, useRef } from "react";
import { Spin, Modal } from "antd";
import {
  actionTrading,
  api_status,
  defaultLanguage,
  image_domain,
  localStorageVariable,
  url,
} from "src/constant";
import { Input } from "../Common/Input";
import socket from "src/util/socket";
import { DOMAIN } from "src/util/service";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCoin } from "src/redux/constant/coin.constant";
import { getType, setShow, showP2pType } from "src/redux/reducers/p2pTrading";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { searchBuyQuick, searchSellQuick } from "src/util/userCallApi";
import {
  debounce,
  formatStringNumberCultureUS,
  getLocalStorage,
  roundDecimalValues,
  setLocalStorage,
} from "src/util/common";
import { coinSetCoin } from "src/redux/actions/coin.action";
import i18n from "src/translation/i18n";
import { math } from "src/App";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";

const P2pExchange = memo(function () {
  const filterType = {
    coin: "coin",
    currency: "currency",
  };
  const getExchangeRateDisparityFromRedux = useSelector(
    getExchangeRateDisparity
  );
  const history = useHistory();
  const apiParamLimit = useRef(1);
  const [filter, setFilter] = useState(filterType.coin); // indicates the user is filtering ads by currency or cryptocurrency
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const inputElement = useRef();
  const actionFromRedux = useSelector(getType);
  const [currentAction, setCurrentAction] = useState(actionFromRedux); // action represents the action of the user looking to buy or sell coins. If a user is looking to buy, search for an ad for sale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callApiFetchListCoinStatus, setCallApiFetchListCoinStatus] = useState(
    api_status.pending
  );
  const [callApiSearchStatus, setCallApiSearchStatus] = useState(
    api_status.pending
  );
  const searchResult = useRef();
  const [selectedCoin, setSelectedCoin] = useState(useSelector(getCoin));
  const handleCancelModal = () => {
    setIsModalOpen(false);
  };
  const [listCoin, setListCoin] = useState();
  const currencyFromRedux = useSelector(getCurrent);
  const listExchangeFromRedux = useSelector(getExchange);
  const amountCoin = useRef(); // coin that the user enters in the input, if the user filters money, then change that money to coin
  const amountMoney = useRef(null); // The amount of money that the user enters in the input. If the user enters coin, the value of the variable is set to null

  const showModal = () => {
    setIsModalOpen(true);
  };
  const fetchListCoin = function () {
    setCallApiFetchListCoinStatus(() => api_status.fetching);
    return new Promise((resolve) => {
      socket.once("listCoin", (resp) => {
        setListCoin(resp);
        setCallApiFetchListCoinStatus(() => api_status.fulfilled);
        resolve(true);
      });
    });
  };
  const renderClassListCoinSpin = function () {
    if (callApiFetchListCoinStatus === api_status.fetching) return "";
    else return "--d-none";
  };
  const renderListCoin = function () {
    if (!listCoin || listCoin.length <= 0) return;
    const renderActive = function (coinName) {
      return coinName === selectedCoin ? "active" : "";
    };
    return listCoin.map((item) => (
      <span
        key={item.id}
        onClick={coinItemClickHandle.bind(null, item.name)}
        className={`p2pExchange__coin-item ${renderActive(item.name)}`}
      >
        <img src={DOMAIN + item.image} alt={item.name} />
        <span>{item.name}</span>
      </span>
    ));
  };
  const coinItemClickHandle = function (coinName) {
    setSelectedCoin(() => coinName);
    dispatch(coinSetCoin(coinName));

    handleCancelModal();
    searchWhenInputHasValue();
  };
  const redirectToP2pTrading = function () {
    dispatch(setShow([showP2pType.p2pTrading, actionTrading.buy]));
  };
  const renderFooterQuestion = function () {
    const setCurrentActionIsBuy = function () {
      setCurrentAction(() => actionTrading.buy);
    };
    const setCurrentActionIsSell = function () {
      setCurrentAction(() => actionTrading.sell);
    };
    if (currentAction === actionTrading.buy)
      return (
        <span
          onClick={setCurrentActionIsSell}
          className="p2pExchange__footer-item"
        >
          {t("searchForBTCToSell").replace("BTC", selectedCoin)} ?
        </span>
      );
    else
      return (
        <span
          onClick={setCurrentActionIsBuy}
          className="p2pExchange__footer-item"
        >
          {t("searchToBuyBTC").replace("BTC", selectedCoin)} ?
        </span>
      );
  };
  const renderClassButtonBuy = function () {
    if (currentAction === actionTrading.buy) return "";
    else return "--d-none";
  };
  const renderClassButtonSell = function () {
    if (currentAction === actionTrading.sell) return "";
    else return "--d-none";
  };
  const renderClassInputFilterCoin = function () {
    return filter === filterType.coin ? "" : "--d-none";
  };
  const renderClassInputFilterCurrency = function () {
    return filter === filterType.currency ? "" : "--d-none";
  };
  const filterByCurrencyClickHandle = function (e) {
    setFilter(filterType.currency);
    const container = e.target.closest(".p2pExchange__type-list");
    for (const item of container.children) {
      item.classList.remove("active");
    }
    e.currentTarget.classList.add("active");
  };
  const filterByCoinClickHandle = function (e) {
    setFilter(filterType.coin);
    const container = e.target.closest(".p2pExchange__type-list");
    for (const item of container.children) {
      item.classList.remove("active");
    }
    e.currentTarget.classList.add("active");
  };
  const renderClassInputFilterTitleCoin = function () {
    return filter === filterType.coin ? "" : "--d-none";
  };
  const renderClassInputFilterTitleCurrency = function () {
    return filter === filterType.currency ? "" : "--d-none";
  };
  const renderPlaceHolder = function () {
    return filter === filterType.coin
      ? t("enterQuantityOfCoins")
      : t("enterAmountOfMoney");
  };
  /**
   * A quick buy search will return for sale listings
   * @param {string} symbol
   * @param {number} amount
   */
  const fetchApiSearchBuyQuick = function (symbol, amount) {
    new Promise((resolve) => {
      searchBuyQuick({
        limit: apiParamLimit.current,
        page: 1,
        symbol,
        amount,
      })
        .then((resp) => {
          setCallApiSearchStatus(api_status.fulfilled);
          searchResult.current = resp.data.data.array;
        })
        .catch((err) => {
          console.log(err);
          searchResult.current = null;
          setCallApiSearchStatus(api_status.rejected);
        });
    });
  };
  /**
   * a quick sale search will return buy listings
   * @param {string} symbol
   * @param {number} amount
   */
  const fetchApiSearchSellQuick = function (symbol, amount) {
    new Promise((resolve) => {
      searchSellQuick({
        limit: apiParamLimit.current,
        page: 1,
        symbol,
        amount,
      })
        .then((resp) => {
          setCallApiSearchStatus(api_status.fulfilled);
          searchResult.current = resp.data.data.array;
        })
        .catch((err) => {
          console.log(err);
          searchResult.current = null;
          setCallApiSearchStatus(api_status.rejected);
        });
    });
  };
  const inputAmountChangeHandle = function () {
    formatValueInput();
    searchAdsExDebounce();
  };
  const searchWhenInputHasValue = function () {
    if (!inputElement?.current?.value) return;
    searchAdsEx();
  };
  const searchAdsEx = async function () {
    if (callApiSearchStatus === api_status.fetching) return;
    setCallApiSearchStatus(api_status.fetching);
    let amount = +inputElement?.current?.value.toString().replaceAll(",", "");
    amountCoin.current = amount;
    amountMoney.current = amount;
    if (filter === filterType.coin) {
      amountMoney.current = null;
      searchAds(selectedCoin, amount);
    } else {
      await fetchListCoin();
      const coinPrice = listCoin.find(
        (item) => item.name === selectedCoin
      )?.price;
      const amountCoinlc = convertCurrencyToCoin(
        amount,
        currencyFromRedux,
        selectedCoin,
        listExchangeFromRedux,
        listCoin
      );
      amountCoin.current = roundDecimalValues(amountCoinlc, coinPrice);
      searchAds(selectedCoin, amountCoinlc);
    }
  };
  const formatValueInput = function () {
    const inputValue = inputElement.current.value;
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      inputElement.current.value = inputValue.slice(0, -1);
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    inputElement.current.value = inputValueFormated;
  };
  const searchAds = function (coinName, amountCoin) {
    setCallApiSearchStatus(api_status.fetching);
    if (currentAction === actionTrading.buy) {
      fetchApiSearchBuyQuick(coinName, amountCoin);
    } else {
      fetchApiSearchSellQuick(coinName, amountCoin);
    }
  };
  const searchAdsExDebounce = debounce(searchAdsEx, 1000);
  const convertCurrencyToCoin = function (
    amountMoney,
    currency,
    coinName,
    listExchange,
    listCoin
  ) {
    if (!getExchangeRateDisparityFromRedux) return;
    const rate = listExchange.find((item) => item.title === currency)?.rate;
    const price = listCoin.find((item) => item.name === coinName).price;

    const priceFraction = math.fraction(price);
    const rateDisparityFraction = math.fraction(
      getExchangeRateDisparityFromRedux
    );
    let newPriceFraction = 0;
    if (currentAction === actionTrading.buy) {
      newPriceFraction = math.add(
        priceFraction,
        math
          .chain(priceFraction)
          .multiply(rateDisparityFraction)
          .divide(100)
          .done()
      );
    } else {
      newPriceFraction = math.subtract(
        priceFraction,
        math
          .chain(priceFraction)
          .multiply(rateDisparityFraction)
          .divide(100)
          .done()
      );
    }
    const amountMoneyFraction = math.fraction(amountMoney);
    const rateFraction = math.fraction(rate);

    const result = math
      .chain(amountMoneyFraction)
      .multiply(rateFraction)
      .multiply(newPriceFraction)
      .done();
    return math.number(result);
  };
  const renderClassSpin = function () {
    if (callApiSearchStatus === api_status.fetching) return "";
    else return "--d-none";
  };
  const renderClassEmpty = function () {
    if (callApiSearchStatus === api_status.pending) return "--d-none";
    if (
      callApiSearchStatus !== api_status.fetching &&
      (!searchResult.current || searchResult.current.length <= 0)
    )
      return "";
    else return "--d-none";
  };
  const renderClassMainButton = function () {
    if (
      callApiSearchStatus !== api_status.fetching &&
      searchResult.current &&
      searchResult.current.length > 0
    )
      return "";
    else return "--d-none";
  };
  const buyClickHandle = function () {
    setLocalStorage(
      localStorageVariable.coinFromP2pExchange,
      amountCoin.current
    );
    setLocalStorage(
      localStorageVariable.moneyFromP2pExchange,
      amountMoney.current
    );
    setLocalStorage(localStorageVariable.coinNameFromP2pExchange, selectedCoin);
    history.push(url.transaction_buy);
    return;
  };
  const sellClickHandle = function () {
    setLocalStorage(
      localStorageVariable.coinFromP2pExchange,
      amountCoin.current
    );
    setLocalStorage(
      localStorageVariable.moneyFromP2pExchange,
      amountMoney.current
    );
    setLocalStorage(localStorageVariable.coinNameFromP2pExchange, selectedCoin);
    history.push(url.transaction_sell);
    return;
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    fetchListCoin();
    return () => {
      dispatch(setShow([showP2pType.p2pTrading, actionTrading.buy]));
    };
  }, []);
  useEffect(() => {
    searchWhenInputHasValue();
  }, [currentAction]);
  useEffect(() => {
    searchWhenInputHasValue();
  }, [currencyFromRedux]);
  useEffect(() => {
    searchWhenInputHasValue();
  }, [getExchangeRateDisparityFromRedux]);

  return (
    <div className="p2pExchange">
      <div className="container">
        <div className="p2pExchange__title">{t("p2pExchange")}</div>
        <div className="p2pExchange__selected  --d-none">
          <span className="p2pExchange__coin">
            <img
              src={image_domain.replace("USDT", selectedCoin.toUpperCase())}
              alt={selectedCoin}
            />
            {selectedCoin}
          </span>
          <button onClick={showModal} className="p2pExchange__button-select">
            <span>{t("chooseAnotherCoin")}</span>
            <i className="fa-solid fa-caret-down"></i>
          </button>
        </div>
        <div className="p2pExchange__search-container">
          <div className="p2pExchange__search-title">
            <span className={renderClassInputFilterTitleCoin()}>
              {t("amount")}:
            </span>
            <span className={renderClassInputFilterTitleCurrency()}>
              {t("amountOfMoney")}:
            </span>
          </div>
          <div className="p2pExchange__input-container">
            <Input
              ref={inputElement}
              onChange={inputAmountChangeHandle}
              placeholder={renderPlaceHolder()}
              type="text"
              style={{
                height: "45px",
                fontSize: "14px",
                border: 0,
                letterSpacing: "0.5px",
              }}
            />
            <span className="p2pExchange__input-span">
              <span className={renderClassInputFilterCurrency()}>
                {currencyFromRedux}
              </span>
              <span className={renderClassInputFilterCoin()}>
                {selectedCoin}
              </span>
            </span>
          </div>
          <div className="p2pExchange__type">
            <div className="p2pExchange__type-title">{t("enterWith")}:</div>
            <div className="p2pExchange__type-list">
              <div
                onClick={filterByCurrencyClickHandle}
                className="p2pExchange__type-item"
              >
                {currencyFromRedux}
              </div>
              <div
                onClick={filterByCoinClickHandle}
                className="p2pExchange__type-item active"
              >
                {selectedCoin}
              </div>
              <div className="p2pExchange__type-item">
                <div className={renderClassEmpty()}>Không có</div>
                <div className={renderClassSpin()}>
                  <Spin />
                </div>
                <div
                  onClick={buyClickHandle}
                  className={`p2pExchange__type-button ${renderClassMainButton()} ${renderClassButtonBuy()}`}
                >
                  Mua
                </div>
                <div
                  onClick={sellClickHandle}
                  className={`p2pExchange__type-button ${renderClassMainButton()} ${renderClassButtonSell()}`}
                >
                  Bán
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p2pExchange__footer">
          {renderFooterQuestion()}
          <span
            onClick={redirectToP2pTrading}
            className="p2pExchange__footer-item"
          >
            {t("goBack")}
          </span>
        </div>
      </div>
      <Modal
        title={t("chooseTheCoinYouWant")}
        open={isModalOpen}
        onCancel={handleCancelModal}
        width={600}
        footer={null}
      >
        <div className="p2pExchange__list-coin">{renderListCoin()}</div>
        <div className={`spin-container ${renderClassListCoinSpin()}`}>
          <Spin />
        </div>
      </Modal>
    </div>
  );
});
export default P2pExchange;
