import { Descriptions, Modal, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import React, { useEffect, useRef, useState, useMemo } from "react";
import i18n from "src/translation/i18n";
import { useHistory, NavLink } from "react-router-dom";
import {
  actionTrading,
  errorMessage,
  api_status,
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import {
  calculateTime,
  calculateTimeDifference,
  formatCurrency,
  getElementById,
  getLocalStorage,
  hideElement,
  processString,
  showElement,
} from "src/util/common";
import {
  companyCancelP2pCommand,
  companyConfirmP2pCommand,
  getQrBankPayment,
  userCancelP2pCommand,
  userConfirmP2pCommand,
} from "src/util/userCallApi";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { math } from "src/App";
import QRCode from "react-qr-code";
import { getListBank } from "src/redux/reducers/bankSlice";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { CopyToClipboard } from "react-copy-to-clipboard";

function ConfirmItem(props) {
  const { index, content, profileId, render, fee } = props;
  const actionType = {
    buy: "buy",
    sell: "sell",
  };
  const history = useHistory();
  const { t } = useTranslation();
  const exchange = useSelector(getExchange);
  const currentCurrency = useSelector(getCurrent);
  const listBankRedux = useSelector(getListBank);

  const [counter, setCounter] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankName, setbankName] = useState();
  const [ownerAccount, setOwnerAccount] = useState();
  const [numberBank, setNumberBank] = useState();
  const [pay, setPay] = useState();
  const [amount, setAmount] = useState();
  const [header, setHeader] = useState();
  const [symbol, setSymbol] = useState();
  const [contact, setContact] = useState();
  const [code, setCode] = useState();
  const [rate, setRate] = useState();
  const [userCurrentAction, setUserCurrentAction] = useState(); //The current user's action is different from the ad's side
  const [qrcode, setQrcode] = useState("");
  const [qrcodeSpin, setqrcodeSpin] = useState(api_status.pending);

  const idCommand = useRef();
  const deadLine = useRef(calculateTime(content.created_at, 15, 0));
  const callApiStatus = useRef(api_status.pending);
  const isMobileViewport = window.innerWidth < 600;

  useEffect(() => {
    loadData();
  }, [content]);
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        loadData();
        currentLanguage = newLanguage;
        return;
      }
    });

    const intervalId = timer();
    if (counter === `00 : 00`) clearInterval(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  useEffect(() => {
    if (listBankRedux && listBankRedux.length > 0) {
      fetchLoadQRPayment();
    }
  }, [listBankRedux]);

  const calcMoney = function (money) {
    if (!exchange || !currentCurrency || !money) return;
    const currencyRate = exchange.find(
      (item) => item.title === currentCurrency
    ).rate;
    const moneyFraction = math.fraction(money);
    const currencyRateFraction = math.fraction(currencyRate);
    const result = math.multiply(moneyFraction, currencyRateFraction);
    return formatCurrency(i18n.language, currentCurrency, math.number(result));
  };
  const timer = function () {
    return setInterval(() => {
      const utcTime = new Date();
      utcTime.setHours(utcTime.getHours() + 7);
      const time = calculateTimeDifference(
        utcTime.toISOString(),
        deadLine.current
      );
      setCounter(
        () =>
          `${time.mm.toString().padStart(2, "0")} : ${time.ss
            .toString()
            .padStart(2, "0")}`
      );
    }, 1000);
  };
  const showModalPayment = () => {
    setIsModalOpen(true);
  };
  const handleCancelModalPayment = () => {
    setIsModalOpen(false);
  };
  const closeTable = function () {
    hideElement(getElementById("confirm__table"));
  };
  const showTable = function () {
    showElement(getElementById("confirm__table"));
  };
  const closeSpinner = function () {
    hideElement(getElementById("confirm__spinner" + index));
  };
  const showSpinner = function () {
    showElement(getElementById("confirm__spinner" + index));
  };
  const fetchApiUserConfirm = function () {
    return new Promise((resolve) => {
      if (callApiStatus.current === api_status.fetching) {
        return resolve(false);
      }
      callApiStatus.current = api_status.fetching;
      userConfirmP2pCommand({
        idP2p: idCommand.current,
      })
        .then((resp) => {
          callApiStatus.current = api_status.fulfilled;
          callToastSuccess(t("confirmSuccess"));
          return resolve(true);
        })
        .catch((error) => {
          callApiStatus.current = api_status.rejected;

          return resolve(false);
        });
    });
  };
  const userConfirmClickHandle = async function () {
    apiFetchingUI();
    const apiRes = await fetchApiUserConfirm();
    if (apiRes) {
      render((state) => state + 1);
    }
    apiNoFetchingUI();
  };
  const fetchApiUserCancel = function () {
    return new Promise((resolve) => {
      if (callApiStatus.current === api_status.fetching) {
        return resolve(false);
      }
      callApiStatus.current = api_status.fetching;
      userCancelP2pCommand({
        idP2p: idCommand.current,
      })
        .then((resp) => {
          callApiStatus.current = api_status.fulfilled;
          callToastSuccess(t("cancelSuccess"));
          return resolve(true);
        })
        .catch((error) => {
          return resolve(null);
        });
    });
  };
  const userCancelClickHandle = async function () {
    apiFetchingUI();
    const apiRes = await fetchApiUserCancel();
    if (apiRes) {
      history.push(url.p2pTrading);
    }
    apiNoFetchingUI();
  };
  const apiFetchingUI = function () {
    closeTable();
    showSpinner();
  };
  const apiNoFetchingUI = function () {
    closeSpinner();
    showTable();
  };
  const fetchApiCompanyCancel = function () {
    return new Promise((resolve) => {
      if (callApiStatus.current === api_status.fetching) {
        return resolve(false);
      }
      callApiStatus.current = api_status.fetching;
      companyCancelP2pCommand({ idP2p: idCommand.current })
        .then((resp) => {
          callApiStatus.current = api_status.fulfilled;
          callToastSuccess(t("cancelSuccess"));
          return resolve(true);
        })
        .catch((error) => {
          callApiStatus.current = api_status.rejected;

          return resolve(false);
        });
    });
  };
  const fetchApiCompanyConfirm = function () {
    return new Promise((resolve) => {
      if (callApiStatus.current === api_status.fetching) {
        return resolve(false);
      }
      callApiStatus.current = api_status.fetching;
      companyConfirmP2pCommand({
        idP2p: idCommand.current,
      })
        .then((resp) => {
          callApiStatus.current = api_status.fulfilled;
          callToastSuccess(t("confirmSuccess"));
          return resolve(true);
        })
        .catch((error) => {
          callApiStatus.current = api_status.rejected;
          const mess = error?.response?.data?.message;
          switch (mess) {
            case errorMessage.insufficientBalance:
              callToastError(t("insufficientBalance"));
              break;
            default:
              callToastError(mess || commontString.error);
              break;
          }
          return resolve(false);
        });
    });
  };
  const companyConfirmHandleClick = async function () {
    apiFetchingUI();
    const apiRes = await fetchApiCompanyConfirm();
    if (apiRes) {
      render((state) => state + 1);
    }
    apiNoFetchingUI();
  };
  const companyCancelClickHandle = async function () {
    apiFetchingUI();
    const apiResp = await fetchApiCompanyCancel();
    if (apiResp) {
      render((state) => state + 1);
    }
    apiNoFetchingUI();
  };
  const loadData = function () {
    const {
      code,
      amount,
      symbol,
      rate,
      pay,
      side,
      created_at,
      bankName: bankN,
      ownerAccount: account,
      numberBank: numAcc,
      typeUser,
      userid: userId,
      id: idC,
      contact: contactC,
    } = content;
    idCommand.current = idC;
    setHeader(() => `${t("trading")} ${symbol}`);
    const date = created_at.split("T");
    const time = date.at(-1).split(".");
    const timerElement = getElementById("createdAt" + index);
    if (!timerElement) return;
    timerElement.innerHTML = date.at(0) + " " + time.at(0);
    setbankName(bankN);
    setOwnerAccount(account);
    setNumberBank(numAcc);
    setPay(pay);
    setAmount(amount);
    setSymbol(symbol);
    setCode(code);
    setRate(rate);
    setContact(contactC);
    if (
      (side === actionType.buy && userId === profileId) ||
      (side === actionType.sell && userId !== profileId)
    ) {
      setUserCurrentAction(() => actionType.buy);
    } else if (
      (side === actionType.buy && userId !== profileId) ||
      (side === actionType.sell && userId === profileId)
    ) {
      setUserCurrentAction(() => actionType.sell);
    }
  };
  const renderMainButton = function () {
    const { typeUser, userid: userId } = content;
    if (typeUser === 2 && userId === profileId) {
      return (
        <>
          <Button onClick={userConfirmClickHandle}>
            {t("paymentConfirmed")}
          </Button>
          <Button
            onClick={userCancelClickHandle}
            type={buttonClassesType.danger}
          >
            {t("cancelOrder")}
          </Button>
        </>
      );
    } else if (typeUser === 2 && userId !== profileId) {
      return (
        <>
          <Button disabled>{t("waitingTransfer")}</Button>
        </>
      );
    } else if (typeUser === 1 && userId === profileId) {
      if (userCurrentAction === actionTrading.buy) {
        return <Button disabled>{t("waitingForSellerToConfirm")}</Button>;
      } else {
        return <Button disabled>{t("waitingForBuyerToConfirm")}</Button>;
      }
    } else if (typeUser === 1 && userId !== profileId) {
      return (
        <>
          <Button onClick={companyConfirmHandleClick}>
            {userCurrentAction === actionTrading.buy
              ? t("receivedToken")
              : t("receivedPayment")}
          </Button>
          <Button
            onClick={companyCancelClickHandle}
            type={buttonClassesType.danger}
          >
            {t("notReceivedPayment")}
          </Button>
        </>
      );
    }
  };
  const renderBankInfo = function () {
    const inputString = t("accountInfoVietcomBank");
    const substringsList = ["3000stk2888", "VietcomBank", "123accountnae456"];
    const callback = (match, i) => {
      switch (match) {
        case "3000stk2888":
          return (
            <div key={i} className="green-text">
              {numberBank}
            </div>
          );
        case "VietcomBank":
          return (
            <div key={i} className="blue-text">
              {bankName}
            </div>
          );
        case "123accountnae456":
          return (
            <div key={i} className="red-text">
              {ownerAccount}
            </div>
          );
        default:
          break;
      }
    };
    return processString(inputString, substringsList, callback);
  };
  const renderTitleModal = function () {
    let inputString = "";
    if (userCurrentAction === actionType.buy)
      inputString = t("youAreBuyingBitcoinThroughSerepay");
    else inputString = t("youAreSellingBitcoinThroughSerepay");
    const substringsList = ["0.abc00012346787889456", "BTC", "Serepay"];
    const callback = (match, i) => {
      switch (match) {
        case "0.abc00012346787889456":
          return (
            <div key={i} className="red-text">
              {amount}
            </div>
          );
        case "BTC":
          return (
            <div key={i} className="red-text">
              {symbol}
            </div>
          );
        case "Serepay":
          return (
            <div key={i} className="blue-text">
              {"Serepay"}
            </div>
          );
        default:
          break;
      }
    };
    return processString(inputString, substringsList, callback);
  };
  const renderTraderEmail = function () {
    const { typeUser, userid: userId } = content;
    if (
      (typeUser === 2 && userId === profileId) ||
      (typeUser === 1 && userId === profileId)
    ) {
      return content.emailAds;
    } else {
      return content.email;
    }
  };
  const renderTrader = function () {
    const { typeUser, userid: userId } = content;
    if (
      (typeUser === 2 && userId === profileId) ||
      (typeUser === 1 && userId === profileId)
    ) {
      return content.userNameAds;
    } else {
      return content.userName;
    }
  };
  const renderSectionTrader = function () {
    const listString = ["114455t56est999"];
    const callback = function (match, index) {
      switch (match) {
        case listString.at(0):
          return (
            <span key={index} className="confirm--green">
              {renderTrader()}
            </span>
          );
        default:
          break;
      }
    };
    return processString(
      t("ifYouNeedAssistancePleaseContactTheTestMerchant"),
      listString,
      callback
    );
  };
  const renderClassBuyAction = function () {
    if (userCurrentAction === actionType.buy) {
      return "confirm--green";
    } else return "confirm--red";
  };
  const fetchLoadQRPayment = async function () {
    try {
      setqrcodeSpin(api_status.fetching);
      const response = await getQrBankPayment(
        content.numberBank,
        content.ownerAccount,
        findBankBin(content.bankName),
        code,
        content.pay.toFixed(0)
      );
      setQrcode(response.data.qrCode);
      setqrcodeSpin(api_status.fulfilled);
    } catch (error) { }
  };
  const findBankBin = function (bankShortName) {
    return listBankRedux.find((item) => {
      const bankName = bankShortName.split(" (");
      if (item.shortName === bankName.at(0)) return true;
    })?.bin;
  };
  const renderClassShowSpinQR = function () {
    return qrcodeSpin === api_status.fetching ? "" : "--d-none";
  };
  const renderClassShowQr = function () {
    return qrcodeSpin !== api_status.pending &&
      qrcodeSpin !== api_status.fetching
      ? ""
      : "--d-none";
  };
  const renderShowQRByAction = function () {
    return userCurrentAction === actionType.buy ? "" : "--d-none";
  };
  const onCopyHandle = function () {
    callToastSuccess(t(commontString.success.toLowerCase()));
  };

  return (
    <div className="confirm">
      <div className="container">
        <table id="confirm__table">
          <thead>
            <tr className="confirm__header">
              <td colSpan={2}>{header} </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t("transactionCode")}</td>
              <td className="confirm--green">{code}</td>
            </tr>
            <tr>
              <td>{t("trader")}:</td>
              <td>
                <div>{renderSectionTrader()}</div>
                <div>
                  {t("email")}:{" "}
                  <span className="confirm--green">{renderTraderEmail()}</span>
                </div>
                <div>
                  {t("contact")}:{" "}
                  <NavLink to={"#"}>
                    <span className="confirm--green">{contact}</span>
                  </NavLink>
                </div>
              </td>
            </tr>
            <tr>
              <td>{t("status")}</td>
              <td>
                <div className="confirm__status">
                  <span>
                    <div className="confirm__status-text confirm--blue">
                      <div className="loader"></div>
                      {t("waitingForPayment")}
                    </div>
                  </span>
                  <span className="confirm--red confirm__status-time">
                    {counter}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>{t("payment")}</td>
              <td>
                <div className="confirm__payment">
                  <Button onClick={showModalPayment}>
                    {t("paymentDetails")}
                  </Button>
                  <span className="confirm--green">
                    {t(
                      "youConfirmThatYouHaveMadeTheTransferPleaseWaitForUsToVerify"
                    )}
                  </span>
                </div>
                <div className={`${renderShowQRByAction()}`}>
                  <div
                    className={`d-flex alignItem-c justify-c ${renderClassShowQr()}`}
                  >
                    <span
                      style={{
                        padding: 5,
                        maxWidth: "50%",
                        backgroundColor: "white",
                      }}
                    >
                      <QRCode
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        value={qrcode ?? ""}
                      />
                    </span>
                  </div>
                  <div
                    className={`d-flex alignItem-c justify-c ${renderClassShowSpinQR()}`}
                  >
                    <Spin />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                {userCurrentAction === actionType.buy
                  ? t("youAreBuying")
                  : t("youAreSelling")}
              </td>
              <td>
                <span className={`hightLightNumber ${renderClassBuyAction()}`}>
                  {amount}
                </span>{" "}
                {symbol}
              </td>
            </tr>
            <tr>
              <td>{t("rate")}</td>
              <td className="confirm--red">{calcMoney(rate)}</td>
            </tr>
            <tr>
              <td>{t("amount")}</td>
              <td>
                <div className="confirm__money">
                  <span className="confirm--red">
                    {new Intl.NumberFormat(i18n.language, {
                      style: "currency",
                      currency: "VND",
                    }).format(pay)}
                  </span>
                  <span>
                    {t("transactionFee").replace(
                      "48,000",
                      formatCurrency(i18n.language, "VND", fee, false)
                    )}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>{t("time")}</td>
              <td
                id={"createdAt" + index}
                className="confirm--green confirm__time"
              >
                13-12-2023 | 04:29
              </td>
            </tr>
            <tr>
              <td>{t("note")}</td>
              <td className="confirm__comment">
                <li>{t("makePayment")}</li>
                <li>{t("cryptoOnly")}</li>
                <li>{t("websiteTransaction")}</li>
                <li>
                  {t("paymentDelayOrError")}{" "}
                  {userCurrentAction === actionType.buy
                    ? t("pleaseContactSellerForAssistance")
                    : t("pleaseContactBuyerForAssistance")}
                </li>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="confirm__action">{renderMainButton()}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          id={"confirm__spinner" + index}
          className="spin-container --d-none"
        >
          <Spin />
        </div>
      </div>
      <Modal
        title={<div style={{ textAlign: "center" }}>{t("paymentInfo")}</div>}
        open={isModalOpen}
        onOk={handleCancelModalPayment}
        onCancel={handleCancelModalPayment}
        okText="Gửi hình thanh toán"
        okButtonProps={{ style: { display: "none" } }}
        cancelText={t("close")}
        width={800}
        className="confirm-modal"
      >
        <div className="descriptionText">
          {renderTitleModal()}
          <div className="blue-text descriptionText__remind">
            {t(
              "pleaseMakeThePaymentForTheCorrectAmountContentAndAccountNumberBelow"
            )}
          </div>
        </div>
        <div className="paymentContent">
          <Descriptions
            column={1}
            title=""
            bordered
            size={isMobileViewport ? "small" : "middle"}
          >
            <Descriptions.Item label={t("amountOfMoney")}>
              <div className="green-text">
                {formatCurrency(i18n.language, "VND", pay, true)}
              </div>
              <CopyToClipboard
                text={formatCurrency(i18n.language, "VND", pay, false)}
                onCopy={onCopyHandle}
              >
                <div className="icon-copy">
                  <i className="fa-solid fa-copy"></i>
                </div>
              </CopyToClipboard>
            </Descriptions.Item>
            <Descriptions.Item label={t("content")}>
              <div className="green-text">{code}</div>
              <CopyToClipboard text={code} onCopy={onCopyHandle}>
                <div className="icon-copy">
                  <i className="fa-solid fa-copy"></i>
                </div>
              </CopyToClipboard>
            </Descriptions.Item>
            <Descriptions.Item label={t("accountNumber")}>
              <div>
                <div>{renderBankInfo()}</div>
              </div>
              <CopyToClipboard text={numberBank} onCopy={onCopyHandle}>
                <div className="icon-copy">
                  <i className="fa-solid fa-copy"></i>
                </div>
              </CopyToClipboard>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>
    </div>
  );
}
export default ConfirmItem;
