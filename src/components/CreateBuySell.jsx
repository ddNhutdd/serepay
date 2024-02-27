import { Modal } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import i18n from "src/translation/i18n";
import {
  addClassToElementById,
  formatCurrency,
  formatStringNumberCultureUS,
  getClassListFromElementById,
  getElementById,
  getLocalStorage,
} from "src/util/common";
import { DOMAIN } from "src/util/service";
import { companyAddAds, getProfile } from "src/util/userCallApi";
import {
  actionTrading,
  api_status,
  defaultLanguage,
  localStorageVariable,
  regularExpress,
  url,
} from "src/constant";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input, inputColor, inputType } from "./Common/Input";
import { math } from "src/App";
import { getBankState } from "src/redux/reducers/bankSlice";
import Dropdown from "./Common/dropdown/Dropdown";
import { Button, htmlType } from "./Common/Button";
import { getExchangeRateSell } from "src/redux/reducers/exchangeRateSellSlice";

export default function CreateBuy() {
  const actionType = {
    sell: "sell",
    buy: "buy",
  };
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();
  const action = location.pathname.split("/").at(-1);
  const data = useRef([]);
  const [currentCoin, setCurrentCoin] = useState(
    getLocalStorage(localStorageVariable.createAds) || "BTC"
  );
  const [marketSellPrice, setMarketSellPrice] = useState();
  const [isModalCoinVisible, setIsModalCoinVisible] = useState(false);
  const [isModalPreviewOpen, setIsModalPreviewOpen] = useState(false);
  const listCoinRealTime = useSelector(getListCoinRealTime);
  const currentCurrency = useSelector(getCurrent);
  const { listBank } = useSelector(getBankState);
  const exchange = useSelector(getExchange);
  const exchangeRateSellDisparity = useSelector(getExchangeRateSell);
  const [selectedBank, setSelectedBank] = useState();
  const userName = useRef("");
  const controls = useRef({
    amount: "amount",
    mini: "mini",
    fullname: "fullname",
    accountNumber: "accountNumber",
    info: "info",
  });
  const controlsTourched = useRef({});
  const [controlsErrors, setControlsErrors] = useState({});
  const callApiStatus = useRef(api_status.pending);
  const isMobileViewport = window.innerWidth < 600;

  const inputContactInfoElement = useRef();

  useEffect(() => {
    data.current = listCoinRealTime ?? [];
    renderMarketBuyPrice();
    calcSellPrice();
  }, [listCoinRealTime]);
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    const currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        validate();
        return;
      }
    });

    const callProfile = async function () {
      return await fetchUserNameProfile();
    };
    callProfile().then((resp) => {
      userName.current = resp;
    });
  }, []);
  useEffect(() => {
    if (listBank && listBank.length > 0) {
      setSelectedBank(listBank.at(0));
    }
  }, [listBank]);

  const showCoinModal = () => setIsModalCoinVisible(true);
  const modalCoinHandleOk = () => setIsModalCoinVisible(false);
  const modalCoinHandleCancel = () => setIsModalCoinVisible(false);
  const showModalPreview = () => {
    setIsModalPreviewOpen(true);
    setTimeout(() => {
      renderModalReview();
    }, 0);
  };
  const modalPreviewHandleOk = () => {
    setIsModalPreviewOpen(false);
  };
  const modalPreviewHandleCancel = () => {
    setIsModalPreviewOpen(false);
  };
  const renderMarketBuyPrice = function () {
    const result = calcBuyPrice();
    // set html
    getElementById("marketBuyPrice").innerHTML = formatCurrency(
      i18n.language,
      currentCurrency,
      result
    );
  };
  const calcBuyPrice = function () {
    if (data.length <= 0 || exchange.length <= 0) return;
    // find current price
    let ccCoin = data.current.filter((item) => item.name === currentCoin)[0]
      ?.price;
    if (!ccCoin) return;
    const exchangeRate = exchange.find(
      (item) => item.title === currentCurrency
    )?.rate;
    if (!exchangeRate) return;
    // process price
    const rateDisparity = math.fraction(ccCoin);
    const exchangeRateFraction = math.fraction(exchangeRate);
    const result = math.multiply(rateDisparity, exchangeRateFraction);
    return math.number(result);
  };
  const renderClassMarketSellPrice = function () {
    return action === actionType.sell ? "" : "--d-none";
  };
  const renderClassMarketBuyPrice = function () {
    return action === actionType.buy ? "" : "--d-none";
  };
  const calcSellPrice = function () {
    if (data.length <= 0 || exchange.length <= 0 || !exchangeRateSellDisparity)
      return;
    const ccCoin = data.current.filter((item) => item.name === currentCoin)[0]
      ?.price;
    if (!ccCoin) return;
    const exchangeRate = exchange.find(
      (item) => item.title === currentCurrency
    )?.rate;
    if (!exchangeRate) return;

    const ccCoinFraction = math.fraction(ccCoin);
    const rateDisparity = math.fraction(exchangeRateSellDisparity);
    const priceSell = math.subtract(
      ccCoinFraction,
      math.chain(ccCoinFraction).multiply(rateDisparity).divide(100).done()
    );
    const exchangeRateFraction = math.fraction(exchangeRate);
    const result = math.multiply(priceSell, exchangeRateFraction);

    setMarketSellPrice(() => math.number(result));
  };
  const renderModalReview = function () {
    getElementById("modalPreviewPrice").innerHTML = formatCurrency(
      i18n.language,
      currentCurrency,
      marketSellPrice
    );
    getElementById("modalPreviewAmount").innerHTML =
      getElementById("amoutInput").value;
    getElementById("modalPreviewMinimumAmount").innerHTML =
      getElementById("minimumAmoutInput").value;
  };
  const fetchUserNameProfile = function () {
    return getProfile()
      .then((resp) => {
        return resp.data.data.username;
      })
      .catch((error) => {
        return null;
      });
  };
  const validate = function () {
    let valid = true;
    const amountElement = getElementById("amoutInput");
    const miniElement = getElementById("minimumAmoutInput");
    const fullnameElement = getElementById("fullnameInput");
    const accountNumberElement = getElementById("accountNumberInput");
    if (
      !amountElement ||
      !miniElement ||
      !fullnameElement ||
      !accountNumberElement ||
      !inputContactInfoElement
    )
      return false;
    if (controlsTourched.current[controls.current.amount]) {
      if (
        !regularExpress.checkNumber.test(
          amountElement.value.replaceAll(",", "")
        ) &&
        amountElement.value
      ) {
        valid &= false;
        setControlsErrors((state) => {
          return {
            ...state,
            [controls.current.amount]: t("formatIncorrect"),
          };
        });
      } else if (!amountElement.value) {
        valid &= false;
        setControlsErrors((state) => {
          return {
            ...state,
            [controls.current.amount]: "require",
          };
        });
      } else {
        setControlsErrors((state) => {
          const newState = { ...state };
          delete newState[controls.current.amount];
          return newState;
        });
      }
    }
    if (controlsTourched.current[controls.current.mini]) {
      if (
        !regularExpress.checkNumber.test(
          miniElement.value.replaceAll(",", "")
        ) &&
        miniElement.value
      ) {
        valid &= false;
        setControlsErrors((state) => ({
          ...state,
          [controls.current.mini]: "formatIncorrect",
        }));
      } else if (
        +miniElement.value.replaceAll(",", "") >
        amountElement.value.replaceAll(",", "")
      ) {
        valid &= false;
        setControlsErrors((state) => ({
          ...state,
          [controls.current.mini]: "theMinimumQuantityIsTooLarge",
        }));
      } else if (!miniElement.value) {
        valid &= false;
        setControlsErrors((state) => ({
          ...state,
          [controls.current.mini]: "require",
        }));
      } else {
        setControlsErrors((state) => {
          const newState = { ...state };
          delete newState[controls.current.mini];
          return newState;
        });
      }
    }
    if (controlsTourched.current[controls.current.info]) {
      if (!inputContactInfoElement.current.value) {
        valid &= false;
        setControlsErrors((state) => {
          return {
            ...state,
            [controls.current.info]: "require",
          };
        });
      } else {
        setControlsErrors((state) => {
          const newState = { ...state };
          delete newState[controls.current.info];
          return newState;
        });
      }
    }
    if (action === actionType.sell) {
      if (controlsTourched.current[controls.current.fullname]) {
        if (!regularExpress.accountExpress.test(fullnameElement.value)) {
          valid &= false;
          setControlsErrors((state) => ({
            ...state,
            [controls.current.fullname]:
              "theAccountNameShouldBeInPlainVietnameseWrittenInUppercaseWithAMinimumOf5CharactersAndAMaximumOf50Characters",
          }));
        } else if (!fullnameElement.value) {
          valid &= false;
          setControlsErrors((state) => ({
            ...state,
            [controls.current.fullname]: "require",
          }));
        } else if (
          fullnameElement.value &&
          regularExpress.accountExpress.test(fullnameElement.value)
        ) {
          delete controlsErrors.current;
          setControlsErrors((state) => {
            const newState = { ...state };
            delete newState[controls.current.fullname];
            return newState;
          });
        }
      }
      if (controlsTourched.current[controls.current.accountNumber]) {
        if (!accountNumberElement.value) {
          valid &= false;
          setControlsErrors((state) => ({
            ...state,
            [controls.current.accountNumber]: "require",
          }));
        } else {
          delete controlsErrors.current;
          setControlsErrors((state) => {
            const newState = { ...state };
            delete newState[controls.current.accountNumber];
            return newState;
          });
        }
      }
    }
    return Object.keys(controlsTourched.current).length <= 0
      ? false
      : Boolean(valid);
  };
  const controlOnfocusHandle = function (e) {
    const name = e.target.name;
    controlsTourched.current[name] = true;
    validate();
  };
  const controlOnChangeHandle = function (formatNumber = false, e) {
    if (formatNumber) {
      formatInput(e.currentTarget, e.currentTarget.value.replaceAll(",", ""));
    }
    validate();
  };
  const formatInput = function (input, inputValue) {
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      input.value = formatStringNumberCultureUS(inputValue.slice(0, -1));
      return;
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    input.value = inputValueFormated;
  };
  const callApiCreateAds = function (data) {
    return new Promise((resolve) => {
      if (callApiStatus.current === api_status.fetching) resolve(null);
      else callApiStatus.current = api_status.fetching;
      companyAddAds(data)
        .then((resp) => {
          callApiStatus.current = api_status.fulfilled;
          callToastSuccess(t("success"));
          getElementById("buyAdsForm").reset();
          resolve(resp);
        })
        .catch((error) => {
          callApiStatus.current = api_status.rejected;

          const mess = error?.response?.data?.message;
          switch (mess) {
            case "Insufficient balance":
              callToastError(t("insufficientBalance"));
              break;
            case "The minimum selling quantity cannot be more than the number you want to sell":
              callToastError(
                t(
                  "theMinimumSellingQuantityCannotBeMoreThanTheNumberYouWantToSell"
                )
              );
              break;
            default:
              callToastError(t("anErrorHasOccurred"));
              break;
          }
          resolve(null);
        });
    });
  };
  const submitHandle = async function (event) {
    if (event) {
      event.preventDefault();
    }
    //validation
    for (const item of Object.entries(controls.current)) {
      controlsTourched.current[item.at(0)] = true;
    }
    const isValid = validate();
    if (!isValid) return;
    // get data
    showLoadingButtonSubmit();
    const amout = getElementById("amoutInput").value.replaceAll(",", "");
    const mini = getElementById("minimumAmoutInput").value.replaceAll(",", "");
    const fullname = getElementById("fullnameInput").value;
    const accountNumber = getElementById("accountNumberInput").value;
    const sendData = {};
    sendData.amount = Number(amout);
    sendData.amountMinimum = Number(mini);
    sendData.symbol = currentCoin;
    sendData.side = action;
    sendData.contact = inputContactInfoElement.current.value;
    if (action === actionType.sell) {
      sendData.bankName = selectedBank.content;
      sendData.ownerAccount = fullname;
      sendData.numberBank = accountNumber;
    }
    const resultApi = await callApiCreateAds(sendData);
    if (resultApi) {
      dispatch(userWalletFetchCount());
    }
    closeLoadingButtonSubmit();
  };
  const showLoadingButtonSubmit = function () {
    addClassToElementById("buttonSubmit", "disable");
    getClassListFromElementById("buttonSubmitLoader").remove("--d-none");
  };
  const closeLoadingButtonSubmit = function () {
    getClassListFromElementById("buttonSubmit").remove("disable");
    addClassToElementById("buttonSubmitLoader", "--d-none");
  };
  const buyOrSellDirect = function () {
    if (action === actionType.buy) {
      history.push(url.create_ads_sell);
    } else {
      history.push(url.create_ads_buy);
    }
  };
  const modalButtonCreateClickHandle = function () {
    modalPreviewHandleCancel();
    submitHandle();
  };
  const renderInputColor = function () {
    switch (action) {
      case actionTrading.buy:
        return inputColor.green;
      case actionTrading.sell:
        return inputColor.red;
      default:
        break;
    }
  };
  const dropdownChangeHandle = function (item) {
    setSelectedBank(item);
  };

  return (
    <div className="create-buy-ads fadeInBottomToTop">
      <div className="container">
        <div className="box">
          <h2 className="title">
            {action === actionType.buy
              ? t("createNewBuyAdvertisement")
              : t("createNewSellAdvertisement")}
          </h2>
          <span onClick={buyOrSellDirect} className="switch">
            {action === actionType.buy
              ? t("doYouWantToSell")
              : t("doYouWantToBuy")}
          </span>
          <div className="head-area">
            <h2 className="head-area-title">
              {action === actionType.buy
                ? t("adsToBuyBTC").replace("BTC", currentCoin)
                : t("adsToSellBTC").replace("BTC", currentCoin)}
            </h2>
            <div className={renderClassMarketBuyPrice()}>
              {t("marketBuyPrice")}:{" "}
              <span
                id="marketBuyPrice"
                className="create-buy-ads__head-area-price"
              >
                ---
              </span>
            </div>
            <div className={renderClassMarketSellPrice()}>
              {t("marketSellPrice")}:{" "}
              <span
                id="marketSellPrice"
                className="create-buy-ads__head-area-price"
              >
                {formatCurrency(
                  i18n.language,
                  currentCurrency,
                  marketSellPrice
                )}
              </span>
            </div>
            <i
              className="fa-solid fa-pen-to-square --d-none"
              onClick={showCoinModal}
            ></i>
          </div>
          <form id="buyAdsForm">
            <div className="amount-area">
              <h2>{t("amount")}</h2>
              <div className="field">
                <label>
                  {t("amountOf")} {currentCoin}:
                </label>
                <Input
                  type={inputType.number}
                  color={renderInputColor()}
                  onChange={controlOnChangeHandle.bind(null, true)}
                  onFocus={controlOnfocusHandle}
                  name="amount"
                  key={"a1va"}
                  id="amoutInput"
                  errorMes={t(controlsErrors[controls.current.amount])}
                />
              </div>
              <div className="field">
                <label>
                  {t("minimumBTCAmount").replace("BTC", currentCoin)}:
                </label>
                <Input
                  type={inputType.number}
                  color={renderInputColor()}
                  onChange={controlOnChangeHandle.bind(null, true)}
                  onFocus={controlOnfocusHandle}
                  name="mini"
                  key={"a2va"}
                  id="minimumAmoutInput"
                  errorMes={t(controlsErrors[controls.current.mini])}
                />
              </div>
            </div>
            <div className="amount-area">
              <h2>{t("contact")}</h2>
              <div className="field">
                <label>{t("info")}:</label>
                <Input
                  onChange={controlOnChangeHandle.bind(null, false)}
                  onFocus={controlOnfocusHandle}
                  ref={inputContactInfoElement}
                  type={inputType.text}
                  name={controls.current.info}
                  errorMes={t(controlsErrors[controls.current.info])}
                />
              </div>
            </div>
            <div
              className={`payment-area ${
                action === actionType.buy ? "--d-none" : ""
              }`}
            >
              <h2>{t("paymentDetails")}</h2>
              <div className="field">
                <label>{t("bankName")}:</label>
                <Dropdown
                  id={`dropdownPayment`}
                  list={listBank}
                  itemSelected={selectedBank}
                  itemClickHandle={dropdownChangeHandle}
                />
              </div>
              <div className="field">
                <label htmlFor="fullnameInput">{t("fullName")}:</label>
                <Input
                  onChange={controlOnChangeHandle.bind(null, false)}
                  onFocus={controlOnfocusHandle}
                  id="fullnameInput"
                  name="fullname"
                  type="text"
                  errorMes={t(controlsErrors[controls.current.fullname])}
                />
              </div>
              <div className="field">
                <label htmlFor="accountNumberInput">
                  {t("accountNumber")}:{" "}
                </label>
                <Input
                  onChange={controlOnChangeHandle.bind(null, false)}
                  onFocus={controlOnfocusHandle}
                  id="accountNumberInput"
                  name="accountNumber"
                  type="text"
                  errorMes={t(controlsErrors[controls.current.accountNumber])}
                />
              </div>
            </div>
            <div className="review-area --d-none">
              <span onClick={showModalPreview}>
                <i className="fa-solid fa-eye"></i>
                <span>{t("reviewYourAd")}</span>
              </span>
            </div>
            <div className="button-area">
              <Button
                id="buttonSubmit"
                onClick={submitHandle}
                htmlSubmit={htmlType.submit}
              >
                <div id="buttonSubmitLoader" className="loader --d-none"></div>
                {t("createNewAdvertisement")}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Modal
        title={t("chooseYourCoin")}
        open={isModalCoinVisible}
        onOk={modalCoinHandleOk}
        onCancel={modalCoinHandleCancel}
        footer={null}
        width={600}
      >
        <div className="create-buy-ads__modal-coin" style={{ padding: 20 }}>
          {data.current.map((item, i) => {
            return (
              <button
                className={`btn-choice-coin ${
                  currentCoin === item.name ? "active" : ""
                }`}
                key={i}
                onClick={() => {
                  setCurrentCoin(item.name);
                  setIsModalCoinVisible(false);
                }}
              >
                <img
                  className="create-buy-ads__modal-image"
                  src={DOMAIN + item.image}
                  alt={item.image}
                />
                {item.name}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        open={isModalPreviewOpen}
        onOk={modalPreviewHandleOk}
        onCancel={modalPreviewHandleCancel}
        footer={null}
        width={800}
      >
        <div className="create-buy-ads__modal-preview">
          <div className="create-buy-ads__modal-preview-header">
            {t("preview")}
            <span
              onClick={modalPreviewHandleCancel}
              className="create-buy-ads__modal-preview-close"
            >
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
          <div className="preview">
            <div className="col col-2">
              <div>
                <span className="title">{t("price")}:</span>{" "}
                <span id="modalPreviewPrice">Test</span>
              </div>
              <div>
                <span className="title">{t("amount")}:</span>{" "}
                <span id="modalPreviewAmount">Test</span>
              </div>
              <div>
                <span className="title">{t("amountMinimum")}:</span>{" "}
                <span id="modalPreviewMinimumAmount">Test</span>
              </div>
            </div>
            <div className="col col-3">
              <div id="modalAction">
                <button
                  onClick={modalButtonCreateClickHandle}
                  style={{ width: isMobileViewport ? "100%" : "fit-content" }}
                >
                  {t("create")}
                </button>
              </div>
            </div>
          </div>
          <div className="create-buy-ads__modal-preview-footer">
            <button onClick={modalPreviewHandleCancel}>{t("close")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
