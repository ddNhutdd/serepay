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
import { getInfoP2p, getProfile } from "src/util/userCallApi";
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
    //
    socket.off("operationP2p");
    socket.on("operationP2p", (idP2p) => {
      console.log(idP2p, "operationP2p");
      loadData();
    });
    return () => {
      dispatch(userWalletFetchCount());
    };
  }, []);
  const fetchApiGetInfoP2p = function () {
    return new Promise((resolve, rejected) => {
      console.log("fetch ", idAds);
      getInfoP2p({
        idP2p: idAds,
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          resolve(resp.data.data);
        })
        .catch((error) => {
          setCallApiStatus(() => api_status.rejected);
          rejected(false);
        })
        .finally(() => {
          hideElement(getElementById("confirm__spinner"));
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
    fetchApiGetInfoP2p()
      .then((respon) => {
        if (!respon) return;
        const result = respon.map((item, index) => (
          <ConfirmItem
            key={index}
            index={index}
            content={item}
            profileId={profileId}
            render={setRender}
          />
        ));
        setData(() => result);
      })
      .catch((error) => {
        history.push(url.p2p_management);
        return;
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
