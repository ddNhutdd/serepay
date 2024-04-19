import { Pagination, Spin } from "antd";
import css from "./deposite.module.scss";
import React, { useEffect } from "react";
import { Button } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { useState, useRef } from "react";
import { api_status } from "src/constant";
import {
  getHistoryDepositAdmin,
  getHistoryDepositAdminAllExcel,
} from "src/util/adminCallApi";
import { exportExcel, formatNumber } from "src/util/common";
import { availableLanguageCodeMapper } from "src/translation/i18n";

function Deposite() {
  const [mainData, setMainData] = useState();
  const [loadMainDataStatus, setLoadMainDataStatus] = useState(
    api_status.pending
  );
  const [callApiExcelStatus, setCallApiExcelStatus] = useState(
    api_status.pending
  );
  const [page, setPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);

  const limit = useRef(10);

  const renderClassSpinComponent = function () {
    return loadMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmptyComponent = function () {
    return loadMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderClassDataTable = function () {
    return loadMainDataStatus !== api_status.fetching &&
      mainData &&
      mainData.length > 0
      ? ""
      : "--d-none";
  };
  const renderTable = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item, index) => (
      <tr key={index}>
        <td>{item.coin_key}</td>
        <td>{item.created_at}</td>
        <td>{item.message}</td>
        <td>{formatNumber(item.before_amount, availableLanguageCodeMapper.en, -1)}</td>
        <td>{formatNumber(item.amount, availableLanguageCodeMapper.en, -1)}</td>
        <td>{formatNumber(item.after_amount, availableLanguageCodeMapper.en, -1)}</td>
        <td>{item.userName}</td>
        <td>{item.email}</td>
      </tr>
    ));
  };
  const fetApiGetHistoryDepositAdmin = async function (page = 1) {
    try {
      if (loadMainDataStatus === api_status.fetching) return;
      setLoadMainDataStatus(() => api_status.fetching);
      const resp = await getHistoryDepositAdmin({
        limit: limit.current,
        page,
      });
      const { array, total } = resp.data.data;
      setMainData(() => array);
      setTotalItem(() => total);
      setLoadMainDataStatus(() => api_status.fulfilled);
      setPage(() => page);
      return { array, total };
    } catch (error) {
      setLoadMainDataStatus(() => api_status.rejected);
    }
  };
  const pageChangeHandle = function (page) {
    fetApiGetHistoryDepositAdmin(page);
  };
  const exportExcelClickHandle = async function () {
    try {
      if (callApiExcelStatus === api_status.fetching) return;
      setCallApiExcelStatus(() => api_status.fetching);
      const resp = await fetchTransferExcel();
      await exportExcel(resp, "Transfer", "Transfer");
      setCallApiExcelStatus(() => api_status.fulfilled);
    } catch (error) {
      setCallApiExcelStatus(() => api_status.rejected);
    }
  };

  const fetchTransferExcel = async function () {
    try {
      const resp = await getHistoryDepositAdminAllExcel();
      return resp.data.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetApiGetHistoryDepositAdmin(1);
  }, []);

  return (
    <div className={css["deposite"]}>
      <div className={css["deposite__header"]}>
        <div className={css["deposite__title"]}>Deposite</div>
        <div className={`row ${css["deposite__filter"]}`}>
          <div className={`col-md-12 col-6 pl-0`}>
            <Button
              loading={callApiExcelStatus === api_status.fetching}
              onClick={exportExcelClickHandle}
            >
              Export Excel All Transfer
            </Button>
          </div>
          <div className={`col-md-12 col-6 ${css["deposite__paging"]}`}>
            <Pagination
              current={page}
              onChange={pageChangeHandle}
              total={totalItem}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
      <div className={css["deposite__content"]}>
        <table>
          <thead>
            <tr>
              <th>Coin Key</th>
              <th>Create At</th>
              <th>Message</th>
              <th>Before Amount</th>
              <th>Amount</th>
              <th>After Amount</th>
              <th>UserName</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody className={renderClassDataTable()}>{renderTable()}</tbody>
          <tbody className={renderClassSpinComponent()}>
            <tr>
              <td colSpan={8}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderClassEmptyComponent()}>
            <tr>
              <td colSpan={8}>
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

export default Deposite;
