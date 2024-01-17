import { Button, Input, message, Spin } from "antd";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { axiosService } from "../util/service";
import {
  commontString,
  defaultLanguage,
  localStorageVariable,
} from "src/constant";
import { getLocalStorage } from "src/util/common";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
const typeList = ["TRC20", "ERC20", "PEP20"];
export default function Wallet() {
  //
  const [type, setType] = useState(typeList[0]);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [coinList, setCoinList] = useState([]);
  const [currentCoin, setCurrentCoin] = useState("BTC");
  const [action, setAction] = useState("Deposit");
  const [info, setInfo] = useState({
    address: "",
    amount: "",
  });
  const { isLogin } = useSelector((root) => root.loginReducer);
  const { t } = useTranslation();
  const getAllCoins = async () => {
    try {
      let response = await axiosService.post("api/crypto/getListCoinAll");
      setCoinList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const createWallet = async (symbol) => {
    setLoading(true);
    try {
      let response = await axiosService.post("/api/user/createWallet", {
        symbol,
      });
      setWalletAddress(response.data.data?.address || "");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const doWithdraw = async (data) => {
    try {
      let response = await axiosService.post("api/crypto/widthdraw", data);
      console.log(response.data);
      callToastSuccess(t(commontString.success));
    } catch (error) {
      console.log(error);
      callToastError(t(commontString.error));
    }
  };
  useEffect(() => {
    getAllCoins();
    createWallet("BTC.TRC20");
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);
  const deposit = (item) => {
    setAction("Deposit");
    setCurrentCoin(item.name);
    setType(typeList[0]);
    createWallet(item.name + "." + type);
  };
  const withdraw = (item) => {
    setAction("Withdraw");
    setCurrentCoin(item.name);
    setType(typeList[0]);
  };
  const renderWallet = (item, index) => {
    return (
      <div
        className={
          item.name === currentCoin ? "wallet-item active" : "wallet-item"
        }
        key={index}
      >
        <img src="/img/busd.png" alt="..." />
        <div className="info">
          <span className="name">{item.token_key}</span>
          <span className="shortName">{item.name}</span>
          <span className="amount">0.000000</span>
          <Button className="depositBtn" onClick={() => deposit(item)}>
            Desposit
          </Button>
          <Button className="withdrawBtn" onClick={() => withdraw(item)}>
            Withdraw
          </Button>
        </div>
      </div>
    );
  };
  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    if (action === "Deposit") createWallet(currentCoin + "." + selectedType);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(walletAddress);
    message.success("Copied to clipboard");
  };
  const handleChangeInput = (e) => {
    setInfo({
      ...info,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = () => {
    doWithdraw({
      symbol: currentCoin,
      amount: info.amount,
      network: type,
      toAddress: info.address,
    });
  };
  if (!isLogin) {
    return <Redirect to={"/"} />;
  }
  return (
    <div className="wallet">
      <div className="container">
        <div className="left box">
          <h2 className="title">{t("wallets")}</h2>
          <div className="coin-list">
            {coinList.map((item, index) => {
              return renderWallet(item, index);
            })}
          </div>
        </div>
        <div className="right box">
          {action === "Deposit" ? (
            <div className="deposit">
              <h2 className="title">
                {t(action.toLocaleLowerCase())} {currentCoin}
              </h2>
              <div className="deposit-type">
                {typeList.map((item, index) => {
                  return (
                    <Button
                      key={index}
                      type={item === type ? "primary" : "default"}
                      onClick={() => handleTypeChange(item)}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
              {loading ? (
                <div className="deposit-content">
                  <div
                    style={{
                      width: "100%",
                      height: 309.33,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                </div>
              ) : (
                <div className="deposit-content">
                  <div className="qr">
                    <QRCode value={walletAddress} size={170} />
                  </div>
                  <div className="address">{walletAddress}</div>
                  <Button
                    type="primary"
                    style={{ width: "50%" }}
                    onClick={copyLink}
                  >
                    {t("copyAddress")}
                  </Button>
                </div>
              )}
              <div className="deposit-description">
                <dl>
                  <div>
                    <dt>
                      <i className="fa-solid fa-circle-info"></i>
                    </dt>
                    <dd>
                      {t("thisDepositAddressOnlyAccepts")}
                      {currentCoin}. {t("doNotSendOtherCoinsToIt")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
          {action === "Withdraw" ? (
            <div className="withdraw">
              <h2 className="title">
                {action} {currentCoin}
              </h2>
              <div className="withdraw-type">
                {typeList.map((item, index) => {
                  return (
                    <Button
                      key={index}
                      type={item === type ? "primary" : "default"}
                      onClick={() => handleTypeChange(item)}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
              <div className="withdraw-content">
                <form>
                  <div className="field address">
                    <label htmlFor="address">{currentCoin} address</label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={info.address}
                      onChange={handleChangeInput}
                    />
                  </div>
                  <div className="field amount">
                    <label htmlFor="amount">Amount of {currentCoin}</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Input
                        type="text"
                        id="amount"
                        name="amount"
                        addonAfter={currentCoin}
                        value={info.amount}
                        onChange={handleChangeInput}
                      />
                      <Button style={{ marginLeft: 10 }}>MAX</Button>
                    </div>
                  </div>
                  <div className="field field3">
                    <span>Max available: </span>
                    <span className="strong">0.0000000 {currentCoin}</span>
                  </div>
                </form>
              </div>
              <div className="withdraw-description">
                <dl>
                  <div>
                    <dt>
                      <i className="fa-solid fa-circle-info"></i>
                    </dt>
                    <dd>
                      The overhead fees are not fixed, subject to change
                      depending on the state of the blockchain networks.
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <i className="fa-solid fa-circle-info"></i>
                    </dt>
                    <dd>Estimated completion time: 2 minutes.</dd>
                  </div>
                </dl>
              </div>
              <Button
                type="primary"
                size="large"
                style={{ width: 120, marginTop: 50 }}
                onClick={handleSubmit}
              >
                Send
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
