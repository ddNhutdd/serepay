import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { axiosService } from "../util/service";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useEffect } from "react";
import { getLocalStorage, removeLocalStorage } from "src/util/common";
import i18n from "src/translation/i18n";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import socket from "src/util/socket";
import { Button } from "antd";
export default function Login({ history }) {
  //
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Required"),
      password: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      login(values.username, values.password);
    },
  });
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [typeInputPassword, setTypeInputPassword] = useState("password");
  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
    //
    const element = document.querySelector(".login-register");
    if (element) element.classList.add("fadeInBottomToTop");
  }, []);
  //
  const login = async (e, p) => {
    setIsLoading(true);
    try {
      let response = await axiosService.post("/api/user/login", {
        userName: e,
        password: p,
      });
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
      socket.on("ok", (res) => {
        console.log(res, "ok");
      });
      history.push("wallet-2");
      if (previousPage) {
        history.replace(previousPage.pathname + previousPage.search);
        removeLocalStorage(localStorageVariable.previousePage);
      } else {
        history.push(url.p2pTrading);
      }
      //redirect to admin
      redirecToAdmin(response.data.data);
    } catch (error) {
      callToastError(t(commontString.error));
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
              <input
                id="username"
                name="username"
                value={formik.values.email}
                onChange={formik.handleChange}
                size="large"
              />
              {formik.errors.username ? (
                <div className="error">{formik.errors.username}</div>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="password">{t("password")}</label>
              <input
                size="large"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                type={typeInputPassword}
              />
              {formik.errors.password ? (
                <div className="error">{formik.errors.password}</div>
              ) : null}
              <span
                id="eyeShow"
                className={typeInputPassword === "text" ? "" : "--d-none"}
                onClick={() => {
                  setTypeInputPassword(() => "password");
                }}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                className={typeInputPassword === "password" ? "" : "--d-none"}
                onClick={() => {
                  setTypeInputPassword(() => "text");
                }}
                id="eyeHide"
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>

            <Button
              loading={isLoading}
              type="primary"
              size="large"
              className="loginBtn"
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
