import React, { useEffect, useState, useRef, useCallback } from "react";
import css from "./swap.module.scss";
import { Pagination, Spin } from "antd";
import { Input } from "src/components/Common/Input";
import { api_status } from "src/constant";
import socket from "src/util/socket";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { historySwapAdmin } from "src/util/adminCallApi";
import { debounce } from "src/util/common";

export default function SwapAdmin() {
  const all = "ALL";
  const filterType = {
    coin: "coin",
    username: "username",
  };

  const [fetchListCoinStatus, setFetchListCoinStatus] = useState(
    api_status.pending
  );
  const [fetchDataTableStatus, setFetchDataTableStatus] = useState(
    api_status.pending
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [userName, setUserName] = useState();
  const [filter, setFilter] = useState(filterType.coin);
  const [listCoin, setListCoin] = useState([]);
  const [seletedCoin, setSeletedCoin] = useState(all);
  const [dataTable, setDataTable] = useState([]);

  const limit = useRef(10);

  const tabCLickHandle = function (fillter, ev) {
    ev.stopPropagation();
    setFilter(() => fillter);
    fetchHistorySwapAdmin(1, seletedCoin, userName, fillter);
  };
  const pageChangeHandle = function (page) {
    fetchHistorySwapAdmin(page, seletedCoin, userName, filter);
  };
  const renderClassShowTabContentCoin = function () {
    return filter === filterType.coin ? "" : "--d-none";
  };
  const renderClassShowTabContentUsername = function () {
    return filter === filterType.username ? "" : "--d-none";
  };
  const inputUserNameChangeHandle = function (ev) {
    const value = ev.target.value;
    setUserName(() => value);
    fetchHistorySwapAdminDebounced(1, undefined, value, filterType.username);
  };
  const renderClassActiveTabCoin = function () {
    return filter === filterType.coin ? css["active"] : "";
  };
  const renderClassActiveTabUserName = function () {
    return filter === filterType.username ? css["active"] : "";
  };
  const fetchListCoin = function () {
    if (fetchListCoinStatus === api_status.fetching) return;
    setFetchListCoinStatus(() => api_status.fetching);
    try {
      socket.once("listCoin", (resp) => {
        setFetchListCoinStatus(() => api_status.fulfilled);
        setListCoin(() => resp);
      });
    } catch (error) {
      setFetchListCoinStatus(() => api_status.rejected);
    }
  };
  const renderListCoinSpin = function () {
    return fetchListCoinStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderListCoin = function (listCoin) {
    if (!listCoin || listCoin.length <= 0) return;
    const listCoinNew = [
      {
        id: all,
        name: all.toUpperCase(),
      },
      ...listCoin,
    ];
    return listCoinNew.map((item) => (
      <div key={item.id}>
        <Button
          onClick={coinClickHandle.bind(null, item.name)}
          type={buttonClassesType.outline}
          className={`${css["swapAdmin__coin-item"]}  ${setActiveListCoin(
            item.name
          )}`}
        >
          {item.name}
        </Button>
      </div>
    ));
  };
  const setActiveListCoin = function (coinName) {
    return coinName === seletedCoin ? css["active"] : "";
  };
  const coinClickHandle = function (coinName) {
    setSeletedCoin(() => coinName);
    fetchHistorySwapAdmin(1, coinName, undefined, filterType.coin);
  };
  const fetchHistorySwapAdmin = async function (
    page = 1,
    coinName = all,
    username = "",
    fillter = filterType.coin
  ) {
    try {
      if (fetchDataTableStatus === api_status.fetching) return;
      setFetchDataTableStatus(() => api_status.fetching);
      const params = processParams(page, coinName, username, fillter);
      const resp = await historySwapAdmin(params);
      const { array, total } = resp.data.data;
      setDataTable(() => array);
      setTotalItem(() => total);
      setCurrentPage(() => page);
      setFetchDataTableStatus(() => api_status.fulfilled);
    } catch (error) {
      setFetchDataTableStatus(() => api_status.rejected);
    }
  };
  const processParams = function (page, coinName, username, filter) {
    const result = {
      limit: limit.current,
      page: page,
    };

    if (filter === filterType.coin) {
      if (coinName !== all)
        result.query = `wallet = '${coinName}' OR coin_key='${coinName}'`;
    } else if (filter === filterType.username)
      result.query = `POSITION('${username}' IN userName) OR POSITION('${username}' IN email)`;

    return result;
  };
  const renderTable = function (table) {
    if (!table || table.length <= 0) return;
    return table.map((item) => (
      <tr key={item.id}>
        <td>{item.wallet}</td>
        <td>{item.coin_key}</td>
        <td>{item.amount}</td>
        <td>{item.created_at}</td>
        <td>{item.userName}</td>
        <td>{item.email}</td>
        <td>{item.wallet_amount}</td>
      </tr>
    ));
  };
  const renderTableSpin = function () {
    return fetchDataTableStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderTableEmpty = function () {
    return fetchDataTableStatus !== api_status.fetching &&
      (!dataTable || dataTable.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderTableContent = function () {
    return fetchDataTableStatus !== api_status.fetching &&
      dataTable &&
      dataTable.length > 0
      ? ""
      : "--d-none";
  };
  const fetchHistorySwapAdminDebounced = useCallback(
    debounce(fetchHistorySwapAdmin, 1000),
    []
  );

  useEffect(() => {
    fetchListCoin();
    fetchHistorySwapAdmin(1);
  }, []);

  return (
    <div className={css["swapAdmin"]}>
      <div className={css["swapAdmin__header"]}>
        <div className={css["swapAdmin__title"]}>Swap</div>
        <div className={`row ${css["swapAdmin__filter"]}`}>
          <div className={`col-md-12 col-7 pl-0 row`}>
            <div className="col-12 row pl-0">
              <div
                data-tab={filterType.coin}
                onClick={tabCLickHandle.bind(null, filterType.coin)}
                className={`col-sm-6 col-lg-5 col-3 ${renderClassActiveTabCoin()} ${
                  css["swapAdmin__tabItem"]
                }`}
              >
                Coin
              </div>
              <div
                data-tab={filterType.username}
                onClick={tabCLickHandle.bind(null, filterType.username)}
                className={`col-sm-6 col-lg-5 col-3 ${renderClassActiveTabUserName()} ${
                  css["swapAdmin__tabItem"]
                }`}
              >
                UserName
              </div>
              <div
                data-tab={"none"}
                className={`d-sm-0 col-lg-2 col-6 ${css["swapAdmin__tabItem"]}`}
              ></div>
            </div>
            <div
              className={`row ${
                css["swapAdmin__list-coin"]
              } ${renderClassShowTabContentCoin()}`}
            >
              {renderListCoin(listCoin)}
              <span
                className={`${css["spin-container"]} ${renderListCoinSpin()}`}
              >
                <Spin />
              </span>
            </div>
            <div
              className={`col-12 row p-0 alignItem-c ${renderClassShowTabContentUsername()}`}
            >
              <div className="col-12 pl-0">
                <Input
                  value={userName}
                  onChange={inputUserNameChangeHandle}
                  placeholder={"userName"}
                />
              </div>
            </div>
          </div>
          <div className={`col-md-12 col-5 ${css["swapAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItem}
            />
          </div>
        </div>
      </div>
      <div className={css["swapAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Coin_key</th>
              <th>Amount</th>
              <th>created_at</th>
              <th>userName</th>
              <th>email</th>
              <th>wallet_amount</th>
            </tr>
          </thead>
          <tbody className={renderTableContent()}>
            {renderTable(dataTable)}
          </tbody>
          <tbody className={renderTableSpin()}>
            <tr>
              <td colSpan={7}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderTableEmpty()}>
            <tr>
              <td colSpan={7}>
                <div>
                  <EmptyCustom></EmptyCustom>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
