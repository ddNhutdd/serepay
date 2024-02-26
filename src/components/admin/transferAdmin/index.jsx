import { Pagination, Spin } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { EmptyCustom } from "src/components/Common/Empty";
import css from "./transferAdmin.module.scss";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { api_status } from "src/constant";
import socket from "src/util/socket.js";
import { historytransferAdmin } from "src/util/adminCallApi.js";
import { debounce, formatNumber, rountRange } from "src/util/common.js";
import { availableLanguage } from "src/translation/i18n.js";
import { Input } from "src/components/Common/Input";

export default function TransferAdmin() {
  const all = "ALL";
  const filterType = {
    coin: "coin",
    username: "username",
  };

  const [callApiMainApiStatus, setCallApiMainApiStatus] = useState(
    api_status.pending
  );
  const [callApiListCoin, setCallApiListCoin] = useState(api_status.pending);
  const [callApiExportExcelStatus, setCallApiExportExcelStatus] = useState(
    api_status.pending
  );

  const [listCoin, setListCoin] = useState();
  const [listTransfer, setListTransfer] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [seletedCoin, setSeletedCoin] = useState(all);
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState(filterType.coin);

  const getListCoin = function () {
    setCallApiListCoin(() => api_status.fetching);
    return new Promise((resolve, reject) => {
      socket.once("listCoin", (resp) => {
        resolve(resp);
        setListCoin(() => resp);
        setCallApiListCoin(() => api_status.fulfilled);
      });
    });
  };
  const fetchApiLoadData = function (
    page = 1,
    symbol = all,
    username = "",
    filter = filterType.coin
  ) {
    if (callApiMainApiStatus === api_status.fetching) return;
    setCallApiMainApiStatus(() => api_status.fetching);
    return new Promise((resolve, reject) => {
      const obj = processQuery({ page, symbol, username, filter });
      historytransferAdmin(obj)
        .then((resp) => {
          const { array, total } = resp.data.data;
          setListTransfer(() => array);
          setTotalItem(() => total);
          setCurrentPage(() => page);
          setCallApiMainApiStatus(() => api_status.fulfilled);
          resolve({ array, total });
        })
        .catch((error) => {
          setCallApiMainApiStatus(() => api_status.reject);
        });
    });
  };
  const processQuery = function ({ page, filter, symbol, username }) {
    const result = {
      limit: 10,
      page,
    };

    if (filter === filterType.coin) {
      if (symbol !== all)
        return {
          ...result,
          query: `coin_key = '${symbol}'`,
        };
    } else if (filter === filterType.username)
      return {
        ...result,
        query: `POSITION('${username}' IN address_form) OR POSITION('${username}' IN address_to)`,
      };
    return result;
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
          className={`${css["transferAdmin__coin-item"]}  ${setActiveListCoin(
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
    fetchApiLoadData(1, coinName, undefined, filterType.coin);
  };
  const renderTable = function (listTransfer) {
    if (
      !listTransfer ||
      listTransfer.length <= 0 ||
      !listCoin ||
      listCoin.length <= 0
    )
      return;
    return listTransfer.map((item) => (
      <tr key={item.id}>
        <td>{item.coin_key.toUpperCase()}</td>
        <td>{item.created_at}</td>
        <td>
          {formatNumber(
            item.amount,
            availableLanguage.en,
            rountRange(
              listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                ?.price || 10000
            )
          )}
        </td>
        <td>{item.address_form}</td>
        <td>{item.address_to}</td>
        <td>{item.note}</td>
      </tr>
    ));
  };
  const renderClassSpinComponent = function () {
    return callApiMainApiStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmptyComponent = function () {
    return callApiMainApiStatus !== api_status.fetching &&
      listTransfer &&
      listTransfer.length <= 0
      ? ""
      : "--d-none";
  };
  const renderClassDataTable = function () {
    return callApiMainApiStatus !== api_status.fetching &&
      listTransfer &&
      listTransfer.length > 0
      ? ""
      : "--d-none";
  };
  const pageChangeHandle = function (page) {
    fetchApiLoadData(page, seletedCoin, userName, filter);
  };
  const renderClassSpinListCoin = function () {
    return callApiListCoin === api_status.pending ? "" : "--d-none";
  };
  const fetchApiLoadDataDebounced = useCallback(
    debounce(fetchApiLoadData, 1000),
    []
  );
  const inputUserNameChangeHandle = function (e) {
    const stringValue = e.target.value;
    setUserName(() => stringValue);
    fetchApiLoadDataDebounced(1, seletedCoin, stringValue, filterType.username);
  };
  const tabCLickHandle = function (filter, ev) {
    if (
      callApiMainApiStatus === api_status.pending ||
      callApiListCoin === api_status.pending
    )
      return;

    const isNone = ev.currentTarget.dataset.tab === "none";
    if (isNone) return;

    const container = ev.currentTarget.closest(".row");
    const classActive = css["active"];
    for (const tab of container.children) {
      tab.classList.remove(classActive);
    }
    ev.currentTarget.classList.add(classActive);

    setFilter(() => filter);
    filter === filterType.coin && setUserName(() => "");

    fetchApiLoadData(1, seletedCoin, userName, filter);
  };
  const renderClassShowTabContentCoin = function () {
    return filter === filterType.coin ? "" : "--d-none";
  };
  const renderClassShowTabContentUsername = function () {
    return filter === filterType.username ? "" : "--d-none";
  };
  const exportExcelHandle = async function () {
    try {
    } catch (error) {}
  };

  useEffect(() => {
    getListCoin();
    fetchApiLoadData();
  }, []);

  return (
    <div className={css["transferAdmin"]}>
      <div className={css["transferAdmin__header"]}>
        <div className={css["transferAdmin__title"]}>Transfer</div>
        <div className={`row ${css["transferAdmin__filter"]}`}>
          <div className={`col-md-12 col-7 pl-0 row`}>
            <div className="col-12 row pl-0">
              <div
                data-tab={filterType.coin}
                onClick={tabCLickHandle.bind(null, filterType.coin)}
                className={`col-sm-6 col-lg-5 col-3 ${css["active"]} ${css["transferAdmin__tabItem"]}`}
              >
                Coin
              </div>
              <div
                data-tab={filterType.username}
                onClick={tabCLickHandle.bind(null, filterType.username)}
                className={`col-sm-6 col-lg-5 col-3  ${css["transferAdmin__tabItem"]}`}
              >
                UserName
              </div>
              <div
                data-tab={"none"}
                className={`d-sm-0 col-lg-2 col-6 ${css["transferAdmin__tabItem"]}`}
              ></div>
            </div>
            <div
              className={`row ${
                css["transferAdmin__list-coin"]
              } ${renderClassShowTabContentCoin()}`}
            >
              {renderListCoin(listCoin)}
              <span
                className={`${
                  css["spin-container"]
                } ${renderClassSpinListCoin()}`}
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
                  placeholder={"UserName"}
                />
              </div>
            </div>
          </div>
          <div className={`col-md-12 col-5 ${css["transferAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItem}
            />
          </div>
          <div className={`row p-0 mb-3`}>
            <Button onClick={exportExcelHandle}>
              Export Excel All Transfer
            </Button>
          </div>
        </div>
      </div>
      <div className={css["transferAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>Coin_key</th>
              <th>Create_at</th>
              <th>Mount</th>
              <th>Address From</th>
              <th>Address To</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody className={renderClassDataTable()}>
            {renderTable(listTransfer)}
          </tbody>
          <tbody className={renderClassSpinComponent()}>
            <tr>
              <td colSpan={6}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderClassEmptyComponent()}>
            <tr>
              <td colSpan={6}>
                <div className="spin-container">
                  <EmptyCustom />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
