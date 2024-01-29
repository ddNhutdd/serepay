import React, { useEffect } from "react";
import SerepayWalletList from "./walletList";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getLocalStorage } from "src/util/common";
import {
  coinString,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import i18n from "src/translation/i18n";

import { coinSetCoin } from "src/redux/actions/coin.action";

import WalletTop, { titleWalletTop } from "./WalletTop";
function SwaptobeWallet() {
  const history = useHistory();
  const isLogin = useSelector((root) => root.loginReducer.isLogin);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLogin) {
      dispatch(coinSetCoin(coin ?? coinString.USDT));
      history.push(url.login);
      return;
    }

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);

  return (
    <div className="swaptobe-wallet fadeInBottomToTop">
      <div className="container">
        <WalletTop title={titleWalletTop.walletOverview} />
        <SerepayWalletList />
      </div>
    </div>
  );
}
export default SwaptobeWallet;
