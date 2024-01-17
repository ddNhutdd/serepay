import { toast } from "react-toastify";
import css from "./callToast.module.scss";
import { useEffect, useRef } from "react";
import { getLocalStorage } from "src/util/common";
import { defaultLanguage, localStorageVariable } from "src/constant";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
const toastOption = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
  theme: "dark",
};
//
export const callToastSuccess = (content, title = null) =>
  toast(<ToastSuccess content={content} title={title} />, toastOption);
export const callToastError = (content) =>
  toast(<ToastError content={content} />, toastOption);
//
const ToastSuccess = function ({ content, title }) {
  const { t } = useTranslation();
  const tem = useRef(title || t("success"));
  return (
    <>
      <div className={css["toast-header"]}>
        <div className={css["toast-header-success-icon"]}>
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <span>{tem.current}</span>
      </div>
      <div>{content}</div>
    </>
  );
};
const ToastError = function ({ content }) {
  const { t } = useTranslation();
  const tem = useRef(t("error"));
  return (
    <>
      <div className={css["toast-header"]}>
        <div className={css["toast-header-error-icon"]}>
          <i className="fa-solid fa-circle-xmark red"></i>
        </div>
        <span>{tem.current}</span>
      </div>
      <div>{content}</div>
    </>
  );
};
