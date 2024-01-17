import { Modal } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";
import { getBankListV2 } from "src/assets/resource/getBankListV2";
import i18n from "src/translation/i18n";
import {
  addClassToElementById,
  formatCurrency,
  formatNumber,
  formatStringNumberCultureUS,
  getClassListFromElementById,
  getElementById,
  getLocalStorage,
  roundIntl,
} from "src/util/common";
import { DOMAIN } from "src/util/service";
import { companyAddAds, getProfile } from "src/util/userCallApi";
import {
  api_status,
  currencyMapper,
  defaultLanguage,
  localStorageVariable,
  regularExpress,
  url,
} from "src/constant";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input } from "./Common/Input";
import { math } from "src/App";

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
  const exchange = useSelector(getExchange);
  const exchangeRateDisparity = useSelector(getExchangeRateDisparity);
  const selectedBank = useRef("OCB");
  const userName = useRef("");
  const controls = useRef({
    amount: "amount",
    mini: "mini",
    fullname: "fullname",
    accountNumber: "accountNumber",
  });
  const controlsTourched = useRef({});
  const [controlsErrors, setControlsErrors] = useState({});
  const callApiStatus = useRef(api_status.pending);
  const isMobileViewport = window.innerWidth < 600;

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

    document.addEventListener("click", closeDropdownBank);
    bankDropdownSelect(selectedBank.current);
    renderBankDropdown();

    const callProfile = async function () {
      return await fetchUserNameProfile();
    };
    callProfile().then((resp) => {
      userName.current = resp;
    });

    return () => {
      document.removeEventListener("click", closeDropdownBank);
    };
  }, []);

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
    if (data.length <= 0 || exchange.length <= 0 || !exchangeRateDisparity)
      return;
    // find current price
    let ccCoin = data.current.filter((item) => item.name === currentCoin)[0]
      ?.price;
    if (!ccCoin) return;
    const exchangeRate = exchange.find(
      (item) => item.title === currentCurrency
    )?.rate;
    if (!exchangeRate) return;
    // process price
    const ccCoinFraction = math.fraction(ccCoin);
    const rateDisparity = math.fraction(exchangeRateDisparity);
    const priceBuy = math.add(
      ccCoinFraction,
      math.chain(ccCoinFraction).multiply(rateDisparity).divide(100).done()
    );
    const exchangeRateFraction = math.fraction(exchangeRate);
    const result = math.multiply(priceBuy, exchangeRateFraction);
    return math.number(result);
  };
  const renderClassMarketSellPrice = function () {
    return action === actionType.sell ? "" : "--d-none";
  };
  const renderClassMarketBuyPrice = function () {
    return action === actionType.buy ? "" : "--d-none";
  };
  const calcSellPrice = function () {
    if (data.length <= 0 || exchange.length <= 0 || !exchangeRateDisparity)
      return;
    const ccCoin = data.current.filter((item) => item.name === currentCoin)[0]
      ?.price;
    if (!ccCoin) return;
    const exchangeRate = exchange.find(
      (item) => item.title === currentCurrency
    )?.rate;
    if (!exchangeRate) return;

    const ccCoinFraction = math.fraction(ccCoin);
    const rateDisparity = math.fraction(exchangeRateDisparity);
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
  const toggleDropdownBank = function (e) {
    e.stopPropagation();
    getClassListFromElementById("dropdownBankMenu").toggle("show");
    getClassListFromElementById("dropdownBankSelected").toggle("active");
  };
  const closeDropdownBank = function () {
    getClassListFromElementById("dropdownBankMenu").remove("show");
    getClassListFromElementById("dropdownBankSelected").remove("active");
  };
  const renderBankDropdown = function () {
    const containerElement =
      getElementById("dropdownBankMenu").querySelector("ul");
    containerElement.innerHTML = "";
    for (const item of getBankListV2()) {
      containerElement.innerHTML += `<li class="dropdown-item">
      <span>
        <img src=${item.logo} alt="${item.code}" />
      </span>
      <span class="dropdown-content">${" " + item.name} (${item.code})</span>
    </li>`;
    }
    // add event
    for (const item of containerElement.children) {
      item.addEventListener("click", bankDropdownItemClickHandle);
    }
  };
  const bankDropdownItemClickHandle = function (event) {
    const element = event.currentTarget;
    const name = element.querySelector(".dropdown-content").innerHTML;
    const bankNameArr = name.split(" ");
    const bankName = bankNameArr.slice(0, -1).join(" ");
    bankDropdownSelect(bankName.trim());
  };
  const bankDropdownSelect = function (bankName) {
    const item = getBankListV2().find((item) => item.name === bankName);
    if (!item) return;
    const selectedElement = getElementById("dropdownBankSelected");
    const selectedElementImg = selectedElement.querySelector("img");
    selectedElementImg.src = item.logo;
    selectedElementImg.alt = item.name;
    const selectedElementContent = getElementById("dropdownBankSelectedText");
    selectedElementContent.innerHTML = item.name + ` (${item.code})`;
    selectedBank.current = bankName;
  };
  const fetchUserNameProfile = function () {
    return getProfile()
      .then((resp) => {
        return resp.data.data.username;
      })
      .catch((error) => {
        console.log(error);
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
      !accountNumberElement
    )
      return false;
    if (controlsTourched.current[controls.current.amount]) {
      if (
        !regularExpress.checkNumber.test(amountElement.value) &&
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
            [controls.current.amount]: t("require"),
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
        !regularExpress.checkNumber.test(miniElement.value) &&
        miniElement.value
      ) {
        valid &= false;
        setControlsErrors((state) => ({
          ...state,
          [controls.current.mini]: t("formatIncorrect"),
        }));
      } else if (!miniElement.value) {
        valid &= false;
        setControlsErrors((state) => ({
          ...state,
          [controls.current.mini]: t("require"),
        }));
      } else {
        setControlsErrors((state) => {
          const newState = { ...state };
          delete newState[controls.current.mini];
          return newState;
        });
      }
    }
    if (action === actionType.sell) {
      if (controlsTourched.current[controls.current.fullname]) {
        if (!fullnameElement.value) {
          valid &= false;
          setControlsErrors((state) => ({
            ...state,
            [controls.current.fullname]: t("require"),
          }));
        } else {
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
            [controls.current.accountNumber]: t("require"),
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
  const controlOnChangeHandle = function () {
    validate();
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
          console.log(error);
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
    const amout = getElementById("amoutInput").value;
    const mini = getElementById("minimumAmoutInput").value;
    const fullname = getElementById("fullnameInput").value;
    const accountNumber = getElementById("accountNumberInput").value;
    const sendData = {};
    sendData.amount = Number(amout);
    sendData.amountMinimum = Number(mini);
    sendData.symbol = currentCoin;
    sendData.side = action;
    if (action === actionType.sell) {
      sendData.bankName = selectedBank.current;
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
                  onChange={controlOnChangeHandle}
                  onFocus={controlOnfocusHandle}
                  name="amount"
                  key={"a1va"}
                  id="amoutInput"
                  errorMes={controlsErrors[controls.current.amount]}
                />
              </div>
              <div className="field">
                <label>
                  {t("minimumBTCAmount").replace("BTC", currentCoin)}:
                </label>
                <Input
                  onChange={controlOnChangeHandle}
                  onFocus={controlOnfocusHandle}
                  name="mini"
                  key={"a2va"}
                  id="minimumAmoutInput"
                  errorMes={controlsErrors[controls.current.mini]}
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
                <div
                  id="dropdownBankSelected"
                  onClick={toggleDropdownBank}
                  className="field__dropdown-selected"
                >
                  <span>
                    <img
                      src={process.env.PUBLIC_URL + "/img/iconen.png"}
                      alt={"currentLanguage"}
                    />
                  </span>
                  <span id="dropdownBankSelectedText">thien</span>
                  <span>
                    <i className="fa-solid fa-chevron-down"></i>
                  </span>
                </div>
                <div
                  id="dropdownBankMenu"
                  className="field-dropdown-menu-container"
                >
                  <ul className="dropdown-menu"></ul>
                </div>
              </div>
              <div className="field">
                <label htmlFor="fullnameInput">{t("fullName")}:</label>
                <Input
                  onChange={controlOnChangeHandle}
                  onFocus={controlOnfocusHandle}
                  id="fullnameInput"
                  name="fullname"
                  type="text"
                  errorMes={controlsErrors[controls.current.fullname]}
                />
              </div>
              <div className="field">
                <label htmlFor="accountNumberInput">
                  {t("accountNumber")}:{" "}
                </label>
                <Input
                  onChange={controlOnChangeHandle}
                  onFocus={controlOnfocusHandle}
                  id="accountNumberInput"
                  name="accountNumber"
                  type="text"
                  errorMes={controlsErrors[controls.current.accountNumber]}
                />
              </div>
            </div>
            <div className="review-area">
              <span onClick={showModalPreview}>
                <i className="fa-solid fa-eye"></i>
                <span>{t("reviewYourAd")}</span>
              </span>
            </div>
            <div className="button-area">
              <button
                id="buttonSubmit"
                onClick={submitHandle}
                type="submit"
                className="button-area-primary"
              >
                <div id="buttonSubmitLoader" className="loader --d-none"></div>
                {t("createNewAdvertisement")}
              </button>
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
