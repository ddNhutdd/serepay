import React, { useEffect, useState, useRef } from "react";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import {
  api_status,
  coinString,
  deploy_domain,
  image_domain,
  localStorageVariable,
  url,
} from "src/constant";
import { Input, inputType } from "src/components/Common/Input";
import {
  formatNumber,
  formatStringNumberCultureUS,
  generateNewURL,
  getLocalStorage,
  observeWidth,
  parseURLParameters,
  removeLocalStorage,
  setLocalStorage,
} from "src/util/common";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { Pagination, Spin } from "antd";
import css from "./transfer.module.scss";
import WalletTop, { titleWalletTop } from "../WalletTop";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getProfile, transferToUsername } from "src/util/userCallApi";
import { callToastError } from "src/function/toast/callToast";
import { useHistory } from "react-router-dom";
import { historytransfer as fetchHistorytransfer } from "src/util/userCallApi";
import { EmptyCustom } from "src/components/Common/Empty";

function Transfer() {
  const { t } = useTranslation();
  const userWallet = useSelector(getUserWallet);
  const location = useLocation();
  const listParams = location.search;
  const history = useHistory();
  const isLogin = useSelector((root) => root.loginReducer.isLogin);

  const [callApiSubmitStatus, setCallApiSubmitStatus] = useState(
    api_status.pending
  );
  const [callApiHistoryStatus, setCallApiHistoryStatus] = useState(
    api_status.pending
  );
  const [callApiProfileStatus, setCallApiProfileStatus] = useState(
    api_status.pending
  );

  const [historyTransfer, setHistoryTransfer] = useState([]);
  const [inputAmountCurrency, setInputAmountCurrency] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [inputAmoutTransferPadding, setInputAmoutTransferPadding] = useState(0);
  const [transferHistoryTotalItems, setTransferHistoryTotalItems] = useState(0);
  const [typeKyc, setTypeKyc] = useState(0);
  const [coin, setCoin] = useState(
    getLocalStorage(localStorageVariable.coinFromWalletList)
  );

  const userNameInputElement = useRef();
  const messageElement = useRef();
  const transferHistoryCurrentPage = useRef(1);
  const limit = useRef(10);

  const usernameInputChangeHandle = function (e) {
    const username = e.target.value;
    //change qr
    const { note, amountCoin } = parseURLParameters(qrValue);
    setQrValue(() =>
      generateNewURL(deploy_domain, username, coin, amountCoin, note)
    );
  };
  const noteChangeHandle = function (e) {
    const note = e.target.value;
    //change qr
    const { username, amountCoin } = parseURLParameters(qrValue);
    setQrValue(() =>
      generateNewURL(deploy_domain, username, coin, amountCoin, note)
    );
  };
  const transferToUserNameSubmitHandle = function (e) {
    e.preventDefault();
    if (callApiSubmitStatus === api_status.fetching) {
      return;
    }
    setCallApiSubmitStatus(api_status.fetching);
    transferToUsername({
      symbol: coin,
      userName: userNameInputElement.current.value,
      amount: inputAmountCurrency.toString().replaceAll(",", ""),
      note: messageElement.current.value,
    })
      .then((resp) => {
        callToastSuccess(t("transferSuccessful"));
        clearForm();
        transferHistoryCurrentPage.current = 1;
        fetchTransferHistory();
        dispatch(userWalletFetchCount());
        setCallApiSubmitStatus(api_status.fulfilled);
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.message;
        switch (errorMessage) {
          case "UserName is not exit":
            callToastError(t("userNameNotExists"));
            break;
          case "Invalid balance":
            callToastError(t("invalidBalance"));
            break;
          case "Not be empty":
            const errorMessage = error?.response?.data?.errors[0];
            errorMessage === "userName is not empty" &&
              callToastError(t("userNameNotEmpty"));
            errorMessage === "amount is not empty" &&
              callToastError(t("amountNotEmpty"));
            break;
          default:
            callToastError(t("anErrorHasOccurred"));
            break;
        }
        setCallApiSubmitStatus(api_url.rejected);
      });
  };
  const clearForm = function () {
    userNameInputElement.current.value = "";
    setInputAmountCurrency("");
    messageElement.current.value = "";
  };
  const renderTransferHistory = function () {
    return (
      <>
        <div className={css["transfer__title"]}>
          {t("transferHistory")} {coin}
        </div>
        <div className={`${css["transfer__Wallet-list"]} fadeInBottomToTop`}>
          {historyTransfer.map((item) => (
            <div key={item.id} className={css["transfer__Wallet-item"]}>
              <div className={css["transfer__Wallet-header"]}>
                <i className="fa-solid fa-calendar"></i>
                {item.created_at}
              </div>
              <div className={css["transfer__Wallet-body"]}>
                <div>Coin: {item.coin_key.toUpperCase()}</div>
                <div className={css["transfer__Wallet-body-amount"]}>
                  {t("amount")}: {formatNumber(item.amount, i18n.language, 8)}{" "}
                  {
                    <img
                      src={image_domain.replace(
                        coinString.USDT,
                        item.coin_key.toUpperCase()
                      )}
                      alt={item.coin_key.toUpperCase()}
                    />
                  }
                </div>
                <div>
                  {t("type")} : {item.type_exchange}
                </div>
                <div>
                  {t("note")}: {item.note}
                </div>
                <div>
                  {t("fromUser")}: {item.address_form}
                </div>
                <div>
                  {t("toUser")}: {item.address_to}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };
  const transferHistoryPagingOnChangeHandle = function (page) {
    transferHistoryCurrentPage.current = page;
    fetchTransferHistory();
  };
  const fetchTransferHistory = function () {
    setCallApiHistoryStatus(api_status.fetching);
    fetchHistorytransfer({
      limit: limit.current,
      page: transferHistoryCurrentPage.current,
      symbol: coin,
    })
      .then((resp) => {
        setHistoryTransfer(resp.data.data.array);
        setTransferHistoryTotalItems(resp.data.data.total);
        setCallApiHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        setCallApiHistoryStatus(api_status.rejected);
      });
  };
  const inputAmountCurrencyOnChangeHandles = function (e) {
    const inputValue = e.target.value;
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      setInputAmountCurrency(inputValue.slice(0, -1));
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    setInputAmountCurrency(inputValueFormated);
    //change qr
    const { username, note } = parseURLParameters(qrValue);
    setQrValue(() =>
      generateNewURL(
        deploy_domain,
        username,
        coin,
        inputValueWithoutComma,
        note
      )
    );
  };
  const getMaxAvailable = function () {
    return userWallet[coin.toLowerCase() + "_balance"];
  };
  const renderClassComponentSpin = function () {
    if (
      !userWallet ||
      userWallet.length <= 0 ||
      callApiProfileStatus === api_status.fetching
    )
      return "";
    return "--d-none";
  };
  const renderClassComponentContent = function () {
    if (
      !userWallet ||
      userWallet.length <= 0 ||
      callApiProfileStatus === api_status.fetching ||
      typeKyc !== 1
    )
      return "--d-none";
    return "";
  };
  const loadData = function () {
    const {
      username,
      coin: coinParams,
      amountCoin,
      note,
    } = parseURLParameters(listParams);
    username && (userNameInputElement.current.value = username);
    coinParams && setCoin(coinParams);
    amountCoin &&
      setInputAmountCurrency(formatNumber(amountCoin, i18n.language, 10));
    note && (messageElement.current.value = note);

    fetchApiGetProfile();
  };
  const renderClassHistorySpin = function () {
    return callApiHistoryStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassHistoryEmpty = function () {
    return callApiHistoryStatus !== api_status.fetching &&
      (!historyTransfer || historyTransfer.length <= 0)
      ? ""
      : "--d-none";
  };
  const fetchApiGetProfile = function () {
    return new Promise((resolve, reject) => {
      if (callApiProfileStatus === api_status.fetching) resolve(false);
      setCallApiProfileStatus(() => api_status.fetching);
      getProfile()
        .then((resp) => {
          const typeKyc = resp?.data?.data?.type_kyc;
          setTypeKyc(() => typeKyc);
          setCallApiProfileStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((err) => {
          reject(false);
          callToastError("Không tìm thấy thông tin tài khoản");
          setCallApiProfileStatus(() => api_status.rejected);
          history.push(url.login);
        });
    });
  };
  const renderClassShowKycVertifing = function () {
    if (callApiProfileStatus !== api_status.fetching && typeKyc === 2)
      return "";
    return "--d-none";
  };
  const renderClassShowKycNotYetVerify = function () {
    if (
      callApiProfileStatus !== api_status.fetching &&
      typeKyc !== 1 &&
      typeKyc !== 2
    ) {
      return "";
    }
    return "--d-none";
  };
  const redirectToProfile = function () {
    history.push(url.login);
    return;
  };

  useEffect(() => {
    Object.keys(listParams).length > 0 &&
      !isLogin &&
      setLocalStorage(localStorageVariable.previousePage, location);

    if (!isLogin) {
      history.push(url.login);
      return;
    }

    fetchTransferHistory();

    loadData();

    const inputObserver = observeWidth(setInputAmoutTransferPadding);
    inputObserver.observe(document.querySelector("#transferListTag"));

    return () => {
      inputObserver.disconnect();
    };
  }, []);

  return (
    <div className={css["transfer"]}>
      <div className={css["container"]}>
        <WalletTop title={titleWalletTop.transfer} />
        <div className={`spin-container ${renderClassComponentSpin()}`}>
          <Spin />
        </div>
        <div
          className={css["tranfer2Fa"] + ` ${renderClassShowKycNotYetVerify()}`}
        >
          Please update your identity information and turn on 2FA before being
          able to transfer. Contact your support for help.
          <Button onClick={redirectToProfile}>Chuyển tới trang profile</Button>
        </div>
        <div
          className={css["tranfer2Fa"] + ` ${renderClassShowKycVertifing()}`}
        >
          Vui lòng chờ admin xác nhận kyc
        </div>
        <div
          className={`${
            css["transferContent"]
          } ${renderClassComponentContent()}`}
        >
          <div className={css["left"]}>
            <div className={css["header"]}>
              <span>{t("userName")}</span>
            </div>
            <form className={`${css["wallet"]} ${css["active"]}`}>
              <div className={css["input"]}>
                <p>{t("userName")}</p>
                <Input
                  onChange={usernameInputChangeHandle}
                  ref={userNameInputElement}
                  type="text"
                />
              </div>
              <div className={css["input"]}>
                <p>
                  {t("amountOf")} {coin}
                </p>
                <Input
                  value={inputAmountCurrency}
                  onChange={inputAmountCurrencyOnChangeHandles}
                  type={inputType.number}
                  style={{ paddingRight: inputAmoutTransferPadding + 15 }}
                />
                <div id="transferListTag" className={css["list-tag"]}>
                  <span>{coin}</span>
                </div>
              </div>
              <div className={css["max-available"]}>
                <span>{t("maxAvailable")}:</span>{" "}
                <span>
                  {formatNumber(getMaxAvailable() || 0, i18n.language, 8)}{" "}
                  {coin}
                </span>
              </div>
              <div className={css["input"]}>
                <p>{t("message")}</p>
                <textarea
                  className={css["textarea"]}
                  ref={messageElement}
                  placeholder="I'm fine, tks. And u!"
                  cols="30"
                  rows="10"
                  onChange={noteChangeHandle}
                ></textarea>
              </div>
              <div className={css["button-submit-container"]}>
                <Button
                  type={buttonClassesType.success}
                  loading={callApiSubmitStatus === api_status.fetching}
                  onClick={transferToUserNameSubmitHandle}
                >
                  {t("send").toUpperCase()}
                </Button>
              </div>
            </form>
          </div>
          <div className={css["formWithdraw__right-container"]}>
            <div className={`${css["formWithdraw__qr"]}`}>
              <div className={css["formWithdraw__qr__bg"]}>
                <QRCode
                  style={{
                    height: "auto",
                    maxWidth: "200px",
                    width: "200px",
                  }}
                  value={qrValue}
                />
              </div>
            </div>
            <div className={css["right"]}>
              {renderTransferHistory()}
              <div className={`spin-container ${renderClassHistorySpin()}`}>
                <Spin />
              </div>
              <div className={renderClassHistoryEmpty()}>
                <EmptyCustom stringData={t("noData")} />
              </div>
              <div className={css["paging"]}>
                <Pagination
                  onChange={transferHistoryPagingOnChangeHandle}
                  total={transferHistoryTotalItems}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Transfer;
