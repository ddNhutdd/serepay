import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Pagination } from "antd";
import QRCode from "react-qr-code";
import {
  convertStringToNumber,
  formatNumber,
  formatStringNumberCultureUS,
  generateNewURL,
  getLocalStorage,
  parseURLParameters,
} from "src/util/common";
import i18n from "src/translation/i18n";
import {
  api_status,
  api_url,
  defaultLanguage,
  deploy_domain,
  image_domain,
  localStorageVariable,
} from "src/constant";
import {
  getHistoryWidthdraw,
  transferToAddress,
  transferToUsername,
} from "src/util/userCallApi";
import { getUserWallet } from "src/redux/constant/coin.constant";

import { historytransfer as historytransferApi } from "src/util/userCallApi";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input } from "src/components/Common/Input";
import {
  actionContent,
  getCoin,
  setShow,
} from "src/redux/reducers/wallet2Slice";
import { form, getShow } from "src/redux/reducers/walletWithdraw";
import { setShow as setShowTabFromRedux } from "src/redux/reducers/walletWithdraw";
import { EmptyCustom } from "src/components/Common/Empty";

function FormWithdraw() {
  const withdrawTypeEnum = {
    TRC20: "TRC20",
    ERC20: "ERC20",
    BEP20: "BEP20",
  };
  const showFromRedux = useSelector(getShow);
  const [showForm, setShowForm] = useState(showFromRedux);
  const { t } = useTranslation();
  const [withdrawType, setWithdrawType] = useState(withdrawTypeEnum.TRC20);
  const [inputAmountCurrency, setInputAmountCurrency] = useState("");
  const inputNoteValue = useRef();
  const formWallet = useRef();
  const dispatch = useDispatch();
  const userNameInputElement = useRef();
  const withdrawHistoryCurrentPage = useRef(1);
  const transferHistoryCurrentPage = useRef(1);
  const addressElement = useRef();
  const messageElement = useRef();
  const { search } = useLocation();
  const coin = useSelector(getCoin);
  const userWallet = useSelector(getUserWallet);
  const [callApiSubmitStatus, setCallApiSubmitStatus] = useState(
    api_status.pending
  );
  const [callApiGetWithdrawHistoryStatus, setCallApiGetWithdrawHistoryStatus] =
    useState(api_status.pending);
  const [callApiGetTransferHistoryStatus, setCallApiGetTransferHistoryStatus] =
    useState(api_status.pending);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [historytransfer, setHistoryTransfer] = useState([]);
  const [withdrawHistoryTotalItems, setWithdrawHistoryTotalItems] = useState(1);
  const [transferHistoryTotalItems, setTransferHistoryTotalItems] = useState(1);
  const [qrValue, setQrValue] = useState(deploy_domain);

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    fetchWithdrawHistory();
    fetTransferHistory();
    // if url have variable set value for control
    const { username, note, amountCoin } = parseURLParameters(search);
    if (username) {
      setShowForm(form.UserName);
      setInputAmountCurrency(() => formatStringNumberCultureUS(amountCoin));
      userNameInputElement.current.value = username;
      messageElement.current.value = note;
    }
    //
    document
      .getElementsByClassName("FormWithdraw")[0]
      .classList.add("fadeInBottomToTop");
    return () => {
      dispatch(setShow(actionContent.main));
      dispatch(setShowTabFromRedux(form.wallet));
    };
  }, []);

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
  const submitFormWalletHandle = function (e) {
    console.log(inputNoteValue, addressElement);
    e.preventDefault();
    if (callApiSubmitStatus !== api_status.fetching) {
      setCallApiSubmitStatus(api_status.fetching);
      transferToAddress({
        to_address: addressElement.current.value,
        symbol: coin,
        amount: convertStringToNumber(inputAmountCurrency).toString(),
        note: inputNoteValue.current.value,
        type: "1",
      })
        .then(() => {
          callToastSuccess(
            t("createASuccessfulMoneyTransferOrderWaitingForAdminApproval")
          );
          setCallApiSubmitStatus(api_status.fulfilled);
          formWallet.current.reset();
          setInputAmountCurrency("");
          withdrawHistoryCurrentPage.current = 1;
          addressElement.current.value = "";
          fetchWithdrawHistory();
        })
        .catch((error) => {
          console.log(error);
          const messageError = error?.response?.data?.message;
          switch (messageError) {
            case "Insufficient balance or incorrect withdrawal minimum amount.":
              callToastError(t("insufficientBalanceOrWithdrawalAmount"));
              break;
            default:
              callToastError(t("anErrorHasOccurred"));
              break;
          }
          setCallApiSubmitStatus(api_status.rejected);
        });
    }
  };
  const fetchWithdrawHistory = function () {
    setCallApiGetWithdrawHistoryStatus(api_status.fetching);
    getHistoryWidthdraw({
      symbol: coin,
      limit: "10",
      page: withdrawHistoryCurrentPage.current,
    })
      .then((resp) => {
        setWithdrawHistory(resp.data.data.array);
        setWithdrawHistoryTotalItems(resp.data.data.total);
        setCallApiGetWithdrawHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        console.log(error);
        setCallApiGetWithdrawHistoryStatus(api_status.rejected);
      });
  };
  const renderWithdrawHistory = function () {
    if (callApiGetWithdrawHistoryStatus === api_status.fetching) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    } else if (
      callApiGetWithdrawHistoryStatus !== api_status.fetching &&
      withdrawHistory.length <= 0
    ) {
      return <EmptyCustom stringData={t("noData")} />;
    } else if (
      callApiGetWithdrawHistoryStatus !== api_status.fetching &&
      withdrawHistory.length > 0
    ) {
      return (
        <>
          <div className="formWithdraw__title">{t("withdrawalHistory")}</div>
          <div className="formWithdraw__Wallet-list fadeInBottomToTop">
            {withdrawHistory.map((item) => (
              <div key={item.id} className="formWithdraw__Wallet-item">
                <div className="formWithdraw__Wallet-header">
                  <i className="fa-solid fa-calendar"></i>
                  {item.created_at}
                </div>
                <div className="formWithdraw__Wallet-body">
                  <div>Coin: {item.wallet.toUpperCase()}</div>
                  <div>
                    {`${t("status")}: ${renderStatusHistoryWidthdraw(
                      item.status
                    )}`}
                  </div>
                  <div>
                    {t("note")}: {item.note}
                  </div>
                  <div className="formWithdraw__Wallet-body-amount">
                    {t("amount")}: {formatNumber(item.amount, i18n.language, 8)}{" "}
                    {
                      <img
                        src={image_domain.replace(
                          "USDT",
                          item.wallet.toUpperCase()
                        )}
                        alt={item.wallet.toUpperCase()}
                      />
                    }
                  </div>
                  <div>
                    <span className="formWithdraw__Wallet-address">
                      {`${t("toAddress")}: ${item.to_address}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };
  const renderStatusHistoryWidthdraw = function (status) {
    switch (status) {
      case 0:
        return t("reject");
      case 1:
        return t("success");
      case 2:
        return t("pending");
      default:
        break;
    }
  };
  const withdrawHistoryPagingOnChangeHandle = function (page) {
    withdrawHistoryCurrentPage.current = page;
    fetchWithdrawHistory();
  };
  const getMaxAvailable = function () {
    return userWallet[coin.toLowerCase() + "_balance"];
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
      amount: inputAmountCurrency.toString().replace(",", ""),
      note: messageElement.current.value,
    })
      .then((resp) => {
        callToastSuccess(t("transferSuccessful"));
        userNameInputElement.current.value = "";
        setInputAmountCurrency("");
        messageElement.current.value = "";
        transferHistoryCurrentPage.current = 1;
        fetTransferHistory();
        dispatch(userWalletFetchCount());
        setCallApiSubmitStatus(api_status.fulfilled);
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.message;
        console.log(error?.response?.data, errorMessage);
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
  const fetTransferHistory = function () {
    setCallApiGetTransferHistoryStatus(api_status.fetching);
    historytransferApi({
      limit: "10",
      page: transferHistoryCurrentPage.current,
      symbol: coin,
    })
      .then((resp) => {
        setHistoryTransfer(resp.data.data.array);
        setTransferHistoryTotalItems(resp.data.data.total);
        setCallApiGetTransferHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        console.log(error);
        setCallApiGetTransferHistoryStatus(api_status.rejected);
      });
  };
  const renderTransferHistory = function () {
    if (callApiGetTransferHistoryStatus === api_status.fetching) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    } else if (
      callApiGetTransferHistoryStatus !== api_status.fetching &&
      historytransfer.length <= 0
    ) {
      return <EmptyCustom stringData={t("noData")} />;
    } else if (
      callApiGetTransferHistoryStatus !== api_status.fetching &&
      historytransfer.length > 0
    ) {
      return (
        <>
          <div className="formWithdraw__title">
            {t("transferHistory")} {coin}
          </div>
          <div className="formWithdraw__Wallet-list fadeInBottomToTop">
            {historytransfer.map((item) => (
              <div key={item.id} className="formWithdraw__Wallet-item">
                <div className="formWithdraw__Wallet-header">
                  <i className="fa-solid fa-calendar"></i>
                  {item.created_at}
                </div>
                <div className="formWithdraw__Wallet-body">
                  <div>Coin: {item.coin_key.toUpperCase()}</div>
                  <div className="formWithdraw__Wallet-body-amount">
                    {t("amount")}: {formatNumber(item.amount, i18n.language, 8)}{" "}
                    {
                      <img
                        src={image_domain.replace(
                          "USDT",
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
    }
  };
  const transferHistoryPagingOnChangeHandle = function (page) {
    transferHistoryCurrentPage.current = page;
    fetTransferHistory();
  };
  const maxButtonClickHandle = function () {
    let valueString = getMaxAvailable()?.toString();
    setInputAmountCurrency(formatStringNumberCultureUS(valueString || ""));
  };
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
  const renderClassActiveTabWallet = function () {
    return showForm === form.Wallet ? "active" : "--d-none";
  };
  const renderClassActiveTabUserName = function () {
    return showForm === form.UserName ? "active" : "--d-none";
  };
  const renderClassDisableWhenFetching = function () {
    return callApiSubmitStatus === api_status.fetching ? "disabled" : "";
  };

  return (
    <div className="container">
      <div className="FormWithdraw">
        <div className="left">
          <div className="header">
            <span
              className={`${renderClassActiveTabWallet()}  ${renderClassDisableWhenFetching()}`}
            >
              {t("wallet")} {coin}
            </span>
            <span
              className={`${renderClassActiveTabUserName()}  ${renderClassDisableWhenFetching()}`}
            >
              {t("userName")}
            </span>
          </div>
          <form
            ref={formWallet}
            className={`wallet ${showForm !== form.Wallet ? "--d-none" : ""}`}
          >
            <div className="withdraw-type">
              <span
                onClick={() => setWithdrawType("TRC20")}
                className={`withdraw-type-items ${
                  withdrawType === "TRC20" ? "active" : ""
                }`}
              >
                TRC20
              </span>
              <span
                onClick={() => setWithdrawType("ERC20")}
                className={`withdraw-type-items ${
                  withdrawType === "ERC20" ? "active" : ""
                }`}
              >
                ERC20
              </span>
              <span
                onClick={() => setWithdrawType("BEP20")}
                className={`withdraw-type-items ${
                  withdrawType === "BEP20" ? "active" : ""
                }`}
              >
                BEP20
              </span>
            </div>
            <div className="input">
              <p>{t("address")}</p>
              <Input ref={addressElement} type="text" />
            </div>
            <div className="input">
              <p>{t("note")}</p>
              <Input ref={inputNoteValue} type="text" />
            </div>
            <div className="input">
              <p>
                {t("amountOf")} {coin}
              </p>
              <Input
                value={inputAmountCurrency}
                onChange={inputAmountCurrencyOnChangeHandles}
                type="text"
              />
              <div className="list-tag">
                <span>{coin}</span>
                <span onClick={maxButtonClickHandle} className="active">
                  MAX
                </span>
              </div>
            </div>
            <div className="max-available">
              <span>{t("maxAvailable")}:</span>{" "}
              <span>
                {formatNumber(getMaxAvailable(), i18n.language, 8)} {coin}
              </span>
            </div>
            <ul className="list-notify">
              <li className="notify-item">
                <span>
                  <img src="./img/!.png" alt="" />
                </span>
                <p>
                  {t(
                    "youMustKeepAMinimumOf20TRXInYourWalletToSecureEnoughGasFeesForTradingTRC20Tokens"
                  )}
                </p>
              </li>
              <li className="notify-item">
                <span>
                  <img src="./img/!.png" alt="" />
                </span>
                <p>
                  {t(
                    "youMustKeepAMinimumOf20TRXInYourWalletToSecureEnoughGasFeesForTradingTRC20Tokens"
                  )}
                </p>
              </li>
              <li className="notify-item">
                <span>
                  <img src="./img/!.png" alt="" />
                </span>
                <p>
                  {t(
                    "theOverheadFeesAreNotFixedSubjectToChangeDependingOnTheStateOfTheBlockchainNetworks"
                  )}
                </p>
              </li>
              <li className="notify-item">
                <span>
                  <img src="./img/!.png" alt="" />
                </span>
                <p>{t("estimatedCompletionTime2Minutes")}</p>
              </li>
            </ul>
            <div className="button-submit-container">
              <button
                className={`${
                  callApiSubmitStatus === api_status.fetching ? "disabled" : ""
                }`}
                type="submit"
                onClick={submitFormWalletHandle}
              >
                {t("send")}
              </button>
            </div>
          </form>
          <form
            className={`aliases ${
              showForm !== form.UserName ? "--d-none" : ""
            }`}
          >
            <div className="input">
              <p>{t("userName")}</p>
              <Input
                onChange={usernameInputChangeHandle}
                ref={userNameInputElement}
                type="text"
              />
            </div>
            <div className="input">
              <p>
                {t("amountOf")} {coin}
              </p>
              <Input
                value={inputAmountCurrency}
                onChange={inputAmountCurrencyOnChangeHandles}
                type="text"
              />
              <div className="list-tag">
                <span>{coin}</span>
              </div>
            </div>
            <div className="max-available">
              <span>{t("maxAvailable")}:</span>{" "}
              <span>
                {formatNumber(getMaxAvailable(), i18n.language, 8)} {coin}
              </span>
            </div>
            <div className="input">
              <p>{t("message")}</p>
              <textarea
                className="textarea"
                ref={messageElement}
                placeholder="I'm fine, tks. And u!"
                cols="30"
                rows="10"
                onChange={noteChangeHandle}
              ></textarea>
            </div>
            <div className="button-submit-container">
              <button
                className={`${
                  callApiSubmitStatus === api_status.fetching ? "disabled" : ""
                }`}
                onClick={transferToUserNameSubmitHandle}
              >
                {t("send")}
              </button>
            </div>
          </form>
        </div>
        <div className="FormWithdraw__right-container">
          <div
            className={`FormWithdraw__qr ${
              showForm === form.Wallet ? "--d-none" : ""
            }`}
          >
            <div className="FormWithdraw__qr__bg">
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
          <div className="right">
            {showForm === form.Wallet ? (
              <>
                {renderWithdrawHistory()}
                <div className="paging">
                  <Pagination
                    onChange={withdrawHistoryPagingOnChangeHandle}
                    total={withdrawHistoryTotalItems}
                  />
                </div>
              </>
            ) : (
              <>
                {renderTransferHistory()}
                <div className="paging">
                  <Pagination
                    onChange={transferHistoryPagingOnChangeHandle}
                    total={transferHistoryTotalItems}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default FormWithdraw;
