import { Pagination, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { EmptyCustom } from "src/components/Common/Empty";
import css from "./transferAdmin.module.scss";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { api_status } from "src/constant";
import socket from "src/util/socket.js";
import { historytransferAdmin } from "src/util/adminCallApi.js";
import { formatNumber, rountRange } from "src/util/common.js";
import { availableLanguage } from "src/translation/i18n.js";

export default function TransferAdmin() {
  const [callApiMainApiStatus, setCallApiMainApiStatus] = useState(
    api_status.pending
  );

  const [listCoin, setListCoin] = useState();
  const [listTransfer, setListTransfer] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [seletedCoin, setSeletedCoin] = useState("ALL");

  const getListCoin = function () {
    return new Promise((resolve, reject) => {
      socket.once("listCoin", (resp) => {
        resolve(resp);
      });
    });
  };
  const fetchApiLoadData = function (page = 1, symbol = "", username = "") {
    return new Promise((resolve, reject) => {
      const obj = processQuery(page, symbol, username);
      historytransferAdmin(obj)
        .then((resp) => {
          const { array, total } = resp.data.data;
          resolve({ array, total });
        })
        .catch((error) => {});
    });
  };
  const processQuery = function (page, symbol, username) {
    const result = {
      limit: 10,
      page,
    };
    if (symbol)
      return {
        ...result,
        query: `coin_key = '${symbol}'`,
      };
    if (username)
      return {
        ...result,
        query: `POSITION('${username}' IN address_form) OR POSITION('${username}' IN address_to)`,
      };
    return result;
  };
  const loadDataFirstTime = function () {
    if (callApiMainApiStatus === api_status.fetching) return;
    setCallApiMainApiStatus(() => api_status.fetching);
    Promise.all([getListCoin(), fetchApiLoadData()])
      .then((resp) => {
        setListCoin(() => resp.at(0));
        setCallApiMainApiStatus(() => api_status.fulfilled);
        setListTransfer(() => resp.at(1).array);
        setTotalItem(() => resp.at(0).total);
        setCurrentPage(() => 1);
      })
      .catch((err) => {
        setCallApiMainApiStatus(() => api_status.reject);
      });
  };
  const renderListCoin = function (listCoin) {
    if (!listCoin || listCoin.length <= 0) return;
    const listCoinNew = [
      {
        id: "all",
        name: "ALL",
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
    // fetchApiLoadData(1, coinName, undefined);
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
    return callApiMainApiStatus !== api_status.fetching;
  };

  useEffect(() => {
    loadDataFirstTime();
  }, []);

  return (
    <div className={css["transferAdmin"]}>
      <div className={css["transferAdmin__header"]}>
        <div className={css["transferAdmin__title"]}>Transfer</div>
        <div className={`row ${css["transferAdmin__filter"]}`}>
          <div
            className={`col-md-12 col-7 row ${css["transferAdmin__list-coin"]}`}
          >
            {renderListCoin(listCoin)}
          </div>
          <div className={`col-md-12 col-5 ${css["transferAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              // current={currentPage}
              // onChange={pageChangeHandle}
              // total={totalItem}
            />
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
          <tbody className="">{renderTable(listTransfer)}</tbody>
          <tbody className={renderClassSpinComponent()}>
            <tr>
              <td colSpan={6}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className="--d-none">
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
