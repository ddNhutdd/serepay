import React, { useEffect, useRef, useState } from "react";
import { Spin, Pagination } from "antd";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import {
  errorMessage,
  api_status,
  commontString,
  defaultCurrency,
  defaultLanguage,
  localStorageVariable,
  regularExpress,
  url,
} from "src/constant";
import i18n from "src/translation/i18n";
import { Modal } from "antd";
import {
  getElementById,
  getLocalStorage,
  removeLocalStorage,
} from "src/util/common";
import { useHistory } from "react-router-dom";
import {
  addListBanking,
  generateOTPToken,
  getProfile,
  turnOff2FA,
  turnOn2FA,
  uploadKyc,
  getListBanking as getListBankUser,
  changePasswords,
} from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input, inputType } from "../Common/Input";
import { EmptyCustom } from "../Common/Empty";
import { getBankState } from "src/redux/reducers/bankSlice";
import Dropdown from "../Common/dropdown/Dropdown";
import { Button, buttonClassesType, htmlType } from "../Common/Button";
import Kyc from "./kyc";
import useForm from "src/hooks/use-form";
import useLogout from "src/hooks/logout";

function Profile() {
  const logout = useLogout();
  const { t } = useTranslation();
  const history = useHistory();
  const { listBank, status: listBankStatus } = useSelector(getBankState);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [callApiLoadInfoUserStatus, setCallApiLoadInfoUserStatus] = useState(
    api_status.pending
  );
  const [callApiTurnONOff2faStatus, setCallApiTurnONOff2faStatus] = useState(
    api_status.pending
  );
  const [isEnabled_twofa, setIsEnabled_twofa] = useState(false); // 2fa status
  const [qrValue, setQrvalue] = useState({
    addressCode: null,
    textCode: null,
  });
  const [callApi2FAStatus, setCallApi2FAStatus] = useState(api_status.pending);
  const [verifyKycStatus, setVerifyKycStatus] = useState(3);
  // 

  // useEffect
  useEffect(() => {
    const dataUser = getLocalStorage(localStorageVariable.user);
    if (!dataUser) {
      history.push(url.login);
      return;
    }

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    // load du lieu len cac control
    fetchUserProfile();

    fetchApiGetListBankingUser(1);
  }, []);
  useEffect(() => {
    if (listBankStatus === api_status.fulfilled)
      setBankDropdownSelected(() => listBank.at(0));
  }, [listBankStatus]);

  const showModal2FA = () => {
    // open modal
    setIs2FAModalOpen(true);
    // fetch data for modal
    setTimeout(() => {
      fetchDataFor2Fa();
    }, 0);
  };
  const modal2FAHandleCancel = () => {
    //close modal
    setIs2FAModalOpen(false);
    // set modal 2fa display
    setTimeout(() => {
      const hideClass = "--d-none";
      document
        .querySelector(".profile__2faModal .profile__2faModel__stepQR")
        .classList.remove(hideClass);
      document
        .querySelector(".profile__2faModal .profile__2faModel__stepVerify")
        .classList.add(hideClass);
      document.getElementById("profile__modal-code").value = "";
    }, 100);
  };
  const modal2FANextHandleCLick = function (e) {
    const hideClass = "--d-none";
    const effectClass = "fadeInRightToLeft";
    // hide step 1
    const step1Element = document.querySelector(
      ".profile__2faModal .profile__2faModel__stepQR"
    );
    step1Element.classList.add(hideClass);
    // show step 2
    const step2Element = document.querySelector(
      ".profile__2faModal .profile__2faModel__stepVerify"
    );
    step2Element.classList.add(effectClass);
    step2Element.classList.remove(hideClass);
    setTimeout(() => {
      step2Element.classList.remove(effectClass);
    }, 600);
  };
  const modal2FAPreviousHandleClick = function (e) {
    const hideClass = "--d-none";
    const effectClass = "fadeInLeftToRight";
    // hide step 2
    document
      .querySelector(".profile__2faModal .profile__2faModel__stepVerify")
      .classList.add(hideClass);
    // show step 1
    const step1Element = document.querySelector(
      ".profile__2faModal .profile__2faModel__stepQR"
    );
    step1Element.classList.add(effectClass);
    step1Element.classList.remove(hideClass);
    setTimeout(() => {
      step1Element.classList.remove(effectClass);
    }, 600);
  };
  const fetchUserProfile = function () {
    if (callApiLoadInfoUserStatus === api_status.fetching) return;
    else setCallApiLoadInfoUserStatus(api_status.fetching);
    getProfile()
      .then((resp) => {
        const userInfo = resp?.data?.data;
        if (userInfo) {
          const { username, email, enabled_twofa, verified } = userInfo;
          document.getElementById("profile__info-email").value = email;
          document.getElementById("profile__info-username").value = username;
          setIsEnabled_twofa(Boolean(enabled_twofa));
          setVerifyKycStatus(verified);
        }
        setCallApiLoadInfoUserStatus(api_status.fulfilled);
      })
      .catch((error) => {
        setCallApiLoadInfoUserStatus(api_status.rejected);
      });
  };
  const fetchDataFor2Fa = function () {
    if (isEnabled_twofa === true) {
      //set control cho 2fa modal
      const hideClass = "--d-none";
      const step1Element = document.querySelector(
        ".profile__2faModal .profile__2faModel__stepQR"
      );
      step1Element.classList.add(hideClass);
      const step2Element = document.querySelector(
        ".profile__2faModal .profile__2faModel__stepVerify"
      );
      step2Element.classList.remove(hideClass);
    } else if (isEnabled_twofa === false) {
      //call api
      if (callApi2FAStatus === api_status.fetching) return;
      else setCallApi2FAStatus(api_status.fetching);
      generateOTPToken()
        .then((resp) => {
          const { otpAuth, secret } = resp.data.data;
          setQrvalue(() => ({
            addressCode: otpAuth,
            textCode: secret,
          }));
          setCallApi2FAStatus(api_status.fulfilled);
        })
        .catch((error) => {
          setCallApi2FAStatus(api_status.rejected);
          setQrvalue(() => ({
            addressCode: null,
            textCode: null,
          }));
        });
    }
  };
  const turnOnOff2faClickHandle = function () {
    // validate
    const inputCodeValue = document.getElementById("profile__modal-code").value;
    const regularIsNumberString = /^[0-9]+$/;
    if (
      !inputCodeValue ||
      !(inputCodeValue.length === 6) ||
      !regularIsNumberString.test(inputCodeValue)
    ) {
      callToastError(t("invalidData"));
      return;
    }
    //cal api
    if (callApiTurnONOff2faStatus === api_status.fetching) return;
    else setCallApiTurnONOff2faStatus(api_status.fetching);
    if (isEnabled_twofa) {
      // turn off twofa
      turnOff2FA({ otp: inputCodeValue })
        .then((resp) => {
          setIsEnabled_twofa(() => false);
          modal2FAHandleCancel();
          callToastSuccess(t("turnOffSuccessfully"));
          setCallApiTurnONOff2faStatus(api_status.fulfilled);
        })
        .catch((error) => {
          const messError = error.response.data.message;
          switch (messError) {
            case "Incorrect code! ":
              callToastError(t("incorrectCode"));
              break;

            default:
              callToastError(t("error"));
              break;
          }
          setCallApiTurnONOff2faStatus(api_status.rejected);
        });
    } else {
      //turn on twofa
      turnOn2FA({ otp: inputCodeValue })
        .then((resp) => {
          setIsEnabled_twofa(() => true); // get new user info
          modal2FAHandleCancel();
          callToastSuccess(t("turnOnSuccessfully"));
          setCallApiTurnONOff2faStatus(api_status.fulfilled);
        })
        .catch((error) => {
          const message = error?.response?.data?.message;
          switch (message) {
            case "Incorrect code ! ":
              callToastError(t("incorrectCode"));
              break;
            default:
              callToastError(t("anErrorHasOccurred"));
              break;
          }
          setCallApiTurnONOff2faStatus(api_status.rejected);
        });
    }
  };
  const renderContent2FaQr = function () {
    const style = {
      display: "flex",
      with: "100%",
      height: "100px",
      alignItems: "center",
      justifyContent: "center",
    };
    const style2 = {
      background: "white",
      padding: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
    if (callApi2FAStatus === api_status.fetching) {
      return (
        <div className={style}>
          <Spin />
        </div>
      );
    } else if (qrValue.addressCode === null) {
      return (
        <div className={style}>
          <EmptyCustom stringData={t("noData")} />
        </div>
      );
    } else {
      return (
        <>
          <div style={style2}>
            <QRCode
              style={{
                height: "auto",
                maxWidth: "200px",
                width: "100%",
              }}
              value={qrValue.addressCode}
            />
          </div>
          <div>{qrValue.textCode}</div>
        </>
      );
    }
  };

  // payment
  const paymentControl = {
    bank: 'pm_bank',
    accountName: 'pm_accountName',
    accountNumber: 'pm_accountNumber'
  }
  const listPaymentPageSize = useRef(5);
  const [bankDropdownSelected, setBankDropdownSelected] = useState(
    listBank.at(0)
  );
  const [callApiBankingUserStatus, setCallApiBankingUserStatus] = useState(
    api_status.pending
  );
  const [listPayment, setListPayment] = useState([]);
  const [callApiPaymentStatus, setCallApiPaymentStatus] = useState(
    api_status.pending
  );
  const [listPaymentTotalItems, setListPaymentTotalItems] = useState(1);
  const [, setListPaymentCurrentPage] = useState(1);
  /**
 * function fetch data for state listPayment
 */
  const fetchApiGetListBankingUser = async function (page) {
    if (callApiPaymentStatus === api_status.fetching) {
      return;
    }
    setCallApiPaymentStatus(api_status.fetching);
    await getListBankUser({
      limit: listPaymentPageSize.current,
      page: page,
    })
      .then((resp) => {
        setCallApiPaymentStatus(api_status.fulfilled);
        setListPayment(resp.data.data.array);
        setListPaymentTotalItems(resp.data.data.total);
      })
      .catch((error) => {
        setCallApiPaymentStatus(api_status.rejected);
        setListPayment([]);
      });
  };
  const renderPaymenList = function () {
    if (callApiPaymentStatus === api_status.fetching) {
      return (
        <div className={`spin-container`}>
          <Spin />
        </div>
      );
    } else if (listPayment.length <= 0) {
      return (
        <div className="spin-container">
          <EmptyCustom stringData={t("noData")} />
        </div>
      );
    } else {
      return listPayment.map((item) => {
        const bankInfo = findLogoBank(item.name_banking);
        return (
          <div key={item.id} className="profile__payment-record">
            <div className="profile__payment-cell">
              <span>
                <img src={bankInfo || "www.abc.com"} alt={bankInfo?.code} />{" "}
              </span>
              <span>{item.name_banking}</span>
            </div>
            <div className="profile__payment-cell">{item.owner_banking}</div>
            <div className="profile__payment-cell">{item.number_banking}</div>
          </div>
        );
      });
    }
  };
  const findLogoBank = function (bankName) {
    const result = listBank.find((item) => item.content === bankName)?.image;
    return result;
  };
  const listPaymentPageChangeHandle = function (page) {
    setListPaymentCurrentPage(page);
    fetchApiGetListBankingUser(page);
  };
  const dropdownItemCLick = function (item, _) {
    setBankDropdownSelected(item);
  };
  const addBankingSubmitHandle = async function (values) {
    const result = await fetApiUserAddBanking({
      numberBanking: values[paymentControl.accountNumber],
      nameBanking: bankDropdownSelected.content,
      ownerBanking: values[paymentControl.accountName]?.toUpperCase(),
    });
    if (result !== null) paymentReset;
    setBankDropdownSelected(listBank.at(0));
    // render list
    fetchApiGetListBankingUser(1);
  };
  const fetApiUserAddBanking = function (data) {
    return new Promise((resolve) => {
      if (callApiBankingUserStatus === api_status.fetching) {
        return resolve(null);
      }
      setCallApiBankingUserStatus(api_status.fetching);
      addListBanking(data)
        .then((resp) => {
          setCallApiBankingUserStatus(api_status.fulfilled);
          callToastSuccess(t(commontString.success));
          return resolve(resp.data.data);
        })
        .catch((error) => {
          setCallApiBankingUserStatus(api_status.rejected);
          const mess = error.response.data.message;
          switch (mess) {
            case errorMessage.bankExist:
              callToastError(t("bankAccountNumberAlreadyExists"));
              break;
            default:
              callToastError(mess || t(commontString.error));
          }
          return resolve(null);
        });
    });
  };
  const [paymentRegister, paymentSubmitHandle, paymentError, paymentReset] = useForm(addBankingSubmitHandle, {
    [paymentControl.bank]: bankDropdownSelected?.content,
    [paymentControl.accountName]: '',
    [paymentControl.accountNumber]: ''
  });

  // change password
  const changePasswordControl = {
    oldPass: 'oldPass',
    newPass: 'newPass',
    confirmPass: 'confirmPass'
  }
  const changePassSubmit = async function (ev) {
    await callApiChangePass();
    changePassReset();
  };
  const [isModalChangePassOpen, setIsModalOpen] = useState(false);
  const [callApiChangePassStatus, setCallApiChangePassStatus] = useState(
    api_status.pending
  );
  const [changePassRegister, changePassSubmitHandle, changePassError, changePassReset] = useForm(changePassSubmit, {
    [changePasswordControl.oldPass]: '',
    [changePasswordControl.newPass]: '',
    [changePasswordControl.confirmPass]: ''
  });
  const oldPassElement = useRef();
  const newPassElement = useRef();
  const confirmPassElement = useRef();
  const showModalChangePass = () => {
    setIsModalOpen(true);
  };
  const closeChangePassModal = () => {
    setIsModalOpen(false);
    resetChangePassForm();
  };
  const resetChangePassForm = function () {
    oldPassElement.current.value = "";
    newPassElement.current.value = "";
    confirmPassElement.current.value = "";
  };
  const callApiChangePass = async function () {
    try {
      if (callApiChangePassStatus === api_status.fetching) return;
      setCallApiChangePassStatus(api_status.fetching);
      await changePasswords({
        password: oldPassElement.current.value,
        passwordNew: newPassElement.current.value,
      });
      setCallApiChangePassStatus(api_status.fulfilled);
      callToastSuccess(t("passwordChangedSuccessfully"));
      closeChangePassModal();
      logout();
      history.push(url.home);
    } catch (error) {
      const er = error?.response?.data?.message;
      switch (er) {
        case "Wrong password!":
          callToastError(t("wrongPassword"));
          break;
        default:
          callToastError(er || t(commontString.error.toLowerCase()));
          break;
      }
      setCallApiChangePassStatus(api_status.rejected);
    }
  };

  return (
    <div className="profile fadeInBottomToTop">
      <div className="container">
        <div className="profile__info">
          <div className="profile__card-container box">
            <div className="profile__title">{t("profile")}</div>
            <div className="profile__info-user">
              <div className="profile__input  w-100">
                <label htmlFor="profile__info-email">{t("email")}</label>
                <Input
                  id="profile__info-email"
                  className="disabled"
                  disabled
                  type="text"
                />
              </div>
              <div className="profile__input  w-100">
                <label htmlFor="profile__info-username">{t("username")}</label>
                <Input
                  id="profile__info-username"
                  className="disabled w-100"
                  disabled
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
        {/*<div>*/}
        {/*  <div className="profile__card-container box">*/}
        {/*    <div className="profile__title">KYC</div>*/}
        {/*    <div>*/}
        {/*      <Kyc verify={verifyKycStatus} />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className="profile__payment">
          <div className="profile__card-container box">
            <div className="profile__title">{t("payment")}</div>
            <div className="profile__payment-content">
              <form onSubmit={paymentSubmitHandle} >
                <div className="profile__input">
                  <label>{t("bankName")}</label>
                  <div className="profile__dropdown">
                    <Dropdown
                      id={`dropdownPayment`}
                      list={listBank}
                      itemClickHandle={dropdownItemCLick}
                      itemSelected={bankDropdownSelected}
                    />
                  </div>
                </div>
                <div className="profile__input">
                  <label htmlFor={paymentControl.accountNumber}>
                    {t("accountNumber")}
                  </label>
                  <Input
                    {...paymentRegister(paymentControl.accountNumber)}
                    require={[true, 'require']}
                    type="text"
                    errorMes={t(paymentError[paymentControl.accountNumber])}
                  />
                </div>
                <div className="profile__input">
                  <label htmlFor={paymentControl.accountName}>
                    {t("accountName")}
                  </label>
                  <Input
                    {...paymentRegister(paymentControl.accountName)}
                    require={[true, 'require']}
                    min={[5, 'accountNameMustBeAtLeast6Characters']}
                    max={[50, 'accountNameMaximum50Characters']}
                    type="text"
                    errorMes={t(paymentError[paymentControl.accountName])}
                  />
                </div>
                <div className="profile__payment-action">
                  <Button
                    htmlSubmit={htmlType.submit}
                    className="profile__payment-button"
                    loading={callApiBankingUserStatus === api_status.fetching}
                  >
                    {t("addBanking")}
                  </Button>
                </div>
              </form>
            </div>
            <div className="profile__title">{t("yourListBank")}:</div>
            <div className="profile__payment-list">
              <div className="profile__payment-record">
                <div className="profile__payment-header">{t("bankName")}</div>
                <div className="profile__payment-header">
                  {t("accountName")}
                </div>
                <div className="profile__payment-header">
                  {t("accountNumber")}
                </div>
              </div>
              {renderPaymenList()}
            </div>
            <div className="profile__paging">
              <Pagination
                defaultCurrent={1}
                onChange={listPaymentPageChangeHandle}
                pageSize={listPaymentPageSize.current}
                total={listPaymentTotalItems}
              />
            </div>
          </div>
        </div>
        <div className=" profile__security">
          <div className="profile__card-container box">
            <div className="profile__title">{t("security")}</div>
            <div className="profile__security-item">
              <div className="profile__left">
                <h4>{t("password")}</h4>
                <p>{t("doYouWantToChangeYourPasswordClickHereToChange")}</p>
              </div>
              <div className="profile__right">
                <button
                  onClick={showModalChangePass}
                  className="profile__button"
                >
                  {t("changePassword")}
                </button>
              </div>
            </div>
            <div className="profile__security-item">
              <div className="profile__left">
                <h4>2FA</h4>
                <p>{t("requiredToWithdrawOrUpdateTheSecurity")}</p>
              </div>
              <div className="profile__right">
                <button onClick={showModal2FA} className="profile__button">
                  {isEnabled_twofa ? t("turnOff2FA") : t("turnOn2FA")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        footer={false}
        open={is2FAModalOpen}
        onCancel={modal2FAHandleCancel}
      >
        <div className="profile__2faModal">
          <div className="profile__2faModel__header">
            <div className="profile__2faModel__title">
              {t("twoFactorAuthentication2FA")}
            </div>
            <div
              className="profile__2faModel__close"
              onClick={modal2FAHandleCancel}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <div className="profile__2faModel__stepQR">
            <div className="profile__2faModel__body">
              <p>
                {t("scanThisQRCodeInTheAuthenticatorApp") +
                  ", " +
                  t("orEnterTheCodeBelowManuallyIntoTheApp")}
              </p>
              <div className="profile__2faModel__qr">
                {renderContent2FaQr()}
              </div>
            </div>
            <div className="profile__2faModal__footer">
              <button
                id="profile__modalButton_next"
                onClick={modal2FANextHandleCLick}
                className="profile__button"
              >
                {t("next")}
              </button>
            </div>
          </div>
          <div className="profile__2faModel__stepVerify --d-none">
            <div className="profile__2faModel__body">
              <div id="profile__modal__code" className="profile__input">
                <label htmlFor="profile__modal-code">
                  {t("enterThe6DigitCodeFromAuthenticatorApp")}
                </label>
                <Input id="profile__modal-code" type="text" />
              </div>
            </div>
            <div className="profile__2faModal__footer">
              <button
                onClick={modal2FAPreviousHandleClick}
                id="profile__modalButton_previous"
                className="profile__button ghost"
              >
                {t("previous")}
              </button>
              <button
                onClick={turnOnOff2faClickHandle}
                id="profile__modalButton_turnOn2Fa"
                className={`profile__button ${callApi2FAStatus === api_status.fetching ? "disabled" : ""
                  } `}
              >
                <div
                  className={`loader ${callApi2FAStatus === api_status.fetching ? "" : "--d-none"
                    }`}
                ></div>
                {isEnabled_twofa ? t("turnOff2FA") : t("turnOn2FA")}
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        header={false}
        footer={false}
        open={isModalChangePassOpen}
        onCancel={closeChangePassModal}
      >
        <div className="profile__changePassModal">
          <div className="profile__changePassModal__header">
            <div className="profile__changePassModal__title">
              {t("changePassword")}
            </div>
            <div
              className="profile__changePassModal__close"
              onClick={closeChangePassModal}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <form onSubmit={changePassSubmitHandle} className="profile__changePassModal__body">
            <div>
              <label htmlFor="oldPass">{t("oldPassword")}</label>
              <Input
                {...changePassRegister(changePasswordControl.oldPass)}
                require={[true, 'require']}
                min={[6, errorMessage.password_1]}
                errorMes={t(changePassError[changePasswordControl.oldPass])}
                ref={oldPassElement}
                type={inputType.password}
                placeholder={t("oldPassword")}
              />
            </div>
            <div>
              <label htmlFor="newPass">{t("newPassword")}</label>
              <Input
                {...changePassRegister(changePasswordControl.newPass)}
                require={[true, 'require']}
                min={[6, 'passwordMustBeGreaterThanOrEqualTo6Characters']}
                errorMes={t(changePassError[changePasswordControl.newPass])}
                ref={newPassElement}
                type={inputType.password}
                placeholder={t("newPassword")}
              />
            </div>
            <div>
              <label htmlFor="confirmPass">{t("confirmPassword")}</label>
              <Input
                {...changePassRegister(changePasswordControl.confirmPass)}
                require={[true, 'require']}
                min={[6, 'passwordMustBeGreaterThanOrEqualTo6Characters']}
                asame={[changePasswordControl.newPass, 'passwordNotMatch']}
                errorMes={t(changePassError[changePasswordControl.confirmPass])}
                ref={confirmPassElement}
                type={inputType.password}
                placeholder={t("confirmPassword")}
              />
            </div>
            <div className="profile__changePassModal__footer">
              <Button
                htmlSubmit={htmlType.button}
                type={buttonClassesType.outline}
                onClick={closeChangePassModal}
              >
                {t("cancel")}
              </Button>
              <Button
                loading={callApiChangePassStatus === api_status.fetching}
                htmlSubmit={htmlType.submit}
              >
                {t("ok")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
export default Profile;
