import React, { useEffect, useRef, useState } from "react";
import { Button as ButtonAntd, Empty, Pagination, Spin, Modal } from "antd";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import {
  addClassToElementById,
  getClassListFromElementById,
  getElementById,
  getLocalStorage,
  setLocalStorage,
} from "src/util/common";
import {
  api_status,
  coinString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import {
  getListAdsBuy,
  getListAdsSell,
  searchBuyQuick,
  searchSellQuick,
} from "src/util/userCallApi";
import socket from "src/util/socket";
import { DOMAIN } from "src/util/service";
import { getCoin } from "src/redux/constant/coin.constant";
import { Input } from "./Common/Input";
import { Button } from "./Common/Button";
export default function P2PTrading2({ history }) {
  // The list of users selling coins must be placed in the buy section on the interface.
  // The list of users buying coins must be placed in the sell section on the interface.
  const coin = getLocalStorage(localStorageVariable.coin);
  const { t } = useTranslation();
  const coinFromRedux = useSelector(getCoin);
  const callApiSellListStatus = useRef(api_status.pending);
  const callApiBuyListStatus = useRef(api_status.pending);
  const [buyListSectionTotalItems, setBuyListSectionTotalItems] = useState(1);
  const [sellListSectionTotalItems, setSellListSectionTotalItems] = useState(1);
  const buyCoin = useRef(coinString.USDT); // display for section Buy, used by api fetch sell
  const sellCoin = useRef(coinString.USDT); // display for section Sell, used by api fetch buy
  const [buySectionPage, setBuySectionPage] = useState(1);
  const [sellSectionPage, setSellSectionPage] = useState(1);
  const listCoin = useRef();
  const amountSectionBuyFilter = useRef("");
  const amountSectionSellFilter = useRef("");
  const [isBuyChooseCoinModalOpen, setIsBuyChooseCoinModalOpen] =
    useState(false);
  const [isSellChooseCoinModalOpen, setIsSellChooseCoinModalOpen] =
    useState(false);
  //
  const showChooseCoinSellModal = () => {
    setIsSellChooseCoinModalOpen(true);
    setTimeout(() => {
      renderChooseCoinSellModal(buyChooseCoinModalSellItemCLick);
    }, 0);
  };
  const chooseCoinSellCancelHandle = () => {
    setIsSellChooseCoinModalOpen(false);
  };
  const showBuyChooseCoinBuyModal = () => {
    setIsBuyChooseCoinModalOpen(true);
    setTimeout(() => {
      renderChooseCoinBuyModal(buyChooseCoinModalBuyItemCLick);
    }, 0);
  };
  const chooseCoinBuyCancelHandle = () => {
    setIsBuyChooseCoinModalOpen(false);
  };
  const closeBuySectionContent = function () {
    addClassToElementById("buyContent", "--d-none");
  };
  const showBuySectionContent = function () {
    getClassListFromElementById("buyContent").remove("--d-none");
  };
  const closeBuySectionLoader = function () {
    addClassToElementById("buyLoader", "--d-none");
  };
  const showBuySectionLoader = function () {
    const ele = getClassListFromElementById("buyLoader");
    if (ele) {
      ele.remove("--d-none");
    }
  };
  const closeBuySectionEmpty = function () {
    addClassToElementById("buyEmpty", "--d-none");
  };
  const showBuySectionEmpty = function () {
    getClassListFromElementById("buyEmpty").remove("--d-none");
  };
  const closeSellSectionContent = function () {
    addClassToElementById("sellContent", "--d-none");
  };
  const showSellSectionContent = function () {
    getClassListFromElementById("sellContent").remove("--d-none");
  };
  const closeSellSectionLoader = function () {
    addClassToElementById("sellLoader", "--d-none");
  };
  const showSellSectionLoader = function () {
    const ele = getClassListFromElementById("sellLoader");
    if (ele) {
      ele.remove("--d-none");
    }
  };
  const closeSellSectionEmpty = function () {
    addClassToElementById("sellEmpty", "--d-none");
  };
  const showSellSectionEmpty = function () {
    getClassListFromElementById("sellEmpty").remove("--d-none");
  };
  const fetchListAdsSell = function (page) {
    return new Promise((resolve) => {
      if (callApiSellListStatus.current === api_status.fetching) resolve({});
      else callApiSellListStatus.current = api_status.fetching;
      getListAdsSell({
        limit: 5,
        page: page,
        symbol: buyCoin.current,
      })
        .then((resp) => {
          callApiSellListStatus.current = api_status.fulfilled;
          resolve(resp.data.data);
        })
        .catch((error) => {
          callApiSellListStatus.current = api_status.rejected;
          console.log(error);
          resolve({});
        });
    });
  };
  const fetchListAdsBuy = function (page) {
    return new Promise((resolve) => {
      if (callApiBuyListStatus.current === api_status.fetching) resolve({});
      else callApiBuyListStatus.current = api_status.fetching;
      if (!coin) resolve({});
      getListAdsBuy({ limit: 5, page: page, symbol: sellCoin.current })
        .then((resp) => {
          callApiBuyListStatus.current = api_status.fulfilled;
          resolve(resp.data.data);
        })
        .catch((error) => {
          callApiBuyListStatus.current = api_status.rejected;
          console.log(error);
          resolve({});
        });
    });
  };
  const fetchListAdsBuyFilter = function (page) {
    return new Promise((resolve) => {
      if (callApiBuyListStatus.current === api_status.fetching) {
        return resolve({});
      }
      callApiBuyListStatus.current = api_status.fetching;
      searchBuyQuick({
        limit: 5,
        page,
        symbol: sellCoin.current,
        amount: Number(amountSectionSellFilter.current),
      })
        .then((resp) => {
          callApiBuyListStatus.current = api_status.fulfilled;
          return resolve(resp.data.data);
        })
        .catch((error) => {
          callApiBuyListStatus.current = api_status.rejected;
          return resolve({});
        });
    });
  };
  const fetchListAdsSellFilter = function (page) {
    return new Promise((resolve) => {
      if (callApiSellListStatus.current === api_status.fetching) {
        return resolve({});
      }
      callApiSellListStatus.current = api_status.fetching;
      searchSellQuick({
        limit: 5,
        page: page,
        symbol: buyCoin.current,
        amount: Number(amountSectionBuyFilter.current),
      })
        .then((resp) => {
          callApiSellListStatus.current = api_status.fulfilled;
          return resolve(resp.data.data);
        })
        .catch((error) => {
          callApiSellListStatus.current = api_status.rejected;
          return resolve({});
        });
    });
  };
  const renderSectionBuy = async function (fnFetch, page) {
    closeBuySectionContent();
    closeBuySectionEmpty();
    showBuySectionLoader();
    const { array, total } = await fnFetch(page);
    closeBuySectionLoader();
    const containerElement = getElementById("buyContent");
    if (!containerElement) return;
    containerElement.innerHTML = "";
    if (!array || array.length <= 0) {
      showBuySectionEmpty();
    } else {
      for (const item of array) {
        containerElement.innerHTML += `<div class="record-content box fadeInBottomToTop">
          <div class="row">
            <div class="col">
              <span class="key">${t("seller")}:</span>
              <span class="value">${item.userName}</span>
            </div>
            <div class="col">
              <span class="key">${t("fullName")}:</span>
              <span class="value">${item.ownerAccount}</span>
            </div>
            <div class="col">
              <span class="key">${t("bankName")}:</span>
              <span class="value">${item.bankName}</span>
            </div>
            <div class="col">
              <span class="key">${t("accountNumber")}:</span>
              <span class="value">${item.numberBank}</span>
            </div>
            <div class="col">
              <span class="key">${t("amount")}:</span>
              <span class="value">${item.amount}</span>
            </div>
            <div class="col">
              <span class="key">${t("amountMinimum")}:</span>
              <span class="value">${item.amountMinimum}</span>
            </div>
            <div class="col">
              <span class="key">${t("available")}:</span>
              <span class="value">${+(item.amount - item.amountSuccess).toFixed(
                8
              )}</span>
            </div>
            <div class="col">
              <span class="key">${t("createdAt")}:</span>
              <span class="value">${item.created_at}</span>
            </div>
          </div>
          <button class="sell-coin" name="${item.id}">${t("buy")}</button>
      </div>`;
      }
      // add event
      for (const item of containerElement.children) {
        const button = item.querySelector("button");
        const id = button.name;
        button.addEventListener(
          "click",
          buyClickHandle.bind(
            null,
            array.filter((it) => it.id === Number(id))[0]
          )
        );
      }
      // show
      closeBuySectionEmpty();
      showBuySectionContent();
    }
    setBuyListSectionTotalItems(() => total);
    setBuySectionPage(() => page);
  };
  const renderSectionSell = async function (fnFetch, page) {
    closeSellSectionContent();
    closeSellSectionEmpty();
    showSellSectionLoader();
    const { array, total } = await fnFetch(page);
    closeSellSectionLoader();
    const containerElement = getElementById("sellContent");
    if (!containerElement) return;
    containerElement.innerHTML = "";
    if (!array || array.length <= 0) {
      showSellSectionEmpty();
    } else {
      for (const item of array) {
        containerElement.innerHTML += `<div class="record-content box fadeInBottomToTop">
            <div class="row">
              <div class="col">
                <span class="key">${t("buyer")}:</span>
                <span class="value">${item.userName}</span>
              </div>
              <div class="col">
                <span class="key">${t("createdAt")}:</span>
                <span class="value">${item.created_at}</span>
              </div>
              <div class="col">
                <span class="key">${t("amount")}:</span>
                <span class="value">${item.amount}</span>
              </div>
              <div class="col">
                <span class="key">${t("amountMinimum")}:</span>
                <span class="value">${item.amountMinimum}</span>
              </div>
              <div class="col">
                <span class="key">${t("available")}:</span>
                <span class="value">${+(
                  item.amount - item.amountSuccess
                ).toFixed(8)}</span>
              </div>
            </div>
            <button class="sell-coin" name="${item.id}">${t("sell")}</button>
        </div>`;
      }
      // }
      // add event
      for (const item of containerElement.children) {
        const button = item.querySelector("button");
        const id = button.name;
        button.addEventListener(
          "click",
          sellClickHandle.bind(
            null,
            array.filter((it) => it.id === Number(id))[0]
          )
        );
      }
      // show
      closeSellSectionEmpty();
      showSellSectionContent();
    }
    setSellListSectionTotalItems(() => total);
    setSellSectionPage(() => page);
  };
  const loadSectionSell = function (page) {
    if (amountSectionSellFilter.current) {
      renderSectionSell(fetchListAdsBuyFilter, page);
    } else {
      renderSectionSell(fetchListAdsBuy, page);
    }
  };
  const loadSectionBuy = function (page) {
    if (amountSectionBuyFilter.current) {
      renderSectionBuy(fetchListAdsSellFilter, page);
    } else {
      renderSectionBuy(fetchListAdsSell, page);
    }
  };
  const sectionBuyButtonFilterClickHandle = function () {
    if (callApiSellListStatus.current === api_status.fetching) return;
    loadSectionBuy(1);
  };
  const sectionSellButtonFilterClickHandle = function () {
    if (callApiBuyListStatus.current === api_status.fetching) return;
    loadSectionSell(1);
    return;
  };
  const buyClickHandle = function (item) {
    setLocalStorage(localStorageVariable.adsItem, item);
    history.push(url.transaction);
    return;
  };
  const sellClickHandle = function (item) {
    setLocalStorage(localStorageVariable.adsItem, item);
    history.push(url.transaction);
    return;
  };
  const onChangeSectionBuyPaging = function (page) {
    loadSectionBuy(page);
  };
  const onChangeSectionSellPaging = function (page) {
    loadSectionSell(page);
    return;
  };
  /**
   * render modal
   * @param {function} fu function for click item
   */
  const renderChooseCoinBuyModal = function (fu) {
    showModalBuySpin();
    const element = getElementById("p2ptrading2CoinBuyModal");
    element.innerHTML = "";
    if (!listCoin.current || listCoin.current.length <= 0) {
      return;
    }
    for (const item of listCoin.current) {
      element.innerHTML += `<span class="p2ptrading2-coin-to-select-modal__item ${
        item.name === buyCoin.current ? "active" : ""
      }">
      <img src="${DOMAIN + item.image}" />
        <span class='p2ptrading2-coin-to-select-modal__item-text'>${
          item.name
        }</span>
      </span>`;
    }
    // add event
    for (const item of element.children) {
      item.addEventListener(
        "click",
        fu.bind(
          null,
          item.querySelector(".p2ptrading2-coin-to-select-modal__item-text")
            .innerHTML
        )
      );
    }
    closeModalBuySpin();
  };
  const renderChooseCoinSellModal = function (fu) {
    showModalSellSpin();
    const element = getElementById("p2ptrading2CoinSellModal");
    element.innerHTML = "";
    if (!listCoin.current || listCoin.current.length <= 0) {
      return;
    }
    for (const item of listCoin.current) {
      element.innerHTML += `<span class="p2ptrading2-coin-to-select-modal__item ${
        item.name === sellCoin.current ? "active" : ""
      }">
      <img src="${DOMAIN + item.image}" />
        <span class='p2ptrading2-coin-to-select-modal__item-text'>${
          item.name
        }</span>
      </span>`;
    }
    // add event
    for (const item of element.children) {
      item.addEventListener(
        "click",
        fu.bind(
          null,
          item.querySelector(".p2ptrading2-coin-to-select-modal__item-text")
            .innerHTML
        )
      );
    }
    closeModalSellSpin();
  };
  const buyChooseCoinModalBuyItemCLick = function (coin) {
    buyCoin.current = coin;
    const constainer = getElementById("p2ptrading2CoinBuyModal");
    for (const item of constainer.children) {
      const coin = item.querySelector(
        ".p2ptrading2-coin-to-select-modal__item-text"
      ).innerHTML;
      if (coin === buyCoin.current) {
        if (!item.classList.contains("active")) item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
    amountSectionBuyFilterClear();
    loadSectionBuy(1);
    chooseCoinBuyCancelHandle();
  };
  const buyChooseCoinModalSellItemCLick = function (coin) {
    sellCoin.current = coin;
    const constainer = getElementById("p2ptrading2CoinSellModal");
    for (const item of constainer.children) {
      const coin = item.querySelector(
        ".p2ptrading2-coin-to-select-modal__item-text"
      ).innerHTML;
      if (coin === sellCoin.current) {
        if (!item.classList.contains("active")) item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
    amountSectionSellFilterClear();
    loadSectionSell(1);
    chooseCoinSellCancelHandle();
    return;
  };
  const amountSectionBuyFilterChangeHandle = function (e) {
    amountSectionBuyFilter.current = e.target.value;
  };
  const amountSectionBuyFilterClear = function () {
    amountSectionBuyFilter.current = "";
    getElementById("amountSectionBuyFilterInput").value = "";
  };
  const amountSectionSellFilterClear = function () {
    amountSectionBuyFilter.current = "";
    getElementById("amountSectionSellFilterInput").value = "";
  };
  const closeModalBuySpin = function () {
    addClassToElementById("p2ptrading2CoinBuyModalSpin", "--d-none");
  };
  const showModalBuySpin = function () {
    getClassListFromElementById("p2ptrading2CoinBuyModalSpin").remove(
      "--d-none"
    );
  };
  const closeModalSellSpin = function () {
    addClassToElementById("p2ptrading2CoinSellModalSpin", "--d-none");
  };
  const showModalSellSpin = function () {
    getClassListFromElementById("p2ptrading2CoinSellModalSpin").remove(
      "--d-none"
    );
  };
  const amountSectionSellFilterChangeHandle = function (e) {
    amountSectionSellFilter.current = e.target.value;
  };
  const createAdsSell = function () {
    setLocalStorage(localStorageVariable.createAds, buyCoin.current);
    history.push(url.create_ads_sell);
  };
  const createAdsBuy = function () {
    setLocalStorage(localStorageVariable.createAds, sellCoin.current);
    history.push(url.create_ads_buy);
  };
  //
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        loadSectionBuy(buySectionPage);
        loadSectionSell(sellSectionPage);
      }
      currentLanguage = newLanguage;
    });
    //
    socket.once("listCoin", (resp) => {
      listCoin.current = resp;
      const eleBuy = getElementById("p2ptrading2CoinBuyModal");
      if (eleBuy) {
        renderChooseCoinBuyModal(buyChooseCoinModalBuyItemCLick);
      }
      const eleSell = getElementById("p2ptrading2CoinSellModal");
      if (eleSell) {
        renderChooseCoinSellModal(buyChooseCoinModalSellItemCLick);
      }
    });
    //
    const element = document.querySelector(".p2ptrading2");
    element.classList.add("fadeInBottomToTop");
  }, []);
  useEffect(() => {
    buyCoin.current = coinFromRedux || coin || "BTC";
    sellCoin.current = coinFromRedux || coin || "BTC";
    getElementById("buyChoiceCoinButton").innerHTML = buyCoin.current;
    getElementById("sellChoiceCoinButton").innerHTML = sellCoin.current;
    renderSectionBuy(fetchListAdsSell, 1);
    renderSectionSell(fetchListAdsBuy, 1);
  }, [coinFromRedux]);
  return (
    <div className="p2ptrading2">
      <div className="container">
        <div className="buy">
          <div className="buy-title">
            <i className="fa-solid fa-flag"></i>
            <span>
              {t("youWantTo")} <span>{t("buy")}</span>{" "}
              <button
                id="buyChoiceCoinButton"
                onClick={showBuyChooseCoinBuyModal}
                className="buyChoiceCoin buttonContainer--transparent"
              >
                {buyCoin.current}
              </button>{" "}
              ?
            </span>
          </div>
          <div className="buy__filter">
            <Button type="primary" onClick={sectionBuyButtonFilterClickHandle}>
              Search
            </Button>
            <Input
              id="amountSectionBuyFilterInput"
              onChange={amountSectionBuyFilterChangeHandle}
              type="text"
              placeholder={t("amount")}
            />
          </div>
          <div id="buyContent">
            <div className="buy-content box">
              <div className="item1">
                <span>User Name: test5</span>
              </div>
              <div className="item2"></div>
              <div className="item3"></div>
              <div className="item4">
                <ButtonAntd type="primary">{t("buy")}</ButtonAntd>
              </div>
            </div>
          </div>
          <div
            id="buyLoader"
            className="spin-container fadeInBottomToTop --d-none"
          >
            <Spin />
          </div>
          <div
            id="buyEmpty"
            className="spin-container fadeInBottomToTop --d-none"
          >
            <Empty />
          </div>
          <div className="p2ptrading2__footer">
            <div className="buy-ad">
              <Button onClick={createAdsBuy}>
                {t("creatingYourBuyingAd")}
              </Button>
            </div>
            <Pagination
              defaultCurrent={1}
              current={buySectionPage}
              pageSize={5}
              onChange={onChangeSectionBuyPaging}
              total={buyListSectionTotalItems}
              showSizeChanger={false}
            />
          </div>
        </div>
        <div className="sell">
          <div className="sell-title">
            <i className="fa-solid fa-flag"></i>
            <span>
              {t("youWantTo")}{" "}
              <span>
                {t("sell").at(0).toLocaleUpperCase() + t("sell").slice(1)}
              </span>{" "}
              <button
                onClick={showChooseCoinSellModal}
                id="sellChoiceCoinButton"
                className="buttonContainer--transparent"
              >
                {sellCoin.current}
              </button>{" "}
              ?
            </span>
          </div>
          <div className="sell__filter">
            <Button onClick={sectionSellButtonFilterClickHandle}>Search</Button>
            <Input
              id="amountSectionSellFilterInput"
              onChange={amountSectionSellFilterChangeHandle}
              type="text"
              placeholder={t("amount")}
            />
          </div>
          <div id="sellContent">
            <div className="sell-content box">
              <div className="item1">
                <span>
                  <span>1.3119</span> USD/USDT
                </span>
                <span>{t("maximum") + ": " + t("unlimited")}</span>
              </div>
              <div className="item2">Westpac</div>
              <div className="item3">Felix500</div>
              <div className="item4">
                <ButtonAntd type="primary">{t("sell")}</ButtonAntd>
              </div>
            </div>
            <div className="sell-content box">
              <div className="item1">
                <span>
                  <span>1.3119</span> USD/USDT
                </span>
                <span>{t("maximum") + ": " + t("unlimited")}</span>
              </div>
              <div className="item2">Westpac</div>
              <div className="item3">Felix500</div>
              <div className="item4">
                <ButtonAntd type="primary">{t("sell")}</ButtonAntd>
              </div>
            </div>
          </div>
          <div id="sellLoader" className="spin-container --d-none">
            <Spin />
          </div>
          <div id="sellEmpty" className="spin-container --d-none">
            <Empty />
          </div>
          <div className="p2ptrading2__footer">
            <div className="sell-ad">
              <Button onClick={createAdsSell}>
                {t("creatingYourSellingAd")}
              </Button>
            </div>
            <Pagination
              defaultCurrent={1}
              current={sellSectionPage}
              pageSize={5}
              total={sellListSectionTotalItems}
              showSizeChanger={false}
              onChange={onChangeSectionSellPaging}
            />
          </div>
        </div>
      </div>
      <Modal
        title="Coin to Buy"
        open={isBuyChooseCoinModalOpen}
        onCancel={chooseCoinBuyCancelHandle}
        footer={null}
        width={600}
      >
        <div>
          <div
            id="p2ptrading2CoinBuyModal"
            className="p2ptrading2-coin-to-select-modal"
          ></div>
          <div id="p2ptrading2CoinBuyModalSpin" className="spin-container">
            <Spin />
          </div>
        </div>
      </Modal>
      <Modal
        title="Coin to Sell"
        open={isSellChooseCoinModalOpen}
        onCancel={chooseCoinSellCancelHandle}
        footer={null}
        width={600}
      >
        <div>
          <div
            id="p2ptrading2CoinSellModal"
            className="p2ptrading2-coin-to-select-modal"
          ></div>
          <div id="p2ptrading2CoinSellModalSpin" className="spin-container">
            <Spin />
          </div>
        </div>
      </Modal>
    </div>
  );
}
