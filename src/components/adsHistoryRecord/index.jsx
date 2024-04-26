import React, { useEffect } from "react";
import css from "./adsHistoryRecord.module.scss";
import {
  defaultLanguage,
  image_domain,
  localStorageVariable,
} from "src/constant";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import {
  formatNumber,
  getLocalStorage,
  rountRange,
} from "src/util/common";
import { Button, buttonClassesType } from "../Common/Button";
import { TagCustom, TagType } from "../Common/Tag";

export const AdsHistoryRecordType = {
  admin: "admin",
  user: "user",
};

function AdsHistoryRecord(props) {
  const {
    item,
    price,
    type = "",
    // for user
    showModal = function () { },
    cancelAdsId = function () { },
  } = props;
  const { t } = useTranslation();

  const renderStatus = function (type) {
    switch (type) {
      case 2:
        return <TagCustom type={TagType.pending} />;
      case 1:
        return <TagCustom type={TagType.success} />;
      case 3:
        return <TagCustom type={TagType.error} />;
      default:
        break;
    }
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);

  return (
    <div
      key={item.id}
      className={`box fadeInBottomToTop ${css["ads-history__record"]}`}
    >
      <div className={css["width-record-33"]}>
        <table>
          <tbody>
            <tr>
              <td>{t("amount")}:</td>
              <td>
                {formatNumber(item.amount, i18n.language, rountRange(price))}
              </td>
            </tr>
            <tr>
              <td>{t("amountMinimum")}:</td>
              <td>
                {formatNumber(
                  item.amountMinimum,
                  i18n.language,
                  rountRange(price)
                )}
              </td>
            </tr>
            <tr>
              <td>{t("quantityRemaining")}:</td>
              <td>
                {formatNumber(
                  item.amount - item.amountSuccess,
                  i18n.language,
                  rountRange(price)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={css["width-record-33"]}>
        <table>
          <tbody>
            <tr>
              <td className={css["logo-coin"]}>
                <img
                  src={image_domain.replace("USDT", item.symbol.toUpperCase())}
                  alt={item.symbol}
                />
                :{" "}
              </td>
              <td>
                <span>{item.symbol}</span>
              </td>
            </tr>
            <tr>
              <td>{t("userName")}:</td>
              <td>
                <span>{item.userName}</span>
              </td>
            </tr>
            <tr>
              <td>{t("email")}:</td>
              <td>
                <span>{item.email}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={css["width-record-33"]}>
        <table>
          <tbody>
            <tr>
              <td>{t("createdAt")}:</td>
              <td>{item.created_at}</td>
            </tr>
            <tr>
              <td
                className={`${css["ads-history-action"]}`}
                id={"adsHistoryAction" + item.id}
                colSpan="2"
              >
                <div className={css["ads-history-action-container"]}>
                  <Button
                    type={buttonClassesType.outline}
                    className={`${item.type === 1 || item.type === 2 ? "" : "--d-none"
                      }`}
                    onClick={() => {
                      cancelAdsId.current = item.id;
                      showModal();
                    }}
                    id={"adsHistoryActionCancelButton" + item.id}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdsHistoryRecord;
