import React, { useState, useRef, useEffect, useCallback } from "react";
import css from "./p2p.module.scss";
import { Pagination, Spin } from "antd";
import { Button, buttonClassesType } from "../Common/Button";
import { useHistory } from "react-router-dom";
import {
  actionTrading,
  api_status,
  coinString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import socket from "src/util/socket";
import {
  getListAdsBuy,
  getListAdsSell,
  searchBuyQuick,
  searchSellQuick,
} from "src/util/userCallApi";
import { EmptyCustom } from "../Common/Empty";
import {
  debounce,
  formatNumber,
  formatStringNumberCultureUS,
  getLocalStorage,
  setLocalStorage,
} from "src/util/common";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { Input } from "../Common/Input";
import { useSelector } from "react-redux";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import { getExchangeRateSell } from "src/redux/reducers/exchangeRateSellSlice";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";
import { math } from "src/App";

function P2p() {
  const searchType = {
    coin: "coin",
    money: "money",
  };
  const history = useHistory();
  const { t } = useTranslation();

  const currency = useSelector(getCurrent);
  const exchange = useSelector(getExchange);
  const listCoinRealTime = useSelector(getListCoinRealTime);
  const exchangeSell = useSelector(getExchangeRateSell);
  const exchangeBuy = useSelector(getExchangeRateDisparity);

  const [fetchListCoinStatus, setFetchListCoinStatus] = useState(
    api_status.pending
  );
  const [fetchMainDataStatus, setFetchMainDataStatus] = useState(
    api_status.pending
  );
  const [showSearch, setShowSearch] = useState(false);
  const [listCoin, setListCoin] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(coinString.USDT);
  const [filterAction, setFilterAction] = useState(actionTrading.buy);
  const [searchAction, setSearchAction] = useState(searchType.coin);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [mainData, setMainData] = useState([]);
  const [marginActionFilter, setMarginActionFilter] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [inputSearchValue, setInputSearchValue] = useState("");

  const filterActionElement = useRef();
  const limit = useRef(10);
  const buyElement = useRef();
  const filterActionRef = useRef(actionTrading.buy);
  const filterElement = useRef();
  const amountCoinSearch = useRef(0);

  const filterSellClickHandle = function () {
    if (!filterActionElement?.current) return;
    if (fetchMainDataStatus === api_status.fetching) return;
    filterActionElement.current.classList.add(css["move"]);
    setFilterAction(actionTrading.sell);

    setMarginActionFilter(buyElement.current.clientWidth);
    filterActionRef.current = actionTrading.sell;

    loadMainData(1, selectedCoin, actionTrading.sell, inputSearchValue);
  };
  const filterBuyClickHandle = function () {
    if (!filterActionElement?.current) return;
    if (fetchMainDataStatus === api_status.fetching) return;
    filterActionElement.current.classList.contains(css["move"]) &&
      filterActionElement.current.classList.remove(css["move"]);
    setFilterAction(actionTrading.buy);

    setMarginActionFilter(0);
    filterActionRef.current = actionTrading.buy;

    loadMainData(1, selectedCoin, actionTrading.buy, inputSearchValue);
  };
  const redirectPage = function (page) {
    history.push(page);
  };
  const fetchListCoin = async function () {
    if (fetchListCoinStatus === api_status.fetching) return;
    try {
      setFetchListCoinStatus(api_status.fetching);
      await socket.once("listCoin", (resp) => {
        setListCoin(resp);
        setFetchListCoinStatus(api_status.fulfilled);
      });
    } catch (error) {
      setFetchListCoinStatus(api_status.rejected);
    }
  };
  const renderSpinCoin = function () {
    return !listCoin || listCoin.length <= 0 ? "" : "--d-none";
  };
  const renderListCoin = function () {
    if (!listCoin || listCoin.length <= 0) {
      return;
    }
    const setActive = function (coinName) {
      return coinName === selectedCoin ? css["active"] : "";
    };
    const buttonCLickHandle = function (name, ev) {
      if (fetchMainDataStatus === api_status.fetching) return;
      ev.stopPropagation();
      setSelectedCoin(name);
      loadMainData(1, name, filterAction, inputSearchValue);
    };
    return listCoin.map((item) => (
      <span key={item.name}>
        <Button
          onClick={buttonCLickHandle.bind(null, item.name)}
          className={`${css["p2p__coinItem"]} ${setActive(item.name)}`}
          type={buttonClassesType.outline}
        >
          {item.name}
        </Button>
      </span>
    ));
  };
  const loadMainData = function (page, symbol, action, search = "") {
    setMainData([]);
    if (search) {
      switch (action) {
        case actionTrading.buy:
          fetchSearchSellQuick(page, symbol, amountCoinSearch.current);
          break;
        case actionTrading.sell:
          fetchSearchBuyQuick(page, symbol, amountCoinSearch.current);
          break;
        default:
          break;
      }
    } else {
      switch (action) {
        case actionTrading.buy:
          fetchListAdsSell(page, symbol);
          break;
        case actionTrading.sell:
          fetchListAdsBuy(page, symbol);
          break;
        default:
          break;
      }
    }
  };
  const fetchSearchBuyQuick = async function (page, symbol, amount) {
    if (fetchMainDataStatus === api_status.fetching) return;
    try {
      setFetchMainDataStatus(api_status.fetching);
      const resp = await searchBuyQuick({
        limit: limit.current,
        page,
        symbol,
        amount,
      });
      const data = resp.data.data;
      setMainData(data.array);
      setCurrentPage(page);
      setTotalItems(data.total);
      setFetchMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setFetchMainDataStatus(api_status.rejected);
    }
  };
  const fetchSearchSellQuick = async function (page, symbol, amount) {
    if (fetchMainDataStatus === api_status.fetching) return;
    try {
      setFetchMainDataStatus(api_status.fetching);
      const resp = await searchSellQuick({
        limit: limit.current,
        page,
        symbol,
        amount,
      });
      const data = resp.data.data;
      setMainData(data.array);
      setCurrentPage(page);
      setTotalItems(data.total);
      setFetchMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setFetchMainDataStatus(api_status.rejected);
    }
  };
  const fetchListAdsBuy = async function (page, symbol) {
    if (fetchMainDataStatus === api_status.fetching) return;
    try {
      setFetchMainDataStatus(api_status.fetching);
      const resp = await getListAdsBuy({ limit: limit.current, page, symbol });
      const data = resp.data.data;
      setMainData(data.array);
      setCurrentPage(page);
      setTotalItems(data.total);
      setFetchMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setFetchMainDataStatus(api_status.rejected);
    }
  };
  const fetchListAdsSell = async function (page, symbol) {
    if (fetchMainDataStatus === api_status.fetching) return;
    try {
      setFetchMainDataStatus(api_status.fetching);
      const resp = await getListAdsSell({ limit: limit.current, page, symbol });
      const data = resp.data.data;
      setMainData(data.array);
      setCurrentPage(page);
      setTotalItems(data.total);
      setFetchMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setFetchMainDataStatus(api_status.rejected);
    }
  };
  const renderClassSpinMainData = function () {
    return fetchMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmptyMainData = function () {
    if (
      fetchMainDataStatus !== api_status.fetching &&
      fetchMainDataStatus !== api_status.pending &&
      (!mainData || mainData.length <= 0)
    ) {
      return "";
    } else {
      return "--d-none";
    }
  };
  const renderMainData = function () {
    if (!mainData || mainData.length <= 0) return;
    const renderButtonBuy = function (adsType) {
      return adsType === actionTrading.sell && selectedCoin === coinString.USDT
        ? ""
        : "--d-none";
    };
    const renderButtonSell = function (adsType) {
      return adsType === actionTrading.buy && selectedCoin === coinString.USDT
        ? ""
        : "--d-none";
    };
    const buyCLickHandle = function (minimum) {
      setLocalStorage(localStorageVariable.coinToTransaction, minimum);
      setLocalStorage(localStorageVariable.moneyToTransaction, null);
      setLocalStorage(
        localStorageVariable.coinNameToTransaction,
        coinString.USDT
      );
      history.push(url.transaction_buy);
      return;
    };
    const sellCLickHandle = function (minimum) {
      setLocalStorage(localStorageVariable.coinToTransaction, minimum);
      setLocalStorage(localStorageVariable.moneyToTransaction, null);
      setLocalStorage(
        localStorageVariable.coinNameToTransaction,
        coinString.USDT
      );
      history.push(url.transaction_sell);
      return;
    };
    return mainData.map((item) => (
      <div
        key={item.id}
        className={`${css["p2p__listRecord"]} f-lg-c gap-lg-2 bt-1 d-flex`}
      >
        <div className={`${css["p2p__listCol"]} w-lg-100`}>
          <div className="d-flex gap-1 alignItem-c">
            <span className={css["p2p__listColDot"]}>
              <i className="fa-solid fa-circle"></i>
            </span>
            <span>{item.userName}</span>
            <span className={css["p2p__listColCheck"]}>
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </div>
          <div>{t("goodRating")} 98%</div>
          <div>{t("completionTime")} ~ 2m 23s</div>
        </div>
        <div className={`${css["p2p__listCol"]} w-lg-100`}>
          <div>
            <span>{t("accessBank")}</span>
          </div>
        </div>
        <div className={`${css["p2p__listCol"]} w-lg-100`}>
          <div className="row">
            <span className="col-4 p-0">{t("amount")}:</span>
            <span className="col-6 p-0">
              {formatNumber(
                item.amount - item.amountSuccess,
                i18n.language,
                -1
              )}{" "}
              {item.symbol}
            </span>
            <span className="col-4 p-0">{t("tradeLimit")}:</span>
            <span className="col-8 p-0">
              {formatNumber(item.amountMinimum, i18n.language, -1)}{" "}
              {item.symbol} - {formatNumber(item.amount, i18n.language, -1)}{" "}
              {item.symbol}
            </span>
          </div>
        </div>
        <div
          className={`${css["p2p__listCol"]} justify-lg-start  d-flex alignItem-c justify-end`}
        >
          <Button
            className={renderButtonBuy(item.side)}
            type={buttonClassesType.success}
            onClick={buyCLickHandle.bind(null, item.amountMinimum)}
          >
            {t("buy")}
          </Button>
          <Button
            className={renderButtonSell(item.side)}
            type={buttonClassesType.danger}
            onClick={sellCLickHandle.bind(null, item.amountMinimum)}
          >
            {t("sell")}
          </Button>
        </div>
      </div>
    ));
  };
  const pageOnChangeHandle = function (page) {
    loadMainData(page, selectedCoin, filterAction, inputSearchValue);
  };
  const showBuy = function () {
    return filterAction === actionTrading.buy ? "" : "--d-none";
  };
  const showSell = function () {
    return filterAction === actionTrading.sell ? "" : "--d-none";
  };
  const setStickHandle = function () {
    if (!filterElement?.current) return;
    if (
      window.scrollY >= 227 &&
      window.innerWidth > 575 &&
      isSticky === false
    ) {
      filterElement.current.classList.add(css["sticky"]);
      setIsSticky(true);
    } else {
      filterElement?.current?.classList?.contains(css["sticky"]) &&
        filterElement?.current?.classList?.remove(css["sticky"]);
      setIsSticky(false);
    }
  };
  const switchCoinClickHandle = function () {
    setSearchAction(searchType.coin);
    setInputSearchValue("");
  };
  const switchMoneyClickHandle = function () {
    setSearchAction(searchType.money);
    setInputSearchValue("");
  };
  const renderClassSearchCoin = function () {
    return searchAction === searchType.coin ? "" : "--d-none";
  };
  const renderClassSearchMoney = function () {
    return searchAction === searchType.money ? "" : "--d-none";
  };
  const inputSearchChangeHandle = function (ev) {
    const str = ev.target.value;
    const res = formatInputSearch(str);

    if (searchAction === searchType.coin) {
      amountCoinSearch.current = res.replaceAll(",", "");
    } else {
      amountCoinSearch.current = calcCoin(res);
    }

    loadMainDataDebounced(
      currentPage,
      selectedCoin,
      filterAction,
      amountCoinSearch.current
    );
  };
  const calcCoin = function (money) {
    if (!money) return;

    const rate = exchange.find((item) => item.title === currency)?.rate;
    const price = listCoinRealTime.find(item.name === selectedCoin)?.price;
    const price1Coin = 0;
  };
  const formatInputSearch = function (inputValue) {
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      const res = inputValue.slice(0, -1);
      setInputSearchValue(res);
      return res;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    setInputSearchValue(inputValueFormated);
    return inputValueFormated;
  };
  const renderClassSpinSearch = function () {
    return !showSearch ? "" : "--d-none";
  };
  const renderClassShowSearch = function () {
    return showSearch ? "" : "--d-none";
  };
  const loadMainDataDebounced = useCallback(debounce(loadMainData, 1000), []);

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (
        newLanguage !== currentLanguage &&
        filterActionRef.current === actionTrading.sell
      ) {
        filterBuyClickHandle();
      }
      currentLanguage = newLanguage;
    });

    fetchListCoin();
    loadMainData(1, coinString.USDT, actionTrading.buy);

    window.onscroll = function () {
      setStickHandle();
    };
  }, []);
  useEffect(() => {
    if (
      currency &&
      exchange &&
      exchange.length > 0 &&
      listCoinRealTime &&
      listCoinRealTime.length > 0 &&
      exchangeSell &&
      exchangeBuy &&
      showSearch === false
    ) {
      setShowSearch(true);
    }
  }, [currency, exchange, listCoinRealTime, exchangeSell, exchangeBuy]);

  return (
    <div className={css["p2p"]}>
      <div className={`${css["container"]}`}>
        <div className={`${css["p2p__header"]} f-md-c d-f alignItem-c box`}>
          <div className={css["p2p__title"]}>P2P</div>
          <div
            className={`${css["p2p__menu"]} ml-md-0 w-md-100 justify-md-sb d-f ml-a`}
          >
            <div className={`${css["p2p__menuItem"]} ${css["active"]}`}>
              <span>
                <i className="fa-solid fa-house"></i>
              </span>
              <span className="d-md-0">{t("homeP2p")}</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.p2pTrading)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-file-lines"></i>
              </span>
              <span className="d-md-0">{t("order")}</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.create_ads_buy)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-plus"></i>
              </span>
              <span className="d-md-0">{t("newAd")}</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.ads_history)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
              <span className="d-md-0">{t("ads")}</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.profile)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-user"></i>
              </span>
              <span className="d-md-0">{t("profile")}</span>
            </div>
          </div>
        </div>
        <div className={`${css["p2p__mainContent"]} box pl-0 pr-0`}>
          <div ref={filterElement} className={`${css["p2p__filter"]}`}>
            <div className="d-f mb-4 f-lg-c alignItem-lg-start">
              <span className={`${css["p2p__filterAction"]} mb-lg-2`}>
                <div
                  ref={filterActionElement}
                  className={`${css["p2p__filterActionActive"]}`}
                  style={{ marginLeft: marginActionFilter }}
                >
                  <span className={`--visible-hidden ${showBuy()}`}>
                    {t("buy")}
                  </span>
                  <span className={`--visible-hidden ${showSell()}`}>
                    {t("sell")}
                  </span>
                </div>
                <div
                  ref={buyElement}
                  onClick={filterBuyClickHandle}
                  className={css["p2p__filterActionTitle"]}
                >
                  <span>{t("buy")}</span>
                </div>
                <div
                  onClick={filterSellClickHandle}
                  className={css["p2p__filterActionTitle"]}
                >
                  <span>{t("sell")}</span>
                </div>
              </span>
              <span
                className={`${css["p2p__filterCoin"]} ml-lg-0 justify-lg-start f-lg-w  d-f alignItem-c justify-c ml-2 `}
              >
                {renderListCoin()}
                <span className={renderSpinCoin()}>
                  <Spin />
                </span>
              </span>
            </div>
            <div className={renderClassShowSearch()}>
              <div className="row mb-2">
                <div className="col-sm-12 col-md-8 col-6 p-0 pos-r mb-2">
                  <Input
                    style={{ paddingRight: "50px" }}
                    value={inputSearchValue}
                    onChange={inputSearchChangeHandle}
                  />
                  <span
                    className={`${
                      css["p2p__inputInfo"]
                    } ${renderClassSearchMoney()}`}
                  >
                    {currency}
                  </span>
                  <span
                    className={`${
                      css["p2p__inputInfo"]
                    } ${renderClassSearchCoin()}`}
                  >
                    {selectedCoin}
                  </span>
                </div>
              </div>
              <div className="row mb-2">
                <div
                  onClick={switchCoinClickHandle}
                  className={`hover-p us-0 ${renderClassSearchMoney()}`}
                >
                  Switch to Coin
                </div>
                <div
                  onClick={switchMoneyClickHandle}
                  className={`hover-p us-0 ${renderClassSearchCoin()}`}
                >
                  Switch to Money
                </div>
              </div>
            </div>
            <div className={`row mb-2 ${renderClassSpinSearch()}`}>
              <div className="col-sm-12 col-md-8 col-6 d-f alignItem-c justify-c p-0 ">
                <Spin />
              </div>
            </div>
          </div>
          <div className={css["p2p__list"]}>
            <div className={`${css["p2p__listHeader"]} d-lg-0 d-flex`}>
              <div className="w-25">{t("buyFrom")}</div>
              <div className="w-25">{t("payment")}</div>
              <div className="w-25">{t("price")}</div>
              <div className="w-25 ta-r">{t("trade")}</div>
            </div>
            <div className={css["p2p__listContent"]}>{renderMainData()}</div>
            <div className={`spin-container ${renderClassSpinMainData()}`}>
              <Spin />
            </div>
            <div className={renderClassEmptyMainData()}>
              <EmptyCustom stringData={t("noData")}></EmptyCustom>
            </div>
            <div className="d-flex alignItem-c justify-c mt-2">
              <Pagination
                current={currentPage}
                total={totalItems}
                showSizeChanger={false}
                onChange={pageOnChangeHandle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default P2p;
