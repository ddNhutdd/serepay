import React, { useEffect, useState, useRef } from "react";
import { Pagination, Spin, Modal } from "antd";
import { EmptyCustom } from "src/components/Common/Empty";
import { adminPermision, api_status, commontString, image_domain } from "src/constant";
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
import NoPermision from "../no-permision";
import { useSelector } from "react-redux";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
import { adminFunction } from "../sidebar";
import { analysisAdminPermision, formatNumber, rountRange } from "src/util/common";
import { availableLanguage } from "src/translation/i18n";

function Ads() {
  const actionType = {
    all: "All",
    buy: "Buy",
    sell: "Sell",
  };
  const confirmType = {
    confirm: 'confirm',
    reject: 'reject'
  }





  //kiểm tra quyền admin 
  const { permision } = useSelector(getAdminPermision);
  const currentPagePermision = analysisAdminPermision(adminFunction.ads, permision);






  // phần action
  const [actionFilterSelected, setActionFilterSelected] = useState(actionType.all);
  const dropdownActionToggle = function (e) {
    e.stopPropagation();
    setIsShowDropdownAction((s) => !s);
  };
  const actionTypeClickHandle = function (action) {
    setActionFilterSelected(() => action);
  };



  // phần phân trang
  const [totalItems, setTotalItems] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = function (page) {
    if (
      callApiListCoinStatus === api_status.fetching ||
      callApiMainDataStatus === api_status.fetching
    )
      return;
    loadData({ page });
  };



  // phần modal list coin 
  const [callApiListCoinStatus, setCallApiListCoinStatus] = useState(api_status.pending);
  const [listCoin, setListCoin] = useState([]);
  const [isShowDropdownAction, setIsShowDropdownAction] = useState();
  const [isModalCoinOpen, setIsModalCoinOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("ALL");
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
          className={`ads-modal-coin-content__item ${record.name === selectedCoin ? "active" : ""
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
  const modalCoinCancelHandle = function () {
    setIsModalCoinOpen(() => false);
  };
  const renderClassWithAction = function () {
    return actionFilterSelected === actionType.all ? "--d-none" : "";
  };




  // check box pending
  const [isPending, setIsPending] = useState(false);
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




  // phần maindata
  const [callApiMainDataStatus, setCallApiMainDataStatus] = useState(api_status.pending);
  const [mainData, setMainData] = useState();
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
          setCallApiMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
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






  // phần render table 
  const renderTableContent = function () {
    return mainData?.map((item) => (
      <tr key={item.id}>
        <td>
          <div>
            <span className="ads--low-opacity">
              Username:
            </span>
            {" "}
            {item.userName}
          </div>
          <div>
            <span className="ads--low-opacity">
              Email:
            </span>
            {" "}
            {item.email}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <span className="ads--low-opacity">
              Amount:
            </span>
            {" "}
            {formatNumber(item.amount, availableLanguage.en, rountRange(
              listCoin?.find((coin) => coin?.name === item?.symbol?.toUpperCase())
                ?.price || 10000
            ))}
            <img
              style={{ height: 20, width: 20, objectFit: 'cover' }}
              src={image_domain.replace("USDT", item.symbol.toUpperCase())}
              alt={item.symbol}
            />
          </div>
          <div className="d-flex alignItem-c gap-1">
            <span className="ads--low-opacity">
              Amount Minimum:
            </span>
            {" "}
            {formatNumber(item.amountMinimum, availableLanguage.en, rountRange(
              listCoin?.find((coin) => coin?.name === item?.symbol?.toUpperCase())
                ?.price || 10000
            ))}
            <img
              style={{ height: 20, width: 20, objectFit: 'cover' }}
              src={image_domain.replace("USDT", item.symbol.toUpperCase())}
              alt={item.symbol}
            />
          </div>
          <div className="d-flex alignItem-c gap-1">
            <span className="ads--low-opacity">
              Quantity Remaining:
            </span>
            {" "}
            {formatNumber(item.amount - item.amountSuccess, availableLanguage.en, rountRange(
              listCoin?.find((coin) => coin?.name === item?.symbol?.toUpperCase())
                ?.price || 10000
            ))}
            <img
              style={{ height: 20, width: 20, objectFit: 'cover' }}
              src={image_domain.replace("USDT", item.symbol.toUpperCase())}
              alt={item.symbol}
            />
          </div>
        </td>
        <td>
          {item.side}
        </td>
        <td>
          <div>
            <span className="ads--low-opacity">
              Created at:
            </span>
            {" "}
            {item.created_at}
          </div>
          <div>
            {renderStatus(item.type)}
          </div>
        </td>
        {
          currentPagePermision === adminPermision.edit && <td>
            {
              item.type === 2 && <div className="d-flex alignItem-c gap-1">
                <Button
                  type={buttonClassesType.outline}
                  onClick={confirmModalOpen.bind(null, item.id, confirmType.reject)}
                >
                  Reject
                </Button>
                <Button
                  type={buttonClassesType.primary}
                  onClick={confirmModalOpen.bind(null, item.id, confirmType.confirm)}
                >
                  Confirm
                </Button>
              </div>
            }
          </td>
        }

      </tr>
    ));
  };
  const renderClassTableSpin = function () {
    return callApiMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassTableEmpty = function () {
    return callApiMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
      ? ""
      : "--d-none";
  }
  const renderStatus = function (type) {
    switch (type) {
      case 2:
        return <TagCustom type={TagType.pending} />;
      case 1:
        return <TagCustom type={TagType.success} />;
      case 3:
        return <TagCustom type={TagType.error} />;
      default:
        break;
    }
  };






  // khi mở modal xác nhận hoặc từ chối quảng cáo thì set id của user cho idSelectedAds
  const idSelectedAds = useRef();





  // phần modal confirm hoặc reject
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [callApiProcessStatus, setCallApiProcessStatus] = useState(api_status.pending);
  const [modalType, setModalType] = useState();
  const confirmModalOpen = (id, type) => {
    setModalType(type);
    idSelectedAds.current = id;
    setConfirmModalShow(true);
  }
  const confirmModalClose = () => {
    setConfirmModalShow(false);
  }
  const modalConfirmHandle = async function () {
    switch (modalType) {
      case confirmType.confirm:
        await fetchApiAcceptAds();
        loadData();
        break;

      case confirmType.reject:
        await fetApiRejectAds();
        loadData();
        break;

      default:
        break;
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
          confirmModalClose()
          loadData();
          setCallApiProcessStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
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
          confirmModalClose();
          loadData();
          setCallApiProcessStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          callToastError("Error");
          closeModalConfirm();
          setCallApiProcessStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };




  // render nột dung modal tuỳ theo người dùng đang confirm hay đang reject
  const renderContentModalConfirm = function () {
    switch (modalType) {
      case confirmType.confirm:
        return "Do you confirm your consent to this advertisement?"

      case confirmType.reject:
        return "Do you have an opt-out confirmation for this ad?"

      default:
        break;
    }
  };



  // useEffect 
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




  const closeDropdownAction = function () {
    setIsShowDropdownAction(() => false);
  };
  const renderClassShowMenuAction = function () {
    return isShowDropdownAction ? "show" : "";
  };


  if (currentPagePermision === adminPermision.noPermision) {
    return (
      <NoPermision />
    )
  }


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
        {
          mainData && mainData.length > 0 && <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Type of Ads</th>
                <th>Info</th>
                {
                  currentPagePermision === adminPermision.edit && <th>Action</th>
                }
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        }

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
        closeModalHandle={confirmModalClose}
        isShowModal={confirmModalShow}
      />
    </div>
  );
}

export default Ads;
