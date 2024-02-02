import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import {
  addClassToElementById,
  formatStringNumberCultureUS,
  getClassListFromElementById,
  getElementById,
} from "src/util/common";
import { useSelector, useDispatch } from "react-redux";
import {
  exchangeRateDisparityApiStatus,
  fetchExchangeRateDisparity,
  getExchangeRateDisparity,
} from "src/redux/reducers/exchangeRateDisparitySlice";
import { api_status, regularExpress } from "src/constant";
import { updateExchangeRateDisparity } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { EmptyCustom } from "src/components/Common/Empty";
import { Button } from "src/components/Common/Button";
import { Input } from "src/components/Common/Input";
function ExchangeRateDisparity() {
  const rateFromRedux = useSelector(getExchangeRateDisparity);
  const rateStatusFromRedux = useSelector(exchangeRateDisparityApiStatus);
  const controls = useRef({ newValueInput: "newValueInput" });
  const controlTourched = useRef({});
  const [controlErrors, setControlErrors] = useState({});
  const dispatch = useDispatch();
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);

  useEffect(() => {
    return () => {
      dispatch(fetchExchangeRateDisparity());
    };
  }, []);
  useEffect(() => {
    setRate();
  }, [rateFromRedux, rateStatusFromRedux]);

  const showSpinner = function () {
    getClassListFromElementById("spinner").remove("--d-none");
  };
  const closeSpinner = function () {
    addClassToElementById("spinner", "--d-none");
  };
  const showEmpty = function () {
    getClassListFromElementById("empty").remove("--d-none");
  };
  const closeEmpty = function () {
    addClassToElementById("empty", "--d-none");
  };
  const closeContent = function () {
    addClassToElementById("content", "--d-none");
  };
  const showContent = function () {
    getClassListFromElementById("content").remove("--d-none");
  };
  const setRate = async function () {
    closeEmpty();
    closeContent();
    closeSpinner();
    if (rateStatusFromRedux === api_status.fetching) {
      showSpinner();
    } else if (!rateFromRedux) {
      showEmpty();
    } else if (rateFromRedux) {
      showContent();
      getElementById("rateInput").value = rateFromRedux;
    }
  };
  const validate = function () {
    let valid = true;
    const newValueInputElement = getElementById("newValueInput");
    if (
      newValueInputElement &&
      controlTourched.current[controls.current.newValueInput]
    ) {
      const checkNumber = regularExpress.checkNumber;
      if (
        !checkNumber.test(newValueInputElement.value.replaceAll(",", "")) &&
        newValueInputElement.value
      ) {
        valid &= false;
        setControlErrors((state) => ({
          ...state,
          [controls.current.newValueInput]: "Format incorect",
        }));
      } else if (!newValueInputElement.value) {
        valid &= false;
        setControlErrors((state) => ({
          ...state,
          [controls.current.newValueInput]: "Require",
        }));
      } else {
        setControlErrors((state) => {
          const newState = { ...state };
          delete newState[controls.current.newValueInput];
          return newState;
        });
      }
    }
    return Object.keys(controlTourched.current).length <= 0 ? false : valid;
  };
  const newValueInputFocusHandle = function () {
    controlTourched.current[controls.current.newValueInput] = true;
    validate();
  };
  const newValueInputChangeHandle = function (ev) {
    const value = ev.target.value;
    validate();
    ev.target.value = formatInput(value);
  };
  const formatInput = function (inputValue) {
    const inputValueWithoutComma = inputValue.replace(/,/g, "");
    const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
    if (!regex.test(inputValueWithoutComma)) {
      return inputValue.slice(0, -1);
    }
    const inputValueFormated = formatStringNumberCultureUS(
      inputValueWithoutComma
    );
    return inputValueFormated;
  };
  const submitHandle = function (event) {
    event.preventDefault();
    controlTourched.current[controls.current.newValueInput] = true;
    const valid = validate();
    if (!valid) {
    } else {
      // call api
      if (callApiStatus === api_status.fetching) return;
      else setCallApiStatus(() => api_status.fetching);
      const newValueElement = getElementById("newValueInput");
      if (!newValueElement) return;
      updateExchangeRateDisparity({
        name: "exchangeRate",
        value: newValueElement.value.replaceAll(",", ""),
      })
        .then((resp) => {
          setCallApiStatus(() => api_status.fulfilled);
          callToastSuccess("Thành Công");
          const value = getElementById("newValueInput").value;
          getElementById("rateInput").value = value;
          closeButtonSubmitLoader();
        })
        .catch((error) => {
          closeButtonSubmitLoader();
          setCallApiStatus(() => api_status.rejected);

          const mess = error?.response?.data?.message;
          switch (mess) {
            case "User does not have access":
              callToastError(mess);
              break;
            default:
              callToastError("Có lỗi trong quá trình xử lí");
              break;
          }
        });
    }
  };
  const closeButtonSubmitLoader = function () {
    getClassListFromElementById("buttonSubmit").remove("disabled");
    addClassToElementById("buttonSubmitLoader", "--d-none");
  };
  return (
    <div className="admin-exchange-rate-disparity">
      <div className="admin-exchange-rate-disparity__header">
        <h3 className="admin-exchange-rate-disparity__title">
          Exchange Rate Disparity
        </h3>
      </div>
      <div id="content" className="admin-exchange-rate-disparity__content">
        <div className="admin-exchange-rate-disparity__control-input">
          <label htmlFor="">Current Value:</label>
          <Input id="rateInput" disabled type="text" className="disabled" />
        </div>
        <form className="admin-exchange-rate-disparity__form">
          <div className="admin-exchange-rate-disparity__control-input">
            <label htmlFor="newValueInput">New Value:</label>
            <Input
              onFocus={newValueInputFocusHandle}
              onChange={newValueInputChangeHandle}
              id="newValueInput"
              type="text"
              errorMes={controlErrors[controls.current.newValueInput]}
            />
            <small id="newInputValueError" className="--visible-hidden">
              error
            </small>
          </div>
          <div className="admin-exchange-rate-disparity__action">
            <Button
              disabled={callApiStatus === api_status.fetching ? true : false}
              id="buttonSubmit"
              onClick={submitHandle}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <div id="spinner" className="spin-container --d-none">
        <Spin />
      </div>
      <div id="empty" className="spin-container --d-none">
        <EmptyCustom />
      </div>
    </div>
  );
}
export default ExchangeRateDisparity;
