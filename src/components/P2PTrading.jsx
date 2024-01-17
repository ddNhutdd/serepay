import { Button as ButtonAntd, Card, Modal, Table } from "antd";
import { Spin } from "antd";
import { useHistory } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  formatCurrency,
  formatStringNumberCultureUS,
  getLocalStorage,
  processString,
  setLocalStorage,
} from "src/util/common";
import {
  actionTrading,
  currency,
  currencyMapper,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import i18n from "src/translation/i18n";
import { DOMAIN } from "src/util/service";
import { coinSetCoin } from "src/redux/actions/coin.action";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { getListCoinRealTime } from "src/redux/constant/listCoinRealTime.constant";
import PhoneApps from "./PhoneApps";
import { getExchangeRateDisparity } from "src/redux/reducers/exchangeRateDisparitySlice";
import { getShow, setShow, showP2pType } from "src/redux/reducers/p2pTrading";
import P2pExchange from "./p2pExchange";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "./Common/Button";
import { getProfile } from "src/util/userCallApi";
import { math } from "src/App";

export default function P2PTrading({ history }) {
  const showContent = useSelector(getShow);
  const redirectPage = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const data = useSelector(getListCoinRealTime);
  const [sellPrice, setSellPrice] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [coinImage, setCoinImage] = useState(DOMAIN + "images/USDT.png");
  const { coin } = useSelector((root) => root.coinReducer);
  const userSelectedCurrency = useSelector(getCurrent);
  const exChangeFromRedux = useSelector(getExchange);
  const exchangeRateDisparityFromRedux = useSelector(getExchangeRateDisparity);
  const exchange = useRef();
  const [coinFullName, setCoinFullName] = useState();
  const [typeAds, setTypeAds] = useState(0);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const columns = [
    {
      title: t("name"),
      key: "coinName",
      dataIndex: "token_key",
      render: (_, record) => {
        return (
          <span
            style={{
              cursor: "pointer",
              display: "flex",
              gap: "5px",
              alignItems: "flex-start",
              fontWeight: 500,
            }}
          >
            <img
              style={{
                display: "block",
                width: "20px",
                height: "20px",
                objectFit: "cover",
                marginTop: "1px",
              }}
              src={DOMAIN + record.image}
              alt={record.token_key}
            />
            {record.token_key} - {record.name}
          </span>
        );
      },
    },
    {
      title: t("24hChange"),
      key: "24hChange",
      dataIndex: "percent",
      render: (_, { percent }) => {
        let color = "black";
        if (percent > 0) {
          color = "#9ADE7B";
        } else if (percent < 0) {
          color = "#B31312";
        }
        return (
          <span style={{ color: color, fontWeight: 500 }}>{percent}%</span>
        );
      },
    },
    {
      title: t("price"),
      key: "price",
      dataIndex: "price",
      width: "25%",
      render: (_, { price }) => {
        return (
          <span>
            {formatStringNumberCultureUS(convertCurrency(price).toFixed(3))}
            {userSelectedCurrency === currency.usd && "$"}
            {userSelectedCurrency === currency.eur && "€"}
            {userSelectedCurrency === currency.vnd && "đ"}
          </span>
        );
      },
    },
    {
      title: t("24hVolume"),
      key: "24hVolume",
      dataIndex: "volume",
    },
  ];

  useEffect(() => {
    setLocalStorage(localStorageVariable.coin, coin);

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    const element = document.querySelector(".p2ptrading");
    if (element) {
      element.classList.add("fadeInBottomToTop");
    }
    fetchApiGetProfile();
  }, []);
  useEffect(() => {
    if (data && data.length !== 0) {
      const x = data.find((item) => item.name === coin);

      setPrice();
      setCoinFullName(x?.token_key);
      setCoinImage(DOMAIN + x?.image);
    }
  }, [data, coin, userSelectedCurrency]);
  useEffect(() => {
    exchange.current = exChangeFromRedux;
    setPrice();
  }, [exChangeFromRedux]);

  const setPrice = function () {
    const buyPrice = calcBuyPrice();
    const sellPrice = calcSellPrice();
    setBuyPrice(buyPrice);
    setSellPrice(sellPrice);
  };
  const calcBuyPrice = function () {
    if (
      !data ||
      data.length <= 0 ||
      !exChangeFromRedux ||
      exChangeFromRedux.length <= 0
    )
      return;
    const x = data.find((item) => item.name === coin);
    const price = x?.price;
    if (!price) return;
    const rate = exChangeFromRedux.find(
      (item) => item.title === userSelectedCurrency.toUpperCase()
    )?.rate;

    const priceFraction = math.fraction(price);
    const rateDisparityFraction = math.fraction(exchangeRateDisparityFromRedux);
    const newPriceFraction = math.add(
      priceFraction,
      math
        .chain(priceFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );
    const rateFraction = math.fraction(rate);
    const result = math.multiply(newPriceFraction, rateFraction);
    return result;
  };
  const calcSellPrice = function () {
    if (
      !data ||
      data.length <= 0 ||
      !exChangeFromRedux ||
      exChangeFromRedux.length <= 0
    )
      return;
    const x = data.find((item) => item.name === coin);
    const price = x?.price;
    if (!price) return;
    const rate = exChangeFromRedux.find(
      (item) => item.title === userSelectedCurrency.toUpperCase()
    )?.rate;

    const priceFraction = math.fraction(price);
    const rateDisparityFraction = math.fraction(exchangeRateDisparityFromRedux);
    const newPriceFraction = math.subtract(
      priceFraction,
      math
        .chain(priceFraction)
        .multiply(rateDisparityFraction)
        .divide(100)
        .done()
    );
    const rateFraction = math.fraction(rate);
    const result = math.multiply(newPriceFraction, rateFraction);
    return result;
  };
  const showModal = () => setIsModalVisible(true);
  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => setIsModalVisible(false);
  const handleSelectedRow = (record) => {
    setIsModalVisible(false);
    setLocalStorage(localStorageVariable.coin, record.name);
    dispatch(coinSetCoin(record.name));
  };
  const renderClassTypeAds = function () {
    switch (typeAds) {
      case 0:
        return "--d-none";
      case 1:
        return "";
      default:
        break;
    }
  };
  const convertCurrency = function (usd) {
    if (
      !exchange.current ||
      exchange.current.length <= 0 ||
      !userSelectedCurrency
    )
      return;
    const rate =
      exchange.current.filter((item) => item.title === userSelectedCurrency)[0]
        ?.rate || 0;
    return usd * rate;
  };
  const buyNowClickHandle = function () {
    if (isLogin) {
      dispatch(setShow([showP2pType.p2pExchange, actionTrading.buy]));
    } else {
      redirectPage.push(url.login);
    }
  };
  const sellNowClickHandle = function () {
    if (isLogin) {
      dispatch(setShow([showP2pType.p2pExchange, actionTrading.sell]));
    } else {
      redirectPage.push(url.login);
    }
  };
  const createAdsSell = function () {
    setLocalStorage(localStorageVariable.createAds, coin);
    history.push(url.create_ads_sell);
  };
  const createAdsBuy = function () {
    setLocalStorage(localStorageVariable.createAds, coin);
    history.push(url.create_ads_buy);
  };
  const renderNotify = function () {
    const string = t(
      "ifYouDidntReceiveTransactionsWithin15MinutesPleaseContactSerepaySupportAtSupportAtSerepayDotNet"
    );
    const listSub = ["support@serepay.net"];
    const callback = function (match, index) {
      if (match === listSub.at(0)) {
        return <span key={index}>{match}</span>;
      }
    };
    return processString(string, listSub, callback);
  };
  const renderContent = function () {
    switch (showContent) {
      case showP2pType.p2pTrading:
        return (
          <div className="p2ptrading">
            <div className="container">
              <div className="top box">
                <div>
                  <img src={coinImage} alt={coin} />
                  <span>{coinFullName}</span>
                </div>
                <Button type="primary" onClick={showModal}>
                  {t("chooseAnother")}{" "}
                </Button>
              </div>
              <div className="center">
                <div className="left box">
                  <div className="left1">
                    <i className="fa-solid fa-flag"></i>
                    <span className="titleContainer">{t("buyingPrice")}:</span>
                  </div>
                  <div className="left2">
                    {formatCurrency(
                      i18n.language,
                      userSelectedCurrency,
                      buyPrice,
                      false
                    )}
                    <span> {userSelectedCurrency}</span>
                  </div>
                  <div className="left3">
                    <ButtonAntd
                      onClick={buyNowClickHandle}
                      className="buyNowBtn"
                    >
                      {t("buyNow")}
                    </ButtonAntd>
                    <button
                      onClick={createAdsBuy}
                      className={`p2pTrading__createAds + ${renderClassTypeAds()}`}
                    >
                      {t("creatingYourBuyingAd")}
                    </button>
                  </div>
                </div>
                <div className="right box">
                  <div className="right1">
                    <i className="fa-solid fa-flag"></i>
                    <span className="titleContainer">{t("sellingPrice")}:</span>
                  </div>
                  <div className="right2">
                    {formatCurrency(
                      i18n.language,
                      userSelectedCurrency,
                      sellPrice,
                      false
                    )}
                    <span> {userSelectedCurrency}</span>
                  </div>
                  <div className="right3">
                    <ButtonAntd
                      onClick={sellNowClickHandle}
                      className="sellNowBtn"
                    >
                      {t("sellNow")}
                    </ButtonAntd>
                    <button
                      onClick={createAdsSell}
                      className={`p2pTrading__createAds ${renderClassTypeAds()}`}
                    >
                      {t("creatingYourSellingAd")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bottom box">
                <i className="fa-solid fa-bolt"></i>
                {renderNotify()}
              </div>
            </div>
            <Modal
              open={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              footer={null}
              width={700}
            >
              <Card className="cardChooseCoin" bodyStyle={{ padding: "0" }}>
                {data && data.length ? (
                  <Table
                    scroll={{ x: 700 }}
                    className="p2ptrading__table"
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => record.id}
                    pagination={{
                      onChange: () => {
                        setTimeout(() => {
                          document.querySelector(".ant-modal-wrap").scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }, 0);
                      },
                    }}
                  />
                ) : (
                  <div className="p2ptrading__model-spinner-container">
                    <Spin style={{ width: "100%" }} />
                  </div>
                )}
              </Card>
            </Modal>
          </div>
        );
      case showP2pType.p2pExchange:
        return <P2pExchange />;
      default:
        break;
    }
  };
  const fetchApiGetProfile = function () {
    getProfile()
      .then((resp) => {
        setTypeAds(() => resp.data.data.type_ads);
      })
      .catch((error) => {});
  };

  return (
    <>
      {renderContent()}
      <PhoneApps />
    </>
  );
}
