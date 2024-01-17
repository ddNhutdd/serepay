import React, { useEffect, useRef, useState } from "react";
import { Pagination, Spin } from "antd";
import { Modal } from "antd";
import { useHistory } from "react-router-dom";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import {
  getElementById,
  getLocalStorage,
  hideElement,
  showElement,
} from "src/util/common";
import {
  api_status,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import {
  companyCancelP2p,
  getInfoP2p,
  getListAdsBuyPenddingToUser,
  getListAdsBuyToUser,
  getListAdsSellPenddingToUser,
  getListAdsSellToUser,
} from "src/util/userCallApi";
import socket from "src/util/socket";
import { EmptyCustom } from "../Common/Empty";
import AdsHistoryRecord, { AdsHistoryRecordType } from "../adsHistoryRecord";
function AdsHistory() {
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    i18n.on("languageChanged", () => {
      loadData(currentPage);
    });
    // get list coin
    fetchListCoin().then((resp) => {
      renderTable(1, fetchListAdsBuyToUser);
    });
    return () => {
      i18n.off();
    };
  }, []);
  const history = useHistory();
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const listCoin = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = useRef(10);
  const [totalItem, setTotalItem] = useState(0);
  const { t } = useTranslation();
  const [listRecord, setListRecord] = useState([]);
  const actionType = {
    buy: "buy",
    sell: "sell",
  };
  const cancelAdsId = useRef();
  const [tabActive, setTabActive] = useState(actionType.buy);
  const action = useRef(actionType.buy);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [callApiCancelStatus, setCallApiCancelStatus] = useState(
    api_status.pending
  );

  const showModal = () => {
    setIsModalConfirmOpen(true);
  };
  const closeModal = () => {
    if (callApiCancelStatus === api_status.fetching) return;
    setIsModalConfirmOpen(false);
  };
  const renderClassEmpty = function () {
    return callApiStatus !== api_status.fetching &&
      (!listRecord || listRecord.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderClassSpin = function () {
    return callApiStatus === api_status.fetching ? "" : "--d-none";
  };
  const fetchListAdsSellToUser = function (page) {
    return new Promise((resolve) => {
      if (callApiStatus === api_status.fetching) resolve({});
      else setCallApiStatus(() => api_status.fetching);
      getListAdsSellToUser({
        limit: limit.current,
        page: page,
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          resolve(resp.data.data);
        })
        .catch((error) => {
          setCallApiStatus(() => api_status.rejected);
          console.log(error);
          resolve({});
        });
    });
  };
  const fetchListAdsBuyToUser = function (page) {
    return new Promise((resolve) => {
      if (callApiStatus === api_status.fetching) {
        return resolve({});
      } else {
        setCallApiStatus(() => api_status.fetching);
      }
      getListAdsBuyToUser({
        limit: limit.current,
        page: page,
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          return resolve(resp.data.data);
        })
        .catch((error) => {
          setCallApiStatus(() => api_status.rejected);
          console.log(error);
          return resolve({});
        });
    });
  };
  const fetchListAdsBuyPenddingToUser = function (page) {
    return new Promise((resolve) => {
      if (callApiStatus === api_status.fetching) {
        return resolve({});
      } else {
        setCallApiStatus(() => api_status.fetching);
      }
      getListAdsBuyPenddingToUser({
        limit: limit.current,
        page: page,
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          return resolve(resp.data.data);
        })
        .catch((error) => {
          setCallApiStatus(() => api_status.rejected);
          console.log(error);
          return resolve({});
        });
    });
  };
  const fetchListAdsSellPenddingToUser = function (page) {
    return new Promise((resolve) => {
      if (callApiStatus === api_status.fetching) {
        return resolve({});
      }
      getListAdsSellPenddingToUser({
        limit: limit.current,
        page: page,
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          return resolve(resp.data.data);
        })
        .catch((error) => {
          console.log(error);
          setCallApiStatus(() => api_status.rejected);
          return resolve({});
        });
    });
  };
  const disableFilter = function () {
    const element = getElementById("pendingCheckbox");
    if (!element) return;
    element.disabled = true;
  };
  const enableFilter = function () {
    const element = getElementById("pendingCheckbox");
    if (!element) return;
    element.disabled = false;
  };
  const renderTable = async function (page, fn) {
    if (!listCoin.current) return;
    disableFilter();
    if (!fn) {
      return;
    }
    const { array: apiRes, total } = await fn(page);
    enableFilter();
    setListRecord(() => []);
    if (!apiRes || apiRes.length <= 0) {
      return;
    } else {
      const listRecord = [];
      for (const item of apiRes) {
        const price = listCoin.current.find(
          (c) => c.name === item.symbol
        ).price;
        listRecord.push(
          <div key={item.id}>
            <AdsHistoryRecord
              item={item}
              price={price}
              showModal={showModal}
              redirectConfirm={redirectConfirm}
              cancelAdsId={cancelAdsId}
              type={AdsHistoryRecordType.user}
            />
          </div>
        );
      }
      setListRecord(() => listRecord);
    }
    //
    const listId = apiRes.map((item) => item.id);
    fetchMultiApiGetInfoP2p(listId);
    // set total items
    setTotalItem(total);
  };
  const actionFulfilled = function (id) {
    const loader = getElementById("adsHistoryActionSpinner" + id);
    const btn = getElementById("adsHistoryActionCheckButton" + id);
    console.log(loader, btn);
    if (!loader || !btn) return;
    hideElement(loader);
    showElement(btn);
  };
  const actionRejected = function (id) {
    const loader = getElementById("adsHistoryActionSpinner" + id);
    const btn = getElementById("adsHistoryActionCheckButton" + id);
    if (!loader || !btn) return;
    hideElement(loader);
    hideElement(btn);
  };
  const cancelAds = function (id) {
    if (callApiCancelStatus === api_status.fetching) return;
    else setCallApiCancelStatus(api_status.fetching);
    companyCancelP2p({
      idP2p: id,
    })
      .then(() => {
        setCallApiCancelStatus(api_status.fulfilled);
        loadData(currentPage);
      })
      .catch((error) => {
        setCallApiCancelStatus(api_status.rejected);
        console.log(error);
      });
  };
  const loadData = function (page) {
    const act = action.current;
    const pending = getElementById("pendingCheckbox")?.checked;
    if (pending === null || pending === undefined) return;
    if (act === actionType.buy) {
      if (pending) {
        renderTable(page, fetchListAdsBuyPenddingToUser);
      } else if (!pending) {
        renderTable(page, fetchListAdsBuyToUser);
      }
    } else if (act === actionType.sell) {
      if (pending) {
        renderTable(page, fetchListAdsSellPenddingToUser);
      } else {
        renderTable(page, fetchListAdsSellToUser);
      }
    }
  };
  const pageChangeHandle = function (pag) {
    setCurrentPage(() => pag);
    loadData(pag);
  };
  const pendingCheckboxChangeHandle = function () {
    setCurrentPage(1);
    loadData(1);
  };
  const tabChangeHandle = function (e) {
    const selected = e.target.dataset.tab;
    if (selected === actionType.sell) {
      action.current = actionType.sell;
      setTabActive(() => actionType.sell);
    } else if (selected === actionType.buy) {
      action.current = actionType.buy;
      setTabActive(() => actionType.buy);
    }
    loadData(1);
  };
  /**
   * If there is no returned data, the api informs the core
   * The function both calls the api and renders the action
   * @param {number | string} id AdsId
   * @returns Promise
   */
  const fetchApiGetInfoP2p = function (id) {
    return new Promise((resolve) => {
      getInfoP2p({
        idP2p: id,
      })
        .then((resp) => {
          actionFulfilled(id);
          resolve(true);
        })
        .catch((error) => {
          actionRejected(id);
          resolve(null);
        });
    });
  };
  const fetchMultiApiGetInfoP2p = function (listId) {
    for (const id of listId) {
      fetchApiGetInfoP2p(id);
    }
  };
  const fetchListCoin = function () {
    return new Promise((resolve) => {
      socket.once("listCoin", (resp) => {
        listCoin.current = resp;
        resolve(resp);
      });
    });
  };
  const redirectConfirm = function (id) {
    history.push(url.confirm.replace(":id", id));
  };
  const modalConfirmOkClickHandle = function () {
    if (callApiCancelStatus === api_status.fetching) return;
    cancelAds(cancelAdsId.current);
    closeModal();
  };
  const renderTitle = function () {
    return action.current === actionType.buy
      ? t("listAdvertisementBuy")
      : t("listAdvertisementSell");
  };
  const renderClassActiveTabBuy = function () {
    return tabActive === actionType.buy ? "active" : "";
  };
  const renderClassActiveTabSell = function () {
    return tabActive === actionType.sell ? "active" : "";
  };
  useEffect(() => {
    console.log(tabActive);
  }, [tabActive]);
  return (
    <div className="ads-history">
      <div className="container">
        <div className="box ads-history__content">
          <div className="ads-history__filter">
            <div className="ads-history__filter-tabs-container">
              <div
                data-tab={actionType.buy}
                onClick={tabChangeHandle}
                className={`ads-history__filter-tabs ${renderClassActiveTabBuy()}`}
              >
                {t("buy")}
              </div>
              <div
                data-tab={actionType.sell}
                onClick={tabChangeHandle}
                className={`ads-history__filter-tabs ${renderClassActiveTabSell()}`}
              >
                {t("sell")}
              </div>
            </div>
            <div>
              <input
                onChange={pendingCheckboxChangeHandle}
                id="pendingCheckbox"
                type="checkbox"
                className="--d-none"
              />
              <label
                className="ads-history__checkbox"
                htmlFor="pendingCheckbox"
              >
                <label htmlFor="pendingCheckbox">{t("pending")}:</label>
                <div className="ads-history__square">
                  <i className="fa-solid fa-check"></i>
                </div>
              </label>
            </div>
          </div>
          <h3>{renderTitle()}</h3>
          <div id="ads-history__content">{listRecord}</div>
          <div
            id="adsHistoryEmpty"
            className={`spin-container ${renderClassEmpty()}`}
          >
            <EmptyCustom stringData={t("noData")} />
          </div>
          <div
            id="adsHistorySpinner"
            className={`spin-container ${renderClassSpin()}`}
          >
            <Spin />
          </div>
          <div className="ads-history__paging">
            <Pagination
              defaultCurrent={1}
              showSizeChanger={false}
              total={totalItem}
              current={currentPage}
              onChange={pageChangeHandle}
            />
          </div>
        </div>
      </div>
      <Modal title={null} open={isModalConfirmOpen} footer={null}>
        <div className="ads-history__modal-container">
          <div className="ads-history__modal-header">
            {t("confirm")}
            <span onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
          <div className="ads-history__modal-content">
            {t("areYouSureYouWantToCancel")}
          </div>
          <div className="ads-history__modal-footer">
            <button
              onClick={closeModal}
              className={`ads-history__modal-cancel ${
                callApiCancelStatus === api_status.fetching ? "disabled" : ""
              }`}
            >
              {t("cancel")}
            </button>
            <button
              onClick={modalConfirmOkClickHandle}
              className={`ads-history__modal-ok ${
                callApiCancelStatus === api_status.fetching ? "disable" : ""
              }`}
            >
              <div
                className={`loader ${
                  callApiCancelStatus === api_status.fetching ? "" : "--d-none"
                }`}
              ></div>
              {t("ok")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default AdsHistory;
