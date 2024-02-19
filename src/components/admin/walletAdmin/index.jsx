import React, { useEffect, useState, useRef } from "react";
import css from "./walletAdmin.module.scss";
import { Pagination, Spin } from "antd";
import { EmptyCustom } from "src/components/Common/Empty";
import { Input } from "src/components/Common/Input";
import { Button } from "src/components/Common/Button";
import { api_status } from "src/constant";
import {
  getAllUser,
  getWalletToUserAdmin,
  searchUserFromUserName,
  updateAmountWalletToId,
} from "src/util/adminCallApi";
import socket from "src/util/socket";
import {
  debounce,
  formatNumber,
  formatStringNumberCultureUS,
  rountRange,
} from "src/util/common";
import { commontString } from "src/constant/index.js";
import { availableLanguage } from "src/translation/i18n";
import {
  callToastError,
  callToastSuccess,
} from "src/function/toast/callToast.js";

function WalletAdmin() {
  const [fetchTableDataStatus, setFetchTableDataStatus] = useState(
    api_status.pending
  );
  const [fetchControlStatus, setFetchControlStatus] = useState(
    api_status.pending
  );

  const [, setRe_render] = useState(true); // avoid closure
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [listCoin, setListCoin] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");

  const listButtonStatus = useRef({});
  const limit = useRef(10);
  const userId = useRef(0);
  const searchValue = useRef("");

  const fetchApiLoadUser = async function (page) {
    if (fetchTableDataStatus == api_status.fetching) return;
    setFetchTableDataStatus(() => api_status.fetching);
    const allUser = await getAllUser({
      limit: limit.current,
      page,
    });
    setFetchTableDataStatus(() => api_status.fulfilled);
    const { array, total } = allUser.data.data;
    setCurrentPage(() => page);
    setTableData(() => array);
    setTotalItems(() => total);
  };
  const renderTable = function () {
    if (!tableData || tableData.length <= 0) return;
    const setActive = function (email) {
      return selectedUserEmail === email ? css["hightLight"] : "";
    };
    return tableData.map((item) => (
      <tr
        onClick={rowTableClickHandle.bind(
          null,
          item.id,
          item.username,
          item.email
        )}
        key={item.id}
        data-id={item.id}
        className={setActive(item.email)}
      >
        <td>{item.username}</td>
        <td>{item.email}</td>
      </tr>
    ));
  };
  const renderClassShowTableSpin = function () {
    return fetchTableDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassShowEmptyTable = function () {
    return fetchTableDataStatus !== api_status.pending &&
      (!tableData || tableData.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderClassShowTableContent = function () {
    return fetchTableDataStatus !== api_status.pending &&
      fetchTableDataStatus !== api_status.fetching &&
      tableData &&
      tableData.length > 0
      ? ""
      : "--d-none";
  };
  const tablePagingChangeHandle = function (page) {
    loadTableData(page);
  };
  const fetchApiGetListCoin = function () {
    setFetchControlStatus(() => api_status.fetching);
    socket.once("listCoin", (resp) => {
      setListCoin(resp);
      setFetchControlStatus(() => api_status.fulfilled);

      const statusButton = {};
      for (const coin of resp) {
        statusButton[coin.name] = false;
      }

      listButtonStatus.current = statusButton;
    });
  };
  const renderClassShowSpinAction = function () {
    return fetchControlStatus === api_status.fetching ? "" : "--d-none";
  };
  const rowTableClickHandle = function (id, username, email, ev) {
    ev.stopPropagation();
    if (fetchControlStatus === api_status.fetching) return;
    userId.current = id;
    setSelectedUserEmail(() => email);
    setSelectedUsername(() => username);

    fetchApiGetWalletToUserAdmin(id).catch((error) => {
      setFetchControlStatus(() => api_status.rejected);
    });
  };
  const fetchApiGetWalletToUserAdmin = async function (userid) {
    if (fetchControlStatus === api_status.fetching) return;
    setFetchControlStatus(() => api_status.fetching);
    const userWallet = await getWalletToUserAdmin({
      userid,
    });
    setFetchControlStatus(() => api_status.fulfilled);
    const dataWallet = userWallet?.data?.data;
    bindDataToControl(dataWallet);
  };
  const bindDataToControl = function (dataWallet) {
    if (!dataWallet || dataWallet.length <= 0) return;
    const allInput = document.querySelectorAll("input[id^='input__']");
    allInput.forEach((input) => (input.value = "0"));

    for (const [key, value] of Object.entries(dataWallet)) {
      const coinName = key.replace("_balance", "").toUpperCase();
      const itemFromListCoin = listCoin.find((item) => item.name === coinName);
      if (!itemFromListCoin) continue;
      const input = document.getElementById(`input__${coinName}`);
      if (!input) continue;
      input.value = formatNumber(
        value,
        availableLanguage.en,
        rountRange(itemFromListCoin.price)
      );
    }
  };
  const renderControl = function () {
    if (!listCoin || listCoin.length <= 0) return;

    return listCoin.map((item) => (
      <div key={item.id} className="row">
        <label
          className="col-12 pb-0 pl-sm-0 m-0"
          htmlFor={`inputContainer${item.name}`}
        >
          {item.name}
        </label>
        <div
          id={`inputContainer${item.name}`}
          className="col-sm-12 col-9 pl-sm-0"
        >
          <Input id={`input__${item.name}`} onChange={inputOnchangeHandle} />
        </div>
        <div className="col-sm-12 col-3 pl-0">
          <Button
            loading={renderLoadingButton(item.name)}
            id={`button__${item.name}`}
            className={`--d-none`}
            onClick={saveClickHandle.bind(null, item.name)}
          >
            Save
          </Button>
        </div>
      </div>
    ));
  };
  const renderLoadingButton = function (coinName) {
    return listButtonStatus.current[coinName];
  };
  const inputOnchangeHandle = function (ev) {
    ev.stopPropagation();
    ev.target.value = formatInputFromCoin(ev.target.value);
    const name = ev.target.id.split("__").at(1);
    showButton(name);
  };
  const showButton = function (coinname) {
    const button = document.getElementById(`button__${coinname}`);
    if (!button) return;
    button.classList.remove("--d-none");
  };
  const formatInputFromCoin = function (inputValue) {
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      return inputValue.slice(0, inputValue.length - 1);
    }
    return formatStringNumberCultureUS(inputValueWithoutComma);
  };
  const renderClassShowActionContent = function () {
    return fetchControlStatus !== api_status.fetching && selectedUserEmail
      ? ""
      : "--d-none";
  };
  const setButtonStatus = function (coinName, value) {
    listButtonStatus.current[coinName] = value;
    setRe_render((s) => !s);
  };
  const saveClickHandle = function (coinName) {
    const amount = document
      .getElementById(`input__${coinName}`)
      .value.replaceAll(",", "");

    fetchApiUpdateAmountWalletToId(coinName, amount);
  };
  const fetchApiUpdateAmountWalletToId = async function (coinname, amount) {
    try {
      setButtonStatus(coinname, true);
      await updateAmountWalletToId({
        userid: userId.current,
        amount,
        symbol: coinname,
      });
      setButtonStatus(coinname, false);
      hideButton(coinname);
      callToastSuccess(commontString.success);
    } catch (error) {
      callToastError(commontString.error);
      setButtonStatus(coinname, false);
    }
  };
  const hideButton = function (coinname) {
    const ele = document.getElementById(`button__${coinname}`);
    if (!ele) return;
    !ele.classList.contains("--d-none") && ele.classList.add("--d-none");
  };
  const searchChangeHandle = function (ev) {
    const value = ev.target.value;
    searchValue.current = value;
    fetchApiSearchUserFromUserNameDebouced(1, value);
  };
  const fetchApiSearchUserFromUserName = async function (page, userName) {
    try {
      if (fetchTableDataStatus === api_status.fetching) return;
      setFetchTableDataStatus(() => api_status.fetching);
      const resp = await searchUserFromUserName({
        limit: limit.current,
        page,
        keywork: userName,
      });
      const { array, total } = resp.data.data;
      setTableData(() => array);
      setTotalItems(() => total);
      setCurrentPage(() => page);
      setFetchTableDataStatus(() => api_status.fulfilled);
    } catch (error) {
      setFetchTableDataStatus(() => api_status.rejected);
    }
  };
  const fetchApiSearchUserFromUserNameDebouced = debounce(
    fetchApiSearchUserFromUserName,
    1000
  );
  const loadTableData = function (page) {
    if (searchValue.current) {
      fetchApiSearchUserFromUserName(page, searchValue.current);
    } else {
      fetchApiLoadUser(page);
    }
  };

  useEffect(() => {
    fetchApiLoadUser(1).catch((error) => {
      setFetchTableDataStatus(() => api_status.rejected);
    });
    fetchApiGetListCoin();
  }, []);

  return (
    <div className={css["walletAdmin"]}>
      <div className={css["walletAdmin__header"]}>
        <div className={css["walletAdmin__title"]}>Wallet</div>
      </div>
      <div className={css["walletAdmin__content"]}>
        <div className="row">
          <div className="col-md-12 col-6 pl-0">
            <div className={`col-12 p-0`}>
              <Input
                onChange={searchChangeHandle}
                placeholder={`Search by username`}
              />
            </div>
            <div className={`col-12 px-0 ta-r ${css["walletAdmin__paging"]}`}>
              <Pagination
                showSizeChanger={false}
                current={currentPage}
                total={totalItems}
                onChange={tablePagingChangeHandle}
              />
            </div>
            <div className={css["walletAdmin__table-container"]}>
              <table>
                <thead>
                  <tr>
                    <td>Username</td>
                    <td>Email</td>
                  </tr>
                </thead>
                <tbody className={renderClassShowTableContent()}>
                  {renderTable()}
                </tbody>
                <tbody className={renderClassShowTableSpin()}>
                  <tr>
                    <td colSpan={2}>
                      <div className="spin-container">
                        <Spin />
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody className={renderClassShowEmptyTable()}>
                  <tr>
                    <td colSpan={2}>
                      <EmptyCustom />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className={`col-md-12 col-6 pl-sm-0 pr-0 order-md--1 ${css["walletAdmin__rightContent"]} `}
          >
            <div className={`spin-container ${renderClassShowSpinAction()}`}>
              <Spin />
            </div>
            <div className={`row ${renderClassShowActionContent()}`}>
              <label className={`col-sm-12 col-6 mb-0 pl-sm-0`}>
                Username:{` ${selectedUsername}`}
              </label>
              <label className={`col-sm-12 col-6 mb-0 pl-sm-0`}>
                Email:{` ${selectedUserEmail}`}
              </label>
            </div>
            <div
              className={`${
                css["walletAdmin__control"]
              } ${renderClassShowActionContent()}`}
            >
              {renderControl()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletAdmin;
