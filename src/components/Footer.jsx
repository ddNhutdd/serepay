import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { defaultLanguage, localStorageVariable } from "src/constant";
import i18n, { availableLanguage } from "src/translation/i18n";
import { getLocalStorage } from "src/util/common";
import { useLocation } from "react-router-dom";
export default function Footer() {
  //
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

  //
  return (
    <footer className="footer">
      <div className="container sereso-container">
        <div className="footer__community">
          <div className="footer__community-title">{t("community")}</div>
          <div className="footer__social-list">
            <div className="footer__social-row">
              <span>
                <img
                  src={process.env.PUBLIC_URL + "/img/telegram.png"}
                  alt="..."
                />
              </span>
              <span>
                <img
                  src={process.env.PUBLIC_URL + "/img/twiter.png"}
                  alt="..."
                />
              </span>
              <span>
                <img
                  src={process.env.PUBLIC_URL + "/img/youtube.png"}
                  alt="..."
                />
              </span>
            </div>
            <div className="footer__social-row">
              <span>
                <img
                  src={process.env.PUBLIC_URL + "/img/facebook.png"}
                  alt="..."
                />
              </span>
              <span>
                <img
                  src={process.env.PUBLIC_URL + "/img/instagram.png"}
                  alt="..."
                />
              </span>
              <span>
                <img src={process.env.PUBLIC_URL + "/img/cb.png"} alt="..." />
              </span>
            </div>
          </div>
        </div>
        <div className="footer__list">
          <div className="footer__list-item">
            <p className="footer__title">{t("application")}</p>
            <ul className="footer__list-content">
              <li>
                <span>{t("swap")}</span>
              </li>
              <li>
                <span>{t("seresoEarn")}</span>
              </li>
              <li>
                <span>{t("seresoCredit")}</span>
              </li>
            </ul>
          </div>
          <div className="footer__list-item">
            <p className="footer__title">{t("list")}</p>
            <ul className="footer__list-content">
              <li>
                <span>{t("listedAssets")}</span>
              </li>
              <li>
                <span>{t("listingApplication")}</span>
              </li>
            </ul>
          </div>
          <div className="footer__list-item">
            <p className="footer__title">{t("resources")}</p>
            <ul className="footer__list-content">
              <li>
                <span>{t("whitepaper")}</span>
              </li>
            </ul>
          </div>
          <div className="footer__list-item">
            <p className="footer__title">{t("aboutUs")}</p>
            <ul className="footer__list-content">
              <li>
                <span>{t("about")}</span>
              </li>
              <li>
                <span>{t("tems")}</span>
              </li>
              <li>
                <span>{t("privacy")}</span>
              </li>
              <li>
                <span>{t("contactUs")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
