import React, { useEffect } from "react";
import { Button } from "../Common/Button";
import { useHistory } from "react-router-dom";
import { defaultLanguage, localStorageVariable, url } from "src/constant";
import { useTranslation } from "react-i18next";
import { getLocalStorage } from "src/util/common";

function ConfirmEmail() {
  const history = useHistory();
  const { t } = useTranslation();

  const redirectLogin = function () {
    history.push(url.login);
    return;
  };
  const redirectMailGoogle = function () {
    window.open("https://mail.google.com", "_blank");
    return;
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);

  return (
    <div className="confirmEmail">
      <div className="container">
        <div className="box">
          <div className="confirmEmail__title">{t("confirmYourEmail")}</div>
          <div className="confirmEmail__content">
            <p>We've sent you an email with a link to verify your account.</p>
            <p>Please check your email and click the link to continue.</p>
          </div>
          <Button onClick={redirectMailGoogle}>Go to your mailbox</Button>
          <ul className="confirmEmail__note">
            <li>
              If you do not receive the email within a few minutes, please check
              your spam folder.
            </li>
            <li>
              Have you verified your account yet?{" "}
              <span onClick={redirectLogin} className="confirmEmail__login">
                Log in
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail;
