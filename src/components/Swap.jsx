import { Modal, Button } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  convertStringToNumber,
  formatNumber,
  formatStringNumberCultureUS,
  getLocalStorage,
  processString,
  roundDecimalValues,
  roundIntl,
  rountRange,
} from "src/util/common";
import {
  api_status,
  commontString,
  defaultLanguage,
  image_domain,
  localStorageVariable,
  url,
} from "src/constant";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Pagination, Spin } from "antd";
import { DOMAIN } from "src/util/service";
import { useHistory } from "react-router-dom";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { getHistorySwapApi, swapCoinApi } from "src/util/userCallApi";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import socket from "src/util/socket";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input } from "./Common/Input";
import { getCoin, getCoinAmount } from "src/redux/reducers/wallet2Slice";
import { EmptyCustom } from "./Common/Empty";
export default function Swap() {
  const { isLogin } = useSelector((root) => root.loginReducer);
  const history = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const data = useSelector(getListCoinRealTime) ?? [];
  const data2 = useSelector(getListCoinRealTime) ?? [];
  const [swapFromCoin, setSwapFromCoin] = useState(useSelector(getCoin));
  const [swapToCoin, setSwapToCoin] = useState("USDT");
  const amountCoin = useSelector(getCoinAmount);
  const userWallet = useSelector(getUserWallet);
  const [fromCoinValueString, setFromCoinValueString] = useState(
    amountCoin > 0 ? amountCoin.toString() : ""
  );
  const [toCoinValueString, setToCoinValueString] = useState("");
  const [searchCoinName, setSearchCoinName] = useState("");
  const searchCoinResult = useRef();
  const [coinSwapHistory, setCoinSwapHistory] = useState([]);
  const [callApiHistoryStatus, setCallApiHistoryStatus] = useState(
    api_status.pending
  );
  const [callApiSwapStatus, setCallApiSwapStatus] = useState(
    api_status.pending
  );
  const [swapHistoryCurrentPage, setSwapHistoryCurrentPage] = useState(1);
  const [swapHistoryTotalPage, setSwapHistoryTotalPage] = useState(1);
  const allCoinPrice = useRef([]);
  const dispatch = useDispatch();

  useEffect(() => {
    formatInputFromCoin(fromCoinValueString);

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    const element = document.querySelector(".swap");
    element.classList.add("fadeInBottomToTop");

    socket.once("listCoin", (resp) => {
      if (resp && resp.length > 0) allCoinPrice.current = resp;
    });
  }, []);
  useEffect(() => {}, [userWallet]);
  useEffect(() => {
    if (data.length > 0) {
      setToCoinValueCalc();
    }
  }, [fromCoinValueString, swapFromCoin, swapToCoin, data]);
  useEffect(() => {
    fetchCoinSwapHistory();
  }, [swapFromCoin, swapToCoin, swapHistoryCurrentPage]);

  const { t } = useTranslation();
  const showModal = () => setIsModalVisible(true);
  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => {
    setSearchCoinName("");
    setIsModalVisible(false);
  };
  const closeModalConfirm = () => {
    if (callApiSwapStatus === api_status.fetching) return;
    setIsModalConfirmOpen(false);
  };
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const showModal2 = () => setIsModalVisible2(true);
  const handleOk2 = () => setIsModalVisible2(false);
  const handleCancel2 = () => {
    setSearchCoinName("");
    setIsModalVisible2(false);
  };
  const transfer = () => {
    const currentFrom = swapFromCoin;
    const currentTo = swapToCoin;
    setSwapFromCoin(currentTo);
    setSwapToCoin(currentFrom);
  };
  const showModalConfirm = () => {
    setIsModalConfirmOpen(true);
  };
  const fromCoinOnChange = function (e) {
    const inputValue = e.target.value;
    formatInputFromCoin(inputValue);
  };
  const formatInputFromCoin = function (inputValue) {
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      setFromCoinValueString(inputValue.slice(0, -1));
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    setFromCoinValueString(inputValueFormated);
  };
  const setToCoinValueCalc = function () {
    if (data.length > 0) {
      const fromCoin = convertStringToNumber(fromCoinValueString.toString());
      const fromPrice = data.filter((item) => item.name === swapFromCoin)[0]
        .price;
      const toPrice = data.filter((item) => item.name === swapToCoin)[0].price;
      const result = convertCacl(fromCoin, fromPrice, toPrice);
      setToCoinValueString(
        formatStringNumberCultureUS(result.toString()) || ""
      );
    }
  };
  const coinPriceDifference = function () {
    if (data.length > 0) {
      const calcNumber = convertCacl(
        1,
        data.filter((item) => item.name === swapFromCoin)[0].price,
        data.filter((item) => item.name === swapToCoin)[0].price
      );
      const coinValue = data.filter((item) => item.name === swapToCoin)[0]
        .price;

      return formatNumber(calcNumber, i18n.language, rountRange(coinValue));
    }
  };
  const convertCacl = function (inputValue, fromPrice, toPrice) {
    return (inputValue * fromPrice) / toPrice;
  };
  const searchCoinOnChange = function (e) {
    setSearchCoinName(e.target.value);
  };
  const mainButtonOnClickHandle = function () {
    if (isLogin && callApiSwapStatus !== api_status.fetching) {
      const swapValue = convertStringToNumber(fromCoinValueString);
      if (!userWallet[swapFromCoin.toLowerCase() + "_balance"]) {
        callToastError(t("theAmountOfCryptocurrencyIsInsufficient"));
        return;
      }
      const maxAvailable = convertStringToNumber(
        userWallet[swapFromCoin.toLowerCase() + "_balance"].toString()
      );
      if (!swapValue || swapValue <= 0) {
        callToastError(t("invalidValue"));
        return;
      } else if (swapValue > maxAvailable) {
        callToastError(t("theAmountOfCryptocurrencyIsInsufficient"));
        return;
      }
      showModalConfirm();
    } else if (!isLogin) {
      history.push(url.login);
    }
  };
  const fetchCoinSwapHistory = function () {
    setCallApiHistoryStatus(api_status.fetching);
    getHistorySwapApi({
      symbolForm: swapFromCoin,
      symbolTo: swapToCoin,
      limit: "10",
      page: swapHistoryCurrentPage,
    })
      .then((resp) => {
        setCoinSwapHistory(resp.data.data.array);
        setSwapHistoryTotalPage(resp.data.data.total);
        setCallApiHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        console.log(error);
        setCallApiHistoryStatus(api_status.rejected);
      });
  };
  const renderCoinSwapHistory = function () {
    if (callApiHistoryStatus === api_status.fetching) {
      return (
        <div
          style={{
            width: "100%",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      );
    } else if (
      callApiHistoryStatus !== api_status.fetching &&
      coinSwapHistory.length <= 0
    ) {
      return <EmptyCustom />;
    } else if (
      callApiHistoryStatus !== api_status.fetching &&
      coinSwapHistory.length > 0
    ) {
      return (
        <div className="swap__history fadeInBottomToTop">
          {coinSwapHistory.map((item, index) => (
            <div key={index} className="swap__history-item">
              <div className="swap__history-time">
                <i className="fa-solid fa-calendar"></i> {item.created_at}
              </div>
              <div className="swap__history-item-main">
                <div className="item">
                  <span>{item.coin_key}: </span>
                  <span className="swap__history-minus">
                    {formatNumber(item.amount, i18n.language, 8)}{" "}
                    <img
                      src={image_domain.replace(
                        "USDT",
                        item.coin_key.toUpperCase()
                      )}
                      alt={item.coin_key}
                    />
                  </span>
                </div>
                <div className="item">
                  <span>{item.wallet}: </span>
                  <span className="swap__history-add">
                    {formatNumber(
                      item.wallet_amount,
                      i18n.language,
                      rountRange(
                        allCoinPrice.current.filter(
                          (it) => it.name === item.wallet
                        )[0]?.price
                      )
                    )}{" "}
                    <img
                      src={image_domain.replace(
                        "USDT",
                        item.wallet.toUpperCase()
                      )}
                      alt={item.wallet}
                    />
                  </span>
                </div>
              </div>
              <div className="swap__history-final">
                <span>
                  {t("rate")} {item.wallet}:
                </span>
                <span>
                  {formatNumber(
                    item.rate,
                    i18n.language,
                    rountRange(
                      allCoinPrice.current.filter(
                        (it) => it.name === item.wallet
                      )[0]?.price
                    )
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };
  const historyPagingOnChangeHandle = function (page) {
    setSwapHistoryCurrentPage(page);
  };
  const maxClickHandle = function () {
    setFromCoinValueString(
      () => userWallet[swapFromCoin.toLowerCase() + "_balance"] || "0"
    );
  };
  const modalConfirmOkClickHandle = function () {
    if (callApiSwapStatus === api_status.fetching) return;
    else setCallApiSwapStatus(api_status.fetching);
    swapCoinApi({
      symbolForm: swapFromCoin,
      symbolTo: swapToCoin,
      amountForm: convertStringToNumber(fromCoinValueString).toString(),
    })
      .then((resp) => {
        callToastSuccess(t(commontString.success));
        fetchCoinSwapHistory();
        dispatch(userWalletFetchCount());
        setCallApiSwapStatus(api_status.fulfilled);
      })
      .catch((error) => {
        const responseError = error?.response?.data?.message;
        switch (responseError) {
          case "Insufficient balance":
            callToastError(t("insufficientBalance"));
            break;
          default:
            callToastError(t("anErrorHasOccurred"));
            break;
        }
        setCallApiSwapStatus(api_status.rejected);
      })
      .finally(() => {
        closeModalConfirm();
      });
  };
  const renderContentConfirm = function () {
    const listString = ["113hgh222", "12ETH12", "122jjk999", "33BTC33"];
    const callBack = function (match, index) {
      switch (match) {
        case "113hgh222":
          return (
            <span key={index} className="swap__modal-confirm-content-main">
              {fromCoinValueString}
            </span>
          );
        case "12ETH12":
          return (
            <span key={index} className="swap__modal-confirm-content-main">
              {swapFromCoin}
            </span>
          );
        case "122jjk999":
          return (
            <span key={index} className="swap__modal-confirm-content-main">
              {toCoinValueString}
            </span>
          );
        case "33BTC33":
          return (
            <span key={index} className="swap__modal-confirm-content-main">
              {swapToCoin}
            </span>
          );
        default:
          break;
      }
    };
    return processString(
      t("doYouWantToExchange113hgh22212ETH12For122jjk99933BTC33"),
      listString,
      callBack
    );
  };

  return (
    <div className="swap">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("swap")}</h2>
          <div className="field">
            <label>
              {t("amountOf")} {swapFromCoin}
            </label>
            <div className="input-area">
              <div className="input-area-input">
                <Input
                  value={fromCoinValueString}
                  onChange={fromCoinOnChange}
                  style={{ paddingRight: "60px" }}
                />
                <button onClick={maxClickHandle} className="max">
                  {t("max")}
                </button>
              </div>
              <button
                className="selectBtn buttonContainer--transparent"
                onClick={showModal}
              >
                <div className="selectBtn-container">
                  <img
                    src={`https://remitano.dk-tech.vn/images/${swapFromCoin}.png`}
                    alt="swapFromCoin"
                  />
                  {swapFromCoin}
                  <i className="fa-solid fa-caret-down"></i>
                </div>
              </button>
            </div>
            <div className="balance">
              <span className="balance-title">{t("balance")}: </span>
              {isLogin
                ? formatNumber(
                    userWallet[swapFromCoin.toLowerCase() + "_balance"] ?? 0,
                    i18n.language,
                    8
                  )
                : ""}
            </div>
          </div>
          <div style={{ textAlign: "center", margin: 20 }}>
            <Button
              type="primary"
              shape="circle"
              onClick={transfer}
              size="large"
            >
              <i className="fa-solid fa-up-down" style={{ fontSize: 16 }}></i>
            </Button>
          </div>
          <div className="field">
            <label>
              {t("amountOf")} {swapToCoin}
            </label>
            <div className="input-area">
              <Input value={toCoinValueString} disabled />
              <button
                className="selectBtn buttonContainer--transparent"
                onClick={showModal2}
              >
                <div className="selectBtn-container  ">
                  <img
                    src={`https://remitano.dk-tech.vn/images/${swapToCoin}.png`}
                    alt="swapToCoin"
                  />
                  {swapToCoin}
                  <i className="fa-solid fa-caret-down"></i>
                </div>
              </button>
            </div>
            <span style={{ display: "block", marginTop: 8 }}>
              1 {swapFromCoin} = {coinPriceDifference()} {swapToCoin}
            </span>
          </div>
          <button
            onClick={mainButtonOnClickHandle}
            className={`buyBtn`}
            size="large"
            type="primary"
          >
            {isLogin ? t("swap") : t("login")}
          </button>
        </div>
        <div className="box" style={{ marginTop: 30 }}>
          <h2 className="title">{t("swapOrder")}</h2>
          {renderCoinSwapHistory()}
          <div className="swap__history-paging">
            <Pagination
              onChange={historyPagingOnChangeHandle}
              total={swapHistoryTotalPage}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
      <Modal
        title={t("swapFrom")}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <div className="swap__modal-coin">
          <Input
            type="text"
            value={searchCoinName}
            placeholder={t("enterTheCoinName")}
            onChange={searchCoinOnChange}
          />
          <div className="swap__modal-list" ref={searchCoinResult}>
            {data
              .filter((item) =>
                item.name.toLowerCase().includes(searchCoinName.toLowerCase())
              )
              .map((item, i) => {
                return (
                  <button
                    className={`swap__modal-item ${
                      item.name === swapFromCoin ? "active" : ""
                    }`}
                    key={i}
                    onClick={() => {
                      setSwapFromCoin(item.name);
                      setIsModalVisible(false);
                      setSearchCoinName("");
                    }}
                  >
                    <>
                      <img src={DOMAIN + item.image} alt={item.image} />
                      <span>{item.name}</span>
                    </>
                  </button>
                );
              })}
          </div>
        </div>
      </Modal>
      <Modal
        title={t("swapTo")}
        open={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}
        footer={null}
        width={600}
      >
        <div className="swap__modal-coin">
          <Input
            className="swap__modal-search"
            type="text"
            value={searchCoinName}
            placeholder={t("enterTheCoinName")}
            onChange={searchCoinOnChange}
          />
          <div className="swap__modal-list" ref={searchCoinResult}>
            {data2
              .filter((item) =>
                item.name.toLowerCase().includes(searchCoinName.toLowerCase())
              )
              .map((item, i) => {
                return (
                  <button
                    className={`swap__modal-item ${
                      item.name === swapToCoin ? "active" : ""
                    }`}
                    key={i}
                    onClick={() => {
                      setSwapToCoin(item.name);
                      setSearchCoinName("");
                      setIsModalVisible2(false);
                    }}
                  >
                    <>
                      <img src={DOMAIN + item.image} alt={item.image} />
                      <span>{item.name}</span>
                    </>
                  </button>
                );
              })}
          </div>
        </div>
      </Modal>
      <Modal title={null} open={isModalConfirmOpen} footer={null}>
        <div className="swap__modal-confirm-container">
          <div className="swap__modal-confirm-header">
            {t("confirm")}
            <span onClick={closeModalConfirm}>
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
          <div className="swap__modal-confirm-content">
            {renderContentConfirm()}
          </div>
          <div className="swap__modal-confirm-footer">
            <button
              onClick={closeModalConfirm}
              className={`swap__modal-confirm-cancel ${
                callApiSwapStatus === api_status.fetching ? "disabled" : ""
              }`}
            >
              {t("cancel")}
            </button>
            <button
              onClick={modalConfirmOkClickHandle}
              className={`swap__modal-confirm-ok ${
                callApiSwapStatus === api_status.fetching ? "disable" : ""
              }`}
            >
              <div
                className={`loader ${
                  callApiSwapStatus === api_status.fetching ? "" : "--d-none"
                }`}
              ></div>
              {t("swap")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
