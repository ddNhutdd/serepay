import React, { useEffect } from "react";
import css from "./adsHistoryRecord.module.scss";
import {
  currencyMapper,
  defaultLanguage,
  image_domain,
  localStorageVariable,
} from "src/constant";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import {
  formatNumber,
  getLocalStorage,
  roundIntl,
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
    showModal = function () {},
    cancelAdsId = function () {},
    // for admin
    rejectClickHandle = function () {},
    acceptClickHandle = function () {},
  } = props;
  const { t } = useTranslation();

  const renderActionByUser = function () {
    return type === AdsHistoryRecordType.user ? "" : "--d-none";
  };
  const renderActionByAdmin = function () {
    return type === AdsHistoryRecordType.admin ? "" : "--d-none";
  };
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
  const renderClassLastCol = function () {
    return type === AdsHistoryRecordType.admin ? "" : "--d-none";
  };
  const renderClassButonLastCoin = function () {
    return item.type === 2 ? "" : "--visible-hidden";
  };
  const renderStyle = function () {
    return type === AdsHistoryRecordType.admin
      ? css["width-record-25"]
      : css["width-record-33"];
  };
  const renderAction = function () {
    if (type === AdsHistoryRecordType.admin) {
      return (
        <tr>
          <td>{t("type")}:</td>
          <td>{t(item.side)}</td>
        </tr>
      );
    } else {
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
      <div className={renderStyle()}>
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
            {renderAction()}
          </tbody>
        </table>
      </div>
      <div className={renderStyle()}>
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
      <div className={renderStyle()}>
        <table>
          <tbody>
            <tr>
              <td>{t("createdAt")}:</td>
              <td>{item.created_at}</td>
            </tr>
            <tr>
              <td
                className={`${
                  css["ads-history-action"]
                } ${renderActionByUser()}`}
                id={"adsHistoryAction" + item.id}
                colSpan="2"
              >
                <div className={css["ads-history-action-container"]}>
                  <Button
                    type={buttonClassesType.outline}
                    className={`${
                      item.type === 1 || item.type === 2 ? "" : "--d-none"
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
              <td
                className={`${
                  css["ads-history-action"]
                }  ${renderActionByAdmin()}`}
                colSpan="2"
              >
                <div className="d-flex alignItem-c justify-c">
                  {renderStatus(item.type)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={renderClassLastCol() + " " + renderStyle()}>
        <table>
          <tbody>
            <tr className={renderClassButonLastCoin()}>
              <td colSpan={2}>
                <div className="d-flex alignItem-c justify-c f-w">
                  <Button
                    className={`m-1`}
                    onClick={rejectClickHandle.bind(null, item.id)}
                  >
                    Reject
                  </Button>
                  <Button onClick={acceptClickHandle.bind(null, item.id)}>
                    Accept
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
