import React, { useEffect, useRef, useState } from "react";
import { Pagination, Spin } from "antd";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import {
  getClassListFromElementById,
  getElementById,
  addClassToElementById,
  getLocalStorage,
  formatNumber,
} from "src/util/common";
import { createWalletBEP20, getDepositHistory } from "src/util/userCallApi";
import {
  api_status,
  coinString,
  commontString,
  defaultLanguage,
  image_domain,
  localStorageVariable,
} from "src/constant";
import { callToastSuccess } from "src/function/toast/callToast";
import i18n from "src/translation/i18n";
import { EmptyCustom } from "src/components/Common/Empty";
import WalletTop, { titleWalletTop } from "../WalletTop";
import { CopyToClipboard } from "react-copy-to-clipboard";

function SerepayWalletDeposit() {
  const fetchApiCreateWallet = function () {
    return new Promise((resolve) => {
      if (callApiCreateWalletStatus === api_status.fetching) resolve(null);
      else setCallApiCreateWalletStatus(() => api_status.fetching);
      createWalletBEP20()
        .then((resp) => {
          setCallApiCreateWalletStatus(() => api_status.fulfilled);
          setAddress(() => resp?.data?.data?.address);
          resolve(true);
        })
        .catch((error) => {
          setAddress(() => error?.response?.data?.errors?.address);
          setCallApiCreateWalletStatus(() => api_status.rejected);

          resolve(null);
        });
    });
  };
  const fetchApiGetHistory = function (coinName, page) {
    return new Promise((resolve) => {
      //
      if (callApiGetHistoryStatus === api_status.fetching || !coinName || !page)
        resolve(null);
      getDepositHistory({
        limit: 10,
        page: page,
        symbol: coinName,
      })
        .then((resp) => {
          resolve(resp.data.data.array);
        })
        .catch((error) => {
          resolve(null);
        });
    });
  };
  const renderHistory = async function (coinName, page) {
    closeHistory();
    closeHistoryEmpty();
    showHistorySpinner();
    const apiresp = await fetchApiGetHistory(coinName, page);
    closeHistorySpinner();
    //render html
    const renderHtml = [];
    if (apiresp && apiresp.length > 0) {
      for (const item of apiresp) {
        renderHtml.push(
          <div key={item.id} className="wallet-deposite__history-item">
            <div className="wallet-deposite__history-time">
              <i className="fa-solid fa-calendar"></i> {item.created_at}
            </div>
            <div className="wallet-deposite__history-content">
              <div className="wallet-deposite__history-name">
                {item.coin_key.toUpperCase()}:
              </div>
              <div className="wallet-deposite__history-amount">
                {formatNumber(item.amount, i18n.language, 8)}{" "}
                <img
                  src={`${image_domain.replace(
                    coinString.USDT,
                    item.coin_key.toUpperCase()
                  )}`}
                  alt={`${item.coin_key}`}
                />
              </div>
              <div className="wallet-deposite__history-final">
                <span>{t("finalAmount")}:</span>
                <span>
                  {formatNumber(item.before_amount, i18n.language, 8)}{" "}
                  <img
                    src={`${image_domain.replace(
                      coinString.USDT,
                      item.coin_key.toUpperCase()
                    )}`}
                    alt={`${item.coin_key}`}
                  />
                </span>
              </div>
            </div>
          </div>
        );
      }
      showHistory();
      closeHistoryEmpty();
    } else {
      showHistoryEmpty();
      closeHistory();
    }
    setHistoryData(() => renderHtml);
  };
  const closeHistory = function () {
    addClassToElementById("historyContent", "--d-none");
  };
  const showHistory = function () {
    const element = getElementById("historyContent");
    if (!element) return;
    getClassListFromElementById("historyContent").remove("--d-none");
  };
  const closeHistorySpinner = function () {
    addClassToElementById("historySpinner", "--d-none");
  };
  const showHistorySpinner = function () {
    getClassListFromElementById("historySpinner") &&
      getClassListFromElementById("historySpinner").remove("--d-none");
  };
  const showHistoryEmpty = function () {
    const historyEmpty = getElementById("historyEmpty");
    if (!historyEmpty) return;
    historyEmpty.remove("--d-none");
  };
  const closeHistoryEmpty = function () {
    addClassToElementById("historyEmpty", "--d-none");
  };
  const renderClassSpin = function () {
    return callApiCreateWalletStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassAddress = function () {
    return callApiCreateWalletStatus === api_status.fetching ? "--d-none" : "";
  };
  const onCopyHandle = function () {
    callToastSuccess(t(commontString.success.toLowerCase()));
  };

  const { t } = useTranslation();
  const isLogin = useSelector((root) => root.loginReducer.isLogin);

  const [callApiCreateWalletStatus, setCallApiCreateWalletStatus] = useState(
    api_status.pending
  );

  const [historyData, setHistoryData] = useState([]);
  const [address, setAddress] = useState("");

  const selectedCoin = useRef(
    getLocalStorage(localStorageVariable.coinFromWalletList) || coinString.USDT
  );
  const historyPage = useRef(1);
  const codeElement = useRef();
  const callApiGetHistoryStatus = useRef(api_status.pending);

  useEffect(() => {
    if (!isLogin) {
      history.push(url.login);
      return;
    }

    fetchApiCreateWallet();
    renderHistory(selectedCoin.current, historyPage.current);

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        renderHistory(selectedCoin.current, historyPage.current);
        currentLanguage = newLanguage;
        return;
      }
    });
  }, []);

  return (
    <div className="wallet-deposit fadeInBottomToTop">
      <div className="container">
        <WalletTop title={titleWalletTop.deposit} />
        <div className="wallet-deposit-content">
          <div className="wallet-deposit-left">
            <ul>
              <li>
                <span className="number">1</span>
                <div className="wallet-deposit-input">
                  <p>{t("select")} Coin</p>
                  <div className="content-selected">
                    <img
                      src={`https://remitano.dk-tech.vn/images/${selectedCoin.current}.png`}
                      alt="name"
                    />
                    <span className="content">{selectedCoin.current}</span>
                  </div>
                </div>
              </li>
              <li>
                <span className="number">2</span>
                <div className="wallet-deposit-input">
                  <p>{t("select")} Network</p>
                  <div className="content-selected">
                    <span className="content">
                      <span className="main-content">BEP20</span>
                    </span>
                    <span className="main-content__down">
                      <i className="fa-solid fa-caret-down"></i>
                    </span>
                  </div>
                </div>
              </li>
              <li>
                <span className="number">3</span>
                <div className="address">
                  <span>{t("depositQR")}</span>
                  <div className="address-content">
                    <div
                      className={`fadeInBottomToTop spin-container ${renderClassSpin()}`}
                    >
                      <Spin />
                    </div>
                    <div
                      className={`address-content-qr fadeInBottomToTop ${renderClassAddress()}`}
                    >
                      <div className="address-content-qr-background">
                        <QRCode
                          style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                          }}
                          value={address ?? ""}
                        />
                      </div>
                    </div>
                    <div
                      className={`address-code-container ${renderClassAddress()}`}
                    >
                      <div className="address-code fadeInBottomToTop">
                        <div className="address-code-title">
                          {t("eWalletAddress")}
                        </div>
                        <div ref={codeElement} className="code">
                          {address}
                        </div>
                      </div>
                      <CopyToClipboard text={address} onCopy={onCopyHandle}>
                        <span className="address-copy fadeInBottomToTop">
                          <i className="fa-regular fa-copy"></i>
                        </span>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <span style={{ visibility: 'hidden' }} className="number">1</span>
                <div className="wallet-deposit-input">
                  <ul className="wallet-deposit-causion">
                    <li>
                      <img src={process.env.PUBLIC_URL + "/img/!.png"} alt="info" />
                      You have to deposit at least 5 USDT to be credited. Any deposit that is less than 5 USDT will not be refunded.
                    </li>
                    <li>
                      <img src={process.env.PUBLIC_URL + "/img/!.png"} alt="info" />
                      This deposit address only accepts USDT. Do not send other coins to it.
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <div className="wallet-deposit-right">
            <h3 id="historyTitle">
              {t("depositBtcHistory").replace("BTC", selectedCoin.current)}
            </h3>
            <div
              id="historyContent"
              className=" wallet-deposit__history fadeInBottomToTop"
            >
              {historyData}
            </div>
            <div
              id="historySpinner"
              className="spin-container fadeInBottomToTop"
            >
              <Spin />
            </div>
            <div id="historyEmpty" className="spin-container fadeInBottomToTop">
              <EmptyCustom stringData={t("noData")} />
            </div>
            <div className="wallet-deposite-paging">
              <Pagination defaultCurrent={1} total={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SerepayWalletDeposit;
