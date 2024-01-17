import React, { useEffect, useState, useRef } from "react";
import { Pagination, Spin } from "antd";
import { EmptyCustom } from "src/components/Common/Empty";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { api_status } from "src/constant";
import {
  activeWidthdraw,
  cancelWidthdraw,
  getListWidthdrawCoin,
  getListWidthdrawCoinAll,
  getListWidthdrawCoinPendding,
} from "src/util/adminCallApi";
import socket from "src/util/socket";
import { ModalConfirm } from "src/components/Common/ModalConfirm";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input } from "src/components/Common/Input";
import { TagCustom, TagType } from "src/components/Common/Tag";

function Widthdraw() {
  const [callApiLoadMainDataStatus, setCallApiLoadMainDataStatus] = useState(
    api_status.pending
  );
  const [callApiLoadCoin, setCallApiLoadCoin] = useState(api_status.pending);
  const [callApiAcceptStatus, setCallApiAcceptStatus] = useState(
    api_status.pending
  );
  const [callApiRejectStatus, setCallApiRejectStatus] = useState(
    api_status.pending
  );
  const [listCoin, setListCoin] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("ALL");
  const [totalItem, setTotalItem] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [mainData, setMainData] = useState([]);
  const [isShowPending, setIsShowPending] = useState(false);
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isShowModalReject, setIsShowModalReject] = useState(false);

  const limit = useRef(10);
  const isChecked = useRef(false);
  const selectedWidthdraw = useRef();
  const inputReasonElement = useRef();

  useEffect(() => {
    fetchApiLoadDataAll(1);
    fetchAllCoin();
  }, []);

  const fetchApiLoadDataAll = function (page) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve([]);
      else setCallApiLoadMainDataStatus(api_status.fetching);
      clearMainData();
      getListWidthdrawCoinAll({
        limit: limit.current,
        page,
      })
        .then((resp) => {
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          const data = resp.data.data;
          setMainData(() => data.array);
          setTotalItem(() => data.total);
          resolve(data.array);
        })
        .catch((err) => {
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          console.log(err);
          setTotalItem(1);
          reject(false);
        })
        .finally(() => {
          setCurrentPage(() => page);
        });
    });
  };
  const fetchAllCoin = function () {
    return new Promise((resolve, reject) => {
      if (callApiLoadCoin === api_status.fetching) resolve(false);
      else setCallApiLoadCoin(() => api_status.fetching);
      socket.once("listCoin", (resp) => {
        setListCoin(() => resp);
        setCallApiLoadCoin(() => api_status.fulfilled);
      });
    });
  };
  const renderClassSpin = function () {
    return callApiLoadMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmpty = function () {
    if (
      callApiLoadMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
    )
      return "";
    else return "--d-none";
  };
  const renderStatus = function (status) {
    switch (status) {
      case 0:
        return <TagCustom type={TagType.error} />;
      case 1:
        return <TagCustom type={TagType.success} />;
      case 2:
        return <TagCustom type={TagType.pending} />;
      default:
        return null;
    }
  };
  const renderDataTable = function () {
    return mainData.map((record) => (
      <tr key={record.id}>
        <td>{record.coin_key.toUpperCase()}</td>
        <td>{record.amount}</td>
        <td>{record.to_address}</td>
        <td>{record.form_address}</td>
        <td>{record.note}</td>
        <td>{record.username}</td>
        <td>{record.email}</td>
        <td>{record.phone}</td>
        <td>{record.descriptions}</td>
        <td>{record.withdraw_pay_percent}</td>
        <td>{record.amount_pay_by_coin_key}</td>
        <td>{record.amount_pay_by_coin}</td>
        <td>{record.fee_amount}</td>
        <td>{record.amount_after_fee}</td>
        <td>{record.coin_rate}</td>
        <td>{record.rate}</td>
        <td>{renderStatus(record.status)}</td>
        <td>{renderAction(record.id, record.status)}</td>
      </tr>
    ));
  };
  const renderClassCoinSpin = function () {
    return callApiLoadCoin === api_status.fetching ? "" : "--d-none";
  };
  const renderListCoin = function () {
    const newList = [{ name: "ALL" }, ...listCoin];
    return newList.map((coin) => (
      <div key={coin.name}>
        <Button
          onClick={coinClickHandle.bind(null, coin.name)}
          type={buttonClassesType.outline}
          className={`widthdraw__coin-item ${
            coin.name === selectedCoin ? "active" : ""
          }`}
        >
          {coin.name}
        </Button>
      </div>
    ));
  };
  const coinClickHandle = function (coinName) {
    loadData(1, coinName);
  };
  const loadData = function (page, coinName) {
    const all = "ALL";
    if (
      callApiLoadCoin === api_status.fetching ||
      callApiLoadMainDataStatus === api_status.fetching
    )
      return;
    setSelectedCoin(coinName);
    if (coinName === all) {
      setIsShowPending(() => false);
      fetchApiLoadDataAll(page);
    } else if (coinName !== all) {
      setIsShowPending(() => true);
      if (isChecked.current) {
        fetchApiLoadDataByCoinPending(page, coinName);
      } else {
        fetchApiLoadDataByCoin(page, coinName);
      }
    }
  };
  const renderClassPending = function () {
    return isShowPending ? "" : "--d-none";
  };
  const clearMainData = function () {
    setMainData(() => []);
    setCurrentPage(() => 1);
    setTotalItem(() => 1);
  };
  const fetchApiLoadDataByCoin = function (page, symbol) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve([]);
      else {
        setCallApiLoadMainDataStatus(() => api_status.fetching);
        clearMainData();
      }
      getListWidthdrawCoin({
        limit: limit.current,
        page,
        symbol,
      })
        .then((resp) => {
          const data = resp.data.data;
          setMainData(() => data.array);
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          setTotalItem(() => data.total);
          setCurrentPage(() => page);
          resolve(data.array);
        })
        .catch((err) => {
          console.log(err);
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          reject(() => false);
        });
    });
  };
  const fetchApiLoadDataByCoinPending = function (page, symbol) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve(false);
      else {
        setCallApiLoadMainDataStatus(() => api_status.fetching);
        clearMainData();
      }
      getListWidthdrawCoinPendding({
        limit: limit.current,
        page,
        symbol,
      })
        .then((resp) => {
          const data = resp.data.data;
          setTotalItem(() => data.total);
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          setCurrentPage(() => page);
          setMainData(() => data.array);
          resolve(data.array);
        })
        .catch((error) => {
          console.log(error);
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const pendingChangeHandle = function (e) {
    const isCheckedLc = e.target.checked;
    if (
      callApiLoadMainDataStatus === api_status.fetching ||
      callApiLoadCoin === api_status.fetching
    ) {
      e.target.checked = !isCheckedLc;
      return;
    }
    isChecked.current = isCheckedLc;
    if (isCheckedLc) {
      fetchApiLoadDataByCoinPending(1, selectedCoin);
    } else {
      fetchApiLoadDataByCoin(1, selectedCoin);
    }
  };
  const pageChangeHandle = function (page) {
    loadData(page, selectedCoin); // fetch data will reset the page, if fetch data fails the page is 1
  };
  const renderAction = function (id, status) {
    if (status === 2) {
      return (
        <div className="widthdraw__action">
          <Button
            onClick={showModalConfirm.bind(null, id)}
            children={"Confirm"}
          />
          <Button
            onClick={showModalReject.bind(null, id)}
            children={"Reject"}
          />
        </div>
      );
    }
  };
  const showModalConfirm = function (id) {
    selectedWidthdraw.current = id;
    setIsShowModalConfirm(() => true);
  };
  const closeModalConfirm = function () {
    if (callApiAcceptStatus === api_status.fetching) return;
    setIsShowModalConfirm(() => false);
  };
  const fetchApiActiveWidthdraw = function (id) {
    return new Promise((resolve, reject) => {
      if (callApiAcceptStatus === api_status.fetching) resolve(false);
      else setCallApiAcceptStatus(() => api_status.fetching);
      activeWidthdraw({
        id,
      })
        .then((resp) => {
          callToastSuccess("Success");
          setCallApiAcceptStatus(() => api_status.fulfilled);
          closeModalConfirm();
          loadData(currentPage, selectedCoin);
        })
        .catch((error) => {
          console.log(error);
          callToastError("Fail");
          setCallApiAcceptStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const closeModalReject = function () {
    setIsShowModalReject(() => false);
  };
  const showModalReject = function (id) {
    selectedWidthdraw.current = id;
    setIsShowModalReject(() => true);
  };
  const renderContentModalReject = function () {
    return (
      <div className="modalRejectControl">
        <label className="modalRejectLabel" htmlFor="widthdrawReason">
          Reason
        </label>
        <Input
          ref={inputReasonElement}
          className="modalRejectInput"
          id="widthdrawReason"
        />
      </div>
    );
  };
  const fetchApiReject = function (id, note) {
    return new Promise((resolve, reject) => {
      if (callApiRejectStatus === api_status.fetching) resolve(false);
      else setCallApiRejectStatus(() => api_status.fetching);
      cancelWidthdraw({
        id,
        note,
      })
        .then((resp) => {
          callToastSuccess("Success");
          setCallApiRejectStatus(() => api_status.fulfilled);
          closeModalReject();
          loadData(currentPage, selectedCoin);
          inputReasonElement.current.value = "";
          resolve(true);
        })
        .catch((error) => {
          setCallApiRejectStatus(() => api_status.rejected);
          console.log(error);
          callToastError("Fail");
          reject(false);
        });
    });
  };
  const buttonOKModalRejectClickHandle = function () {
    const note = inputReasonElement.current.value;
    fetchApiReject(selectedWidthdraw.current, note);
  };

  return (
    <div className="widthdraw">
      <div className="widthdraw__header">
        <div className="widthdraw__title">Widthdraw</div>
        <div className="row widthdraw__filter">
          <div className="col-md-12 col-7 row widthdraw__list-coin">
            {renderListCoin()}
            <div className={renderClassCoinSpin()}>
              <Spin />
            </div>
            <div className={`widthdraw__pending ` + renderClassPending()}>
              <input
                onChange={pendingChangeHandle}
                className="--d-none"
                type="checkbox"
                id="widthdrawPending"
              />
              <label
                className="row widthdraw__pending-content"
                htmlFor="widthdrawPending"
              >
                <div className="widthdraw__pending-square">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>Pending</div>
              </label>
            </div>
          </div>
          <div className="col-md-12 col-5 widthdraw__paging">
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItem}
            />
          </div>
        </div>
      </div>
      <div className="widthdraw__content">
        <table>
          <thead>
            <tr>
              <th>Coin Key</th>
              <th>Amount</th>
              <th>To Address</th>
              <th>From Address</th>
              <th>Note</th>
              <th>UserName</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Descriptions</th>
              <th>Withdraw Pay Percent</th>
              <th>Amount Pay By Coin Key</th>
              <th>Amount Pay By Coin</th>
              <th>Fee Amount</th>
              <th>Amount After Fee</th>
              <th>Coin Rate</th>
              <th>Rate</th>
              <th>Status</th>
              <th>
                <i className="fa-solid fa-gears"></i>
              </th>
            </tr>
          </thead>
          <tbody>{renderDataTable()}</tbody>
        </table>
        <div className={renderClassEmpty()}>
          <EmptyCustom />
        </div>
        <div className={renderClassSpin() + " spin-container"}>
          <Spin />
        </div>
      </div>
      <ModalConfirm
        isShowModal={isShowModalConfirm}
        modalConfirmHandle={fetchApiActiveWidthdraw.bind(
          null,
          selectedWidthdraw.current
        )}
        closeModalHandle={closeModalConfirm}
        waiting={callApiAcceptStatus}
      />
      <ModalConfirm
        content={renderContentModalReject()}
        isShowModal={isShowModalReject}
        modalConfirmHandle={buttonOKModalRejectClickHandle}
        closeModalHandle={closeModalReject}
        waiting={callApiRejectStatus}
      />
    </div>
  );
}

export default Widthdraw;
