import React, { useEffect, useState, useRef } from "react";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { api_status, coinString, localStorageVariable } from "src/constant";
import { Input, inputType } from "src/components/Common/Input";
import {
  formatNumber,
  getLocalStorage,
  removeLocalStorage,
} from "src/util/common";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { Pagination } from "antd";
import css from "./transfer.module.scss";
import WalletTop, { titleWalletTop } from "../WalletTop";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { useSelector } from "react-redux";

function Transfer() {
  const { t } = useTranslation();
  const coin = getLocalStorage(localStorageVariable.coinFromWalletList);
  const userWallet = useSelector(getUserWallet);

  const [callApiSubmitStatus, setCallApiSubmitStatus] = useState(
    api_status.fetching
  );

  const [historytransfer] = useState([]);
  const [inputAmountCurrency, setInputAmountCurrency] = useState();
  const [qrValue, setQrValue] = useState("");
  const [inputAmoutTransferPadding, setInputAmoutTransferPadding] = useState();
  const [transferHistoryTotalItems, setTransferHistoryTotalItems] = useState(0);

  const userNameInputElement = useRef();
  const messageElement = useRef();

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
  const renderTransferHistory = function () {
    return (
      <>
        <div className={css["transfer__title"]}>
          {t("transferHistory")} {coin}
        </div>
        <div className={`${css["transfer__Wallet-list"]} fadeInBottomToTop`}>
          {historytransfer.map((item) => (
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
    fetTransferHistory();
  };
  const fetTransferHistory = function () {
    setCallApiHistoryStatus(api_status.fetching);
    historytransferApi({
      limit: "10",
      page: transferHistoryCurrentPage.current,
      symbol: coin,
    })
      .then((resp) => {
        setHistoryTransfer(resp.data.data.array);
        setTransferHistoryTotalItems(resp.data.data.total);
        setCallApiHistoryStatus(api_status.fulfilled);
      })
      .catch((error) => {
        console.log(error);
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

  useEffect(() => {
    return () => {
      removeLocalStorage(localStorageVariable.coinFromWalletList);
    };
  }, []);

  return (
    <div className={css["transfer"]}>
      <div className={css["container"]}>
        <WalletTop title={titleWalletTop.transfer} />
        <div className={css["transferContent"]}>
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
