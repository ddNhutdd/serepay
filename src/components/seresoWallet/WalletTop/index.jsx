import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserWallet } from "src/redux/constant/coin.constant";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import { DOMAIN } from "src/util/service";
import css from "./walletTop.module.scss";

export const titleWalletTop = {
  walletOverview: "walletOverview",
  widthdraw: "widthdraw",
  transfer: "transfer",
  deposit: "diposit",
};

function WalletTop(props) {
  const { title } = props;

  const userWallet = useSelector(getUserWallet);
  const { t } = useTranslation();

  const [userWalletUsdt, setUserWalletUsdt] = useState(0);

  const renderClassShowTitle = function (tit) {
    return tit === title ? "" : "--d-none";
  };

  useEffect(() => {
    setUserWalletUsdt(() =>
      new Intl.NumberFormat(i18n.language).format(
        userWallet["usdt_balance"] || 0
      )
    );
  }, [userWallet]);

  return (
    <div className={css["walletTop"]}>
      <h5 className={css["title"]}>
        <span
          className={
            css["title__header"] +
            ` ${renderClassShowTitle(titleWalletTop.walletOverview)}`
          }
        >
          <span>{t("walletOverview")}</span>
        </span>
        <span
          className={`title__header ${renderClassShowTitle(
            titleWalletTop.widthdraw
          )}`}
        >
          <span>{t("withdraw")}</span>
        </span>
        <span
          className={`title__header ${renderClassShowTitle(
            titleWalletTop.transfer
          )}`}
        >
          <span>{t("transfer")}</span>
        </span>
        <span
          className={`title__header ${renderClassShowTitle(
            titleWalletTop.deposit
          )}`}
        >
          <span>{t("deposit")} Cryto</span>
        </span>
      </h5>
      <div className={css["info"]}>
        <div>{t("amount")} USDT</div>
        <div>
          <span>{userWalletUsdt}</span>{" "}
          <img src={DOMAIN + "images/USDT.png"} alt="usdt" />
        </div>
      </div>
    </div>
  );
}

export default WalletTop;
