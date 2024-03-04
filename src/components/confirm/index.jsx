import React, { useEffect, useState, useRef } from "react";
import i18n, {
  availableLanguage,
  availableLanguageCodeMapper,
} from "src/translation/i18n";
import {
  actionTrading,
  api_status,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { getInfoP2p, getProfile } from "src/util/userCallApi";
import ConfirmItem from "./confirmItem";
import { Spin } from "antd";
import { formatCurrency, getLocalStorage } from "src/util/common";
import { callToastError } from "src/function/toast/callToast";
import { useTranslation } from "react-i18next";
import socket from "src/util/socket";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { getCurrent, getExchange } from "src/redux/constant/currency.constant";
import { math } from "src/App";

function Confirm() {
  const currentCurrency = useSelector(getCurrent);
  const { id: idAds } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const exchange = useSelector(getExchange);

  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [data, setData] = useState([]);
  const [render, setRender] = useState(1);

  const userId = useRef();

  useEffect(() => {
    if (exchange && exchange.length > 0) loadData();
  }, [render, exchange]);
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    socket.off("operationP2p");
    socket.on("operationP2p", (idP2p) => {
      loadData();
    });
    return () => {
      dispatch(userWalletFetchCount());
    };
  }, []);
  useEffect(() => {
    if (userId.current && data && data.length > 0 && exchange) {
      setCallApiStatus(() => api_status.fulfilled);
    }
  }, [userId.current, data]);

  const fetchApiGetInfoP2p = function () {
    return new Promise((resolve, rejected) => {
      getInfoP2p({
        idP2p: idAds,
      })
        .then((resp) => {
          resolve(resp.data.data);
        })
        .catch((error) => {
          rejected(false);
        });
    });
  };
  const fetchApiGetProfile = function () {
    return new Promise((resolve) => {
      getProfile()
        .then((resp) => {
          resolve(resp.data.data);
        })
        .catch((error) => {
          callToastError(t("can'tFindUserInformation"));
          resolve(false);
        });
    });
  };
  const calcFee = function (item) {
    const { side, userId: uid, amount, rate, pay } = item;
    const rateUSD_VND = exchange.find((ec) => ec.title === "VND")?.rate;

    const rateUSD_VNDFraction = math.fraction(rateUSD_VND);
    const amountFraction = math.fraction(amount);
    const rateFraciton = math.fraction(rate);
    const payFraction = math.fraction(pay);

    // hai dòng này để nó có thể hiển thị đồng bộ với rate của confirm, nếu để chính xác thì sẽ bị lệch
    const rateRount = math.multiply(rateFraciton, rateUSD_VNDFraction);
    const rateRountFormat = formatCurrency(
      availableLanguage.en,
      currentCurrency,
      math.number(rateRount),
      false
    );

    const rateRountFormatFraction = math.fraction(
      rateRountFormat.replaceAll(",", "")
    );
    const moneyEs = math
      .chain(amountFraction)
      .multiply(rateRountFormatFraction)
      .done();
    let result;

    if (
      (side === actionTrading.buy && uid === userId.current) ||
      (side === actionTrading.sell && uid !== userId.current)
    ) {
      // buy
      result = math.subtract(payFraction, moneyEs);
    } else if (
      (side === actionTrading.buy && uid !== userId.current) ||
      (side === actionTrading.sell && uid === userId.current)
    ) {
      // sell
      result = math.subtract(moneyEs, payFraction);
    }

    return Math.abs(math.number(result));
  };
  const renderHtml = function () {
    if (!data || data.lenght <= 0) return;
    return data.map((item) => {
      const fee = calcFee(item);
      return (
        <ConfirmItem
          key={item.id}
          index={item.id}
          content={item}
          profileId={userId.current}
          render={setRender}
          fee={fee}
        />
      );
    });
  };
  const loadData = async function () {
    if (callApiStatus === api_status.fetching) return;
    else setCallApiStatus(() => api_status.fetching);

    const promiseFetchInfo = fetchApiGetInfoP2p();
    const promiseFetchProfile = fetchApiGetProfile();

    Promise.all([promiseFetchInfo, promiseFetchProfile])
      .then((resp) => {
        //
        const info = resp?.at(0);
        if (!info) return;
        //
        const profile = resp?.at(1);
        const { id } = profile;
        userId.current = id;
        if (!profile) {
          callToastError(t("can'tFindUserInformation"));
          history.push(url.login);
          return;
        }
        //
        setData(() => info);
      })
      .catch((err) => {
        setCallApiStatus(() => api_status.rejected);
        history.push(url.p2p_management);
        return;
      });
  };
  const renderClassSpin = function () {
    return callApiStatus === api_status.fetching ||
      callApiStatus === api_status.pending
      ? ""
      : "--d-none";
  };
  const renderClassShowContent = function () {
    return callApiStatus !== api_status.fetching ||
      callApiStatus !== api_status.pending
      ? ""
      : "--d-none";
  };

  const classStyle = {
    paddingTop: "120px",
    paddingBottom: "30px",
    display: "flex",
    gap: "30px",
    flexDirection: "column",
  };

  return (
    <>
      <div className={`spin-container ${renderClassSpin()}`} style={classStyle}>
        <Spin />
      </div>
      <div className={`${renderClassShowContent()}`} style={classStyle}>
        {renderHtml()}
      </div>
    </>
  );
}
export default Confirm;
