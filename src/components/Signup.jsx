import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as Yup from "yup";
import { axiosService } from "../util/service";
import { useState } from "react";
import i18n from "src/translation/i18n";
import { getLocalStorage } from "src/util/common";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { useTranslation } from "react-i18next";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input, inputType } from "./Common/Input";
import { Button } from "./Common/Button";

export default function Signup({ history }) {
  const { isLogin } = useSelector((root) => root.loginReducer);
  const { t } = useTranslation();

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
      username: Yup.string().required(t("require")),
      email: Yup.string().required(t("require")).email(t("invalidEmail")),
      password: Yup.string().required(t("require")),
      password2: Yup.string()
        .required(t("require"))
        .oneOf([Yup.ref("password"), null], t("passwordNotMatch")),
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

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);

  const signup = async (info) => {
    setLoading(true);
    try {
      let response = await axiosService.post("/api/user/signup", info);
      callToastSuccess(t(commontString.success));
      history.replace(url.login);
    } catch (error) {
      callToastError(commontString.error);
    } finally {
      setLoading(false);
    }
  };

  if (isLogin) {
    return <Redirect to={"/"} />;
  }

  return (
    <div className="login-register fadeInBottomToTop">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("createAccount")}</h2>
          <form>
            <div className="field">
              <label htmlFor="username">{t("userName")}</label>
              <Input
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                errorMes={formik.errors.username}
              />
            </div>
            <div className="field">
              <label htmlFor="email">{t("email")}</label>
              <Input
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                errorMes={formik.errors.email}
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t("password")}</label>
              <Input
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                type={inputType.password}
                errorMes={formik.errors.password}
              />
            </div>

            <div className="field">
              <label htmlFor="password2">{t("confirmPassword")}</label>
              <Input
                id="password2"
                name="password2"
                value={formik.values.password2}
                onChange={formik.handleChange}
                type={inputType.password}
                errorMes={formik.errors.password2}
              />
            </div>

            <div className="field">
              <label htmlFor="referral">{t("referralCode")}</label>
              <Input
                disabled
                size="large"
                id="referral"
                name="referral"
                value={formik.values.referral}
              />
            </div>

            <Button
              loading={loading}
              className="loginBtn"
              onClick={formik.handleSubmit}
              htmlType="submit"
            >
              {t("createAccount")}
            </Button>
          </form>

          <div className="toSignUp" onClick={() => history.replace("/login")}>
            {t("alreadyHadAnAccount")}{" "}
            <span style={{ fontWeight: 500 }}>{t("logIn")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
