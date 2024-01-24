import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { sendMailForGetPassword } from "src/util/userCallApi";
import { useTranslation } from "react-i18next";
import { getLocalStorage } from "src/util/common";
import { defaultLanguage, localStorageVariable } from "src/constant";
import i18n from "src/translation/i18n";
import { Input } from "../Common/Input";
import { Button } from "../Common/Button";

function RecoveryPassword() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const fetchApiSendEmail = function () {
    return new Promise((resolve, reject) => {
      if (loading) resolve(true);
      else setLoading(() => true);
      sendMailForGetPassword({
        email: formik.values.email,
      })
        .then((resp) => {
          callToastSuccess(t("emailHasBeenSent"));
        })
        .catch((error) => {
          const mes = error.response.data.message;
          switch (mes) {
            case "Email is not define":
              callToastError(t("theEmailDoesNotExistInTheSystem"));
              break;

            default:
              callToastError(t("error"));
              break;
          }
        })
        .finally(() => {
          setLoading(() => false);
        });
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required(t("require")).email(t("invalidEmail")),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, e) => {
      fetchApiSendEmail();
    },
  });

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">{t("recoveryPassword")}</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label htmlFor="email">{t("email")}: </label>
              <Input
                id="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                errorMes={formik.errors.email}
              />
            </div>
            <Button loading={loading} className="loginBtn" htmlType="submit">
              {t("send")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecoveryPassword;
