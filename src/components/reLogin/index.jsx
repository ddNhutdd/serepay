import { Modal } from "antd";
import React, { useEffect, useState, useRef } from "react";
import {
  apiResponseErrorMessage,
  defaultCurrency,
  defaultLanguage,
  localStorageVariable,
  url,
} from "src/constant";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "src/util/common";
import { Input, inputType } from "../Common/Input";
import css from "./reLogin.module.scss";
import { Button } from "../Common/Button";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";
import { useDispatch } from "react-redux";
import { currencySetCurrent } from "src/redux/actions/currency.action";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { axiosService } from "src/util/service";
import { useLocation, useHistory } from "react-router-dom";
import { userWalletFetchCount } from "src/redux/actions/coin.action";
import socket from "src/util/socket";

function ReLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [errors, setErrors] = useState({});

  const passwordElement = useRef();
  const controls = useRef({
    username: "username",
    password: "password",
  });
  const tourched = useRef({});

  useEffect(() => {
    const id = setInterval(() => {
      checkLocalStorage();
    }, 1000);

    return () => clearTimeout(id);
  }, []);

  const checkLocalStorage = function () {
    const showModal = getLocalStorage(localStorageVariable.expireToken);
    const token = localStorage.getItem(localStorageVariable.token);
    if (showModal && token) {
      setIsModalOpen(true);
      setUsernameValue(showModal);
      logout();
    }
  };
  const handleCancel = () => {};
  const login = async (e, p) => {
    setIsLoading(true);
    try {
      let response = await axiosService.post("/api/user/login", {
        userName: e,
        password: p,
      });
      setIsModalOpen(false);
      response?.data?.data?.id === 1
        ? dispatch({ type: "USER_ADMIN", payload: true })
        : dispatch({ type: "USER_ADMIN", payload: false });
      const profile = JSON.stringify(response.data.data);
      callToastSuccess(t("loggedInSuccessfully"));
      setIsModalOpen(false);
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", profile);
      setLocalStorage(localStorageVariable.expireToken, false);
      dispatch({ type: "USER_LOGIN" });
      // menu load list mycoin
      dispatch(userWalletFetchCount());
      // search previos page and redirect
      const previousPage = getLocalStorage(localStorageVariable.previousePage);
      socket.emit("join", response.data.data.id);
      socket.on("ok", (res) => {});
      handleReload();
    } catch (error) {
      const mess =
        error?.response?.data?.errors[0]?.msg || error?.response?.data?.message;
      switch (mess) {
        case apiResponseErrorMessage.usernameMini:
          callToastError(t("usernameMustBeGreaterThanOrEqualTo3Characters"));
          break;
        case apiResponseErrorMessage.password_1:
          callToastError(t("passwordMustBeGreaterThanOrEqualTo6Characters"));
          break;
        case apiResponseErrorMessage.accountIncorrect:
          callToastError(t("incorrectAccountOrPassword"));
          break;
        default:
          callToastError(mess || t("error"));
          break;
      }
    } finally {
      setIsLoading(false);
      removeLocalStorage(localStorageVariable.expireToken);
    }
  };
  const logout = () => {
    dispatch({ type: "USER_ADMIN", payload: false });
    removeLocalStorage(localStorageVariable.lng);
    localStorage.removeItem(localStorageVariable.user);
    localStorage.removeItem(localStorageVariable.token);
    removeLocalStorage(localStorageVariable.coinToTransaction);
    removeLocalStorage(localStorageVariable.currency);
    removeLocalStorage(localStorageVariable.adsItem);
    removeLocalStorage(localStorageVariable.coinNameToTransaction);
    removeLocalStorage(localStorageVariable.createAds);
    removeLocalStorage(localStorageVariable.moneyToTransaction);
    dispatch(currencySetCurrent(defaultCurrency));
    removeLocalStorage(localStorageVariable.coin);
    removeLocalStorage(localStorageVariable.coinFromWalletList);
    removeLocalStorage(localStorageVariable.amountFromWalletList);
    removeLocalStorage(localStorageVariable.thisIsAdmin);
    dispatch({ type: "USER_LOGOUT" });
  };
  const usernameChangeHandle = function (ev) {
    const value = ev.target.value;
    setUsernameValue(value);
    validate(value, passwordElement.current.value);
  };
  const passwordChangeHandle = function () {
    validate(usernameValue, passwordElement.current.value);
  };
  const onFocusHandle = function (value) {
    tourched.current[value] = true;
    validate(usernameValue, passwordElement.current.value);
  };
  const validate = function (username, password) {
    let isValid = true;

    if (tourched.current[controls.current.username]) {
      if (username.length < 3) {
        isValid &= false;
        setErrors((state) => ({
          ...state,
          [controls.current.username]:
            "usernameMustBeGreaterThanOrEqualTo3Characters",
        }));
      } else {
        const newError = { ...errors };
        delete newError[controls.current.username];
        setErrors(newError);
      }
    }

    if (tourched.current[controls.current.password]) {
      if (password < 6) {
        isValid &= false;
        setErrors((state) => ({
          ...state,
          [controls.current.password]:
            "passwordMustBeGreaterThanOrEqualTo6Characters",
        }));
      } else {
        const newError = { ...errors };
        delete newError[controls.current.password];
        setErrors(newError);
      }
    }

    return Object.keys(tourched).length <= 0 ? false : Boolean(isValid);
  };
  const submitHandle = async function (ev) {
    ev.preventDefault();
    Object.keys(controls.current).forEach((key) => {
      tourched.current[key] = true;
    });
    const valid = validate(usernameValue, passwordElement.current.value);
    if (!valid) return;
    await login(usernameValue, passwordElement.current.value);
  };
  const handleReload = () => {
    setLocalStorage(localStorageVariable.reLoginR, location.pathname);
    history.push(url.login);
    return;
  };

  return (
    <>
      <Modal
        header={false}
        footer={false}
        open={isModalOpen}
        onCancel={handleCancel}
      >
        <div className={css["reLogin"]}>
          <div className="reLogin__content">
            <div className={`${css["reLogin__content__title"]} p-3 bb-1`}>
              {t("pleaseLogInAgain")}
            </div>
            <div className="reLogin__content__text p-3 ">
              <p className="m-0">{t("loginExpired")}</p>
              <p className="m-0">
                {t("pleaseLogInAgainToContinueYourSession")}
              </p>
            </div>
            <form className="p-3 pt-0 d-flex f-c gap-2">
              <div>
                <label htmlFor="usernameRelogin">{t("username")}</label>
                <Input
                  id="usernameRelogin"
                  value={usernameValue}
                  onChange={usernameChangeHandle}
                  errorMes={t(errors[controls.current.username])}
                  onFocus={onFocusHandle.bind(null, controls.current.username)}
                />
              </div>
              <div>
                <label htmlFor="passwordRelogin">{t("password")}</label>
                <Input
                  onChange={passwordChangeHandle}
                  ref={passwordElement}
                  type={inputType.password}
                  id="passwordRelogin"
                  errorMes={t(errors[controls.current.password])}
                  onFocus={onFocusHandle.bind(null, controls.current.password)}
                />
              </div>
              <div>
                <Button
                  loading={isLoading}
                  onClick={submitHandle}
                  className="ml-a"
                >
                  {t("login")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReLogin;
