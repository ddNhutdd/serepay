import { Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { Input } from "src/components/Common/Input";
import { api_status, commontString } from "src/constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { currencySetFetchExchangeCount } from "src/redux/actions/currency.action";
import {
  getExchange,
  getExchangeFetchStatus,
} from "src/redux/constant/currency.constant";
import { addExchange, editExchange } from "src/util/adminCallApi";
function Exchange() {
  const dispatch = useDispatch();
  const exchanges = useSelector(getExchange);
  const exchangesFetchStatus = useSelector(getExchangeFetchStatus);
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [mainData, setMainData] = useState([]);

  const addExchangeClickHandle = function () {
    if (callApiStatus === api_status.fetching) return;
    fetchApiAddExchange();
  };
  const renderTableContent = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item) => (
      <tr
        onClick={tableRowClickHandle}
        data-id={item.id}
        data-title={item.title}
        data-rate={item.rate}
        key={item.id}
      >
        <td>
          <span data-container="title">{item.title}</span>
          <Input className="--d-none" id={`title-${item.id}`} type="text" />
        </td>
        <td>
          <span data-container="rate">{item.rate}</span>
          <Input className="--d-none" id={`rate-${item.id}`} type="text" />
        </td>
        <td>
          <div className="exchange__action">
            <Button
              onClick={editExchangeClickHandle}
              id={`saveRecord-${item.id}`}
              className="--d-none"
              disabled={disableButtonWhenPending()}
            >
              Save
            </Button>
            <Button
              disabled={disableButtonWhenPending()}
              onClick={cancelCLickHandle}
              type={buttonClassesType.outline}
              className="--d-none"
            >
              Cancel
            </Button>
          </div>
        </td>
      </tr>
    ));
  };
  const cancelCLickHandle = function (e) {
    e.stopPropagation();
    if (callApiStatus === api_status.fetching) return;
    const thisRow = e.target.closest("tr");
    hideRow(thisRow);
  };
  const hideRow = function (row) {
    const inputs = row.querySelectorAll("input");
    const spans = row.querySelectorAll("span[data-container]");
    const buttons = row.querySelectorAll("button");
    for (const item of inputs) {
      if (!item.classList.contains("--d-none")) item.classList.add("--d-none");
    }
    for (const item of spans) {
      item.classList.remove("--d-none");
    }
    for (const item of buttons) {
      if (!item.classList.contains("--d-none")) item.classList.add("--d-none");
    }
  };
  const tableRowClickHandle = function (e) {
    if (callApiStatus === api_status.fetching) return;
    const buttons = e.currentTarget.querySelectorAll("button");
    const inputs = e.currentTarget.querySelectorAll("input");
    const title = e.currentTarget.dataset.title;
    const rate = e.currentTarget.dataset.rate;
    const firstButton = Array.from(buttons).at(0);
    if (!firstButton.classList.contains("--d-none")) return;
    for (const [index, item] of Object.entries(inputs)) {
      item.classList.remove("--d-none");
      if (+index === 0) item.value = title;
      else item.value = rate;
    }
    for (const item of buttons) {
      item.classList.remove("--d-none");
    }
    const spans = e.currentTarget.querySelectorAll("[data-container]");
    for (const item of spans) {
      if (!item.classList.contains("--d-none")) item.classList.add("--d-none");
    }
  };
  const renderClassTableSpin = function () {
    return exchangesFetchStatus === api_status.pending ? "" : "--d-none";
  };
  const renderClassTableEmpty = function () {
    return exchangesFetchStatus !== api_status.pending &&
      !mainData &&
      mainData.length <= 0
      ? ""
      : "--d-none";
  };
  const fetchApiEditExchange = function (title, rate, id) {
    return new Promise((resolve, reject) => {
      if (callApiStatus === api_status.pending) resolve(false);
      else setCallApiStatus(() => api_status.fetching);
      editExchange({ title, rate, id })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          resolve(true);
          callToastSuccess(commontString.success);
        })
        .catch((error) => {
          console.log(error);
          setCallApiStatus(() => api_status.rejected);
          callToastError(commontString.error);
          reject(false);
        });
    });
  };
  const editExchangeClickHandle = function (e) {
    if (callApiStatus === api_status.fetching) return;
    e.stopPropagation();
    const thisRow = e.target.closest("tr");
    const id = thisRow.dataset.id;
    const newTitle = thisRow.querySelector("input#title-" + id).value;
    const newRate = thisRow.querySelector("input#rate-" + id).value;
    fetchApiEditExchange(newTitle, newRate, id)
      .then((resp) => {
        if (resp) {
          setNewData(thisRow, newTitle, newRate);
          hideRow(thisRow);
        }
      })
      .catch((error) => {});
  };
  const setNewData = function (row, newTitle, newRate) {
    row.dataset.title = newTitle;
    row.dataset.rate = newRate;
    const spans = row.querySelectorAll("span[data-container]");
    for (const [index, item] of Object.entries(spans)) {
      if (+index === 0) item.innerHTML = newTitle;
      else item.innerHTML = newRate;
    }
  };
  const disableButtonWhenPending = function () {
    return callApiStatus === api_status.fetching ? true : false;
  };
  const fetchApiAddExchange = function () {
    return new Promise((resolve, reject) => {
      if (callApiStatus === api_status.fetching) resolve(false);
      else setCallApiStatus(() => api_status.fetching);
      addExchange({
        title: "",
        rate: 1,
      })
        .then((resp) => {
          dispatch(currencySetFetchExchangeCount());
          callToastSuccess(commontString.success);
          setCallApiStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          setCallApiStatus(() => api_status.rejected);
          callToastError(commontString.error);
          reject(false);
        });
    });
  };

  useEffect(() => {
    return () => {
      dispatch(currencySetFetchExchangeCount());
    };
  }, []);
  useEffect(() => {
    if (
      exchanges &&
      exchanges.length > 0 &&
      exchangesFetchStatus !== api_status.fetching
    )
      setMainData(() => exchanges.reverse());
  }, [exchanges, exchangesFetchStatus]);

  return (
    <div className="admin-exchange">
      <div className="admin-exchange__header">
        <div className="admin-exchange__title">Exchange</div>
        <div>
          <Button
            disabled={disableButtonWhenPending()}
            onClick={addExchangeClickHandle}
          >
            Create
          </Button>
        </div>
      </div>
      <div className="admin-exchange__content">
        <table>
          <thead>
            <tr>
              <th className="--d-none">Id</th>
              <th>Title</th>
              <th>Rate</th>
              <th>
                <i className="fa-solid fa-gears"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {renderTableContent()}
            <tr className={renderClassTableSpin()}>
              <td colSpan="8">
                <div className={`spin-container`}>
                  <Spin />
                </div>
              </td>
            </tr>
            <tr className={renderClassTableEmpty()}>
              <td colSpan="8">
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
export default Exchange;
