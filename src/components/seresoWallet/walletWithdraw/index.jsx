import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Spin, Pagination } from "antd";
import {
  convertStringToNumber,
  formatNumber,
  formatStringNumberCultureUS,
  generateNewURL,
  getLocalStorage,
  observeWidth,
  parseURLParameters,
} from "src/util/common";
import i18n from "src/translation/i18n";
import {
  api_status,
  coinString,
  defaultLanguage,
  deploy_domain,
  image_domain,
  localStorageVariable,
  url,
} from "src/constant";
import { getHistoryWidthdraw, transferToAddress } from "src/util/userCallApi";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input, inputType } from "src/components/Common/Input";
import { EmptyCustom } from "src/components/Common/Empty";
import { Button, buttonClassesType } from "src/components/Common/Button";
import WalletTop, { titleWalletTop } from "../WalletTop";
import css from "./walletWidthdraw.module.scss";
import { useHistory } from "react-router-dom";

function FormWithdraw() {
  const withdrawType = {
    bep20: "bep20",
    amc20: "amc20",
  };
  const { t } = useTranslation();
  const userWallet = useSelector(getUserWallet);
  const coin = getLocalStorage(localStorageVariable.coinFromWalletList);
  const isLogin = useSelector((root) => root.loginReducer.isLogin);
  const history = useHistory();

  const [, setCallApiHistoryStatus] = useState(api_status.pending);
  const [callApiSubmitStatus, setCallApiSubmitStatus] = useState(
    api_status.pending
  );

  const [inputAmountCurrency, setInputAmountCurrency] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [withdrawHistoryTotalItems, setWithdrawHistoryTotalItems] = useState(1);
  const [qrValue, setQrValue] = useState(deploy_domain);
  const [inputPadding, setInputPadding] = useState(0);
  const [withdrawTypeSelected, setWithdrawTypeSelected] = useState(
    withdrawType.bep20
  );

  const inputNoteValue = useRef();
  const formWallet = useRef();
  const withdrawHistoryCurrentPage = useRef(1);
  const addressElement = useRef();

  useEffect(() => {
    if (!isLogin) {
      history.push(url.login);
      return;
    }

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    fetchWithdrawHistory();

    const inputObserver = observeWidth(setInputPadding);
    inputObserver.observe(document.querySelector("#widthDrawListTag"));

    return () => {
      inputObserver.disconnect();
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
      generateNewURL(deploy_domain, username, inputValueWithoutComma, note)
    );
  };
  const submitFormWalletHandle = function (e) {
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
          const messageError =
            error?.response?.data?.errors[0] || error?.response?.data?.message;
          switch (messageError) {
            case "Insufficient balance or incorrect withdrawal minimum amount.":
              callToastError(t("insufficientBalanceOrWithdrawalAmount"));
              break;
            case "to_address is not empty":
              callToastError(t("addressIsNotEmpty"));
              break;
            case "Invalid quantity":
              callToastError(t("invalidQuantity"));
              break;
            default:
              callToastError(t(messageError) || t("anErrorHasOccurred"));
              break;
          }
          setCallApiSubmitStatus(api_status.rejected);
        });
    }
  };
  const fetchWithdrawHistory = function () {
    setCallApiHistoryStatus(api_status.fetching);
    getHistoryWidthdraw({
      symbol: coin,
      limit: "10",
      page: withdrawHistoryCurrentPage.current,
    })
      .then((resp) => {
        setWithdrawHistory(resp.data.data.array);
        setWithdrawHistoryTotalItems(resp.data.data.total);
        setCallApiHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        setCallApiHistoryStatus(api_status.rejected);
      });
  };
  const renderWithdrawHistory = function () {
    return (
      <div className={`fadeInBottomToTop ${css["formWithdraw__Wallet-list"]}`}>
        {withdrawHistory.map((item) => (
          <div key={item.id} className={css["formWithdraw__Wallet-item"]}>
            <div className={css["formWithdraw__Wallet-header"]}>
              <i className="fa-solid fa-calendar"></i>
              {item.created_at}
            </div>
            <div className={css["formWithdraw__Wallet-body"]}>
              <div>Coin: {item.wallet.toUpperCase()}</div>
              <div>
                {`${t("status")}: `} {renderStatusHistoryWidthdraw(item.status)}
              </div>
              <div>
                {t("note")}: {item.note}
              </div>
              <div className={css["formWithdraw__Wallet-body-amount"]}>
                {t("amount")}: {formatNumber(item.amount, i18n.language, 8)}{" "}
                {
                  <img
                    src={image_domain.replace(
                      coinString.USDT,
                      item.wallet.toUpperCase()
                    )}
                    alt={item.wallet.toUpperCase()}
                  />
                }
              </div>
              <div>
                <span className={css["formWithdraw__Wallet-address"]}>
                  {`${t("toAddress")}: ${item.to_address}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderStatusHistoryWidthdraw = function (status) {
    switch (status) {
      case 0:
        return (
          <span className="formWithdraw__Wallet-body__reject">
            {t("reject")}
          </span>
        );
      case 1:
        return (
          <span className="formWithdraw__Wallet-body__success">
            {t("success")}
          </span>
        );
      case 2:
        return (
          <span className="formWithdraw__Wallet-body__pending">
            {t("pending")}
          </span>
        );
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
  const maxButtonClickHandle = function () {
    let valueString = getMaxAvailable()?.toString();
    setInputAmountCurrency(formatStringNumberCultureUS(valueString || ""));
  };
  const renderClassSpin = function () {
    return callApiSubmitStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmpty = function () {
    return callApiSubmitStatus !== api_status.pending &&
      callApiSubmitStatus !== api_status.fetching &&
      (!withdrawHistory || withdrawHistory.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderClassActiveWithdrawType = function (value) {
    return value === withdrawTypeSelected ? css["active"] : "";
  };
  const widthdrawTypeClickHandle = function (type) {
    setWithdrawTypeSelected(type);
  };

  return (
    <div className={`fadeInBottomToTop ` + css["formWithdraw"]}>
      <div className={css["container"]}>
        <WalletTop title={titleWalletTop} />
        <div className={css["formWithdrawContent"]}>
          <div className={css["left"]}>
            <div className={css["header"]}>
              <span>
                {t("wallet")} {coin}
              </span>
            </div>
            <form className={css["wallet"]} ref={formWallet}>
              <div className={css["withdraw-type"]}>
                <span
                  onClick={widthdrawTypeClickHandle.bind(
                    null,
                    withdrawType.bep20
                  )}
                  className={`${
                    css["withdraw-type-items"]
                  }  ${renderClassActiveWithdrawType(withdrawType.bep20)}`}
                >
                  BEP20
                </span>
                <span
                  onClick={widthdrawTypeClickHandle.bind(
                    null,
                    withdrawType.amc20
                  )}
                  className={`${
                    css["withdraw-type-items"]
                  } ${renderClassActiveWithdrawType(withdrawType.amc20)}`}
                >
                  AMC20
                </span>
              </div>
              <div className={css["input"]}>
                <p>{t("address")}</p>
                <Input ref={addressElement} type="text" />
              </div>
              <div className={css["input"]}>
                <p>{t("note")}</p>
                <Input ref={inputNoteValue} type="text" />
              </div>
              <div className={css["input"]}>
                <p>{t("amountOf")}</p>
                <Input
                  type={inputType.number}
                  value={inputAmountCurrency}
                  onChange={inputAmountCurrencyOnChangeHandles}
                  style={{ paddingRight: inputPadding + 5 }}
                />
                <div id="widthDrawListTag" className={css["list-tag"]}>
                  <span>{coin}</span>
                  <span
                    onClick={maxButtonClickHandle}
                    className={css["active"]}
                  >
                    MAX
                  </span>
                </div>
              </div>
              <div className={css["max-available"]}>
                <span>{t("maxAvailable")}:</span>{" "}
                <span>
                  {formatNumber(getMaxAvailable() || 0, i18n.language, 8)}{" "}
                  {coin}
                </span>
              </div>
              <ul className={css["list-notify"]}>
                <li className={css["notify-item"]}>
                  <span>
                    <img src="./img/!.png" alt="" />
                  </span>
                  <p>
                    {t(
                      "youMustKeepAMinimum002BNBInYourWalletToSecureEnoughGasFeesForTradingBEP20Tokens"
                    )}
                  </p>
                </li>
                <li className={css["notify-item"]}>
                  <span>
                    <img src="./img/!.png" alt="" />
                  </span>
                  <p>
                    {t(
                      "transactionFeesOrGasFeesAreNotFixedSubjectToChangesDependingOnPeakTimeAndOffPeakOfTheBlockchainNetworks"
                    )}
                  </p>
                </li>
                <li className={css["notify-item"]}>
                  <span>
                    <img src="./img/!.png" alt="" />
                  </span>
                  <p>
                    {t(
                      "estimatedCompletionTime2MinutesIfYouDidNotRecievedYourWithdrawIn15MinutesPleaseContactOurSupportTeamAtSupportSerepayNet"
                    )}
                  </p>
                </li>
              </ul>
              <div className={css["button-submit-container"]}>
                <Button
                  loading={callApiSubmitStatus === api_status.fetching}
                  type={buttonClassesType.success}
                  onClick={submitFormWalletHandle}
                >
                  {t("send").toUpperCase()}
                </Button>
              </div>
            </form>
          </div>
          <div className={css["right"]}>
            <div className={css["formWithdraw__title"]}>
              {t("withdrawalHistory")}
            </div>
            {renderWithdrawHistory()}
            <div className={`spin-container ${renderClassSpin()}`}>
              <Spin />0
            </div>
            <div className={renderClassEmpty()}>
              <EmptyCustom stringData={t("noData")} />
            </div>
            <div className={css["paging"]}>
              <Pagination
                onChange={withdrawHistoryPagingOnChangeHandle}
                total={withdrawHistoryTotalItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FormWithdraw;
