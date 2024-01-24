import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forGetPassword } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { useHistory, useLocation, useParams } from "react-router-dom";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "src/util/common";

function ForgotPassword() {
  const history = useHistory();
  const { t } = useTranslation();
  const token = useParams().token;

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required(t("require")),
      passwordConfirm: Yup.string()
        .required(t("require"))
        .oneOf([Yup.ref("password"), null], t("passwordNotMatch")),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      fetchApiUpdatePassword(values.password);
    },
  });

  const renderClassShowEyePassword = function () {
    return showPassword ? "" : "--d-none";
  };
  const renderClassShowEyeSlashPassword = function () {
    return showPassword ? "--d-none" : "";
  };
  const eyePasswordToggle = function () {
    setShowPassword((s) => !s);
  };
  const renderTypePassword = function () {
    return showPassword ? "text" : "password";
  };
  const renderClassShowEyePasswordConfirm = function () {
    return showPasswordConfirm ? "" : "--d-none";
  };
  const renderClassShowEyeSlashPasswordConfirm = function () {
    return showPasswordConfirm ? "--d-none" : "";
  };
  const eyePasswordConfirmToggle = function () {
    setShowPasswordConfirm((s) => !s);
  };
  const renderTypePasswordConfirm = function () {
    return showPasswordConfirm ? "text" : "password";
  };
  const fetchApiUpdatePassword = function (newPassword) {
    return new Promise((resolve, reject) => {
      if (isLoading) resolve(true);
      else setIsLoading(() => true);
      forGetPassword({
        passwordNew: newPassword,
      })
        .then((resp) => {
          callToastSuccess(commontString.success);
          history.push(url.login);
        })
        .catch((error) => {
          console.log(error);
          callToastError(commontString.error);
        })
        .finally(() => {
          setIsLoading(() => false);
        });
    });
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    localStorage.setItem(localStorageVariable.token, token);
    return () => {
      removeLocalStorage(localStorageVariable.token);
    };
  }, []);

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("changePassword")}</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label htmlFor="password">{t("newPassword")}</label>
              <input
                name="password"
                id="password"
                type={renderTypePassword()}
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.errors.password ? (
                <div className="error">{formik.errors.password}</div>
              ) : null}
              <span
                onClick={eyePasswordToggle}
                id="eyeShow"
                className={renderClassShowEyePassword()}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                onClick={eyePasswordToggle}
                id="eyeHide"
                className={renderClassShowEyeSlashPassword()}
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>
            <div className="field">
              <label htmlFor="passwordConfirm">{t("newPasswordConfirm")}</label>
              <input
                type={renderTypePasswordConfirm()}
                id="passwordConfirm"
                name="passwordConfirm"
                onChange={formik.handleChange}
                value={formik.values.passwordConfirm}
              />
              {formik.errors.passwordConfirm ? (
                <div className="error">{formik.errors.passwordConfirm}</div>
              ) : null}
              <span
                onClick={eyePasswordConfirmToggle}
                id="eyeShow"
                className={renderClassShowEyePasswordConfirm()}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                onClick={eyePasswordConfirmToggle}
                id="eyeHide"
                className={renderClassShowEyeSlashPasswordConfirm()}
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>
            <Button
              loading={isLoading}
              type="primary"
              size="large"
              className="loginBtn"
              htmlType="submit"
            >
              {t("change")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
