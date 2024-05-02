import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  exchangeRateDisparityApiStatus,
  fetchExchangeRateDisparity,
  getExchangeRateDisparity,
} from "src/redux/reducers/exchangeRateDisparitySlice";
import { api_status, commontString, regularExpress } from "src/constant";
import { updateExchangeRateDisparity } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { Input } from "src/components/Common/Input";
import {
  fetchExchangeRateSell,
  getExchangeRateSell,
  getExchangeRateSellApiStatus,
} from "src/redux/reducers/exchangeRateSellSlice";
function ExchangeRateDisparity() {

  //
  const dispatch = useDispatch();



  // format input 
  const formatInput = function (inputValue) {
    const inputValueWithoutComma = inputValue.replaceAll(/,/g, "");
    if (inputValueWithoutComma === "-") return "-";

    const format = function (numberString) {
      if (numberString === "-") return "-";
      const regex = /^(-?[0-9]+(\.[0-9]*)?)?$/;
      if (!regex.test(numberString)) return;
      const parts = numberString.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };

    const regex = /^(-?[0-9]+(\.[0-9]*)?)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      return format(inputValueWithoutComma.slice(0, -1));
    }
    const inputValueFormated = format(inputValueWithoutComma);
    return inputValueFormated;
  };


  // tỉ lệ mua
  const rateFromRedux = useSelector(getExchangeRateDisparity);
  const rateBuyStatusFromRedux = useSelector(exchangeRateDisparityApiStatus);
  const [typeBuyButton, setTypeBuyButton] = useState(buttonClassesType.outline);
  const [callApiSetBuyStatus, setCallApiSetBuyStatus] = useState(api_status.pending);
  const inputBuyNew = useRef();
  const validateBuy = function () {
    let valid = true;
    const newValueInputElement = inputBuyNew.current;
    if (
      newValueInputElement &&
      controlBuyTourched.current[controlsBuy.current.newValueInput]
    ) {
      const checkNumber = regularExpress.checkNumber;
      if (
        !checkNumber.test(newValueInputElement.value.replaceAll(",", "")) &&
        newValueInputElement.value
      ) {
        valid &= false;
        setControlBuyErrors((state) => ({
          ...state,
          [controlsBuy.current.newValueInput]: "Format incorect",
        }));
      } else if (!newValueInputElement.value) {
        valid &= false;
        setControlBuyErrors((state) => ({
          ...state,
          [controlsBuy.current.newValueInput]: "Require",
        }));
      } else {
        setControlBuyErrors((state) => {
          const newState = { ...state };
          delete newState[controlsBuy.current.newValueInput];
          return newState;
        });
      }
    }
    return Object.keys(controlBuyTourched.current).length <= 0 ? false : valid;
  };
  const newValueInputBuyChangeHandle = function (ev) {
    const value = ev.target.value;
    ev.target.value = formatInput(value);
    validateBuy();
    setTypeBuyButton(buttonClassesType.primary);
  };
  const newValueInputBuyFocusHandle = function () {
    controlBuyTourched.current[controlsBuy.current.newValueInput] = true;
    validateBuy();
  };
  const submitBuyHandle = function (event) {
    event.preventDefault();
    controlBuyTourched.current[controlsBuy.current.newValueInput] = true;
    const valid = validateBuy();
    if (!valid) {
    } else {
      // call api
      if (callApiSetBuyStatus === api_status.fetching) return;
      setCallApiSetBuyStatus(api_status.fetching);
      const newValueElement = inputBuyNew.current;
      if (!newValueElement) return;
      updateExchangeRateDisparity({
        name: "exchangeRate",
        value: newValueElement.value.replaceAll(",", ""),
      })
        .then((resp) => {
          callToastSuccess(commontString.success);
          setCallApiSetBuyStatus(api_status.fulfilled);
          setTypeBuyButton(buttonClassesType.outline)
        })
        .catch((error) => {
          const mess = error?.response?.data?.message;
          switch (mess) {
            case "User does not have access":
              callToastError(mess);
              break;
            default:
              callToastError("Có lỗi trong quá trình xử lí");
              break;
          }
          setCallApiSetBuyStatus(api_status.rejected);
        });
    }
  };



  // tỉ lệ bán
  const rateSellFromRedux = useSelector(getExchangeRateSell);
  const rateSellStatusFromRedux = useSelector(getExchangeRateSellApiStatus);
  const [typeSellButton, setTypeSellButton] = useState(buttonClassesType.outline);
  const [callApiSetSellStatus, setCallApiSetSellStatus] = useState(api_status.pending);
  const inputSellNew = useRef();
  const validateSell = function () {
    let valid = true;
    const newValueInputElement = inputSellNew.current;
    if (
      newValueInputElement &&
      controlSellTourched.current[controlsSell.current.newValueInput]
    ) {
      const checkNumber = regularExpress.checkNumber;
      if (
        !checkNumber.test(newValueInputElement.value.replaceAll(",", "")) &&
        newValueInputElement.value
      ) {
        valid &= false;
        setControlSellErrors((state) => ({
          ...state,
          [controlsSell.current.newValueInput]: "Format incorect",
        }));
      } else if (!newValueInputElement.value) {
        valid &= false;
        setControlSellErrors((state) => ({
          ...state,
          [controlsSell.current.newValueInput]: "Require",
        }));
      } else {
        setControlSellErrors((state) => {
          const newState = { ...state };
          delete newState[controlsBuy.current.newValueInput];
          return newState;
        });
      }
    }
    return Object.keys(controlSellTourched.current).length <= 0 ? false : valid;
  };
  const newValueInputSellFocusHandle = function () {
    controlSellTourched.current[controlsSell.current.newValueInput] = true;
    validateSell();
  };
  const newValueInputSellChangeHandle = function (ev) {
    const value = ev.target.value;
    ev.target.value = formatInput(value);
    validateSell();
    setTypeSellButton(buttonClassesType.primary);
  };
  const submitSellHandle = async function (ev) {
    try {
      ev.preventDefault();
      controlSellTourched.current[controlsSell.current.newValueInput] = true;
      const valid = validateSell();
      if (!valid) return;
      if (callApiSetSellStatus === api_status.fetching) return;
      setCallApiSetSellStatus(api_status.fetching);
      await updateExchangeRateDisparity({
        name: "exchangeRateSell",
        value: inputSellNew.current.value.replaceAll(",", ""),
      });
      callToastSuccess(commontString.success);
      setTypeSellButton(buttonClassesType.outline);
      setCallApiSetSellStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiSetSellStatus(api_status.rejected);
    }
  };





  // useEffect 
  useEffect(() => {
    return () => {
      dispatch(fetchExchangeRateDisparity());
      dispatch(fetchExchangeRateSell());
    };
  }, []);
  useEffect(() => {
    if (inputBuyNew && inputBuyNew.current) {
      inputBuyNew.current.value = rateFromRedux;
    }
  }, [rateFromRedux])
  useEffect(() => {
    if (inputSellNew && inputSellNew.current) {
      inputSellNew.current.value = rateSellFromRedux;
    }
  }, [rateSellFromRedux])





  const [controlBuyErrors, setControlBuyErrors] = useState({});
  const [controlSellErrors, setControlSellErrors] = useState({});
  const controlsBuy = useRef({ newValueInput: "newValueInput" });
  const controlsSell = useRef({ newValueInput: "newValueInput" });
  const controlBuyTourched = useRef({});
  const controlSellTourched = useRef({});






  const renderClassShowSpinBuy = function () {
    return rateBuyStatusFromRedux === api_status.fetching ? "" : "--d-none";
  };
  const renderClassShowContentLeft = function () {
    return rateBuyStatusFromRedux === api_status.fetching ? "--d-none" : "";
  };






  const renderClassShowSpinSell = function () {
    return rateSellStatusFromRedux === api_status.fetching ? "" : "--d-none";
  };
  const renderClassShowContentRight = function () {
    return rateSellStatusFromRedux !== api_status.fetching ? "" : "--d-none";
  };


  return (
    <div className="admin-exchange-rate-disparity">
      <div className="admin-exchange-rate-disparity__header">
        <h3 className="admin-exchange-rate-disparity__title">
          Exchange Rate Disparity
        </h3>
      </div>
      <div className="admin-exchange-rate-disparity__content">
        <div className={`admin-exchange-rate-disparity__content-left`}>
          <label className="formTitle">Exchange Buy</label>
          <form
            className={`admin-exchange-rate-disparity__form ${renderClassShowContentLeft()}`}
          >
            <div className="admin-exchange-rate-disparity__control-input">
              <label htmlFor="newValueInput">New Value:</label>
              <Input
                onFocus={newValueInputBuyFocusHandle}
                onChange={newValueInputBuyChangeHandle}
                ref={inputBuyNew}
                errorMes={controlBuyErrors[controlsBuy.current.newValueInput]}
              />
            </div>
            <div className="admin-exchange-rate-disparity__action">
              <Button
                loading={callApiSetBuyStatus === api_status.fetching}
                onClick={submitBuyHandle}
                type={typeBuyButton}
              >
                Save
              </Button>
            </div>
          </form>
          <div className={`spin-container  ${renderClassShowSpinBuy()}`}>
            <Spin />
          </div>
        </div>
        <div className="admin-exchange-rate-disparity__content-right">
          <label className="formTitle">Exchange Sell</label>
          <form
            className={`admin-exchange-rate-disparity__form ${renderClassShowContentRight()}`}
          >
            <div className="admin-exchange-rate-disparity__control-input">
              <label>New Value:</label>
              <Input
                onFocus={newValueInputSellFocusHandle}
                ref={inputSellNew}
                onChange={newValueInputSellChangeHandle}
                errorMes={controlSellErrors[controlsSell.current.newValueInput]}
              />
            </div>
            <div className="admin-exchange-rate-disparity__action">
              <Button
                loading={callApiSetSellStatus === api_status.fetching}
                onClick={submitSellHandle}
                type={typeSellButton}
              >
                Save
              </Button>
            </div>
          </form>
          <div className={`spin-container  ${renderClassShowSpinSell()}`}>
            <Spin />
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExchangeRateDisparity;
