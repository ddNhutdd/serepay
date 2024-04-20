import React, { useEffect, useState } from "react";
import css from "./kyc.module.scss";
import { getLocalStorage } from "src/util/common";
import {
  errorMessage,
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

  const kycSubmitHandle = async (data) => {
    // prepare data
    const formData = new FormData();
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
        case errorMessage.imagesCannotBeLeftBlank:
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
  const renderError = (controlName) => {
    if (errors[controlName]?.type === 'required') {
      return 'require'
    }
    if (errors[controlName]?.type === 'pattern') {
      return 'formatIncorrect'
    }
  }

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
              {...register("Fullname", { required: true })}
              errorMes={t(renderError('Fullname'))}
            />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPhone">{t("phone")}</label>
            <Input
              {...register("Phone", {
                required: true,
                pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
              })}
              errorMes={t(renderError('Phone'))}
            />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycAddress">{t("address")}</label>
            <Input
              {...register("Address", { required: true })}
              errorMes={t(renderError('Address'))}
            />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycCompany">{t("company")}</label>
            <Input
              {...register("Company", { required: true })}
              errorMes={t(renderError('Company'))}
            />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPassport">{t("passport")}</label>
            <Input
              {...register("Passport", { required: true })}
              errorMes={t(renderError('Passport'))}
            />
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
