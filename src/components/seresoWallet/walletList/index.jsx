import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import i18n, { availableLanguage } from "src/translation/i18n";
import {
  coinString,
  currency,
  currencyMapper,
  image_domain,
  localStorageVariable,
  url,
} from "src/constant";
import {
  formatCurrency,
  formatNumber,
  formatStringNumberCultureUS,
  getLocalStorage,
  roundIntl,
  rountRange,
} from "src/util/common";
import { DOMAIN } from "src/util/service";
import { Spin } from "antd";
import { useHistory } from "react-router-dom";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import {
  actionContent,
  setCoin,
  setCoinAmount,
  setShow as setShowContent,
} from "src/redux/reducers/wallet2Slice";
import {
  form,
  setShow as setShowWithdrawTab,
} from "src/redux/reducers/walletWithdraw";
import { Button, buttonClassesType } from "src/components/Common/Button";
function SerepayWalletList() {
  const history = useHistory();
  const allCoin = useSelector(getListCoinRealTime);
  const myListCoin = useSelector(getUserWallet);
  const userSelectedCurrency = useSelector(getCurrent);
  const exchange = useSelector(getExchange);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || availableLanguage.vi;
    i18n.changeLanguage(language);
  }, []);

  const getMyCoin = function (coinName) {
    if (myListCoin) {
      const key = coinName.toLowerCase() + "_balance";
      return myListCoin[key] ? myListCoin[key] : 0;
    }
  };
  const swapOnClickHandle = function (coinName, amount) {
    dispatch(setCoin(coinName));
    dispatch(setCoinAmount(amount));
    history.push(url.swap);
  };
  const convertCurrency = function (usd, currency, exchange) {
    if (usd === 0) return 0;
    if (!usd || !currency || !exchange || !exchange.length) return -1;
    const rate =
      exchange.filter((item) => item.title === currency)[0]?.rate ?? 0;
    return (usd * rate).toFixed(3);
  };
  const renderButton = function (name) {
    return name === coinString.USDT ? (
      <Button
        onClick={() => {
          dispatch(setCoin(coinString.USDT));
          dispatch(setShowContent(actionContent.desposite));
          window.scrollTo(0, 0);
        }}
        className="primary-button"
      >
        {t("deposit")}
      </Button>
    ) : (
      ""
    );
  };
  const renderListCurrency = (listCurrencyData) => {
    return listCurrencyData?.map((item) => (
      <li key={item.token_key} className="list-item">
        <div className="name">
          <img src={DOMAIN + item.image} alt=".." />
          <span>{item.name}</span>
          <div>{item.token_key}</div>
        </div>
        <div className="price">
          <span>
            {formatCurrency(i18n.language, userSelectedCurrency, item.price)}
          </span>
          <span className="swaptobeWalletList__own">
            <span>{t("own")}:</span>
            <span>
              {formatNumber(
                getMyCoin(item.name, myListCoin),
                i18n.language,
                rountRange(item.price)
              )}
              <img
                src={image_domain.replace("USDT", item.name)}
                alt={item.name}
              />
            </span>
          </span>
        </div>
        <div className="action">
          {renderButton(item.name)}
          <Button
            onClick={() => {
              dispatch(setCoin(item.name));
              dispatch(setShowContent(actionContent.withdraw));
              dispatch(setShowWithdrawTab(form.Wallet));
              window.scrollTo(0, 0);
            }}
            type={buttonClassesType.outline}
          >
            {t("withdraw")}
          </Button>
          <Button
            onClick={() => {
              dispatch(setCoin(item.name));
              dispatch(setShowContent(actionContent.withdraw));
              dispatch(setShowWithdrawTab(form.UserName));
              window.scrollTo(0, 0);
            }}
            type={buttonClassesType.outline}
          >
            {t("transfer")}
          </Button>
          <Button
            onClick={swapOnClickHandle.bind(
              null,
              item.name,
              getMyCoin(item.name)
            )}
            type={buttonClassesType.outline}
          >
            {t("swap")}
          </Button>
        </div>
      </li>
    ));
  };

  return (
    <div className="swaptobeWalletList">
      <ul className="list">
        {!allCoin && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <Spin style={{ margin: "auto" }}></Spin>
          </div>
        )}
        {renderListCurrency(allCoin)}
      </ul>
    </div>
  );
}
export default SerepayWalletList;
