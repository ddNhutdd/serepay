import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { axiosService } from "../util/service";
import {
  errorMessage,
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useEffect } from "react";
import { getLocalStorage, messageTransferHandle, removeLocalStorage, setLocalStorage } from "src/util/common";
import i18n from "src/translation/i18n";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import socket from "src/util/socket";
import { Input, inputType } from "./Common/Input";
import { Button } from "./Common/Button";
import useForm from "src/hooks/use-form";
export default function Login({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  
  const login = async (e, p) => {
    setIsLoading(true);
    try {
      let response = await axiosService.post("/api/user/login", {
        userName: e,
        password: p,
      });
      removeLocalStorage(localStorageVariable.expireToken);
      response?.data?.data?.id === 1
        ? dispatch({ type: "USER_ADMIN", payload: true })
        : dispatch({ type: "USER_ADMIN", payload: false });
      callToastSuccess(t("loggedInSuccessfully"));
      setLocalStorage(localStorageVariable.token, response.data.data.token);
      setLocalStorage(localStorageVariable.user, response.data.data);
      dispatch({ type: "USER_LOGIN" });
      // menu load list mycoin
      dispatch(userWalletFetchCount());
      // search previos page and redirect
      const previousPage = getLocalStorage(localStorageVariable.previousePage);
      socket.emit("join", response.data.data.id);
      socket.on("ok", (res) => { });
      history.push("wallet-2");
      if (previousPage) {
        history.replace(previousPage.pathname + previousPage.search);
        removeLocalStorage(localStorageVariable.previousePage);
      } else {
        history.push(url.p2pTrading);
      }
      //lắng nghe các thông báo về chuyền tiền 
      socket.on("messageTransfer", (res) => {
        messageTransferHandle(res, t);
      })
      //redirect to admin
      redirecToAdmin(response.data.data);
      // chưa xác thực kyc thì chuyển trang profile
      //const verify = response?.data?.data?.verified;
      //if (verify !== 1 && verify !== 2) history.push(url.profile);

    } catch (error) {
      const mess =
        error?.response?.data?.errors[0]?.msg || error?.response?.data?.message;
      switch (mess) {
        case errorMessage.usernameMini:
          callToastError(t("usernameMustBeGreaterThanOrEqualTo3Characters"));
          break;
        case errorMessage.password_1:
          callToastError(t("passwordMustBeGreaterThanOrEqualTo6Characters"));
          break;
        case errorMessage.accountIncorrect:
          callToastError(t("incorrectAccountOrPassword"));
          break;
        default:
          callToastError(mess || t("error"));
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };
  const redirecToAdmin = function (userProfile) {
    const { id } = userProfile;
    if (id === 1) history.push(url.admin_ads);
    return;
  };

  const formSumbitHandle = (values) => {
    login(values[loginControl.username], values[loginControl.password])
  }
  const loginControl = {
    username: 'username',
    password: 'password'
  }
  const [register, onSubmit, errors] = useForm(formSumbitHandle);

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    //
    const element = document.querySelector(".login-register");
    if (element) element.classList.add("fadeInBottomToTop");
  }, []);

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("login")}</h2>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">{t("userName")}</label>
              <Input
                {...register(loginControl.username)}
                require={[true, 'require']}
                min={[3, 'usernameMustBeGreaterThanOrEqualTo3Characters']}
                errorMes={t(errors[loginControl.username])}
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t("password")}</label>
              <Input
                {...register(loginControl.password)}
                require={[true, 'require']}
                min={[6, 'passwordMustBeGreaterThanOrEqualTo6Characters']}
                type={inputType.password}
                errorMes={t(errors[loginControl.password])}
              />
            </div>
            <Button
              className="loginBtn"
              loading={isLoading}
              htmlType="submit"
            >
              {t("logIn")}
            </Button>
          </form>
          <div className="toSignUp" onClick={() => history.replace(url.signup)}>
            {t("dontHaveAnAccount")}{" "}
            <span style={{ fontWeight: 500 }}>{t("letsSignUp")}</span>
          </div>
          <div
            className="toSignUp"
            onClick={() => history.replace(url.recovery_password)}
          >
            {t("forgotPassword")}
          </div>
        </div>
      </div>
    </div>
  );
}
