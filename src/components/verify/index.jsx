import React, { useEffect, useState, useRef } from "react";
import { Button } from "../Common/Button";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import { useParams, useHistory } from "react-router-dom";
import {
  api_status,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { verifyEmail } from "src/util/userCallApi";
import { getLocalStorage } from "src/util/common";

function Verify() {
  const token = useParams().token;
  const history = useHistory();
  const { t } = useTranslation();

  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [errorMessage, setErrorMessage] = useState();
  const errorMessageNotShow = useRef();

  const renderClassShowSpin = function () {
    return callApiStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassShowError = function () {
    return callApiStatus === api_status.rejected ? "" : "--d-none";
  };
  const renderClassShowSuccessContent = function () {
    return callApiStatus === api_status.fulfilled ? "" : "--d-none";
  };
  const redirectLogin = function () {
    history.push(url.login);
  };
  const fetchApiVerify = function () {
    return new Promise((resolve) => {
      if (callApiStatus === api_status.fetching) resolve(true);
      setCallApiStatus(() => api_status.fetching);
      verifyEmail(token)
        .then(() => {
          setCallApiStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          errorMessageNotShow.current = error?.response?.data?.message;
          showError();
          setCallApiStatus(() => api_status.rejected);
          resolve(false);
        });
    });
  };
  const showError = function () {
    switch (errorMessageNotShow.current) {
      case "Có lỗi trong quá trình xử lý":
        setErrorMessage(() => t("thereWasAnErrorInTheProcessing"));
        break;
      case "have you verified your email?":
        setErrorMessage(() => t("accountHasBeenConfirmedEmailBeforehand"));
        break;
      default:
        setErrorMessage(errorMessageNotShow.current || t("error"));
        break;
    }
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    let currentLanguage = i18n.language;
    i18n.on("languageChanged", (newLanguage) => {
      if (newLanguage !== currentLanguage) {
        showError();
      }
      currentLanguage = newLanguage;
    });
    fetchApiVerify();
  }, []);

  return (
    <div className="verify">
      <div className="container">
        <div className="box">
          <div className={`spin-container ${renderClassShowSpin()}`}>
            <Spin />
          </div>
          <div className={`errorContent ${renderClassShowError()}`}>
            <div className="verify__title">{t("authenticationFail")}</div>
            {errorMessage}
          </div>
          <div className={`successContent ${renderClassShowSuccessContent()}`}>
            <div className="verify__title">{t("authenticationSuccess")}</div>
            <p>
              {t(
                "yourEmailHasBeenSuccessfullyVerifiedYouCanNowLogInToYourAccount"
              )}
            </p>
            <Button onClick={redirectLogin}>{t("goToTheLoginPage")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;
