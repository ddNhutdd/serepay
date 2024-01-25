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
import { getLocalStorage, processString } from "src/util/common";

function Verify() {
  const token = useParams().token;
  const history = useHistory();
  const { t } = useTranslation();

  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [errorMessage, setErrorMessage] = useState();
  const [timer, setTimer] = useState(5);
  const idTimer = useRef();

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
    return;
  };
  const fetchApiVerify = function () {
    return new Promise((resolve, reject) => {
      if (callApiStatus === api_status.fetching) resolve(true);
      else setCallApiStatus(() => api_status.fetching);
      verifyEmail(token)
        .then((resp) => {
          startTimer();
          setCallApiStatus(() => api_status.fulfilled);
          resolve(true);
        })
        .catch((error) => {
          const errorMess = error.response.data.message;
          let showError = "";
          switch (errorMess) {
            case "Có lỗi trong quá trình xử lý":
              showError = t("thereWasAnErrorInTheProcessing");
              break;
            case "have you verified your email?":
              showError = t("accountHasBeenConfirmedEmailBeforehand");
              break;
            default:
              showError = t("thereWasAnErrorInTheProcessing");
              break;
          }
          setErrorMessage(() => showError);
          setCallApiStatus(() => api_status.rejected);
          resolve(false);
        });
    });
  };
  const startTimer = function () {
    let countDown = timer;
    const countDownFunction = function () {
      setTimer((s) => --s);
      countDown--;
      if (countDown <= 0) redirectLogin();
    };
    idTimer.current = setInterval(countDownFunction, 1000);
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    fetchApiVerify();

    return () => {
      clearInterval(idTimer.current);
    };
  }, []);

  return (
    <div className="verify">
      <div className="container">
        <div className={renderClassShowSpin()}>
          <Spin />
        </div>
        <div className={`errorContent ${renderClassShowError()}`}>
          {errorMessage}
        </div>
        <div className={`sucesssContent ${renderClassShowSuccessContent()}`}>
          <p>
            {t(
              "successfullyAuthenticatedAccountClickOnTheButtonBelowOrWait#####SecondsToGoToTheLoginPage"
            ).replace(`#####`, timer)}
          </p>
          <Button onClick={redirectLogin}>{t("goToTheLoginPage")}</Button>
        </div>
      </div>
    </div>
  );
}

export default Verify;
