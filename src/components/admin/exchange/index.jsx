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
import Row from "./row";
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
      <Row
        key={item.id}
        id={item.id}
        title={item.title}
        rate={item.rate}
      />
    ));
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
        <div className={`mt-3`}>
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
