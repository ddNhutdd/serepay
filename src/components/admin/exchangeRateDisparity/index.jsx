import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import {
  addClassToElementById,
  getClassListFromElementById,
  getElementById,
} from "src/util/common";
import { useSelector, useDispatch } from "react-redux";
import {
  exchangeRateDisparityApiStatus,
  fetchExchangeRateDisparity,
  getExchangeRateDisparity,
} from "src/redux/reducers/exchangeRateDisparitySlice";
import { api_status } from "src/constant";
import { updateExchangeRateDisparity } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { EmptyCustom } from "src/components/Common/Empty";
import { Button } from "src/components/Common/Button";
function ExchangeRateDisparity() {
  const rateFromRedux = useSelector(getExchangeRateDisparity);
  const rateStatusFromRedux = useSelector(exchangeRateDisparityApiStatus);
  const controls = useRef({ newValueInput: "newValueInput" });
  const controlTourched = useRef({});
  const controlErrors = useRef({});
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
  //
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
      const checkNumber = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/;
      if (
        !checkNumber.test(newValueInputElement.value) &&
        newValueInputElement.value
      ) {
        valid &= false;
        controlErrors.current[controls.current.newValueInput] =
          "Format incorect";
      } else if (!newValueInputElement.value) {
        valid &= false;
        controlErrors.current[controls.current.newValueInput] = "Require";
      } else {
        delete controlErrors.current[controls.current.newValueInput];
      }
    }
    return Object.keys(controlTourched.current).length <= 0 ? false : valid;
  };
  const newValueInputFocusHandle = function () {
    controlTourched.current[controls.current.newValueInput] = true;
    validate();
    renderError();
  };
  const newValueInputChangeHandle = function () {
    validate();
    renderError();
  };
  const renderError = function () {
    if (
      controlTourched.current[controls.current.newValueInput] &&
      controlErrors.current[controls.current.newValueInput]
    ) {
      const inputValueErrorElement = getElementById("newInputValueError");
      inputValueErrorElement.innerHTML =
        controlErrors.current[controls.current.newValueInput];
      inputValueErrorElement.classList.remove("--visible-hidden");
    } else {
      addClassToElementById("newInputValueError", "--visible-hidden");
    }
  };
  const submitHandle = function (event) {
    event.preventDefault();
    controlTourched.current[controls.current.newValueInput] = true;
    const valid = validate();
    if (!valid) {
      renderError();
    } else {
      // call api
      if (callApiStatus === api_status.fetching) return;
      else setCallApiStatus(() => api_status.fetching);
      const newValueElement = getElementById("newValueInput");
      if (!newValueElement) return;
      updateExchangeRateDisparity({
        name: "exchangeRate",
        value: newValueElement.value,
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
          console.log(error);
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
          <input id="rateInput" disabled type="text" className="disabled" />
        </div>
        <form className="admin-exchange-rate-disparity__form">
          <div className="admin-exchange-rate-disparity__control-input">
            <label htmlFor="newValueInput">New Value:</label>
            <input
              onFocus={newValueInputFocusHandle}
              onChange={newValueInputChangeHandle}
              id="newValueInput"
              type="text"
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
