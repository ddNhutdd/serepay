import React, { useEffect, useState, useRef } from "react";
import { Pagination, Spin, Modal } from "antd";
import { EmptyCustom } from "src/components/Common/Empty";
import { api_status } from "src/constant";
import socket from "src/util/socket";
import { Button, buttonClassesType } from "src/components/Common/Button";
import {
  confirmAds,
  getAdsToWhere,
  getAllAds,
  getAllAdsPending,
  refuseAds,
} from "src/util/adminCallApi";
import { TagCustom, TagType } from "src/components/Common/Tag";
import { ModalConfirm } from "src/components/Common/ModalConfirm";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import AdsHistoryRecord, {
  AdsHistoryRecordType,
} from "src/components/adsHistoryRecord";

function Ads() {
  const actionType = {
    all: "All",
    buy: "Buy",
    sell: "Sell",
  };

  const [callApiListCoinStatus, setCallApiListCoinStatus] = useState(
    api_status.pending
  );
  const [callApiMainDataStatus, setCallApiMainDataStatus] = useState(
    api_status.pending
  );
  const [callApiProcessStatus, setCallApiProcessStatus] = useState(
    api_status.pending
  ); //Manage status for both agree and decline
  const [listCoin, setListCoin] = useState([]);
  const [isShowDropdownAction, setIsShowDropdownAction] = useState();
  const [actionFilterSelected, setActionFilterSelected] = useState(
    actionType.all
  );
  const [isPending, setIsPending] = useState(false);
  const [isModalCoinOpen, setIsModalCoinOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("ALL");
  const [mainData, setMainData] = useState();
  const [totalItems, setTotalItems] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isButtonAcceptClick, setIsButtonAcceptClick] = useState(false); //In a table with many buttons, if one of the accept buttons is clicked, the variable has the value true, if one of the reject buttons is clicked, the variable has the value false.

  const limit = useRef(10);
  const idSelectedAds = useRef();

  useEffect(() => {
    document.addEventListener("click", closeDropdownAction);
    fetchListCoin();
    fetchApiAllData(1);
    return () => {
      document.removeEventListener("click", closeDropdownAction);
    };
  }, []);
  useEffect(() => {
    loadData({ page: 1 });
  }, [actionFilterSelected, selectedCoin]);

  const dropdownActionToggle = function (e) {
    e.stopPropagation();
    setIsShowDropdownAction((s) => !s);
  };
  const closeDropdownAction = function () {
    setIsShowDropdownAction(() => false);
  };
  const renderClassShowMenuAction = function () {
    return isShowDropdownAction ? "show" : "";
  };
  const actionTypeClickHandle = function (action) {
    setActionFilterSelected(() => action);
  };
  const renderClassWithAction = function () {
    return actionFilterSelected === actionType.all ? "--d-none" : "";
  };
  const modalCoinCancelHandle = function () {
    setIsModalCoinOpen(() => false);
  };
  const openModalCoin = function () {
    setIsModalCoinOpen(() => true);
  };
  const fetchListCoin = function () {
    return new Promise((resolve, reject) => {
      if (callApiListCoinStatus === api_status.fetching) resolve([]);
      else setCallApiListCoinStatus(api_status.fetching);
      socket.once("listCoin", (resp) => {
        setCallApiListCoinStatus(() => api_status.fulfilled);
        setListCoin(() => resp);
        resolve(resp);
      });
    });
  };
  const renderClassCoinSpin = function () {
    return callApiListCoinStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderListCoin = function () {
    const newListCoin = [{ name: "ALL" }, ...listCoin];
    return newListCoin.map((record) => (
      <div key={record.name}>
        <Button
          onClick={coinClickHandle.bind(null, record.name)}
          className={`ads-modal-coin-content__item ${
            record.name === selectedCoin ? "active" : ""
          }`}
          type={buttonClassesType.outline}
        >
          {record.name}
        </Button>
      </div>
    ));
  };
  const coinClickHandle = function (coinName) {
    setSelectedCoin(() => coinName);
    modalCoinCancelHandle();
  };
  const fetchApiAllData = function (page) {
    return new Promise((resolve, reject) => {
      if (callApiMainDataStatus === api_status.fetching) resolve([]);
      else setCallApiMainDataStatus(api_status.fetching);
      clearData();
      getAllAds({
        limit: limit.current,
        page,
      })
        .then((resp) => {
          const data = resp.data.data;
          setMainData(() => data.array);
          setCurrentPage(page);
          setTotalItems(() => data.total);
          setCallApiMainDataStatus(() => api_status.fulfilled);
          resolve(data.array);
        })
        .catch((err) => {
          console.log(err);
          setCallApiMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const clearData = function () {
    setMainData(() => []);
    setCurrentPage(1);
    setTotalItems(1);
  };
  const renderTableContent = function () {
    return (mainData || []).map((item) => (
      <AdsHistoryRecord
        item={item}
        price={100}
        type={AdsHistoryRecordType.admin}
        rejectClickHandle={rejectClickHandle}
        acceptClickHandle={acceptClickHandle}
      />
    ));
  };
  const rejectClickHandle = function (id) {
    setIsButtonAcceptClick(() => false);
    showModalConfirm();
    idSelectedAds.current = id;
  };
  const acceptClickHandle = function (id) {
    setIsButtonAcceptClick(() => true);
    showModalConfirm();
    idSelectedAds.current = id;
  };
  const renderClassTableSpin = function () {
    return callApiMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassTableEmpty = function () {
    return callApiMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
      ? ""
      : "--d-none";
  };
  const getAllAdsPendding = function (page) {
    return new Promise((resolve, reject) => {
      if (callApiMainDataStatus === api_status.fetching) resolve(false);
      else {
        setCallApiMainDataStatus(() => api_status.fetching);
        clearData();
      }
      getAllAdsPending({
        limit: limit.current,
        page,
      })
        .then((resp) => {
          setCallApiMainDataStatus(() => api_status.fulfilled);
          setCurrentPage(() => page);
          const data = resp.data.data;
          setMainData(() => data.array);
          setTotalItems(() => data.total);
        })
        .catch((error) => {
          console.log(error);
          reject(false);
          setCallApiMainDataStatus(() => api_status.rejected);
        });
    });
  };
  const fetchApiGetAdsToWhere = function (page, where) {
    return new Promise((resolve, reject) => {
      if (callApiMainDataStatus === api_status.fetching) return resolve(false);
      else {
        setCallApiMainDataStatus(() => api_status.fetching);
        clearData();
      }
      getAdsToWhere({
        limit: limit.current,
        page,
        where,
      })
        .then((resp) => {
          const data = resp.data.data;
          setMainData(() => data.array);
          setCurrentPage(page);
          setTotalItems(() => data.total);
          setCallApiMainDataStatus(() => api_status.fulfilled);
          resolve(data.array);
        })
        .catch((err) => {
          console.log(err);
          setCallApiMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const loadData = function (
    {
      page = currentPage,
      pending = isPending,
      action = actionFilterSelected,
      coin = selectedCoin,
    } = {
      page: currentPage,
      pending: isPending,
      action: actionFilterSelected,
      coin: selectedCoin,
    }
  ) {
    if (actionFilterSelected === actionType.all) {
      if (pending) {
        getAllAdsPendding(page);
      } else {
        fetchApiAllData(page);
      }
    } else {
      const whereString = createWhereString(pending, action, coin);
      fetchApiGetAdsToWhere(page, whereString);
    }
  };
  const createWhereString = function (isPending, type, symbol) {
    const result = [];
    if (type !== actionType.all) {
      result.push(`side='${type}'`);
    }
    if (symbol !== "ALL") {
      result.push(`symbol='${selectedCoin}'`);
    }
    if (isPending) {
      result.push(`type=2`);
    }
    return result.join(" AND ");
  };
  const pendingCheckboxChangeHandle = function (e) {
    if (
      callApiListCoinStatus === api_status.fetching ||
      callApiMainDataStatus === api_status.fetching
    )
      return;
    const checked = e.target.checked;
    setIsPending(() => checked);
    loadData({ page: 1, pending: checked });
  };
  const pageChangeHandle = function (page) {
    if (
      callApiListCoinStatus === api_status.fetching ||
      callApiMainDataStatus === api_status.fetching
    )
      return;
    loadData({ page });
  };
  const renderContentModalConfirm = function () {
    return isButtonAcceptClick
      ? "Do you confirm your consent to this advertisement?"
      : "Do you have an opt-out confirmation for this ad?";
  };
  const modalConfirmHandle = function () {
    if (isButtonAcceptClick) {
      fetchApiAcceptAds();
    } else {
      fetApiRejectAds();
    }
  };
  const fetchApiAcceptAds = function () {
    return new Promise((resolve, reject) => {
      if (callApiProcessStatus === api_status.fetching) resolve(false);
      else {
        setCallApiProcessStatus(() => api_status.fetching);
      }
      confirmAds({
        id: idSelectedAds.current,
      })
        .then((resp) => {
          callToastSuccess("Success");
          closeModalConfirm();
          loadData();
          setCallApiProcessStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          callToastError("Error");
          closeModalConfirm();
          setCallApiProcessStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const fetApiRejectAds = function () {
    return new Promise((resolve, reject) => {
      if (callApiProcessStatus === api_status.fetching) resolve(false);
      else setCallApiProcessStatus(() => api_status.fetching);
      refuseAds({
        id: idSelectedAds.current,
      })
        .then((resp) => {
          callToastSuccess("Success");
          closeModalConfirm();
          loadData();
          setCallApiProcessStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          callToastError("Error");
          closeModalConfirm();
          setCallApiProcessStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const closeModalConfirm = function () {
    setIsShowModalConfirm(() => false);
  };
  const showModalConfirm = function () {
    setIsShowModalConfirm(() => true);
  };

  return (
    <div className="ads">
      <div className="ads__header">
        <h3 className="ads__title">Ads</h3>
        <div className="row ads__filterContainer">
          <div className="col-6 col-md-12 row ads__filter">
            <div className="col-6 col-sm-12 ads__dropdown-action">
              <label>Action: </label>
              <div className="ads__dropdown">
                <div
                  onClick={dropdownActionToggle}
                  className="admin__dropdown-selected"
                >
                  <span className="admin__dropdown-text">
                    {actionFilterSelected}
                  </span>
                  <span>
                    <i className="fa-solid fa-angle-down"></i>
                  </span>
                </div>
                <div
                  className={`admin__dropdown-menu ${renderClassShowMenuAction()}`}
                >
                  <div
                    onClick={actionTypeClickHandle.bind(null, actionType.all)}
                    className="admin__dropdown-item"
                  >
                    All
                  </div>
                  <div
                    onClick={actionTypeClickHandle.bind(null, actionType.buy)}
                    className="admin__dropdown-item"
                  >
                    Buy
                  </div>
                  <div
                    onClick={actionTypeClickHandle.bind(null, actionType.sell)}
                    className="admin__dropdown-item"
                  >
                    Sell
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`col-md-12 col-6 ads__dropdown-coin ${renderClassWithAction()}`}
            >
              <label>Coin:</label>
              <div onClick={openModalCoin} className="ads__dropdown ">
                <div className="admin__dropdown-selected">
                  <span className="admin__dropdown-text">{selectedCoin}</span>
                  <span>
                    <i className="fa-solid fa-angle-down"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className={`col-12 ads__checkbox`}>
              <input
                id="pendingCheckbox"
                type="checkbox"
                className="--d-none"
                checked={isPending}
                onChange={pendingCheckboxChangeHandle}
              />
              <label className="ads__checkbox-item" htmlFor="pendingCheckbox">
                <div className="ads__checkbox__label">Pending: </div>
                <div className="ads__checkbox__control">
                  <i className="fa-solid fa-check"></i>
                </div>
              </label>
            </div>
          </div>
          <div className="col-md-12 col-6  ads__paging">
            <Pagination
              defaultCurrent={1}
              pageSize={limit.current}
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItems}
            />
          </div>
        </div>
      </div>
      <div className="ads__content">
        {renderTableContent()}
        <div className={"spin-container " + renderClassTableSpin()}>
          <Spin />
        </div>
        <div className={renderClassTableEmpty()}>
          <EmptyCustom />{" "}
        </div>
      </div>
      <Modal
        title="Select Your Coin"
        open={isModalCoinOpen}
        onCancel={modalCoinCancelHandle}
        footer={false}
      >
        <div className="ads-modal-coin-content">{renderListCoin()}</div>
        <div className={"spin-container " + renderClassCoinSpin()}>
          <Spin />
        </div>
      </Modal>
      <ModalConfirm
        content={renderContentModalConfirm()}
        modalConfirmHandle={modalConfirmHandle}
        waiting={callApiProcessStatus}
        closeModalHandle={closeModalConfirm}
        isShowModal={isShowModalConfirm}
      />
    </div>
  );
}

export default Ads;
