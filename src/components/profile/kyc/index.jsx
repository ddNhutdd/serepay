import React, { useEffect, useState, useRef } from "react";
import css from "./kyc.module.scss";
import { getLocalStorage } from "src/util/common";
import {
  apiResponseErrorMessage,
  api_status,
  commontString,
  defaultLanguage,
  localStorageVariable,
} from "src/constant";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { Input } from "src/components/Common/Input";
import { Button, htmlType } from "src/components/Common/Button";
import InputFile from "src/components/Common/inputFile";
import { uploadKyc } from "src/util/userCallApi";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { useForm } from "react-hook-form";

function Kyc(props) {
  const { verify: verifyProp } = props;
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [frontIdImage, setFrontIdImage] = useState();
  const [backIdImage, setBackIdImage] = useState();
  const [portraitImage, setPortraitImage] = useState();
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [verify, setVerify] = useState();

  // const fullNameElement = useRef();
  // const phoneElement = useRef();
  // const addressElement = useRef();
  // const companyElement = useRef();
  // const passportElement = useRef();

  const kycSubmitHandle = async (data) => {
    // ev.preventDefault();

    // prepare data
    const formData = new FormData();
    // formData.append("fullname", data.name);
    // formData.append("address", addressElement.current.value);
    // formData.append("phone", phoneElement.current.value);
    // formData.append("company", companyElement.current.value);
    // formData.append("passport", passportElement.current.value);
    formData.append("fullname", data.Fullname);
    formData.append("address", data.Address);
    formData.append("phone", data.value);
    formData.append("company", data.value);
    formData.append("passport", data.value);

    formData.append("photo", frontIdImage);
    formData.append("photo", backIdImage);
    formData.append("photo", portraitImage);
    formData.append("userid", getLocalStorage(localStorageVariable.user)?.id);

    // call api
    if (callApiStatus === api_status.fetching) return;
    setCallApiStatus(api_status.fetching);
    try {
      await uploadKyc(formData);
      callToastSuccess(t(commontString.success));
      setCallApiStatus(api_status.fulfilled);
      setVerify(2);
    } catch (error) {
      setCallApiStatus(api_status.rejected);
      const message = error?.response?.data?.message;
      switch (message) {
        case apiResponseErrorMessage.imagesCannotBeLeftBlank:
          callToastError(t("imagesCannotBeLeftBlank"));
          return;
        default:
          callToastError(t(commontString.error));
          return;
      }
    }
  };
  const renderShowVerifying = () => {
    return verify === 2 ? "" : "--d-none";
  };
  const renderShowVerified = () => {
    return verify === 1 ? "" : "--d-none";
  };
  const renderShowForm = () => {
    return verify !== 1 && verify !== 2 ? "" : "--d-none";
  };

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);
  useEffect(() => {
    setVerify(verifyProp);
  }, [verifyProp]);

  return (
    <div className={css["kyc"]}>
      <div className={`${css["kyc__verifying"]} ${renderShowVerifying()}`}>
        <div>{t("pleaseWaitForAdminConfirmation")}</div>
      </div>
      <div className={`${css["kyc__verified"]} ${renderShowVerified()}`}>
        <div>{t("verified")}</div>
      </div>
      <form
        onSubmit={handleSubmit(kycSubmitHandle)}
        className={`${css["kyc__form"]} ${renderShowForm()}`}
      >
        <div className={css["kyc__infoContainer"]}>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycFullname">{t("fullName")}</label>
            <Input
              // id={"kycFullname"}
              {...register("Fullname", { required: true })}
              // ref={fullNameElement}
            />
            <error>
              {errors.Fullname?.type === "required" && "Fullname is required"}
            </error>
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPhone">{t("phone")}</label>
            <Input
              // id={"kycPhone"}
              // ref={phoneElement}
              {...register("Phone", {
                required: true,
                pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
              })}
            />
            <error>
              {errors.Phone?.type === "required" && "Phone is required"}
              {errors.Phone?.type === "pattern" && "Phone is in wrong format"}
            </error>
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycAddress">{t("address")}</label>
            <Input
              // id={"kycAddress"}
              // ref={addressElement}
              {...register("Address", { required: true })}
            />
            <error>
              {errors.Address?.type === "required" && "Address is required"}
            </error>
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycCompany">{t("company")}</label>
            <Input
              // id={"kycCompany"}
              // ref={companyElement}
              {...register("Company", { required: true })}
            />
            <error>
              {errors.Company?.type === "required" && "Company is required"}
            </error>
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPassport">{t("passport")}</label>
            <Input
              // id={"kycPassport"}
              // ref={passportElement}
              {...register("Passport", { required: true })}
            />
            <error>
              {errors.Passport?.type === "required" && "Passport is required"}
            </error>
          </div>
        </div>
        <div className={css["kyc__fileContainer"]}>
          <div className={css["kyc__fileInput"]}>
            <label>
              {t("frontImageOfCitizenIdentificationCardOrIdentityCard")}
            </label>
            <InputFile
              image={frontIdImage}
              setImage={setFrontIdImage}
              id={"frontIdImage"}
            />
          </div>
          <div className={css["kyc__fileInput"]}>
            <label>{t("backOfCitizenIdentificationCardOrIdentityCard")}</label>
            <InputFile
              image={backIdImage}
              setImage={setBackIdImage}
              id={"backIdImage"}
            />
          </div>
          <div className={css["kyc__fileInput"]}>
            <label>{t("portrait")}</label>
            <InputFile
              image={portraitImage}
              setImage={setPortraitImage}
              id={"portraitImage"}
            />
          </div>
        </div>
        <div className={css["kyc__action"]}>
          <Button
            htmlSubmit={htmlType.submit}
            loading={callApiStatus === api_status.fetching}
          >
            {t("send")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Kyc;
