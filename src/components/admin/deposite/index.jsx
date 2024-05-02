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
import { exportExcel, formatNumber, shortenHash } from "src/util/common";
import { availableLanguageCodeMapper } from "src/translation/i18n";
import CopyButton from "src/components/Common/copy-button";

function Deposite() {

  // phần phân trang
  const [page, setPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = function (page) {
    fetApiGetHistoryDepositAdmin(page);
  };


  // phần main data
  const [mainData, setMainData] = useState();
  const [loadMainDataStatus, setLoadMainDataStatus] = useState(
    api_status.pending
  );
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


  // phần render table
  const renderTable = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item, index) => (
      <tr key={index}>
        <td>{item.coin_key}</td>
        <td>{item.created_at}</td>
        <td>{item.message}</td>
        <td>{formatNumber(item.amount, availableLanguageCodeMapper.en, -1)}</td>
        <td>
          {
            item.hash && <div className="d-flex alignItem-c gap-1">
              {shortenHash(item.hash)}
              <CopyButton
                value={item.hash}
              />
            </div>
          }
        </td>
        <td>
          {
            item.address && <div className="d-flex alignItem-c gap-1">
              {shortenHash(item.address)}
              <CopyButton
                value={item.address}
              />
            </div>
          }
        </td>
        <td>{item.userName}</td>
        <td>{item.email}</td>
      </tr>
    ));
  };
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


  // phần xuất excel
  const [callApiExcelStatus, setCallApiExcelStatus] = useState(api_status.pending);
  const fetchTransferExcel = async function () {
    try {
      const resp = await getHistoryDepositAdminAllExcel();
      return resp.data.data;
    } catch (error) {
      throw error;
    }
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


  // useEffect
  useEffect(() => {
    fetApiGetHistoryDepositAdmin(1);
  }, []);

  return (
    <div className={css["deposit"]}>
      <div className={css["deposit__header"]}>
        <div className={css["deposit__title"]}>Deposit</div>
        <div className={`row ${css["deposit__filter"]}`}>
          <div className={`col-md-12 col-6 pl-0`}>
            <Button
              loading={callApiExcelStatus === api_status.fetching}
              onClick={exportExcelClickHandle}
            >
              <i className="fa-solid fa-download"></i>
              Export Excel
            </Button>
          </div>
          <div className={`col-md-12 col-6 ${css["deposit__paging"]}`}>
            <Pagination
              current={page}
              onChange={pageChangeHandle}
              total={totalItem}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
      <div className={css["deposit__content"]}>
        <table>
          <thead>
            <tr>
              <th>Coin Key</th>
              <th>Create At</th>
              <th>Message</th>
              <th>Amount</th>
              <th>Hash</th>
              <th>Address</th>
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
