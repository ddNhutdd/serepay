import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { defaultLanguage, localStorageVariable } from "src/constant";
import { getLocalStorage } from "src/util/common";
import i18n, { availableLanguage } from "src/translation/i18n";
import { useLocation } from "react-router-dom";
function PhoneApps() {
  const { t } = useTranslation();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/") {
      i18n.changeLanguage(availableLanguage.en);
    } else {
      const language =
        getLocalStorage(localStorageVariable.lng) || defaultLanguage;
      i18n.changeLanguage(language);
    }
  }, []);
  return (
    <div className="phone__apps">
      <div className="container">
        <div className="home__app__content">
          <div className="home__app__left">
            <h3>
              {t("seresoApps")} - {t("comingSoon")}
            </h3>
            <p className="home__app__small-header">
              {t("tradingWheneverAndWhereverYouAre")}
            </p>
            <p>{t("compatibleWithIOSAndroidWebsite")}</p>
            <p>
              {t("downloadAppStoreForIOSOperatingSystem")}{" "}
              {t("downloadGooglePlayForAndroidOS")}
            </p>
            <div className="home__app__image-container">
              <img src={process.env.PUBLIC_URL + "/img/ios.png"} alt="ios" />
              <img
                src={process.env.PUBLIC_URL + "/img/android.png"}
                alt="android"
              />
            </div>
          </div>
          <div className="home__app__right">
            <div className="home__app__right__image-container">
              <img
                src={process.env.PUBLIC_URL + "/img/home-16.png"}
                alt="phone"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PhoneApps;
