import React, { useEffect, useState } from "react";
import i18n from "src/translation/i18n";
import {
  api_status,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import {
  exchangeRateDisparity,
  getInfoP2p,
  getProfile,
} from "src/util/userCallApi";
import ConfirmItem from "./confirmItem";
import { Spin } from "antd";
import { getElementById, getLocalStorage, hideElement } from "src/util/common";
import { callToastError } from "src/function/toast/callToast";
import { useTranslation } from "react-i18next";
import socket from "src/util/socket";
import { userWalletFetchCount } from "src/redux/actions/coin.action";

function Confirm() {
  const { id: idAds } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [data, setData] = useState(null);
  const [render, setRender] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, [render]);
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    socket.off("operationP2p");
    socket.on("operationP2p", (idP2p) => {
      console.log("operationp2p");
      loadData();
    });
    return () => {
      dispatch(userWalletFetchCount());
    };
  }, []);

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
          console.log(error);
        });
    });
  };
  const fetchApiGetFee = function () {
    return new Promise((resolve, reject) => {
      exchangeRateDisparity({
        name: "feeP2p",
      })
        .then((resp) => resolve(resp.data.data))
        .catch(() => {
          console.log("error fetchApiGetFee");
          reject(false);
        });
    });
  };
  /**
   * fetch data and render html
   */
  const loadData = async function () {
    if (callApiStatus === api_status.fetching) return;
    else setCallApiStatus(() => api_status.fetching);
    const profile = await fetchApiGetProfile();
    if (!profile) {
      callToastError(t("can'tFindUserInformation"));
      history.push(url.login);
      return;
    }
    const { id: profileId } = profile;
    const promiseFetchInfo = fetchApiGetInfoP2p();
    const promistFetchFee = fetchApiGetFee();
    Promise.all([promistFetchFee, promiseFetchInfo])
      .then((resp) => {
        const fee = resp.at(0).at(0);
        const info = resp?.at(1);

        if (!info) return;

        const result = info.map((item, index) => (
          <ConfirmItem
            key={index}
            index={index}
            content={item}
            profileId={profileId}
            render={setRender}
            fee={fee}
          />
        ));
        setData(() => result);

        setCallApiStatus(() => api_status.fulfilled);
      })
      .catch((err) => {
        setCallApiStatus(() => api_status.rejected);
        history.push(url.p2p_management);
        return;
      })
      .finally(() => {
        hideElement(getElementById("confirm__spinner"));
      });
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
      <div
        id="confirm__spinner"
        className={`spin-container `}
        style={classStyle}
      >
        <Spin />
      </div>
      <div
        className={`${callApiStatus === api_status.fetching ? "--d-none" : ""}`}
        style={classStyle}
      >
        {data}
      </div>
    </>
  );
}
export default Confirm;
