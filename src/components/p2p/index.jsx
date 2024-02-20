import React, { useState, useRef, useEffect } from "react";
import css from "./p2p.module.scss";
import { Pagination, Spin } from "antd";
import { Button, buttonClassesType } from "../Common/Button";
import { useHistory } from "react-router-dom";
import { actionTrading, api_status, coinString, url } from "src/constant";
import socket from "src/util/socket";
import { getListAdsBuy, getListAdsSell } from "src/util/userCallApi";
import { EmptyCustom } from "../Common/Empty";

function P2p() {
  const history = useHistory();

  const [fetchListCoinStatus, setFetchListCoinStatus] = useState(
    api_status.pending
  );
  const [fetchMainDataStatus, setFetchMainDataStatus] = useState(
    api_status.pending
  );
  const [listCoin, setListCoin] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(coinString.USDT);
  const [filterAction, setFilterAction] = useState(actionTrading.buy);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [mainData, setMainData] = useState([]);

  const filterActionElement = useRef();
  const limit = useRef(10);

  const filterSellClickHandle = function () {
    filterActionElement.current.classList.add(css["move"]);
    setFilterAction(actionTrading.sell);

    loadMainData(1, selectedCoin, actionTrading.sell);
  };
  const filterBuyClickHandle = function () {
    filterActionElement.current.classList.contains(css["move"]) &&
      filterActionElement.current.classList.remove(css["move"]);
    setFilterAction(actionTrading.buy);

    loadMainData(1, selectedCoin, actionTrading.buy);
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
      ev.stopPropagation();
      setSelectedCoin(name);
      loadMainData(1, name, filterAction);
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
  const loadMainData = function (page, symbol, action) {
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
      return adsType === actionTrading.sell ? "" : "--d-none";
    };
    const renderButtonSell = function (adsType) {
      return adsType === actionTrading.buy ? "" : "--d-none";
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
          <div>Good rating 98%</div>
          <div>Completion time ~ 2m 23s</div>
        </div>
        <div className={`${css["p2p__listCol"]} w-lg-100`}>
          <div>
            <span>Access Bank</span>
          </div>
        </div>
        <div className={`${css["p2p__listCol"]} w-lg-100`}>
          <div className="row">
            <span className="col-4 p-0">Amount:</span>
            <span className="col-6 p-0">
              {item.amount - item.amountSuccess} {item.symbol}
            </span>
            <span className="col-4 p-0">Trade limit:</span>
            <span className="col-8 p-0">
              {item.amountMinimum} {item.symbol} - {item.amount} {item.symbol}
            </span>
          </div>
        </div>
        <div
          className={`${css["p2p__listCol"]} justify-lg-start  d-flex alignItem-c justify-end`}
        >
          <Button
            className={renderButtonBuy(item.side)}
            type={buttonClassesType.success}
          >
            Buy
          </Button>
          <Button
            className={renderButtonSell(item.side)}
            type={buttonClassesType.danger}
          >
            Sell
          </Button>
        </div>
      </div>
    ));
  };

  useEffect(() => {
    fetchListCoin();
    loadMainData(1, coinString.USDT, actionTrading.buy);
  }, []);

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
              <span className="d-md-0">Home P2P</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.p2pTrading)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-file-lines"></i>
              </span>
              <span className="d-md-0">Order</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.create_ads_buy)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-plus"></i>
              </span>
              <span className="d-md-0">New Ad</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.ads_history)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
              <span className="d-md-0">Ads</span>
            </div>
            <div
              onClick={redirectPage.bind(null, url.profile)}
              className={css["p2p__menuItem"]}
            >
              <span>
                <i className="fa-solid fa-user"></i>
              </span>
              <span className="d-md-0">Profile</span>
            </div>
          </div>
        </div>
        <div className={`${css["p2p__mainContent"]} box pl-0 pr-0`}>
          <div className={css["p2p__filter"]}>
            <div className="d-f mb-4 f-lg-c alignItem-lg-start">
              <span className={`${css["p2p__filterAction"]} mb-lg-2`}>
                <div
                  ref={filterActionElement}
                  className={`${css["p2p__filterActionActive"]}`}
                ></div>
                <div
                  onClick={filterBuyClickHandle}
                  className={css["p2p__filterActionTitle"]}
                >
                  <span>Buy</span>
                </div>
                <div
                  onClick={filterSellClickHandle}
                  className={css["p2p__filterActionTitle"]}
                >
                  <span>Sell</span>
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
          </div>
          <div className={css["p2p__list"]}>
            <div className={`${css["p2p__listHeader"]} d-lg-0 d-flex`}>
              <div className="w-25">Buy from</div>
              <div className="w-25">Payment</div>
              <div className="w-25">Price</div>
              <div className="w-25 ta-r">Trade</div>
            </div>
            <div className={css["p2p__listContent"]}>{renderMainData()}</div>
            <div className={`spin-container ${renderClassSpinMainData()}`}>
              <Spin />
            </div>
            <div className={renderClassEmptyMainData()}>
              <EmptyCustom stringData={`khoong co data`}></EmptyCustom>
            </div>
            <div className="d-flex alignItem-c justify-c mt-2">
              <Pagination
                current={currentPage}
                total={totalItems}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default P2p;
