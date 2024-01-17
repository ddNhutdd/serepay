import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as Yup from "yup";
import { Button } from "antd";
import { axiosService } from "../util/service";
import { useState } from "react";
import i18n from "src/translation/i18n";
import { getLocalStorage } from "src/util/common";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
} from "src/constant";
import { useTranslation } from "react-i18next";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";

export default function Signup({ history }) {
  //
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: "",
      email: "",
      password: "",
      password2: "",
      referral: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Required"),
      email: Yup.string().required("Required").email("Invalid email"),
      password: Yup.string().required("Required"),
      password2: Yup.string()
        .required("Required")
        .oneOf([Yup.ref("password"), null], "Password not match"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      signup({
        Referral: "67d5497458ce",
        email: values.email,
        password: values.password2,
        userName: values.username,
        tokenRecaptcha: "abc",
      });
    },
  });
  const [typeInputPassword, setTypeInputPassword] = useState("password");
  const [typeInputPasswordConfirm, setTypeInputPasswordConfirm] =
    useState("password");

  const { isLogin } = useSelector((root) => root.loginReducer);
  const { t } = useTranslation();
  useEffect(() => {
    const element = document.querySelector(".login-register");
    element.classList.add("fadeInBottomToTop");
    //
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);
  //
  const signup = async (info) => {
    setLoading(true);
    try {
      let response = await axiosService.post("/api/user/signup", info);
      const verifyToken = response?.data?.data;
      callToastSuccess(t(commontString.success));
      axiosService.get("/api/user/verifyEmail/" + verifyToken);
      history.replace("/login");
    } catch (error) {
      callToastError(commontString.error);
    } finally {
      setLoading(false);
    }
  };

  if (isLogin) {
    return <Redirect to={"/"} />;
  }
  //
  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("createAccount")}</h2>
          <form>
            <div className="field">
              <label htmlFor="username">{t("userName")}</label>
              <input
                size="large"
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
              {formik.errors.username ? (
                <div className="error">{formik.errors.username}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="email">{t("email")}</label>
              <input
                size="large"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {formik.errors.email ? (
                <div className="error">{formik.errors.email}</div>
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

            <div className="field">
              <label htmlFor="password2">{t("confirmPassword")}</label>
              <input
                size="large"
                id="password2"
                name="password2"
                value={formik.values.password2}
                onChange={formik.handleChange}
                type={typeInputPasswordConfirm}
              />
              {formik.errors.password2 ? (
                <div className="error">{formik.errors.password2}</div>
              ) : null}
              <span
                id="eyeShow"
                className={
                  typeInputPasswordConfirm === "text" ? "" : "--d-none"
                }
                onClick={() => {
                  setTypeInputPasswordConfirm(() => "password");
                }}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                className={
                  typeInputPasswordConfirm === "password" ? "" : "--d-none"
                }
                onClick={() => {
                  setTypeInputPasswordConfirm(() => "text");
                }}
                id="eyeHide"
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>

            <div className="field">
              <label htmlFor="referral">{t("referralCode")}</label>
              <input
                disabled
                size="large"
                id="referral"
                name="referral"
                value={formik.values.referral}
              />
            </div>
          </form>

          <Button
            loading={loading}
            type="primary"
            size="large"
            className="loginBtn"
            onClick={formik.handleSubmit}
          >
            {t("createAccount")}
          </Button>

          <div className="toSignUp" onClick={() => history.replace("/login")}>
            {t("alreadyHadAnAccount")}{" "}
            <span style={{ fontWeight: 500 }}>{t("logIn")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
