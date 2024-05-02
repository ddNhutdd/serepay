import React, { useEffect } from "react";
import { Button } from "../Common/Button";
import { useHistory } from "react-router-dom";
import { defaultLanguage, localStorageVariable, url } from "src/constant";
import { useTranslation } from "react-i18next";
import { getLocalStorage } from "src/util/common";
import i18n from "src/translation/i18n";

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
            <p>{t("weveSentYouAnEmailWithALinkToVerifyYourAccount")}</p>
            <p>{t("pleaseCheckYourEmailAndClickTheLinkToContinue")}</p>
          </div>
          <Button onClick={redirectMailGoogle}>{t("goToYourMailbox")}</Button>
          <ul className="confirmEmail__note">
            <li>
              {t(
                "ifYouDoNotReceiveTheEmailWithinAFewMinutesPleaseCheckYourSpamFolder"
              )}
            </li>
            <li>
              {t("haveYouVerifiedYourAccountYet")}{" "}
              <span onClick={redirectLogin} className="confirmEmail__login">
                {t("login")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail;
