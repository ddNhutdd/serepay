import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { axiosService } from "../util/service";
import {
  apiResponseErrorMessage,
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useEffect } from "react";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "src/util/common";
import i18n from "src/translation/i18n";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import socket from "src/util/socket";
import { Input, inputType } from "./Common/Input";
import { Button } from "./Common/Button";
export default function Login({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("require")
        .min(3, "usernameMustBeGreaterThanOrEqualTo3Characters"),
      password: Yup.string()
        .required("require")
        .min(6, "passwordMustBeGreaterThanOrEqualTo6Characters"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      login(values.username, values.password);
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    //
    const element = document.querySelector(".login-register");
    if (element) element.classList.add("fadeInBottomToTop");
    //
    reLoginRedirect();
  }, []);
  const reLoginRedirect = function () {
    const url = getLocalStorage(localStorageVariable.reLoginR);
    if (!url) return;
    removeLocalStorage(localStorageVariable.reLoginR);
    history.push(url);
  };

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
      const profile = JSON.stringify(response.data.data);
      callToastSuccess(t("loggedInSuccessfully"));
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", profile);
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
      //
      dispatch(setAccountName(response.data.data?.username));
      setLocalStorage(localStorageVariable.accountName, response.data.data?.username);
      //redirect to admin
      redirecToAdmin(response.data.data);
      //
      const verify = response?.data?.data?.verified;
      if (verify !== 1 && verify !== 2) history.push(url.profile);
    } catch (error) {
      const mess =
        error?.response?.data?.errors[0]?.msg || error?.response?.data?.message;
      switch (mess) {
        case apiResponseErrorMessage.usernameMini:
          callToastError(t("usernameMustBeGreaterThanOrEqualTo3Characters"));
          break;
        case apiResponseErrorMessage.password_1:
          callToastError(t("passwordMustBeGreaterThanOrEqualTo6Characters"));
          break;
        case apiResponseErrorMessage.accountIncorrect:
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

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("login")}</h2>
          <form>
            <div className="field">
              <label htmlFor="email">{t("userName")}</label>
              <Input
                id="username"
                name="username"
                value={formik.values.email}
                onChange={formik.handleChange}
                errorMes={t(formik.errors.username)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t("password")}</label>
              <Input
                size="large"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                type={inputType.password}
                errorMes={t(formik.errors.password)}
              />
            </div>
            <Button
              className="loginBtn"
              loading={isLoading}
              onClick={formik.handleSubmit}
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
