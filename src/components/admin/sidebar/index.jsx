import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { localStorageVariable, url } from "src/constant";
import { callToastSuccess } from "src/function/toast/callToast";
import {
  addClassToElementById,
  getElementById,
  removeLocalStorage,
} from "src/util/common";
function Sidebar() {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlList = location.pathname.split("/");
    const page = urlList[urlList.length - 1];
    selectItem(page);
  }, []);

  const clearSelectedItem = function () {
    const element = getElementById("listItem");
    for (const item of element.children) {
      item.classList.remove("active");
    }
  };
  const selectItem = function (page) {
    clearSelectedItem();
    switch (page) {
      case "exchange-rate-disparity":
        addClassToElementById("exchangeRateDisparity", "active");
        break;
      case "ads":
        addClassToElementById("ads", "active");
        break;
      case "exchange":
        addClassToElementById("exchange", "active");
        break;
      case "user":
        addClassToElementById("user", "active");
        break;
      case "widthdraw":
        addClassToElementById("widthdraw", "active");
        break;
      case "config-data":
        addClassToElementById("config-data", "active");
        break;
      case "transfer":
        addClassToElementById("transfer", "active");
        break;
      case "wallet":
        addClassToElementById("wallet", "active");
        break;
      case "kyc":
        addClassToElementById("kyc", "active");
        break;
      case "swap":
        addClassToElementById("swap", "active");
        break;
      case "deposit":
        addClassToElementById("deposit", "active");
        break;
      default:
        break;
    }
  };
  const redirectWidthdraw = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_widthdraw);
  };
  const redirectExchangeRateDisparity = function (e) {
    clearSelectedItem();
    const element = e.target.closest("#exchangeRateDisparity");
    element.classList.add("active");
    history.push(url.admin_exchangeRateDisparity);
  };
  const redirectAds = function (e) {
    clearSelectedItem();
    const element = e.target.closest("#ads");
    element.classList.add("active");
    history.push(url.admin_ads);
  };
  const redirectUser = function (e) {
    clearSelectedItem();
    const element = e.target.closest("#user");
    element.classList.add("active");
    history.push(url.admin_user);
  };
  const redirectExchange = function (e) {
    clearSelectedItem();
    const element = e.target.closest("#exchange");
    element.classList.add("active");
    history.push(url.admin_exchange);
  };
  const redirectConfigData = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_configData);
  };
  const redirectTransfer = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_transfer);
  };
  const redirectWallet = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_wallet);
  };
  const redirectSwap = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_swap);
  };
  const redirectKyc = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_kyc);
  };
  const redirectDeposite = function (e) {
    clearSelectedItem();
    e.currentTarget.classList.add("active");
    history.push(url.admin_deposite);
  };
  const logout = () => {
    dispatch({ type: "USER_ADMIN", payload: false });
    localStorage.removeItem(localStorageVariable.user);
    localStorage.removeItem(localStorageVariable.token);
    removeLocalStorage(localStorageVariable.currency);
    removeLocalStorage(localStorageVariable.lng);
    removeLocalStorage(localStorageVariable.coin);
    removeLocalStorage(localStorageVariable.adsItem);
    removeLocalStorage(localStorageVariable.coinNameToTransaction);
    removeLocalStorage(localStorageVariable.createAds);
    removeLocalStorage(localStorageVariable.coinFromWalletList);
    removeLocalStorage(localStorageVariable.amountFromWalletList);
    removeLocalStorage(localStorageVariable.thisIsAdmin);
    history.push(url.home);
    dispatch({ type: "USER_LOGOUT" });
    callToastSuccess("Logged out");
  };

  return (
    <div className="admin-sidebar show">
      <ul id="listItem">
        <li onClick={redirectUser} id="user">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-user"></i>
          </span>
          <span className="admin-sidebar__item">Users</span>
        </li>
        <li onClick={redirectKyc} id="kyc">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-user-shield"></i>
          </span>
          <span className="admin-sidebar__item">KYC</span>
        </li>
        <li onClick={redirectExchangeRateDisparity} id="exchangeRateDisparity">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-percent"></i>
          </span>
          <span className="admin-sidebar__item">Exchange Rate Disparity</span>
        </li>
        <li onClick={redirectAds} id="ads">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-rectangle-ad"></i>
          </span>
          <span className="admin-sidebar__item">Advertise</span>
        </li>
        <li onClick={redirectExchange} id="exchange">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-money-bill-transfer"></i>
          </span>
          <span className="admin-sidebar__item">Exchange</span>
        </li>
        <li onClick={redirectWidthdraw} id="widthdraw">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-money-bill"></i>
          </span>
          <span className="admin-sidebar__item">Widthdraw</span>
        </li>
        <li onClick={redirectConfigData} id="config-data">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-database"></i>
          </span>
          <span className="admin-sidebar__item">Config Data</span>
        </li>
        <li onClick={redirectTransfer} id="transfer">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-arrow-right-arrow-left"></i>
          </span>
          <span className="admin-sidebar__item">Transfer</span>
        </li>
        <li onClick={redirectWallet} id="wallet">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-wallet"></i>
          </span>
          <span className="admin-sidebar__item">Wallet</span>
        </li>
        <li onClick={redirectSwap} id="swap">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-rotate"></i>
          </span>
          <span className="admin-sidebar__item">Swap</span>
        </li>
        <li onClick={redirectDeposite} id="deposite">
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-file-invoice"></i>
          </span>
          <span className="admin-sidebar__item">Deposite</span>
        </li>
        <li onClick={logout}>
          <span className="admin-sidebar__icon">
            <i className="fa-solid fa-right-from-bracket"></i>
          </span>
          <span className="admin-sidebar__item">Log out</span>
        </li>
      </ul>
    </div>
  );
}
export default Sidebar;
