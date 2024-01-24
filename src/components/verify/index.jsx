import React, { useEffect, useState, useRef } from "react";
import { Button } from "../Common/Button";
import { Spin } from "antd";
import { useParams, useHistory } from "react-router-dom";
import { api_status, url } from "src/constant";
import { verifyEmail } from "src/util/userCallApi";

function Verify() {
  const token = useParams().token;
  const history = useHistory();

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
        })
        .catch((error) => {
          const errorMess = error.response.data.message;
          // email da xac thuc truoc do, token khong dung
          setErrorMessage(() => errorMess);
          setCallApiStatus(() => api_status.rejected);
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
            Successfully authenticated account. Click on the button below or
            wait {timer} seconds to go to the login page
          </p>
          <Button onClick={redirectLogin}>Go to the login page</Button>
        </div>
      </div>
    </div>
  );
}

export default Verify;
