import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forGetPassword } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { useHistory, useParams } from "react-router-dom";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import { getLocalStorage, removeLocalStorage } from "src/util/common";
import { Input, inputType } from "../Common/Input";
import { Button } from "../Common/Button";

function ForgotPassword() {
  const history = useHistory();
  const { t } = useTranslation();
  const token = useParams().token;

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
              <Input
                name="password"
                id="password"
                type={inputType.password}
                onChange={formik.handleChange}
                value={formik.values.password}
                errorMes={formik.errors.password}
              />
            </div>
            <div className="field">
              <label htmlFor="passwordConfirm">{t("newPasswordConfirm")}</label>
              <Input
                type={inputType.password}
                id="passwordConfirm"
                name="passwordConfirm"
                onChange={formik.handleChange}
                value={formik.values.passwordConfirm}
                errorMes={formik.errors.passwordConfirm}
              />
            </div>
            <Button loading={isLoading} className="loginBtn" htmlType="submit">
              {t("change")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
